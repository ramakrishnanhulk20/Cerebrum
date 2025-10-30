const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Deploying CerebrumFHEVM_v2 with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Platform wallet (you can change this to your own address)
  const platformWallet = deployer.address;
  
  console.log("\n📝 Deploying contract...");
  const CerebrumFHEVM = await hre.ethers.getContractFactory("CerebrumFHEVM_v2");
  const cerebrum = await CerebrumFHEVM.deploy(platformWallet);
  
  await cerebrum.waitForDeployment();
  const address = await cerebrum.getAddress();
  
  console.log("\n✅ CerebrumFHEVM_v2 deployed to:", address);
  console.log("🏦 Platform wallet:", platformWallet);
  
  console.log("\n⏳ Waiting 30 seconds before verification...");
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  console.log("\n🔍 Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [platformWallet],
    });
    console.log("✅ Contract verified!");
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
  }
  
  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Address:", address);
  console.log("Platform Wallet:", platformWallet);
  console.log("Network:", hre.network.name);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🎉 Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("1. Update frontend/src/config/contracts.ts with new address");
  console.log("2. Copy ABI from artifacts/contracts/CerebrumFHEVM_v2.sol/CerebrumFHEVM_v2.json");
  console.log("3. Update CEREBRUM_ABI in contracts.ts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
