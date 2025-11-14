const hre = require("hardhat");

async function main() {
  const contractAddress = "0x597a77E480fe69C50F84837C20a2fC7eCE4c1123";
  
  console.log("Checking contract at:", contractAddress);
  
  // Check if contract exists
  const code = await hre.ethers.provider.getCode(contractAddress);
  console.log("Contract deployed:", code !== "0x");
  console.log("Bytecode size:", code.length, "characters");
  
  if (code === "0x") {
    console.error("❌ No contract found at this address!");
    return;
  }
  
  // Try to interact with the contract
  const CerebrumFHEVM = await hre.ethers.getContractAt(
    "CerebrumFHEVM_v09",
    contractAddress
  );
  
  console.log("\nReading contract data...");
  const totalPatients = await CerebrumFHEVM.getTotalPatients();
  const platformWallet = await CerebrumFHEVM.platformWallet();
  const baseResearcherFee = await CerebrumFHEVM.BASE_RESEARCHER_FEE();
  const lenderCheckFee = await CerebrumFHEVM.LENDER_CHECK_FEE();
  
  console.log("✅ Contract verified!");
  console.log("Total Patients:", totalPatients.toString());
  console.log("Platform Wallet:", platformWallet);
  console.log("BASE_RESEARCHER_FEE:", hre.ethers.formatEther(baseResearcherFee), "ETH");
  console.log("LENDER_CHECK_FEE:", hre.ethers.formatEther(lenderCheckFee), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
