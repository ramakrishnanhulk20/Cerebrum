import { ethers } from "ethers";
import hre from "hardhat";

const func = async function (hre: any) {
  console.log("🚀 Deploying Cerebrum FHEVM v0.9 contracts...\n");
  
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();
  
  // Get deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer);
  console.log(`📍 Deployer address: ${deployer}`);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH\n`);
  
  // Get the deployed risk scoring library address
  let riskScoringAddress = ethers.ZeroAddress;
  try {
    const riskScoring = await get('CerebrumRiskScoring');
    riskScoringAddress = riskScoring.address;
    console.log(`✅ Found CerebrumRiskScoring at: ${riskScoringAddress}`);
  } catch (error) {
    console.log(`⚠️ CerebrumRiskScoring not deployed yet, using zero address`);
  }
  
  // Constructor arguments
  const PLATFORM_WALLET = process.env.PLATFORM_WALLET || deployer;
  
  console.log("\n📋 Constructor arguments:");
  console.log(`   Platform Wallet: ${PLATFORM_WALLET}`);
  console.log(`   Risk Scoring Library: ${riskScoringAddress}`);
  console.log("");
  
  // Deploy CerebrumFHEVM_v09 contract
  console.log("⏳ Deploying CerebrumFHEVM_v09 contract...");
  const cerebrum = await deploy('CerebrumFHEVM_v09', {
    from: deployer,
    args: [PLATFORM_WALLET, riskScoringAddress],
    log: true,
    waitConfirmations: 1,
  });
  
  console.log(`✅ CerebrumFHEVM_v09 deployed to: ${cerebrum.address}\n`);
  
  console.log("=== 🎉 Deployment Summary ===");
  console.log(`CerebrumFHEVM_v09: ${cerebrum.address}`);
  console.log(`RiskScoring Library: ${riskScoringAddress}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${(await hre.ethers.provider.getNetwork()).chainId}`);
  console.log("");
  
  console.log("📄 Next steps:");
  console.log(`1. Update src/config/contracts-v09.ts:`);
  console.log(`   export const CEREBRUM_CONTRACT_ADDRESS = '${cerebrum.address}';`);
  console.log("");
  console.log(`2. Verify on Etherscan:`);
  console.log(`   npx hardhat verify --network sepolia ${cerebrum.address} "${PLATFORM_WALLET}" "${riskScoringAddress}"`);
  console.log("");
  console.log(`3. View on Sepolia Etherscan:`);
  console.log(`   https://sepolia.etherscan.io/address/${cerebrum.address}`);
  
  return true;
};

func.tags = ['cerebrum'];
func.dependencies = ['risk']; // Deploy risk library first
func.id = 'deploy_cerebrum';

export default func;
