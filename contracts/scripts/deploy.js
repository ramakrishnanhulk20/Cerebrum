const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Cerebrum deployment to Sepolia...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy Cerebrum contract
  console.log("⏳ Deploying Cerebrum contract...");
  const Cerebrum = await hre.ethers.getContractFactory("Cerebrum");
  const cerebrum = await Cerebrum.deploy();
  
  await cerebrum.waitForDeployment();
  const address = await cerebrum.getAddress();

  console.log("\n✅ Cerebrum deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Name:     Cerebrum");
  console.log("Network:           Sepolia Testnet");
  console.log("Deployer:          ", deployer.address);
  console.log("Contract Address:  ", address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  console.log("\n🔗 Verification URL:");
  console.log(`https://sepolia.etherscan.io/address/${address}`);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update frontend/.env with:");
  console.log(`   VITE_CEREBRUM_CONTRACT_ADDRESS=${address}`);
  console.log("3. Verify contract on Etherscan (optional):");
  console.log(`   npx hardhat verify --network sepolia ${address}`);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: address,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    chainId: 11155111
  };
  
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to: deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  });
