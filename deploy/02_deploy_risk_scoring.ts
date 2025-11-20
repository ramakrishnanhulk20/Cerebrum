import hre from "hardhat";

const func = async function (hre: any) {
  console.log("\n🔬 Deploying CerebrumRiskScoring Library...\n");
  
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  
  console.log("📦 Deploying CerebrumRiskScoring...");
  console.log(`📍 Deployer address: ${deployer}`);
  
  const riskScoring = await deploy('CerebrumRiskScoring', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  
  console.log(`✅ CerebrumRiskScoring deployed to: ${riskScoring.address}\n`);
  
  console.log("=== 📊 Risk Library Deployment Summary ===");
  console.log(`Contract Address: ${riskScoring.address}`);
  console.log(`Network:          ${hre.network.name}`);
  console.log("");
  
  return true;
};

func.tags = ['risk'];
func.id = 'deploy_risk_scoring';

export default func;
