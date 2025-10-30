// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint8, euint64, ebool, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Cerebrum - Complete FHEVM Health Credit Scoring
/// @notice Health Credit Scoring with encrypted arrays, activity tracking, and proper decryption
contract CerebrumFHEVM_v2 is SepoliaConfig {
    
    // ============ Constants ============
    uint64 public constant INITIAL_SCORE = 500;
    uint64 public constant SCORE_INCREMENT = 10;
    uint64 public constant MAX_SCORE = 850;
    uint256 public constant DATA_SHARE_REWARD = 0.001 ether;
    uint256 public constant RESEARCHER_ACCESS_FEE = 0.01 ether;
    uint256 public constant PLATFORM_FEE_PERCENT = 20;

    // ============ Type Definitions ============
    
    struct HealthData {
        euint64 bloodSugar;
        euint64 cholesterol;
        euint64 bmi;
        uint256 timestamp;
    }

    struct ActivityLog {
        string action;
        uint256 timestamp;
        uint256 blockNumber;
    }

    struct DecryptedHealthRecord {
        uint64 bloodSugar;
        uint64 cholesterol;
        uint64 bmi;
        uint256 timestamp;
        bool isDecrypted;
    }

    struct Patient {
        bool isRegistered;
        euint64 healthScore;
        bool sharingEnabled;
        uint256 lastDataShare;
        uint256 registrationTime;
        uint256 dataShareCount;
        uint64 decryptedScore;
        bool scoreDecrypted;
        uint256 totalEarnings;
        uint256 decryptionRequestId;
        
        // Array storage
        HealthData[] healthRecords;
        ActivityLog[] activityLogs;
    }

    struct PendingDecryptionRequest {
        address patient;
        address requester;
        uint256 recordIndex;
        bool fulfilled;
    }

    // ============ State Variables ============
    
    mapping(address => Patient) public patients;
    mapping(address => mapping(address => bool)) public lenderApprovals;
    mapping(address => mapping(address => bool)) public researcherAccess;
    mapping(address => mapping(address => mapping(uint256 => DecryptedHealthRecord))) public decryptedRecords;
    mapping(uint256 => PendingDecryptionRequest) public pendingRequests;
    mapping(uint256 => address) private scoreDecryptionPatients;
    
    address[] private allPatients;
    uint256 public totalPatients;
    uint256 public totalDataShares;
    address public platformWallet;

    // ============ Events ============
    
    event PatientRegistered(address indexed patient, uint256 timestamp);
    event HealthDataShared(address indexed patient, uint256 timestamp, uint256 recordNumber);
    event DataSharingToggled(address indexed patient, bool enabled, uint256 timestamp);
    event LenderApprovalGranted(address indexed patient, address indexed lender, uint256 timestamp);
    event ResearcherAccessGranted(address indexed patient, address indexed researcher, uint256 timestamp);
    event ResearcherAccessPurchased(address indexed patient, address indexed researcher, uint256 patientPayment, uint256 platformFee, uint256 timestamp);
    event ScoreDecryptionRequested(address indexed patient, uint256 requestId);
    event ScoreDecrypted(address indexed patient, uint64 score, uint256 timestamp);
    event HealthRecordDecryptionRequested(address indexed patient, address indexed researcher, uint256 recordIndex, uint256 requestId);
    event HealthRecordDecrypted(address indexed patient, address indexed researcher, uint256 recordIndex, uint64 bloodSugar, uint64 cholesterol, uint64 bmi);
    event EarningsDistributed(address indexed patient, uint256 amount, uint256 timestamp);

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

    // ============ Constructor ============
    
    constructor(address _platformWallet) {
        if (_platformWallet == address(0)) revert InvalidAddress();
        platformWallet = _platformWallet;
    }

    // ============ Patient Functions ============
    
    function registerPatient() external {
        if (patients[msg.sender].isRegistered) revert AlreadyRegistered();
        
        Patient storage patient = patients[msg.sender];
        patient.isRegistered = true;
        patient.healthScore = FHE.asEuint64(INITIAL_SCORE);
        patient.sharingEnabled = true;
        patient.registrationTime = block.timestamp;
        
        FHE.allowThis(patient.healthScore);
        
        allPatients.push(msg.sender);
        totalPatients++;
        
        patient.activityLogs.push(ActivityLog({
            action: "Patient Registered",
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        
        emit PatientRegistered(msg.sender, block.timestamp);
    }

    function shareHealthData(uint64 bloodSugar, uint64 cholesterol, uint64 bmi) external {
        Patient storage patient = patients[msg.sender];
        if (!patient.isRegistered) revert NotRegistered();
        
        euint64 encBloodSugar = FHE.asEuint64(bloodSugar);
        euint64 encCholesterol = FHE.asEuint64(cholesterol);
        euint64 encBmi = FHE.asEuint64(bmi);
        
        HealthData memory newRecord = HealthData({
            bloodSugar: encBloodSugar,
            cholesterol: encCholesterol,
            bmi: encBmi,
            timestamp: block.timestamp
        });
        
        patient.healthRecords.push(newRecord);
        patient.lastDataShare = block.timestamp;
        patient.dataShareCount++;
        totalDataShares++;
        
        // Update health score
        euint64 increment = FHE.asEuint64(SCORE_INCREMENT);
        euint64 maxScore = FHE.asEuint64(MAX_SCORE);
        euint64 newScore = FHE.add(patient.healthScore, increment);
        ebool isOverMax = FHE.gt(newScore, maxScore);
        patient.healthScore = FHE.select(isOverMax, maxScore, newScore);
        
        FHE.allowThis(patient.healthScore);
        FHE.allowThis(encBloodSugar);
        FHE.allowThis(encCholesterol);
        FHE.allowThis(encBmi);
        
        if (patient.sharingEnabled) {
            patient.totalEarnings += DATA_SHARE_REWARD;
        }
        
        patient.activityLogs.push(ActivityLog({
            action: "Health Data Shared",
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        
        emit HealthDataShared(msg.sender, block.timestamp, patient.healthRecords.length);
    }

    function toggleDataSharing(bool enabled) external {
        Patient storage patient = patients[msg.sender];
        if (!patient.isRegistered) revert NotRegistered();
        
        patient.sharingEnabled = enabled;
        
        patient.activityLogs.push(ActivityLog({
            action: enabled ? "Data Sharing Enabled" : "Data Sharing Disabled",
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        
        emit DataSharingToggled(msg.sender, enabled, block.timestamp);
    }

    function claimEarnings() external {
        Patient storage patient = patients[msg.sender];
        if (!patient.isRegistered) revert NotRegistered();
        if (patient.totalEarnings == 0) revert InsufficientEarnings();
        
        uint256 amount = patient.totalEarnings;
        patient.totalEarnings = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        patient.activityLogs.push(ActivityLog({
            action: "Earnings Claimed",
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        
        emit EarningsDistributed(msg.sender, amount, block.timestamp);
    }

    // ============ Lender Functions ============
    
    function approveLender(address lender) external {
        if (!patients[msg.sender].isRegistered) revert NotRegistered();
        if (lender == address(0)) revert InvalidAddress();
        
        lenderApprovals[msg.sender][lender] = true;
        
        patients[msg.sender].activityLogs.push(ActivityLog({
            action: "Lender Approved",
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        
        emit LenderApprovalGranted(msg.sender, lender, block.timestamp);
    }

    function checkQualification(address patient, uint64 minScore) external returns (ebool) {
        if (!patients[patient].isRegistered) revert NotRegistered();
        if (!lenderApprovals[patient][msg.sender]) revert NotApprovedLender();
        
        euint64 patientScore = patients[patient].healthScore;
        euint64 threshold = FHE.asEuint64(minScore);
        
        return FHE.ge(patientScore, threshold);  // FIXED: Changed from gte to ge
    }

    // ============ Researcher Functions ============
    
    function purchaseResearcherAccess(address patient) external payable {
        if (!patients[patient].isRegistered) revert NotRegistered();
        if (msg.value < RESEARCHER_ACCESS_FEE) revert InsufficientPayment();
        if (platformWallet == address(0)) revert PlatformWalletNotSet();
        
        researcherAccess[patient][msg.sender] = true;
        
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENT) / 100;
        uint256 patientPayment = msg.value - platformFee;
        
        patients[patient].totalEarnings += patientPayment;
        
        (bool success, ) = platformWallet.call{value: platformFee}("");
        require(success, "Platform fee transfer failed");
        
        patients[patient].activityLogs.push(ActivityLog({
            action: "Researcher Access Purchased",
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        
        emit ResearcherAccessGranted(patient, msg.sender, block.timestamp);
        emit ResearcherAccessPurchased(patient, msg.sender, patientPayment, platformFee, block.timestamp);
    }

    function requestHealthRecordDecryption(address _patient, uint256 recordIndex) external {
        if (!patients[_patient].isRegistered) revert NotRegistered();
        if (!researcherAccess[_patient][msg.sender]) revert NotApprovedResearcher();
        if (recordIndex >= patients[_patient].healthRecords.length) revert InvalidRecordIndex();
        
        HealthData storage record = patients[_patient].healthRecords[recordIndex];
        
        bytes32[] memory handles = new bytes32[](3);
        handles[0] = FHE.toBytes32(record.bloodSugar);
        handles[1] = FHE.toBytes32(record.cholesterol);
        handles[2] = FHE.toBytes32(record.bmi);
        
        uint256 requestId = FHE.requestDecryption(handles, this.callbackHealthRecordDecryption.selector);
        
        pendingRequests[requestId] = PendingDecryptionRequest({
            patient: _patient,
            requester: msg.sender,
            recordIndex: recordIndex,
            fulfilled: false
        });
        
        emit HealthRecordDecryptionRequested(_patient, msg.sender, recordIndex, requestId);
    }

    function callbackHealthRecordDecryption(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) public {
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        
        (uint64 bloodSugar, uint64 cholesterol, uint64 bmi) = abi.decode(cleartexts, (uint64, uint64, uint64));
        
        PendingDecryptionRequest storage request = pendingRequests[requestId];
        require(!request.fulfilled, "Already fulfilled");
        
        decryptedRecords[request.patient][request.requester][request.recordIndex] = DecryptedHealthRecord({
            bloodSugar: bloodSugar,
            cholesterol: cholesterol,
            bmi: bmi,
            timestamp: patients[request.patient].healthRecords[request.recordIndex].timestamp,
            isDecrypted: true
        });
        
        request.fulfilled = true;
        
        emit HealthRecordDecrypted(request.patient, request.requester, request.recordIndex, bloodSugar, cholesterol, bmi);
    }

    function requestScoreDecryption() external {
        Patient storage patient = patients[msg.sender];
        if (!patient.isRegistered) revert NotRegistered();
        
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(patient.healthScore);
        
        uint256 requestId = FHE.requestDecryption(handles, this.callbackScoreDecryption.selector);
        patient.decryptionRequestId = requestId;
        scoreDecryptionPatients[requestId] = msg.sender;
        
        emit ScoreDecryptionRequested(msg.sender, requestId);
    }

    function callbackScoreDecryption(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) public {
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        
        uint64 score = abi.decode(cleartexts, (uint64));
        address patientAddr = scoreDecryptionPatients[requestId];
        
        Patient storage patient = patients[patientAddr];
        patient.decryptedScore = score;
        patient.scoreDecrypted = true;
        
        emit ScoreDecrypted(patientAddr, score, block.timestamp);
    }

    // ============ View Functions ============
    
    function getPatientInfo(address _patient) external view returns (
        bool isRegistered,
        bool sharingEnabled,
        uint256 lastDataShare,
        uint256 registrationTime,
        uint256 dataShareCount,
        uint64 decryptedScore,
        bool scoreDecrypted,
        uint256 totalEarnings
    ) {
        Patient storage patient = patients[_patient];
        return (
            patient.isRegistered,
            patient.sharingEnabled,
            patient.lastDataShare,
            patient.registrationTime,
            patient.dataShareCount,
            patient.decryptedScore,
            patient.scoreDecrypted,
            patient.totalEarnings
        );
    }

    function getPatientHealthRecords(address _patient) external view returns (HealthData[] memory) {
        return patients[_patient].healthRecords;
    }

    function getPatientActivity(address _patient) external view returns (ActivityLog[] memory) {
        return patients[_patient].activityLogs;
    }

    function getDecryptedHealthRecord(address patient, uint256 recordIndex) external view returns (
        uint64 bloodSugar,
        uint64 cholesterol,
        uint64 bmi,
        uint256 timestamp,
        bool isDecrypted
    ) {
        DecryptedHealthRecord storage record = decryptedRecords[patient][msg.sender][recordIndex];
        return (record.bloodSugar, record.cholesterol, record.bmi, record.timestamp, record.isDecrypted);
    }

    function getHealthRecordCount(address _patient) external view returns (uint256) {
        return patients[_patient].healthRecords.length;
    }

    function getDecryptedScore(address _patient) external view returns (uint64, bool) {
        return (patients[_patient].decryptedScore, patients[_patient].scoreDecrypted);
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

    function hasLenderApproval(address patient, address lender) external view returns (bool) {
        return lenderApprovals[patient][lender];
    }

    function hasResearcherAccess(address patient, address researcher) external view returns (bool) {
        return researcherAccess[patient][researcher];
    }

    function isPatientRegistered(address _patient) external view returns (bool) {
        return patients[_patient].isRegistered;
    }

    function isSharingEnabled(address _patient) external view returns (bool) {
        return patients[_patient].sharingEnabled;
    }

    function getRiskLevel(address patient) external returns (euint8) {
        if (!patients[patient].isRegistered) revert NotRegistered();
        
        euint64 score = patients[patient].healthScore;
        euint64 lowThreshold = FHE.asEuint64(550);
        euint64 medThreshold = FHE.asEuint64(650);
        
        ebool isLow = FHE.lt(score, lowThreshold);
        ebool isMed = FHE.and(FHE.ge(score, lowThreshold), FHE.lt(score, medThreshold));
        
        euint8 lowRisk = FHE.asEuint8(3);
        euint8 medRisk = FHE.asEuint8(2);
        euint8 highRisk = FHE.asEuint8(1);
        
        euint8 risk = FHE.select(isLow, lowRisk, medRisk);
        risk = FHE.select(isMed, medRisk, risk);
        risk = FHE.select(FHE.ge(score, medThreshold), highRisk, risk);
        
        return risk;
    }

    // ============ Admin Functions ============
    
    function setPlatformWallet(address _platformWallet) external {
        if (_platformWallet == address(0)) revert InvalidAddress();
        platformWallet = _platformWallet;
    }
    
    // ============ Receive Function ============
    
    receive() external payable {}
    fallback() external payable {}
}
