const hre = require("hardhat");
require("dotenv/config");

async function main() {
  console.log("\n🔄 Updating Risk Scoring Library Address...\n");
  
  const MAIN_CONTRACT_ADDRESS = "0xbb55D9C8BC11176D393Ad4F0630EE7dad9317aEC";
  const NEW_RISK_LIBRARY = "0x3aB1E4e1141EA3564441c81D824d2F5b4c71c16d";
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📍 Caller: ${deployer.address}`);
  console.log(`📦 Main Contract: ${MAIN_CONTRACT_ADDRESS}`);
  console.log(`🔬 New Risk Library: ${NEW_RISK_LIBRARY}\n`);
  
  // Get contract instance
  const cerebrum = await hre.ethers.getContractAt(
    "CerebrumFHEVM_v09",
    MAIN_CONTRACT_ADDRESS
  );
  
  // Check current risk library
  const currentLibrary = await cerebrum.riskScoringLibrary();
  console.log(`Current Risk Library: ${currentLibrary}`);
  
  // Update risk library
  console.log("\n📝 Updating risk library address...");
  const tx = await cerebrum.setRiskScoringLibrary(NEW_RISK_LIBRARY);
  console.log(`Transaction hash: ${tx.hash}`);
  
  await tx.wait();
  console.log("✅ Transaction confirmed!");
  
  // Verify update
  const newLibrary = await cerebrum.riskScoringLibrary();
  console.log(`\n✓ Updated Risk Library: ${newLibrary}`);
  
  if (newLibrary === NEW_RISK_LIBRARY) {
    console.log("\n🎉 Risk library successfully updated!");
  } else {
    console.log("\n❌ Risk library update failed!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
