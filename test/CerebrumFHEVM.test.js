const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CerebrumFHEVM - Full Test Suite", function () {
  let cerebrum;
  let owner, patient1, patient2, researcher1, researcher2, lender;

  beforeEach(async function () {
    [owner, patient1, patient2, researcher1, researcher2, lender] = await ethers.getSigners();

    const CerebrumFHEVM = await ethers.getContractFactory("CerebrumFHEVM_v2");
    cerebrum = await CerebrumFHEVM.deploy(owner.address);
    await cerebrum.waitForDeployment();
  });

  // ============ DEPLOYMENT TESTS ============
  describe("Deployment", function () {
    it("Should deploy with platform wallet", async function () {
      expect(await cerebrum.platformWallet()).to.equal(owner.address);
    });

    it("Should initialize constants", async function () {
      expect(await cerebrum.INITIAL_SCORE()).to.equal(500n);
      expect(await cerebrum.MAX_SCORE()).to.equal(850n);
      expect(await cerebrum.RESEARCHER_ACCESS_FEE()).to.equal(ethers.parseEther("0.01"));
      expect(await cerebrum.PLATFORM_FEE_PERCENT()).to.equal(20n);
    });

    it("Should revert with zero address", async function () {
      const CerebrumFHEVM = await ethers.getContractFactory("CerebrumFHEVM_v2");
      await expect(
        CerebrumFHEVM.deploy(ethers.ZeroAddress)
      ).to.be.reverted;
    });
  });

  // ============ PATIENT REGISTRATION ============
  describe("Patient Registration", function () {
    it("Should register patient", async function () {
      await cerebrum.connect(patient1).registerPatient();
      expect(await cerebrum.isPatientRegistered(patient1.address)).to.equal(true);
    });

    it("Should emit PatientRegistered event", async function () {
      await expect(
        cerebrum.connect(patient1).registerPatient()
      ).to.emit(cerebrum, "PatientRegistered");
    });

    it("Should prevent duplicate registration", async function () {
      await cerebrum.connect(patient1).registerPatient();
      await expect(
        cerebrum.connect(patient1).registerPatient()
      ).to.be.revertedWithCustomError(cerebrum, "AlreadyRegistered");
    });

    it("Should track multiple registrations", async function () {
      await cerebrum.connect(patient1).registerPatient();
      await cerebrum.connect(patient2).registerPatient();
      expect(await cerebrum.getTotalPatients()).to.equal(2n);
    });
  });

  // ============ DATA SHARING TOGGLE ============
  describe("Data Sharing", function () {
    beforeEach(async function () {
      await cerebrum.connect(patient1).registerPatient();
    });

    it("Should toggle sharing enabled", async function () {
      await cerebrum.connect(patient1).toggleDataSharing(true);
      expect(await cerebrum.isSharingEnabled(patient1.address)).to.equal(true);
    });

    it("Should toggle sharing disabled", async function () {
      await cerebrum.connect(patient1).toggleDataSharing(false);
      expect(await cerebrum.isSharingEnabled(patient1.address)).to.equal(false);
    });

    it("Should emit DataSharingToggled", async function () {
      await expect(
        cerebrum.connect(patient1).toggleDataSharing(false)
      ).to.emit(cerebrum, "DataSharingToggled");
    });

    it("Should prevent toggle if unregistered", async function () {
      await expect(
        cerebrum.connect(researcher1).toggleDataSharing(true)
      ).to.be.revertedWithCustomError(cerebrum, "NotRegistered");
    });
  });

  // ============ LENDER APPROVAL ============
  describe("Lender Approval", function () {
    beforeEach(async function () {
      await cerebrum.connect(patient1).registerPatient();
    });

    it("Should approve lender", async function () {
      await cerebrum.connect(patient1).approveLender(lender.address);
      expect(await cerebrum.hasLenderApproval(patient1.address, lender.address)).to.equal(true);
    });

    it("Should emit LenderApprovalGranted", async function () {
      await expect(
        cerebrum.connect(patient1).approveLender(lender.address)
      ).to.emit(cerebrum, "LenderApprovalGranted");
    });

    it("Should prevent zero address approval", async function () {
      await expect(
        cerebrum.connect(patient1).approveLender(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(cerebrum, "InvalidAddress");
    });

    it("Should allow multiple approvals", async function () {
      await cerebrum.connect(patient1).approveLender(lender.address);
      await cerebrum.connect(patient1).approveLender(researcher1.address);
      expect(await cerebrum.hasLenderApproval(patient1.address, lender.address)).to.equal(true);
      expect(await cerebrum.hasLenderApproval(patient1.address, researcher1.address)).to.equal(true);
    });
  });

  // ============ RESEARCHER ACCESS & PAYMENTS ============
  describe("Researcher Access", function () {
    beforeEach(async function () {
      await cerebrum.connect(patient1).registerPatient();
    });

    it("Should purchase access", async function () {
      const fee = ethers.parseEther("0.01");
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, {
        value: fee
      });
      expect(await cerebrum.hasResearcherAccess(patient1.address, researcher1.address)).to.equal(true);
    });

    it("Should split payment 80/20", async function () {
      const fee = ethers.parseEther("0.01");
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, {
        value: fee
      });
      const info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(ethers.parseEther("0.008"));
    });

    it("Should emit ResearcherAccessPurchased", async function () {
      const fee = ethers.parseEther("0.01");
      await expect(
        cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, {
          value: fee
        })
      ).to.emit(cerebrum, "ResearcherAccessPurchased");
    });

    it("Should prevent insufficient payment", async function () {
      const fee = ethers.parseEther("0.005");
      await expect(
        cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, {
          value: fee
        })
      ).to.be.revertedWithCustomError(cerebrum, "InsufficientPayment");
    });

    it("Should prevent unregistered patient access", async function () {
      const fee = ethers.parseEther("0.01");
      await expect(
        cerebrum.connect(researcher1).purchaseResearcherAccess(researcher2.address, {
          value: fee
        })
      ).to.be.revertedWithCustomError(cerebrum, "NotRegistered");
    });

    it("Should allow multiple researchers", async function () {
      const fee = ethers.parseEther("0.01");
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, {
        value: fee
      });
      await cerebrum.connect(researcher2).purchaseResearcherAccess(patient1.address, {
        value: fee
      });
      expect(await cerebrum.hasResearcherAccess(patient1.address, researcher1.address)).to.equal(true);
      expect(await cerebrum.hasResearcherAccess(patient1.address, researcher2.address)).to.equal(true);
      const info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(ethers.parseEther("0.016"));
    });
  });

  // ============ EARNINGS MANAGEMENT ============
  describe("Earnings", function () {
    beforeEach(async function () {
      await cerebrum.connect(patient1).registerPatient();
      const fee = ethers.parseEther("0.01");
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, {
        value: fee
      });
    });

    it("Should claim earnings", async function () {
      const initialBalance = await ethers.provider.getBalance(patient1.address);
      const tx = await cerebrum.connect(patient1).claimEarnings();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const finalBalance = await ethers.provider.getBalance(patient1.address);
      expect(finalBalance).to.be.greaterThan(initialBalance - gasUsed);
    });

    it("Should reset earnings after claim", async function () {
      await cerebrum.connect(patient1).claimEarnings();
      const info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(0n);
    });

    it("Should emit EarningsDistributed", async function () {
      await expect(
        cerebrum.connect(patient1).claimEarnings()
      ).to.emit(cerebrum, "EarningsDistributed");
    });

    it("Should prevent double claim", async function () {
      await cerebrum.connect(patient1).claimEarnings();
      await expect(
        cerebrum.connect(patient1).claimEarnings()
      ).to.be.revertedWithCustomError(cerebrum, "InsufficientEarnings");
    });
  });

  // ============ VIEW FUNCTIONS ============
  describe("View Functions", function () {
    beforeEach(async function () {
      await cerebrum.connect(patient1).registerPatient();
      await cerebrum.connect(patient2).registerPatient();
    });

    it("Should return registration status", async function () {
      expect(await cerebrum.isPatientRegistered(patient1.address)).to.equal(true);
      expect(await cerebrum.isPatientRegistered(researcher1.address)).to.equal(false);
    });

    it("Should return patient count", async function () {
      expect(await cerebrum.getTotalPatients()).to.equal(2n);
    });

    it("Should return patient info", async function () {
      const info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.isRegistered).to.equal(true);
    });

    it("Should return empty records", async function () {
      const records = await cerebrum.getPatientHealthRecords(patient1.address);
      expect(records.length).to.equal(0);
    });

    it("Should return patient list", async function () {
      const patients = await cerebrum.getPatientList();
      expect(patients.length).to.equal(2);
      expect(patients).to.include(patient1.address);
    });
  });

  // ============ COMPLEX WORKFLOWS ============
  describe("Workflows", function () {
    it("Full workflow: register → buy → claim", async function () {
      // Register
      await cerebrum.connect(patient1).registerPatient();
      expect(await cerebrum.getTotalPatients()).to.equal(1n);

      // Researcher buys
      const fee = ethers.parseEther("0.01");
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, {
        value: fee
      });

      // Verify earnings
      let info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(ethers.parseEther("0.008"));

      // Claim
      await cerebrum.connect(patient1).claimEarnings();
      info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(0n);
    });

    it("Multi-researcher scenario", async function () {
      await cerebrum.connect(patient1).registerPatient();
      const fee = ethers.parseEther("0.01");

      // 2 researchers buy access
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, {
        value: fee
      });
      await cerebrum.connect(researcher2).purchaseResearcherAccess(patient1.address, {
        value: fee
      });

      const info = await cerebrum.getPatientInfo(patient1.address);
      expect(info.totalEarnings).to.equal(ethers.parseEther("0.016"));
    });

    it("Multi-patient scenario", async function () {
      await cerebrum.connect(patient1).registerPatient();
      await cerebrum.connect(patient2).registerPatient();
      const fee = ethers.parseEther("0.01");

      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient1.address, {
        value: fee
      });
      await cerebrum.connect(researcher1).purchaseResearcherAccess(patient2.address, {
        value: fee
      });

      const info1 = await cerebrum.getPatientInfo(patient1.address);
      const info2 = await cerebrum.getPatientInfo(patient2.address);
      expect(info1.totalEarnings).to.equal(ethers.parseEther("0.008"));
      expect(info2.totalEarnings).to.equal(ethers.parseEther("0.008"));
    });
  });
});
