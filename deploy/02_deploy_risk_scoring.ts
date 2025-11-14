import hre from "hardhat";

async function main() {
  console.log("\n🔬 Deploying CerebrumRiskScoring Library...\n");
  
  // Deploy CerebrumRiskScoring contract
  console.log("📦 Deploying CerebrumRiskScoring...");
  const RiskScoring = await hre.ethers.getContractFactory("CerebrumRiskScoring");
  const riskScoring = await RiskScoring.deploy();
  
  console.log("⏳ Waiting for deployment confirmation...");
  await riskScoring.waitForDeployment();
  
  const contractAddress = await riskScoring.getAddress();
  console.log(`✅ CerebrumRiskScoring deployed to: ${contractAddress}\n`);
  
  // Deployment Summary
  console.log("=== 📊 Deployment Summary ===");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network:          ${hre.network.name}`);
  console.log(`Chain ID:         ${hre.network.config.chainId}`);
  console.log("");
  
  // Next steps
  console.log("=== 🎯 Next Steps ===");
  console.log("1. Update .env with:");
  console.log(`   RISK_SCORING_LIB=${contractAddress}`);
  console.log("");
  console.log("2. Redeploy main contract with this address:");
  console.log(`   npm run deploy:sepolia`);
  console.log("");
  console.log("3. Or update existing contract (if owner function exists)");
  console.log("");
  
  return contractAddress;
}

export default main;

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
