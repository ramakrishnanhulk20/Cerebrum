// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint8, euint64, ebool, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {EthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface ICerebrumRiskScoring {
    function calculateDiabetesRisk(euint64 bloodSugar, euint64 bmi, uint8 age) external returns (euint64);
    function calculateHeartDiseaseRisk(euint64 cholesterol, euint64 bloodPressureSystolic, euint64 heartRate) external returns (euint64);
    function calculateStrokeRisk(euint64 bloodPressureSystolic, euint64 cholesterol, uint8 age, euint64 bmi) external returns (euint64);
    function calculateComprehensiveRisk(euint64 bloodSugar, euint64 cholesterol, euint64 bmi, euint64 bloodPressureSystolic, euint64 heartRate, uint8 age) external returns (euint64, euint64, euint64);
}

/// @title Cerebrum v0.9 - FHEVM v0.9
/// @notice Privacy-first health data marketplace with automatic access control
/// @dev No Gateway callbacks - uses User Decryption (EIP-712) and FHE.allow for seamless access
contract CerebrumFHEVM_v09 is EthereumConfig {
    // ============ Constants ============
    uint64 public constant INITIAL_SCORE = 500;
    uint64 public constant SCORE_INCREMENT = 10;
    uint64 public constant MAX_SCORE = 850;
    uint256 public constant BASE_DATA_SHARE_REWARD = 0.001 ether;
    uint256 public constant BASE_RESEARCHER_FEE = 0.005 ether;
    uint256 public constant LENDER_CHECK_FEE = 0.01 ether;
    uint256 public constant PLATFORM_FEE_PERCENT = 20;

    // Quality thresholds for pricing tiers
    uint8 public constant TIER_PREMIUM = 90;
    uint8 public constant TIER_COMPLETE = 70;
    uint8 public constant TIER_STANDARD = 50;

    // ============ Type Definitions ============

    struct HealthData {
        euint64 bloodSugar;
        euint64 cholesterol;
        euint64 bmi;
        euint64 bloodPressureSystolic;
        euint64 bloodPressureDiastolic;
        euint64 heartRate;
        euint64 weight;
        euint64 height;
        uint8 age;
        uint16 exerciseMinutes;
        uint8 sleepHours;
        uint256 timestamp;
        uint8 qualityScore;
    }

    struct ActivityLog {
        string action;
        uint256 timestamp;
        uint256 blockNumber;
    }

    struct Patient {
        bool isRegistered;
        bool sharingEnabled;
        euint64 healthScore;
        uint256 lastDataShare;
        uint256 registrationTime;
        uint256 dataShareCount;
        uint256 totalEarnings;
        HealthData[] healthRecords;
        ActivityLog[] activityLogs;
    }

    struct EligibilityCheck {
        address lender;
        uint64 minScore;
        uint256 timestamp;
        uint256 amountPaid;
    }

    struct RiskScores {
        euint64 diabetesRisk;
        euint64 heartDiseaseRisk;
        euint64 strokeRisk;
        uint256 timestamp;
    }

    // ============ State Variables ============

    address public owner;
    address public platformWallet;
    ICerebrumRiskScoring public riskScoringLibrary;

    mapping(address => Patient) public patients;
    mapping(address => mapping(address => bool)) public lenderApprovals;
    mapping(address => mapping(address => uint256)) public researcherAccessRound;
    mapping(address => address[]) private lenderApprovedBy;
    mapping(address => mapping(address => EligibilityCheck[])) public eligibilityHistory;
    
    // Store encrypted eligibility results for lenders (TRUE/FALSE only)
    mapping(address => mapping(address => ebool)) private encryptedEligibilityResults;
    
    // Store researcher's encrypted risk analysis results
    mapping(address => mapping(address => mapping(uint256 => RiskScores))) public researcherRiskScores;

    address[] private allPatients;
    uint256 public totalPatients;
    uint256 public totalDataShares;

    // ============ Events ============

    event PatientRegistered(address indexed patient, uint256 timestamp);
    event HealthDataShared(address indexed patient, uint256 timestamp, uint256 recordNumber, uint8 qualityScore);
    event DataSharingToggled(address indexed patient, bool enabled, uint256 timestamp);
    event LenderApprovalGranted(address indexed patient, address indexed lender, uint256 timestamp);
    event LenderApprovalRevoked(address indexed patient, address indexed lender, uint256 timestamp);
    event ResearcherAccessGranted(
        address indexed patient,
        address indexed researcher,
        uint256 dataVersion,
        uint256 timestamp
    );
    event ResearcherAccessPurchased(
        address indexed patient,
        address indexed researcher,
        uint256 price,
        uint256 patientPayment,
        uint256 platformFee,
        uint256 timestamp
    );
    event EarningsDistributed(address indexed patient, uint256 amount, uint256 timestamp);
    event EligibilityChecked(
        address indexed patient,
        address indexed lender,
        uint64 minScore,
        uint256 timestamp
    );
    event RiskScoresCalculated(
        address indexed patient,
        address indexed researcher,
        uint256 indexed recordIndex,
        bytes32 diabetesHandle,
        bytes32 heartHandle,
        bytes32 strokeHandle,
        uint256 timestamp
    );

    event HealthDataPermissionGranted(
        address indexed patient,
        address indexed researcher,
        uint256 indexed recordIndex,
        bytes32 bloodSugarHandle,
        bytes32 cholesterolHandle,
        bytes32 bmiHandle,
        bytes32 bpSystolicHandle,
        bytes32 bpDiastolicHandle,
        bytes32 heartRateHandle,
        bytes32 weightHandle,
        bytes32 heightHandle,
        uint256 timestamp
    );

    event EligibilityPermissionGranted(
        address indexed patient,
        address indexed lender,
        bytes32 resultHandle,
        uint256 timestamp
    );

    event DebugHandles(
        bytes32 storedHealthScoreHandle,
        bytes32 minScoreHandle,
        bytes32 resultHandle
    );

    // ============ Errors ============

    error AlreadyRegistered();
    error NotRegistered();
    error InvalidAddress();
    error InsufficientPayment();
    error NotApprovedLender();
    error NotApprovedResearcher();
    error PlatformWalletNotSet();
    error InsufficientEarnings();
    error InvalidRecordIndex();
    error AccessExpired();
    error NotOwner();
    error NoRiskScoresCalculated();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ============ Constructor ============

    constructor(address _platformWallet, address _riskScoringLibrary) {
        if (_platformWallet == address(0)) revert InvalidAddress();
        platformWallet = _platformWallet;
        owner = msg.sender;
        riskScoringLibrary = ICerebrumRiskScoring(_riskScoringLibrary);
    }

    // ============ Patient Functions ============

    function registerPatient() external {
        if (patients[msg.sender].isRegistered) revert AlreadyRegistered();

        Patient storage patient = patients[msg.sender];
        patient.isRegistered = true;
        patient.healthScore = FHE.asEuint64(INITIAL_SCORE);
        patient.sharingEnabled = true; // Enable sharing by default for smoother UX
        patient.registrationTime = block.timestamp;

        // Grant contract permission to manage health score
        FHE.allowThis(patient.healthScore);
        
        // Grant patient permission to decrypt their own score (User Decryption)
        FHE.allow(patient.healthScore, msg.sender);

        allPatients.push(msg.sender);
        totalPatients++;

        patient.activityLogs.push(
            ActivityLog({action: "Patient Registered", timestamp: block.timestamp, blockNumber: block.number})
        );

        emit PatientRegistered(msg.sender, block.timestamp);
    }

    /// @notice Share health data using encrypted inputs
    /// @dev Uses createEncryptedInput() from frontend to create externalEuint64 values
    /// @param encBloodSugar Encrypted blood sugar from createEncryptedInput()
    /// @param encCholesterol Encrypted cholesterol from createEncryptedInput()
    /// @param encBmi Encrypted BMI from createEncryptedInput()
    /// @param encBpSystolic Encrypted systolic BP from createEncryptedInput()
    /// @param encBpDiastolic Encrypted diastolic BP from createEncryptedInput()
    /// @param encHeartRate Encrypted heart rate from createEncryptedInput()
    /// @param encWeight Encrypted weight from createEncryptedInput()
    /// @param encHeight Encrypted height from createEncryptedInput()
    /// @param inputProof Proof from createEncryptedInput() bundle
    function shareHealthData(
        externalEuint64 encBloodSugar,
        externalEuint64 encCholesterol,
        externalEuint64 encBmi,
        externalEuint64 encBpSystolic,
        externalEuint64 encBpDiastolic,
        externalEuint64 encHeartRate,
        externalEuint64 encWeight,
        externalEuint64 encHeight,
        uint8 age,
        uint16 exerciseMinutes,
        uint8 sleepHours,
        bytes calldata inputProof
    ) external {
        Patient storage patient = patients[msg.sender];
        if (!patient.isRegistered) revert NotRegistered();

        // Convert externalEuint64 to euint64 using asEuint64 with proof
        euint64 bloodSugar = FHE.fromExternal(encBloodSugar, inputProof);
        euint64 cholesterol = FHE.fromExternal(encCholesterol, inputProof);
        euint64 bmi = FHE.fromExternal(encBmi, inputProof);
        euint64 bpSystolic = FHE.fromExternal(encBpSystolic, inputProof);
        euint64 bpDiastolic = FHE.fromExternal(encBpDiastolic, inputProof);
        euint64 heartRate = FHE.fromExternal(encHeartRate, inputProof);
        euint64 weight = FHE.fromExternal(encWeight, inputProof);
        euint64 height = FHE.fromExternal(encHeight, inputProof);

        // Calculate quality score (using plaintext age/exercise/sleep)
        uint8 qualityScore = _calculateQualityScore(
            age,
            exerciseMinutes,
            sleepHours
        );

        // Grant contract permission to manage all encrypted data BEFORE storing
        FHE.allowThis(bloodSugar);
        FHE.allowThis(cholesterol);
        FHE.allowThis(bmi);
        FHE.allowThis(bpSystolic);
        FHE.allowThis(bpDiastolic);
        FHE.allowThis(heartRate);
        FHE.allowThis(weight);
        FHE.allowThis(height);

        HealthData memory newRecord = HealthData({
            bloodSugar: bloodSugar,
            cholesterol: cholesterol,
            bmi: bmi,
            bloodPressureSystolic: bpSystolic,
            bloodPressureDiastolic: bpDiastolic,
            heartRate: heartRate,
            weight: weight,
            height: height,
            age: age,
            exerciseMinutes: exerciseMinutes,
            sleepHours: sleepHours,
            timestamp: block.timestamp,
            qualityScore: qualityScore
        });

        patient.healthRecords.push(newRecord);
        patient.lastDataShare = block.timestamp;
        patient.dataShareCount++;
        totalDataShares++;

        // Update health score
        euint64 increment = FHE.asEuint64(SCORE_INCREMENT);
        euint64 maxScore = FHE.asEuint64(MAX_SCORE);
        euint64 newScore;
        
        // First share: start with INITIAL_SCORE + increment (500 + 10 = 510)
        if (patient.dataShareCount == 1) {
            euint64 initialScore = FHE.asEuint64(INITIAL_SCORE);
            newScore = FHE.add(initialScore, increment);
        } else {
            // Subsequent shares: add to existing score
            newScore = FHE.add(patient.healthScore, increment);
        }
        
        ebool isOverMax = FHE.gt(newScore, maxScore);
        euint64 updatedScore = FHE.select(isOverMax, maxScore, newScore);
        
        // Grant permissions BEFORE assigning to storage
        FHE.allowThis(updatedScore);
        FHE.allow(updatedScore, msg.sender); // Patient can decrypt their own score
        FHE.allow(updatedScore, address(this)); // Contract can use score in future transactions
        
        // Store in patient record
        patient.healthScore = updatedScore;

        // Quality bonus
        uint256 qualityBonus = (qualityScore * BASE_DATA_SHARE_REWARD) / 50;
        patient.totalEarnings += qualityBonus;

        patient.activityLogs.push(
            ActivityLog({action: "Health Data Shared", timestamp: block.timestamp, blockNumber: block.number})
        );

        emit HealthDataShared(msg.sender, block.timestamp, patient.dataShareCount, qualityScore);
    }

    function toggleDataSharing() external {
        Patient storage patient = patients[msg.sender];
        if (!patient.isRegistered) revert NotRegistered();

        patient.sharingEnabled = !patient.sharingEnabled;

        emit DataSharingToggled(msg.sender, patient.sharingEnabled, block.timestamp);
    }

    function claimEarnings() external {
        Patient storage patient = patients[msg.sender];
        if (!patient.isRegistered) revert NotRegistered();
        if (patient.totalEarnings == 0) revert InsufficientEarnings();

        uint256 amount = patient.totalEarnings;
        patient.totalEarnings = 0;

        payable(msg.sender).transfer(amount);

        emit EarningsDistributed(msg.sender, amount, block.timestamp);
    }

    // ============ User Decryption Functions ============

    /// @notice Get encrypted health score handle for User Decryption
    /// @dev Returns the ciphertext that can be decrypted client-side with EIP-712 signature
    /// @dev No need to call enableInstantDecrypt - FHE.allow() is granted in registerPatient()
    /// @param patient Address of the patient
    /// @return Encrypted health score (euint64)
    function getEncryptedHealthScore(address patient) external view returns (euint64) {
        Patient storage pat = patients[patient];
        if (!pat.isRegistered) revert NotRegistered();
        
        return pat.healthScore;
    }

    // ============ Lender Functions ============

    function approveLender(address lender) external {
        Patient storage patient = patients[msg.sender];
        if (!patient.isRegistered) revert NotRegistered();
        if (lender == address(0)) revert InvalidAddress();
        if (lenderApprovals[msg.sender][lender]) revert("Lender already approved");

        lenderApprovals[msg.sender][lender] = true;
        lenderApprovedBy[lender].push(msg.sender);

        emit LenderApprovalGranted(msg.sender, lender, block.timestamp);
    }

    function revokeLender(address lender) external {
        Patient storage patient = patients[msg.sender];
        if (!patient.isRegistered) revert NotRegistered();
        if (lender == address(0)) revert InvalidAddress();
        
        lenderApprovals[msg.sender][lender] = false;
        
        // Remove from lenderApprovedBy array
        address[] storage approvedBy = lenderApprovedBy[lender];
        for (uint256 i = 0; i < approvedBy.length; i++) {
            if (approvedBy[i] == msg.sender) {
                approvedBy[i] = approvedBy[approvedBy.length - 1];
                approvedBy.pop();
                break;
            }
        }
        
        emit LenderApprovalRevoked(msg.sender, lender, block.timestamp);
    }

    /// @notice Check eligibility with plaintext threshold (lender uses User Decryption for result)
    /// @dev Returns encrypted ebool (TRUE/FALSE) - lender decrypts on frontend with EIP-712 signature
    /// @dev No Gateway callbacks - instant result for lender!
    function checkEligibility(address patient, uint64 minCreditScore) external payable {
        if (msg.value != LENDER_CHECK_FEE) revert InsufficientPayment();
        if (!lenderApprovals[patient][msg.sender]) revert NotApprovedLender();

        Patient storage pat = patients[patient];
        if (!pat.isRegistered) revert NotRegistered();
        if (pat.dataShareCount == 0) revert NoRiskScoresCalculated(); // Patient must share data first

        // DEBUG: Log handles before comparison
        bytes32 storedHandle = euint64.unwrap(pat.healthScore);
        
        euint64 minScore = FHE.asEuint64(minCreditScore);
        bytes32 minHandle = euint64.unwrap(minScore);
        
        // Perform comparison
        ebool meetsReq = FHE.ge(pat.healthScore, minScore);
        bytes32 resultHandle = ebool.unwrap(meetsReq);
        
        // DEBUG: Emit handles for inspection
        emit DebugHandles(storedHandle, minHandle, resultHandle);

        // Grant permissions for the ebool IMMEDIATELY after creation
        FHE.allowThis(meetsReq); // Contract needs permission to unwrap/store it
        FHE.allow(meetsReq, msg.sender); // Lender can decrypt it

        // Store encrypted result for lender
        encryptedEligibilityResults[patient][msg.sender] = meetsReq;

        // Distribute payment
        uint256 patientPayment = (msg.value * 80) / 100;
        uint256 platformFee = msg.value - patientPayment;

        pat.totalEarnings += patientPayment;
        payable(platformWallet).transfer(platformFee);

        // Record check
        eligibilityHistory[patient][msg.sender].push(
            EligibilityCheck({
                lender: msg.sender,
                minScore: minCreditScore,
                timestamp: block.timestamp,
                amountPaid: msg.value
            })
        );

        emit EligibilityChecked(patient, msg.sender, minCreditScore, block.timestamp);
        
        // Emit event with handle for frontend parsing
        emit EligibilityPermissionGranted(
            patient,
            msg.sender,
            bytes32(ebool.unwrap(meetsReq)),
            block.timestamp
        );
    }

    /// @notice Check eligibility with ENCRYPTED threshold (maximum privacy)
    /// @dev Both score AND threshold are encrypted - result is encrypted ebool
    /// @dev Lender uses User Decryption to get TRUE/FALSE result on frontend
    function checkEligibilityWithEncryptedThreshold(
        address patient,
        externalEuint64 encryptedMinScore,
        bytes calldata inputProof
    ) external payable {
        if (msg.value != LENDER_CHECK_FEE) revert InsufficientPayment();
        if (!lenderApprovals[patient][msg.sender]) revert NotApprovedLender();

        Patient storage pat = patients[patient];
        if (!pat.isRegistered) revert NotRegistered();
        if (pat.dataShareCount == 0) revert NoRiskScoresCalculated(); // Patient must share data first

        // DEBUG: Log handles before comparison
        bytes32 storedHandle = euint64.unwrap(pat.healthScore);
        
        // Convert encrypted input with proof
        euint64 minScore = FHE.fromExternal(encryptedMinScore, inputProof);
        bytes32 minHandle = euint64.unwrap(minScore);
        
        // Compare encrypted score with encrypted threshold
        ebool meetsReq = FHE.ge(pat.healthScore, minScore);
        bytes32 resultHandle = ebool.unwrap(meetsReq);
        
        // DEBUG: Emit handles for inspection
        emit DebugHandles(storedHandle, minHandle, resultHandle);

        // Grant permissions for the ebool
        FHE.allowThis(meetsReq); // Contract needs permission to store it
        FHE.allow(meetsReq, msg.sender); // Lender can decrypt it

        // Store encrypted result
        encryptedEligibilityResults[patient][msg.sender] = meetsReq;

        // Distribute payment
        uint256 patientPayment = (msg.value * 80) / 100;
        uint256 platformFee = msg.value - patientPayment;

        pat.totalEarnings += patientPayment;
        payable(platformWallet).transfer(platformFee);

        // Record check (threshold is encrypted, so store 0)
        eligibilityHistory[patient][msg.sender].push(
            EligibilityCheck({
                lender: msg.sender,
                minScore: 0, // Threshold is encrypted
                timestamp: block.timestamp,
                amountPaid: msg.value
            })
        );

        emit EligibilityChecked(patient, msg.sender, 0, block.timestamp);
        
        // Emit event with handle for frontend parsing
        emit EligibilityPermissionGranted(
            patient,
            msg.sender,
            bytes32(ebool.unwrap(meetsReq)),
            block.timestamp
        );
    }

    /// @notice Get encrypted eligibility result for User Decryption
    /// @dev Returns encrypted ebool that lender can decrypt on frontend
    function getEncryptedEligibilityResult(address patient) external returns (ebool) {
        ebool result = encryptedEligibilityResults[patient][msg.sender];
        
        // Re-grant PERMANENT permission for off-chain User Decryption
        // Changed from FHE.allowTransient() to FHE.allow() to enable userDecrypt()
        FHE.allow(result, msg.sender);
        
        // Emit event with handle for frontend parsing
        emit EligibilityPermissionGranted(
            patient,
            msg.sender,
            bytes32(ebool.unwrap(result)),
            block.timestamp
        );
        
        return result;
    }

    // ============ Researcher Functions ============

    /// @notice Purchase researcher access 
    /// @dev Contract automatically to researcher - NO PATIENT SIGNING NEEDED!
    /// @dev automatic access control without user interaction
    function purchaseResearcherAccess(address patient, uint256 recordIndex) external payable {
        Patient storage pat = patients[patient];
        if (!pat.isRegistered) revert NotRegistered();
        if (!pat.sharingEnabled) revert NotApprovedResearcher();
        if (recordIndex >= pat.healthRecords.length) revert InvalidRecordIndex();

        uint256 accessPrice = calculateAccessPrice(patient, recordIndex);
        if (msg.value < accessPrice) revert InsufficientPayment();

        // Grant access (track data version)
        researcherAccessRound[patient][msg.sender] = pat.dataShareCount;

        HealthData storage record = pat.healthRecords[recordIndex];
        
        // FHE.allowTransient for automatic, temporary access
        // Researcher gets ONE-TIME access without patient signing again!
        FHE.allowTransient(record.bloodSugar, msg.sender);
        FHE.allowTransient(record.cholesterol, msg.sender);
        FHE.allowTransient(record.bmi, msg.sender);
        FHE.allowTransient(record.bloodPressureSystolic, msg.sender);
        FHE.allowTransient(record.bloodPressureDiastolic, msg.sender);
        FHE.allowTransient(record.heartRate, msg.sender);
        FHE.allowTransient(record.weight, msg.sender);
        FHE.allowTransient(record.height, msg.sender);

        // Distribute payment
        uint256 patientPayment = (accessPrice * 80) / 100;
        uint256 platformFee = accessPrice - patientPayment;

        pat.totalEarnings += patientPayment;
        payable(platformWallet).transfer(platformFee);

        // Refund excess
        if (msg.value > accessPrice) {
            payable(msg.sender).transfer(msg.value - accessPrice);
        }

        emit ResearcherAccessPurchased(patient, msg.sender, accessPrice, patientPayment, platformFee, block.timestamp);
        emit ResearcherAccessGranted(patient, msg.sender, pat.dataShareCount, block.timestamp);
    }

    /// @notice Get encrypted health record for User Decryption
    /// @dev Researcher uses User Decryption (EIP-712) to decrypt on frontend
    /// @dev No Gateway callbacks - instant decryption in 0-2 seconds!
    function getEncryptedHealthRecord(address patient, uint256 recordIndex) 
        external 
        returns (
            euint64 bloodSugar,
            euint64 cholesterol,
            euint64 bmi,
            euint64 bloodPressureSystolic,
            euint64 bloodPressureDiastolic,
            euint64 heartRate,
            euint64 weight,
            euint64 height
        ) 
    {
        Patient storage pat = patients[patient];
        
        if (recordIndex >= pat.healthRecords.length) revert InvalidRecordIndex();
        
        // Check access hasn't expired
        if (researcherAccessRound[patient][msg.sender] != pat.dataShareCount) {
            revert AccessExpired();
        }
        
        HealthData storage record = pat.healthRecords[recordIndex];
        
        // Grant PERMANENT permission for off-chain User Decryption
        // Changed from FHE.allowTransient() to FHE.allow() to enable userDecrypt()
        FHE.allow(record.bloodSugar, msg.sender);
        FHE.allow(record.cholesterol, msg.sender);
        FHE.allow(record.bmi, msg.sender);
        FHE.allow(record.bloodPressureSystolic, msg.sender);
        FHE.allow(record.bloodPressureDiastolic, msg.sender);
        FHE.allow(record.heartRate, msg.sender);
        FHE.allow(record.weight, msg.sender);
        FHE.allow(record.height, msg.sender);
        
        // Emit event with handles for frontend parsing
        emit HealthDataPermissionGranted(
            patient,
            msg.sender,
            recordIndex,
            bytes32(euint64.unwrap(record.bloodSugar)),
            bytes32(euint64.unwrap(record.cholesterol)),
            bytes32(euint64.unwrap(record.bmi)),
            bytes32(euint64.unwrap(record.bloodPressureSystolic)),
            bytes32(euint64.unwrap(record.bloodPressureDiastolic)),
            bytes32(euint64.unwrap(record.heartRate)),
            bytes32(euint64.unwrap(record.weight)),
            bytes32(euint64.unwrap(record.height)),
            block.timestamp
        );
        
        return (
            record.bloodSugar,
            record.cholesterol,
            record.bmi,
            record.bloodPressureSystolic,
            record.bloodPressureDiastolic,
            record.heartRate,
            record.weight,
            record.height
        );
    }

    /// @notice Get plaintext metadata for health record
    /// @dev Returns non-sensitive metadata (age, exercise, sleep, quality score)
    function getHealthRecordMetadata(address patient, uint256 recordIndex)
        external
        view
        returns (
            uint8 age,
            uint16 exerciseMinutes,
            uint8 sleepHours,
            uint256 timestamp,
            uint8 qualityScore
        )
    {
        Patient storage pat = patients[patient];
        if (recordIndex >= pat.healthRecords.length) revert InvalidRecordIndex();
        
        HealthData storage record = pat.healthRecords[recordIndex];
        
        return (
            record.age,
            record.exerciseMinutes,
            record.sleepHours,
            record.timestamp,
            record.qualityScore
        );
    }

    // ============ Encrypted Analytics Functions ============

    /// @notice Calculate encrypted risk scores (on-chain FHE operations)
    /// @dev Returns encrypted risk scores - researcher uses User Decryption to decrypt
    function calculateComprehensiveRisk(address patient, uint256 recordIndex) 
        public 
        returns (euint64 diabetesRisk, euint64 heartRisk, euint64 strokeRisk) 
    {
        Patient storage pat = patients[patient];
        if (!pat.isRegistered) revert NotRegistered();
        if (recordIndex >= pat.healthRecords.length) revert InvalidRecordIndex();
        if (researcherAccessRound[patient][msg.sender] != pat.dataShareCount) revert AccessExpired();
        
        HealthData storage record = pat.healthRecords[recordIndex];
        
        // Grant RiskScoring library permission to access encrypted health data
        address libraryAddress = address(riskScoringLibrary);
        FHE.allow(record.bloodSugar, libraryAddress);
        FHE.allow(record.cholesterol, libraryAddress);
        FHE.allow(record.bmi, libraryAddress);
        FHE.allow(record.bloodPressureSystolic, libraryAddress);
        FHE.allow(record.heartRate, libraryAddress);
        
        // Calculate encrypted risk scores using risk scoring library
        (diabetesRisk, heartRisk, strokeRisk) = riskScoringLibrary.calculateComprehensiveRisk(
            record.bloodSugar,
            record.cholesterol,
            record.bmi,
            record.bloodPressureSystolic,
            record.heartRate,
            record.age
        );
        
        // Grant contract permission to store the encrypted risk scores
        FHE.allowThis(diabetesRisk);
        FHE.allowThis(heartRisk);
        FHE.allowThis(strokeRisk);
        
        // Store encrypted results
        researcherRiskScores[patient][msg.sender][recordIndex] = RiskScores({
            diabetesRisk: diabetesRisk,
            heartDiseaseRisk: heartRisk,
            strokeRisk: strokeRisk,
            timestamp: block.timestamp
        });
        
        // Grant researcher PERMANENT permission to decrypt risk scores (for User Decryption)
        // This allows off-chain userDecrypt() to work after transaction is mined
        FHE.allow(diabetesRisk, msg.sender);
        FHE.allow(heartRisk, msg.sender);
        FHE.allow(strokeRisk, msg.sender);
        
        // Emit event with encrypted handles so frontend can parse and decrypt
        emit RiskScoresCalculated(
            patient, 
            msg.sender, 
            recordIndex,
            bytes32(euint64.unwrap(diabetesRisk)),
            bytes32(euint64.unwrap(heartRisk)),
            bytes32(euint64.unwrap(strokeRisk)),
            block.timestamp
        );
        
        return (diabetesRisk, heartRisk, strokeRisk);
    }

    /// @notice Get encrypted risk scores for User Decryption
    /// @dev Researcher decrypts on frontend with EIP-712 signature
    function getEncryptedRiskScores(address patient, uint256 recordIndex)
        external
        returns (
            euint64 diabetesRisk,
            euint64 heartDiseaseRisk,
            euint64 strokeRisk
        )
    {
        RiskScores storage risks = researcherRiskScores[patient][msg.sender][recordIndex];
        
        // Grant researcher PERMANENT permission (not transient) to decrypt the stored encrypted risk scores
        FHE.allow(risks.diabetesRisk, msg.sender);
        FHE.allow(risks.heartDiseaseRisk, msg.sender);
        FHE.allow(risks.strokeRisk, msg.sender);
        
        return (
            risks.diabetesRisk,
            risks.heartDiseaseRisk,
            risks.strokeRisk
        );
    }

    // ============ Internal Functions ============

    function _calculateQualityScore(
        uint8 age,
        uint16 exerciseMinutes,
        uint8 sleepHours
    ) internal pure returns (uint8) {
        uint8 score = 0;

        // Core metrics (assume provided if function is called)
        score += 30; // bloodSugar, cholesterol, bmi (10 each)

        // Extended metrics
        score += 24; // bpSystolic, bpDiastolic, heartRate (8 each)

        // Lifestyle metrics (6 points each)
        score += 18; // weight, height, age
        if (age > 0) score += 6;
        if (exerciseMinutes > 0) score += 6;
        if (sleepHours > 0) score += 6;

        return score;
    }

    // ============ View Functions ============

    function calculateAccessPrice(address patient, uint256 recordIndex) public view returns (uint256) {
        if (recordIndex >= patients[patient].healthRecords.length) {
            return BASE_RESEARCHER_FEE + 0.003 ether;
        }

        uint8 qualityScore = patients[patient].healthRecords[recordIndex].qualityScore;

        if (qualityScore >= TIER_PREMIUM) {
            return BASE_RESEARCHER_FEE + 0.025 ether;
        } else if (qualityScore >= TIER_COMPLETE) {
            return BASE_RESEARCHER_FEE + 0.015 ether;
        } else if (qualityScore >= TIER_STANDARD) {
            return BASE_RESEARCHER_FEE + 0.007 ether;
        } else {
            return BASE_RESEARCHER_FEE + 0.003 ether;
        }
    }

    function hasCurrentAccess(address patient, address researcher) external view returns (bool) {
        return researcherAccessRound[patient][researcher] == patients[patient].dataShareCount;
    }

    function getApprovedPatients(address lender) external view returns (address[] memory) {
        return lenderApprovedBy[lender];
    }

    function getEligibilityHistory(address patient, address lender) external view returns (EligibilityCheck[] memory) {
        return eligibilityHistory[patient][lender];
    }

    function getPatientInfo(
        address _patient
    )
        external
        view
        returns (
            bool isRegistered,
            bool sharingEnabled,
            uint256 lastDataShare,
            uint256 registrationTime,
            uint256 dataShareCount,
            uint256 totalEarnings
        )
    {
        Patient storage patient = patients[_patient];
        return (
            patient.isRegistered,
            patient.sharingEnabled,
            patient.lastDataShare,
            patient.registrationTime,
            patient.dataShareCount,
            patient.totalEarnings
        );
    }

    function getPatientActivity(address _patient) external view returns (ActivityLog[] memory) {
        return patients[_patient].activityLogs;
    }

    function getHealthRecordCount(address _patient) external view returns (uint256) {
        return patients[_patient].healthRecords.length;
    }

    function getTotalPatients() external view returns (uint256) {
        return totalPatients;
    }

    function getTotalDataShares() external view returns (uint256) {
        return totalDataShares;
    }

    function getPatientList() external view returns (address[] memory) {
        return allPatients;
    }

    function getSharingEnabledPatients() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allPatients.length; i++) {
            if (patients[allPatients[i]].sharingEnabled) {
                count++;
            }
        }
        
        address[] memory sharingPatients = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allPatients.length; i++) {
            if (patients[allPatients[i]].sharingEnabled) {
                sharingPatients[index] = allPatients[i];
                index++;
            }
        }
        
        return sharingPatients;
    }

    function getSharingEnabledCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < allPatients.length; i++) {
            if (patients[allPatients[i]].sharingEnabled) {
                count++;
            }
        }
        return count;
    }

    function hasLenderApproval(address patient, address lender) external view returns (bool) {
        return lenderApprovals[patient][lender];
    }

    function hasResearcherAccess(address patient, address researcher) external view returns (bool) {
        return researcherAccessRound[patient][researcher] > 0;
    }

    function isPatientRegistered(address _patient) external view returns (bool) {
        return patients[_patient].isRegistered;
    }

    function isSharingEnabled(address _patient) external view returns (bool) {
        return patients[_patient].sharingEnabled;
    }

    function getRecordQuality(address _patient, uint256 recordIndex) external view returns (uint8) {
        if (recordIndex >= patients[_patient].healthRecords.length) {
            return 0;
        }
        return patients[_patient].healthRecords[recordIndex].qualityScore;
    }

    function getResearcherPurchasedPatients(address researcher) external view returns (address[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < allPatients.length; i++) {
            address patient = allPatients[i];
            if (researcherAccessRound[patient][researcher] == patients[patient].dataShareCount && 
                patients[patient].dataShareCount > 0) {
                count++;
            }
        }
        
        address[] memory purchasedPatients = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allPatients.length; i++) {
            address patient = allPatients[i];
            if (researcherAccessRound[patient][researcher] == patients[patient].dataShareCount && 
                patients[patient].dataShareCount > 0) {
                purchasedPatients[index] = patient;
                index++;
            }
        }
        
        return purchasedPatients;
    }

    function getResearcherPurchaseCount(address researcher) external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < allPatients.length; i++) {
            address patient = allPatients[i];
            if (researcherAccessRound[patient][researcher] == patients[patient].dataShareCount && 
                patients[patient].dataShareCount > 0) {
                count++;
            }
        }
        return count;
    }

    // ============ Admin Functions ============

    function setPlatformWallet(address _platformWallet) external onlyOwner {
        if (_platformWallet == address(0)) revert InvalidAddress();
        platformWallet = _platformWallet;
    }

    function setRiskScoringLibrary(address _riskScoringLibrary) external onlyOwner {
        if (_riskScoringLibrary == address(0)) revert InvalidAddress();
        riskScoringLibrary = ICerebrumRiskScoring(_riskScoringLibrary);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        owner = newOwner;
    }

    // ============ Receive Function ============

    receive() external payable {}

    fallback() external payable {}
}


