// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {EthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Cerebrum Risk Scoring Library
/// @notice Separate contract for encrypted risk calculations to reduce main contract size
/// @dev Called by main Cerebrum contract to calculate disease risks
contract CerebrumRiskScoring is EthereumConfig {
    
    /// @notice Calculate encrypted diabetes risk score
    /// @param bloodSugar Encrypted blood sugar level
    /// @param bmi Encrypted BMI
    /// @param age Patient age (plaintext)
    /// @return Encrypted diabetes risk score
    function calculateDiabetesRisk(
        euint64 bloodSugar,
        euint64 bmi,
        uint8 age
    ) external returns (euint64) {
        euint64 bsRisk = FHE.mul(bloodSugar, FHE.asEuint64(40));
        euint64 bmiRisk = FHE.mul(bmi, FHE.asEuint64(30));
        euint64 ageRisk = FHE.mul(FHE.asEuint64(uint64(age)), FHE.asEuint64(10));
        
        euint64 totalRisk = FHE.add(bsRisk, bmiRisk);
        totalRisk = FHE.add(totalRisk, ageRisk);
        
        // Allow calling contract (main contract) to access
        FHE.allow(totalRisk, msg.sender);
        
        return totalRisk;
    }

    /// @notice Calculate encrypted heart disease risk score
    /// @param cholesterol Encrypted cholesterol level
    /// @param bloodPressureSystolic Encrypted systolic BP
    /// @param heartRate Encrypted heart rate
    /// @return Encrypted heart disease risk score
    function calculateHeartDiseaseRisk(
        euint64 cholesterol,
        euint64 bloodPressureSystolic,
        euint64 heartRate
    ) external returns (euint64) {
        euint64 cholRisk = FHE.mul(cholesterol, FHE.asEuint64(35));
        euint64 bpRisk = FHE.mul(bloodPressureSystolic, FHE.asEuint64(25));
        euint64 hrRisk = FHE.mul(heartRate, FHE.asEuint64(20));
        
        euint64 totalRisk = FHE.add(cholRisk, bpRisk);
        totalRisk = FHE.add(totalRisk, hrRisk);
        
        FHE.allow(totalRisk, msg.sender);
        
        return totalRisk;
    }

    /// @notice Calculate encrypted stroke risk score
    /// @param bloodPressureSystolic Encrypted systolic BP
    /// @param cholesterol Encrypted cholesterol
    /// @param age Patient age (plaintext)
    /// @param bmi Encrypted BMI
    /// @return Encrypted stroke risk score
    function calculateStrokeRisk(
        euint64 bloodPressureSystolic,
        euint64 cholesterol,
        uint8 age,
        euint64 bmi
    ) external returns (euint64) {
        euint64 bpRisk = FHE.mul(bloodPressureSystolic, FHE.asEuint64(30));
        euint64 cholRisk = FHE.mul(cholesterol, FHE.asEuint64(25));
        euint64 ageRisk = FHE.mul(FHE.asEuint64(uint64(age)), FHE.asEuint64(20));
        euint64 bmiRisk = FHE.mul(bmi, FHE.asEuint64(15));
        
        euint64 totalRisk = FHE.add(bpRisk, cholRisk);
        totalRisk = FHE.add(totalRisk, ageRisk);
        totalRisk = FHE.add(totalRisk, bmiRisk);
        
        FHE.allow(totalRisk, msg.sender);
        
        return totalRisk;
    }

    /// @notice Calculate all three risks at once
    /// @return diabetesRisk Encrypted diabetes risk
    /// @return heartRisk Encrypted heart disease risk
    /// @return strokeRisk Encrypted stroke risk
    function calculateComprehensiveRisk(
        euint64 bloodSugar,
        euint64 cholesterol,
        euint64 bmi,
        euint64 bloodPressureSystolic,
        euint64 heartRate,
        uint8 age
    ) external returns (euint64 diabetesRisk, euint64 heartRisk, euint64 strokeRisk) {
        // Diabetes risk
        euint64 bsRisk = FHE.mul(bloodSugar, FHE.asEuint64(40));
        euint64 bmiRiskD = FHE.mul(bmi, FHE.asEuint64(30));
        euint64 ageRiskD = FHE.mul(FHE.asEuint64(uint64(age)), FHE.asEuint64(10));
        diabetesRisk = FHE.add(FHE.add(bsRisk, bmiRiskD), ageRiskD);
        
        // Heart disease risk
        euint64 cholRisk = FHE.mul(cholesterol, FHE.asEuint64(35));
        euint64 bpRiskH = FHE.mul(bloodPressureSystolic, FHE.asEuint64(25));
        euint64 hrRisk = FHE.mul(heartRate, FHE.asEuint64(20));
        heartRisk = FHE.add(FHE.add(cholRisk, bpRiskH), hrRisk);
        
        // Stroke risk
        euint64 bpRiskS = FHE.mul(bloodPressureSystolic, FHE.asEuint64(30));
        euint64 cholRiskS = FHE.mul(cholesterol, FHE.asEuint64(25));
        euint64 ageRiskS = FHE.mul(FHE.asEuint64(uint64(age)), FHE.asEuint64(20));
        euint64 bmiRiskS = FHE.mul(bmi, FHE.asEuint64(15));
        strokeRisk = FHE.add(FHE.add(FHE.add(bpRiskS, cholRiskS), ageRiskS), bmiRiskS);
        
        // Grant permission to calling contract (main contract needs to access values)
        FHE.allow(diabetesRisk, msg.sender);
        FHE.allow(heartRisk, msg.sender);
        FHE.allow(strokeRisk, msg.sender);

        return (diabetesRisk, heartRisk, strokeRisk);
    }
}