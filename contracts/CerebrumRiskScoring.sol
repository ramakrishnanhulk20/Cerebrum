// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Cerebrum Risk Scoring Library
/// @notice for encrypted risk calculations to reduce main contract size
/// @dev Called by main Cerebrum contract to calculate disease risks
contract CerebrumRiskScoring is ZamaEthereumConfig {
    
    /// @notice Calculate encrypted diabetes risk score
    /// @param bloodSugar Encrypted blood sugar level (mg/dL)
    /// @param bmi Encrypted BMI (kg/m²)
    /// @param age Patient age (plaintext)
    /// @return Encrypted diabetes risk score (returns 0-1000, display as /10 for 0-100%)
    function calculateDiabetesRisk(
        euint64 bloodSugar,
        euint64 bmi,
        uint8 age
    ) external returns (euint64) {

        euint64 bsScore = FHE.mul(FHE.sub(bloodSugar, FHE.asEuint64(70)), FHE.asEuint64(4)); // ×0.4 = ×4/10
        
  
        euint64 bmiScore = FHE.mul(FHE.sub(bmi, FHE.asEuint64(18)), FHE.asEuint64(12)); // ×1.2 = ×12/10
        
        uint64 ageValue = age > 30 ? uint64(age - 30) : 0;
        euint64 ageScore = FHE.mul(FHE.asEuint64(ageValue), FHE.asEuint64(5)); // ×0.5 = ×5/10
        
        // Total risk (will be ~32+8+0 = 40 → display as 4.0%)
        euint64 totalRisk = FHE.add(FHE.add(bsScore, bmiScore), ageScore);
        
        FHE.allow(totalRisk, msg.sender);
        
        return totalRisk;
    }

    /// @notice Calculate encrypted heart disease risk score
    /// @param cholesterol Encrypted cholesterol level (mg/dL)
    /// @param bloodPressureSystolic Encrypted systolic BP (mmHg)
    /// @param heartRate Encrypted heart rate (bpm)
    /// @return Encrypted heart disease risk score (returns 0-1000, display as /10 for 0-100%)
    function calculateHeartDiseaseRisk(
        euint64 cholesterol,
        euint64 bloodPressureSystolic,
        euint64 heartRate
    ) external returns (euint64) {

        euint64 cholScore = FHE.mul(FHE.sub(cholesterol, FHE.asEuint64(150)), FHE.asEuint64(15)); // ×0.15 = ×15/100, but we want ×1.5 so ×15/10
        

        euint64 bpScore = FHE.mul(FHE.sub(bloodPressureSystolic, FHE.asEuint64(100)), FHE.asEuint64(5)); // ×0.5 = ×5/10
        

        euint64 hrScore = FHE.mul(FHE.sub(heartRate, FHE.asEuint64(80)), FHE.asEuint64(1)); // ×0.1 = ×1/10
        

        euint64 totalRisk = FHE.add(FHE.add(cholScore, bpScore), hrScore);
        
        FHE.allow(totalRisk, msg.sender);
        
        return totalRisk;
    }

    /// @notice Calculate encrypted stroke risk score
    /// @param bloodPressureSystolic Encrypted systolic BP (mmHg)
    /// @param cholesterol Encrypted cholesterol (mg/dL)
    /// @param age Patient age (plaintext)
    /// @param bmi Encrypted BMI (kg/m²)
    /// @return Encrypted stroke risk score (returns 0-1000, display as /10 for 0-100%)
    function calculateStrokeRisk(
        euint64 bloodPressureSystolic,
        euint64 cholesterol,
        uint8 age,
        euint64 bmi
    ) external returns (euint64) {

        euint64 bpScore = FHE.mul(FHE.sub(bloodPressureSystolic, FHE.asEuint64(100)), FHE.asEuint64(6)); // ×0.6 = ×6/10
        

        euint64 cholScore = FHE.mul(FHE.sub(cholesterol, FHE.asEuint64(150)), FHE.asEuint64(1)); // ×0.1 = ×1/10
        

        uint64 ageValue = age > 40 ? uint64(age - 40) : 0;
        euint64 ageScore = FHE.mul(FHE.asEuint64(ageValue), FHE.asEuint64(4)); // ×0.4 = ×4/10
        

        euint64 bmiScore = FHE.mul(FHE.sub(bmi, FHE.asEuint64(20)), FHE.asEuint64(3)); // ×0.3 = ×3/10
        
        // Total (BP=200 gives ~60 points → 6.0%)
        euint64 totalRisk = FHE.add(FHE.add(FHE.add(bpScore, cholScore), ageScore), bmiScore);
        
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
        euint64 bsScore = FHE.mul(FHE.sub(bloodSugar, FHE.asEuint64(70)), FHE.asEuint64(4));
        euint64 bmiScoreD = FHE.mul(FHE.sub(bmi, FHE.asEuint64(18)), FHE.asEuint64(12));
        uint64 ageValueD = age > 30 ? uint64(age - 30) : 0;
        euint64 ageScoreD = FHE.mul(FHE.asEuint64(ageValueD), FHE.asEuint64(5));
        diabetesRisk = FHE.add(FHE.add(bsScore, bmiScoreD), ageScoreD);
        
        // Heart disease risk
        euint64 cholScore = FHE.mul(FHE.sub(cholesterol, FHE.asEuint64(150)), FHE.asEuint64(15));
        euint64 bpScoreH = FHE.mul(FHE.sub(bloodPressureSystolic, FHE.asEuint64(100)), FHE.asEuint64(5));
        euint64 hrScore = FHE.mul(FHE.sub(heartRate, FHE.asEuint64(80)), FHE.asEuint64(1));
        heartRisk = FHE.add(FHE.add(cholScore, bpScoreH), hrScore);
        
        // Stroke risk
        euint64 bpScoreS = FHE.mul(FHE.sub(bloodPressureSystolic, FHE.asEuint64(100)), FHE.asEuint64(6));
        euint64 cholScoreS = FHE.mul(FHE.sub(cholesterol, FHE.asEuint64(150)), FHE.asEuint64(1));
        uint64 ageValueS = age > 40 ? uint64(age - 40) : 0;
        euint64 ageScoreS = FHE.mul(FHE.asEuint64(ageValueS), FHE.asEuint64(4));
        euint64 bmiScoreS = FHE.mul(FHE.sub(bmi, FHE.asEuint64(20)), FHE.asEuint64(3));
        strokeRisk = FHE.add(FHE.add(FHE.add(bpScoreS, cholScoreS), ageScoreS), bmiScoreS);
        
        // Grant permission to calling contract (main contract needs to access values)
        FHE.allow(diabetesRisk, msg.sender);
        FHE.allow(heartRisk, msg.sender);
        FHE.allow(strokeRisk, msg.sender);
        
        return (diabetesRisk, heartRisk, strokeRisk);
    }
}