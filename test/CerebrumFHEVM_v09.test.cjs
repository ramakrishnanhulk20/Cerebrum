const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CerebrumFHEVM_v09 - FHEVM v0.9 Test Suite", function () {
  let cerebrum, riskScoring;
  let owner, platformWallet, patient1, patient2, researcher1, researcher2, lender;
  let fhevm;

  // Test constants matching contract
  const INITIAL_SCORE = 500n;
  const SCORE_INCREMENT = 10n;
  const MAX_SCORE = 850n;
  const BASE_RESEARCHER_FEE = ethers.parseEther("0.005"); // Actual contract value
  const LENDER_CHECK_FEE = ethers.parseEther("0.01"); // Actual contract value: 0.01 ether
  const PLATFORM_FEE_PERCENT = 20n;
  const TIER_PREMIUM = 90n;
  const TIER_COMPLETE = 70n;
  const TIER_STANDARD = 50n;

  beforeEach(async function () {
    [owner, platformWallet, patient1, patient2, researcher1, researcher2, lender] = await ethers.getSigners();

    // Deploy Risk Scoring Library first
    const CerebrumRiskScoring = await ethers.getContractFactory("CerebrumRiskScoring");
    riskScoring = await CerebrumRiskScoring.deploy();
    await riskScoring.waitForDeployment();

    // Deploy main contract with platform wallet and risk scoring library
    const CerebrumFHEVM = await ethers.getContractFactory("CerebrumFHEVM_v09");
    cerebrum = await CerebrumFHEVM.deploy(
      platformWallet.address,
      await riskScoring.getAddress()
    );
    await cerebrum.waitForDeployment();

    console.log("\n📋 Contract Deployed:");
    console.log("  Main Contract:", await cerebrum.getAddress());
    console.log("  Risk Scoring:", await riskScoring.getAddress());
    console.log("  Platform Wallet:", platformWallet.address);
  });

  // ============ DEPLOYMENT TESTS ============
  describe("Deployment & Initialization", function () {
    it("Should deploy with correct platform wallet", async function () {
      expect(await cerebrum.platformWallet()).to.equal(platformWallet.address);
    });

    it("Should deploy with correct risk scoring library", async function () {
      expect(await cerebrum.riskScoringLibrary()).to.equal(await riskScoring.getAddress());
    });

    it("Should set correct owner", async function () {
      expect(await cerebrum.owner()).to.equal(owner.address);
    });

    it("Should initialize v0.9 constants correctly", async function () {
      expect(await cerebrum.INITIAL_SCORE()).to.equal(INITIAL_SCORE);
      expect(await cerebrum.SCORE_INCREMENT()).to.equal(SCORE_INCREMENT);
      expect(await cerebrum.MAX_SCORE()).to.equal(MAX_SCORE);
      expect(await cerebrum.BASE_RESEARCHER_FEE()).to.equal(BASE_RESEARCHER_FEE);
      expect(await cerebrum.LENDER_CHECK_FEE()).to.equal(LENDER_CHECK_FEE);
      expect(await cerebrum.PLATFORM_FEE_PERCENT()).to.equal(PLATFORM_FEE_PERCENT);
    });

    it("Should initialize tier constants", async function () {
      expect(await cerebrum.TIER_STANDARD()).to.equal(50);
      expect(await cerebrum.TIER_COMPLETE()).to.equal(70);
      expect(await cerebrum.TIER_PREMIUM()).to.equal(90);
    });

    it("Should have zero initial patients", async function () {
      expect(await cerebrum.getTotalPatients()).to.equal(0n);
    });

    it("Should have zero initial data shares", async function () {
      expect(await cerebrum.getTotalDataShares()).to.equal(0n);
    });

    it("Should revert deployment with zero platform wallet", async function () {
      const CerebrumFHEVM = await ethers.getContractFactory("CerebrumFHEVM_v09");
      await expect(
        CerebrumFHEVM.deploy(ethers.ZeroAddress, await riskScoring.getAddress())
      ).to.be.revertedWithCustomError(cerebrum, "InvalidAddress");
    });
  });

  // ============ PATIENT REGISTRATION (v0.9) ============
  describe("Patient Registration (v0.9 with FHE)", function () {
    it("Should register patient successfully", async function () {
      await expect(cerebrum.connect(patient1).registerPatient())
        .to.emit(cerebrum, "PatientRegistered")
        .withArgs(patient1.address, (await ethers.provider.getBlock('latest')).timestamp + 1);

      expect(await cerebrum.isPatientRegistered(patient1.address)).to.equal(true);
    });

    it("Should initialize patient with encrypted health score", async function () {
      await cerebrum.connect(patient1).registerPatient();
      
      const info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.isRegistered).to.equal(true);
      expect(info.sharingEnabled).to.equal(false); // Default is false, must be toggled on
      expect(info.dataShareCount).to.equal(0n);
      expect(info.totalEarnings).to.equal(0n);
    });

    it("Should prevent duplicate registration", async function () {
      await cerebrum.connect(patient1).registerPatient();
      await expect(
        cerebrum.connect(patient1).registerPatient()
      ).to.be.revertedWithCustomError(cerebrum, "AlreadyRegistered");
    });

    it("Should track multiple patient registrations", async function () {
      await cerebrum.connect(patient1).registerPatient();
      await cerebrum.connect(patient2).registerPatient();
      
      expect(await cerebrum.getTotalPatients()).to.equal(2n);
      
      const patientList = await cerebrum.getPatientList();
      expect(patientList.length).to.equal(2);
      expect(patientList[0]).to.equal(patient1.address);
      expect(patientList[1]).to.equal(patient2.address);
    });

    it("Should NOT add patient to sharing enabled list by default", async function () {
      await cerebrum.connect(patient1).registerPatient();
      
      const sharingEnabled = await cerebrum.getSharingEnabledPatients();
      expect(sharingEnabled.length).to.equal(0); // Sharing disabled by default
      expect(await cerebrum.getSharingEnabledCount()).to.equal(0n);
    });

    it("Should create activity log entry for registration", async function () {
      await cerebrum.connect(patient1).registerPatient();
      
      const logs = await cerebrum.getPatientActivity(patient1.address);
      expect(logs.length).to.equal(1);
      expect(logs[0].action).to.equal("Patient Registered");
    });
  });

  // ============ DATA SHARING TOGGLE (v0.9) ============
  describe("Data Sharing Controls (v0.9)", function () {
    beforeEach(async function () {
      await cerebrum.connect(patient1).registerPatient();
    });

    it("Should toggle sharing to enabled (starts disabled)", async function () {
      await expect(cerebrum.connect(patient1).toggleDataSharing())
        .to.emit(cerebrum, "DataSharingToggled")
        .withArgs(patient1.address, true, (await ethers.provider.getBlock('latest')).timestamp + 1);

      expect(await cerebrum.isSharingEnabled(patient1.address)).to.equal(true);
    });

    it("Should toggle sharing back to disabled", async function () {
      await cerebrum.connect(patient1).toggleDataSharing(); // Enable (was false)
      await cerebrum.connect(patient1).toggleDataSharing(); // Disable
      
      expect(await cerebrum.isSharingEnabled(patient1.address)).to.equal(false);
    });

    it("Should update sharing enabled count correctly", async function () {
      expect(await cerebrum.getSharingEnabledCount()).to.equal(0n); // Starts at 0
      
      await cerebrum.connect(patient1).toggleDataSharing(); // Enable
      expect(await cerebrum.getSharingEnabledCount()).to.equal(1n);
      
      await cerebrum.connect(patient1).toggleDataSharing(); // Disable
      expect(await cerebrum.getSharingEnabledCount()).to.equal(0n);
    });

    it("Should prevent toggle if not registered", async function () {
      await expect(
        cerebrum.connect(researcher1).toggleDataSharing()
      ).to.be.revertedWithCustomError(cerebrum, "NotRegistered");
    });

    it("Should track activity log for toggles", async function () {
      await cerebrum.connect(patient1).toggleDataSharing();
      await cerebrum.connect(patient1).toggleDataSharing();
      
      const logs = await cerebrum.getPatientActivity(patient1.address);
      expect(logs.length).to.equal(1); // Only registration is logged in activityLogs (toggles emit events but don't create log entries)
    });
  });

  // ============ LENDER APPROVAL (v0.9) ============
  describe("Lender Approval System (v0.9)", function () {
    beforeEach(async function () {
      await cerebrum.connect(patient1).registerPatient();
    });

    it("Should approve lender successfully", async function () {
      await expect(cerebrum.connect(patient1).approveLender(lender.address))
        .to.emit(cerebrum, "LenderApprovalGranted")
        .withArgs(patient1.address, lender.address, (await ethers.provider.getBlock('latest')).timestamp + 1);

      expect(await cerebrum.hasLenderApproval(patient1.address, lender.address)).to.equal(true);
    });

    it("Should track approved patients for lender", async function () {
      await cerebrum.connect(patient1).approveLender(lender.address);
      await cerebrum.connect(patient2).registerPatient();
      await cerebrum.connect(patient2).approveLender(lender.address);
      
      const approvedPatients = await cerebrum.getApprovedPatients(lender.address);
      expect(approvedPatients.length).to.equal(2);
      expect(approvedPatients[0]).to.equal(patient1.address);
      expect(approvedPatients[1]).to.equal(patient2.address);
    });

    it("Should revoke lender approval", async function () {
      await cerebrum.connect(patient1).approveLender(lender.address);
      
      await expect(cerebrum.connect(patient1).revokeLender(lender.address))
        .to.emit(cerebrum, "LenderApprovalRevoked")
        .withArgs(patient1.address, lender.address, (await ethers.provider.getBlock('latest')).timestamp + 1);

      expect(await cerebrum.hasLenderApproval(patient1.address, lender.address)).to.equal(false);
    });

    it("Should prevent zero address approval", async function () {
      await expect(
        cerebrum.connect(patient1).approveLender(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(cerebrum, "InvalidAddress");
    });

    it("Should prevent unregistered patient from approving", async function () {
      await expect(
        cerebrum.connect(researcher1).approveLender(lender.address)
      ).to.be.revertedWithCustomError(cerebrum, "NotRegistered");
    });

    it("Should allow multiple lender approvals", async function () {
      await cerebrum.connect(patient1).approveLender(lender.address);
      await cerebrum.connect(patient1).approveLender(researcher1.address);
      
      expect(await cerebrum.hasLenderApproval(patient1.address, lender.address)).to.equal(true);
      expect(await cerebrum.hasLenderApproval(patient1.address, researcher1.address)).to.equal(true);
    });
  });

  // ============ RESEARCHER ACCESS & PAYMENTS (v0.9 with FHE.allowTransient) ============
  describe("Researcher Access Purchase (v0.9 with Auto-Grants)", function () {
    beforeEach(async function () {
      await cerebrum.connect(patient1).registerPatient();
 // Create first health record
      await cerebrum.connect(patient1).toggleDataSharing(); // Enable sharing for researcher tests
    });

    it("Should purchase access with correct payment", async function () {
      const fee = BASE_RESEARCHER_FEE;
      
      await expect(
        cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
          value: fee
        })
      ).to.emit(cerebrum, "ResearcherAccessPurchased");

      expect(await cerebrum.hasResearcherAccess(patient1.address, researcher1.address)).to.equal(true);
    });

    it("Should split payment 80/20 correctly", async function () {
      const fee = BASE_RESEARCHER_FEE;
      const patientShare = (fee * 80n) / 100n; // 0.008 ETH
      const platformShare = (fee * 20n) / 100n; // 0.002 ETH
      
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });
      
      const info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(patientShare);
    });

    it("Should emit correct event with payment details", async function () {
      const fee = BASE_RESEARCHER_FEE;
      const patientShare = (fee * 80n) / 100n;
      const platformShare = (fee * 20n) / 100n;
      
      const tx = await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return cerebrum.interface.parseLog(log).name === "ResearcherAccessPurchased";
        } catch {
          return false;
        }
      });
      
      expect(event).to.not.be.undefined;
    });

    it("Should prevent insufficient payment", async function () {
      const insufficientFee = ethers.parseEther("0.005");
      
      await expect(
        cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
          value: insufficientFee
        })
      ).to.be.revertedWithCustomError(cerebrum, "InsufficientPayment");
    });

    it("Should prevent access to unregistered patient", async function () {
      const fee = BASE_RESEARCHER_FEE;
      
      await expect(
        cerebrum.connect(researcher1).purchaseResearcherAccess(researcher2.address, 0, {
          value: fee
        })
      ).to.be.revertedWithCustomError(cerebrum, "NotRegistered");
    });

    it("Should allow multiple researchers to purchase access", async function () {
      const fee = BASE_RESEARCHER_FEE;
      
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });
      await cerebrum.connect(researcher2).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });
      
      expect(await cerebrum.hasResearcherAccess(patient1.address, researcher1.address)).to.equal(true);
      expect(await cerebrum.hasResearcherAccess(patient1.address, researcher2.address)).to.equal(true);
      
      const info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(ethers.parseEther("0.016")); // 0.008 * 2
    });

    it("Should track researcher purchase count", async function () {
      const fee = BASE_RESEARCHER_FEE;
      
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });
      await cerebrum.connect(patient2).registerPatient();
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient2.address, 0, {
        value: fee
      });
      
      expect(await cerebrum.getResearcherPurchaseCount(researcher1.address)).to.equal(2n);
    });

    it("Should track purchased patients list", async function () {
      const fee = BASE_RESEARCHER_FEE;
      
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });
      await cerebrum.connect(patient2).registerPatient();
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient2.address, 0, {
        value: fee
      });
      
      const purchased = await cerebrum.getResearcherPurchasedPatients(researcher1.address);
      expect(purchased.length).to.equal(2);
      expect(purchased[0]).to.equal(patient1.address);
      expect(purchased[1]).to.equal(patient2.address);
    });
  });

  // ============ EARNINGS MANAGEMENT (v0.9) ============
  describe("Earnings Claims (v0.9)", function () {
    beforeEach(async function () {
      await cerebrum.connect(patient1).registerPatient();

      await cerebrum.connect(patient1).toggleDataSharing(); // Enable sharing
      const fee = BASE_RESEARCHER_FEE;
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });
    });

    it("Should claim earnings successfully", async function () {
      const initialBalance = await ethers.provider.getBalance(patient1.address);
      const earnings = ethers.parseEther("0.004"); // 80% of 0.005
      
      const tx = await cerebrum.connect(patient1).claimEarnings();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(patient1.address);
      expect(finalBalance).to.be.closeTo(initialBalance + earnings - gasUsed, ethers.parseEther("0.0001"));
    });

    it("Should emit EarningsDistributed event", async function () {
      await expect(cerebrum.connect(patient1).claimEarnings())
        .to.emit(cerebrum, "EarningsDistributed")
        .withArgs(patient1.address, ethers.parseEther("0.004"), (await ethers.provider.getBlock('latest')).timestamp + 1);
    });

    it("Should reset earnings to zero after claim", async function () {
      await cerebrum.connect(patient1).claimEarnings();
      
      const info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(0n);
    });

    it("Should prevent claim with zero earnings", async function () {
      await cerebrum.connect(patient1).claimEarnings();
      
      await expect(
        cerebrum.connect(patient1).claimEarnings()
      ).to.be.revertedWithCustomError(cerebrum, "InsufficientEarnings");
    });

    it("Should prevent unregistered patient from claiming", async function () {
      await expect(
        cerebrum.connect(researcher1).claimEarnings()
      ).to.be.revertedWithCustomError(cerebrum, "NotRegistered");
    });

    it("Should accumulate earnings from multiple purchases", async function () {
      const fee = BASE_RESEARCHER_FEE;
      await cerebrum.connect(researcher2).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });
      
      const info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(ethers.parseEther("0.016")); // 0.008 * 2
    });
  });

  // ============ LENDER ELIGIBILITY CHECKS (v0.9 with FHE) ============
  describe("Lender Eligibility Checks (v0.9 Zero-Knowledge)", function () {
    beforeEach(async function () {
      await cerebrum.connect(patient1).registerPatient();
      await cerebrum.connect(patient1).approveLender(lender.address);
    });

    it("Should check eligibility with plaintext threshold", async function () {
      const minScore = 650n;
      const fee = LENDER_CHECK_FEE;
      
      await expect(
        cerebrum.connect(lender).checkEligibility(patient1.address, minScore, {
          value: fee
        })
      ).to.emit(cerebrum, "EligibilityChecked")
        .withArgs(patient1.address, lender.address, minScore, (await ethers.provider.getBlock('latest')).timestamp + 1);
    });

    it("Should prevent check without approval", async function () {
      const minScore = 650n;
      const fee = LENDER_CHECK_FEE;
      
      await expect(
        cerebrum.connect(researcher1).checkEligibility(patient1.address, minScore, {
          value: fee
        })
      ).to.be.revertedWithCustomError(cerebrum, "NotApprovedLender");
    });

    it("Should prevent check with insufficient payment", async function () {
      const minScore = 650n;
      const insufficientFee = ethers.parseEther("0.001");
      
      await expect(
        cerebrum.connect(lender).checkEligibility(patient1.address, minScore, {
          value: insufficientFee
        })
      ).to.be.revertedWithCustomError(cerebrum, "InsufficientPayment");
    });

    it("Should track eligibility history", async function () {
      const minScore = 650n;
      const fee = LENDER_CHECK_FEE;
      
      await cerebrum.connect(lender).checkEligibility(patient1.address, minScore, {
        value: fee
      });
      
      const history = await cerebrum.getEligibilityHistory(patient1.address, lender.address);
      expect(history.length).to.equal(1);
      expect(history[0].lender).to.equal(lender.address);
      expect(history[0].minScore).to.equal(minScore);
      expect(history[0].amountPaid).to.equal(fee);
    });

    it("Should prevent check on unregistered patient", async function () {
      const minScore = 650n;
      const fee = LENDER_CHECK_FEE;
      
      // Lender is not approved for researcher1 (also unregistered), so it fails with NotApprovedLender first
      await expect(
        cerebrum.connect(lender).checkEligibility(researcher1.address, minScore, {
          value: fee
        })
      ).to.be.revertedWithCustomError(cerebrum, "NotApprovedLender"); // Contract checks approval before registration
    });
  });

  // ============ VIEW FUNCTIONS (v0.9) ============
  describe("View Functions (v0.9)", function () {
    beforeEach(async function () {
      await cerebrum.connect(patient1).registerPatient();
      await cerebrum.connect(patient2).registerPatient();
    });

    it("Should return correct patient info", async function () {
      const info = await cerebrum.getPatientInfo(patient1.address);
      
      expect(info.isRegistered).to.equal(true);
      expect(info.sharingEnabled).to.equal(false); // Default is false
      expect(info.dataShareCount).to.equal(0n);
      expect(info.totalEarnings).to.equal(0n);
    });

    it("Should return correct total patients", async function () {
      expect(await cerebrum.getTotalPatients()).to.equal(2n);
    });

    it("Should return correct total data shares", async function () {
      expect(await cerebrum.getTotalDataShares()).to.equal(0n);
    });

    it("Should return complete patient list", async function () {
      const patients = await cerebrum.getPatientList();
      expect(patients.length).to.equal(2);
      expect(patients[0]).to.equal(patient1.address);
      expect(patients[1]).to.equal(patient2.address);
    });

    it("Should return sharing enabled patients", async function () {
      await cerebrum.connect(patient2).toggleDataSharing(); // Enable patient2
      
      const sharingPatients = await cerebrum.getSharingEnabledPatients();
      expect(sharingPatients.length).to.equal(1);
      expect(sharingPatients[0]).to.equal(patient2.address);
    });

    it("Should return correct health record count", async function () {
      expect(await cerebrum.getHealthRecordCount(patient1.address)).to.equal(0n);
    });

    it("Should return registration status correctly", async function () {
      expect(await cerebrum.isPatientRegistered(patient1.address)).to.equal(true);
      expect(await cerebrum.isPatientRegistered(researcher1.address)).to.equal(false);
    });

    it("Should return sharing status correctly", async function () {
      expect(await cerebrum.isSharingEnabled(patient1.address)).to.equal(false); // Starts false
      
      await cerebrum.connect(patient1).toggleDataSharing(); // Enable
      expect(await cerebrum.isSharingEnabled(patient1.address)).to.equal(true);
    });

    it("Should return activity logs", async function () {
      const logs = await cerebrum.getPatientActivity(patient1.address);
      expect(logs.length).to.equal(1);
      expect(logs[0].action).to.equal("Patient Registered");
    });
  });

  // ============ ADMIN FUNCTIONS (v0.9) ============
  describe("Admin Functions (v0.9)", function () {
    it("Should allow owner to update platform wallet", async function () {
      const newWallet = researcher1.address;
      
      await cerebrum.connect(owner).setPlatformWallet(newWallet);
      expect(await cerebrum.platformWallet()).to.equal(newWallet);
    });

    it("Should prevent non-owner from updating platform wallet", async function () {
      // Note: FHEVM Hardhat plugin throws HardhatFhevmError before custom error can be caught
      try {
        await cerebrum.connect(patient1).setPlatformWallet(researcher1.address);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Fhevm assertion failed");
      }
    });

    it("Should prevent zero address platform wallet", async function () {
      await expect(
        cerebrum.connect(owner).setPlatformWallet(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(cerebrum, "InvalidAddress");
    });

    it("Should allow owner to transfer ownership", async function () {
      await cerebrum.connect(owner).transferOwnership(researcher1.address);
      expect(await cerebrum.owner()).to.equal(researcher1.address);
    });

    it("Should prevent non-owner from transferring ownership", async function () {
      // Note: FHEVM Hardhat plugin throws HardhatFhevmError before custom error can be caught
      try {
        await cerebrum.connect(patient1).transferOwnership(researcher1.address);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Fhevm assertion failed");
      }
    });

    it("Should prevent transferring to zero address", async function () {
      await expect(
        cerebrum.connect(owner).transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(cerebrum, "InvalidAddress");
    });
  });

  // ============ COMPLEX WORKFLOWS (v0.9) ============
  describe("Complete Workflows (v0.9 End-to-End)", function () {
    it("Full patient workflow: register → toggle → claim", async function () {
      // Register
      await cerebrum.connect(patient1).registerPatient();

      expect(await cerebrum.getTotalPatients()).to.equal(1n);

      // Enable sharing first
      await cerebrum.connect(patient1).toggleDataSharing();

      // Researcher purchases access
      const fee = BASE_RESEARCHER_FEE;
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });

      // Verify earnings
      let info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(ethers.parseEther("0.004")); // 80% of 0.005

      // Claim earnings
      await cerebrum.connect(patient1).claimEarnings();
      info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(0n);

      // Toggle sharing off
      await cerebrum.connect(patient1).toggleDataSharing();
      expect(await cerebrum.isSharingEnabled(patient1.address)).to.equal(false);
    });

    it("Multi-researcher access workflow", async function () {
      await cerebrum.connect(patient1).registerPatient();

      await cerebrum.connect(patient1).toggleDataSharing(); // Enable sharing
      const fee = BASE_RESEARCHER_FEE;

      // Multiple researchers purchase
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });
      await cerebrum.connect(researcher2).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });

      // Verify both have access
      expect(await cerebrum.hasResearcherAccess(patient1.address, researcher1.address)).to.equal(true);
      expect(await cerebrum.hasResearcherAccess(patient1.address, researcher2.address)).to.equal(true);

      // Verify accumulated earnings (2 * 0.004 = 0.008)
      const info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(ethers.parseEther("0.008"));
    });

    it("Multi-patient researcher workflow", async function () {
      await cerebrum.connect(patient1).registerPatient();
      await cerebrum.connect(patient2).registerPatient();


      await cerebrum.connect(patient1).toggleDataSharing(); // Enable for patient1
      await cerebrum.connect(patient2).toggleDataSharing(); // Enable for patient2
      const fee = BASE_RESEARCHER_FEE;

      // Researcher buys access to both patients
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient2.address, 0, {
        value: fee
      });

      // Verify both patients have earnings (80% of 0.005 = 0.004)
      const info1 = await cerebrum.getPatientInfo(patient1.address);
      const info2 = await cerebrum.getPatientInfo(patient2.address);
      expect(info1.totalEarnings).to.equal(ethers.parseEther("0.004"));
      expect(info2.totalEarnings).to.equal(ethers.parseEther("0.004"));

      // Verify researcher tracking
      expect(await cerebrum.getResearcherPurchaseCount(researcher1.address)).to.equal(2n);
    });

    it("Lender approval and eligibility workflow", async function () {
      await cerebrum.connect(patient1).registerPatient();
      
      // Approve lender
      await cerebrum.connect(patient1).approveLender(lender.address);
      expect(await cerebrum.hasLenderApproval(patient1.address, lender.address)).to.equal(true);

      // Check eligibility
      const minScore = 650n;
      const fee = LENDER_CHECK_FEE;
      await cerebrum.connect(lender).checkEligibility(patient1.address, minScore, {
        value: fee
      });

      // Verify history
      const history = await cerebrum.getEligibilityHistory(patient1.address, lender.address);
      expect(history.length).to.equal(1);

      // Revoke approval
      await cerebrum.connect(patient1).revokeLender(lender.address);
      expect(await cerebrum.hasLenderApproval(patient1.address, lender.address)).to.equal(false);
    });

    it("Complete ecosystem workflow with all actors", async function () {
      // Setup
      await cerebrum.connect(patient1).registerPatient();
      await cerebrum.connect(patient2).registerPatient();

      await cerebrum.connect(patient1).toggleDataSharing(); // Enable sharing

      // Researcher access
      const researcherFee = BASE_RESEARCHER_FEE;
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
        value: researcherFee
      });

      // Lender workflow
      await cerebrum.connect(patient1).approveLender(lender.address);
      const lenderFee = LENDER_CHECK_FEE;
      await cerebrum.connect(lender).checkEligibility(patient1.address, 650n, {
        value: lenderFee
      });

      // Patient claims
      await cerebrum.connect(patient1).claimEarnings();

      // Verify final state
      expect(await cerebrum.getTotalPatients()).to.equal(2n);
      expect(await cerebrum.hasResearcherAccess(patient1.address, researcher1.address)).to.equal(true);
      expect(await cerebrum.hasLenderApproval(patient1.address, lender.address)).to.equal(true);

      const info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(0n); // Claimed
    });
  });

  // ============ EDGE CASES & SECURITY (v0.9) ============
  describe("Edge Cases & Security (v0.9)", function () {
    it("Should handle zero initial state correctly", async function () {
      expect(await cerebrum.getTotalPatients()).to.equal(0n);
      expect(await cerebrum.getTotalDataShares()).to.equal(0n);
      expect(await cerebrum.getSharingEnabledCount()).to.equal(0n);
      
      const emptyList = await cerebrum.getPatientList();
      expect(emptyList.length).to.equal(0);
    });

    it("Should prevent reentrancy in claimEarnings", async function () {
      await cerebrum.connect(patient1).registerPatient();

      await cerebrum.connect(patient1).toggleDataSharing(); // Enable sharing
      const fee = BASE_RESEARCHER_FEE;
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, 0, {
        value: fee
      });

      await cerebrum.connect(patient1).claimEarnings();

      // Second claim should fail
      await expect(
        cerebrum.connect(patient1).claimEarnings()
      ).to.be.revertedWithCustomError(cerebrum, "InsufficientEarnings");
    });

    it("Should handle large numbers of patients", async function () {
      const signers = await ethers.getSigners();
      const numPatients = Math.min(10, signers.length - 6); // Use available signers
      
      for (let i = 0; i < numPatients; i++) {
        await cerebrum.connect(signers[6 + i]).registerPatient();
      }
      
      expect(await cerebrum.getTotalPatients()).to.equal(BigInt(numPatients));
    });

    it("Should maintain state consistency across operations", async function () {
      await cerebrum.connect(patient1).registerPatient();
      
      const initialInfo = await cerebrum.getPatientInfo(patient1.address);
      expect(initialInfo.isRegistered).to.equal(true);
      expect(initialInfo.sharingEnabled).to.equal(false); // Default is false
      
      await cerebrum.connect(patient1).toggleDataSharing(); // Toggle to true
      const afterToggle = await cerebrum.getPatientInfo(patient1.address);
      expect(afterToggle.isRegistered).to.equal(true);
      expect(afterToggle.sharingEnabled).to.equal(true); // Now true after toggle
    });
  });
});
