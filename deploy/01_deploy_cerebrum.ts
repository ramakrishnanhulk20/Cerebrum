import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying Cerebrum FHEVM v0.9 contracts...\n");
  
  // Get deployer info
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(`📍 Deployer address: ${deployerAddress}`);
  console.log(`💰 Deployer balance: ${ethers.formatEther(await hre.ethers.provider.getBalance(deployerAddress))} ETH\n`);
  
  // Constructor arguments
  const PLATFORM_WALLET = process.env.PLATFORM_WALLET || deployerAddress;
  const RISK_SCORING_LIBRARY = process.env.RISK_SCORING_LIBRARY || ethers.ZeroAddress; // Optional
  
  console.log("📋 Constructor arguments:");
  console.log(`   Platform Wallet: ${PLATFORM_WALLET}`);
  console.log(`   Risk Scoring Library: ${RISK_SCORING_LIBRARY}`);
  console.log("");
  
  // Deploy CerebrumFHEVM_v09 contract
  console.log("⏳ Deploying CerebrumFHEVM_v09 contract...");
  const CerebrumFHEVM = await hre.ethers.getContractFactory("CerebrumFHEVM_v09");
  const cerebrum = await CerebrumFHEVM.deploy(PLATFORM_WALLET, RISK_SCORING_LIBRARY);
  await cerebrum.waitForDeployment();
  const cerebrumAddress = await cerebrum.getAddress();
  
  console.log(`✅ CerebrumFHEVM_v09 deployed to: ${cerebrumAddress}\n`);
  
  // Get deployment transaction
  const deployTx = cerebrum.deploymentTransaction();
  if (deployTx) {
    console.log(`📝 Deployment transaction hash: ${deployTx.hash}`);
    console.log(`⛽ Gas used: ${deployTx.gasLimit.toString()}`);
    console.log(`🔗 Block: ${deployTx.blockNumber}\n`);
  }
  
  // Verify contract info
  console.log("🔍 Verifying contract state...");
  const owner = await cerebrum.owner();
  const platformWallet = await cerebrum.platformWallet();
  const totalPatients = await cerebrum.totalPatients();
  
  console.log(`   Owner: ${owner}`);
  console.log(`   Platform Wallet: ${platformWallet}`);
  console.log(`   Total Patients: ${totalPatients}`);
  console.log("");
  
  console.log("=== 🎉 Deployment Summary ===");
  console.log(`CerebrumFHEVM_v09: ${cerebrumAddress}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${(await hre.ethers.provider.getNetwork()).chainId}`);
  console.log("");
  
  // Save deployment info
  console.log("📄 Next steps:");
  console.log(`1. Update src/config/contracts-v09.ts:`);
  console.log(`   export const CEREBRUM_CONTRACT_ADDRESS = '${cerebrumAddress}';`);
  console.log("");
  console.log(`2. Verify on Etherscan (if on Sepolia):`);
  console.log(`   npx hardhat verify --network sepolia ${cerebrumAddress} "${PLATFORM_WALLET}" "${RISK_SCORING_LIBRARY}"`);
  console.log("");
  console.log(`3. View on Sepolia Etherscan:`);
  console.log(`   https://sepolia.etherscan.io/address/${cerebrumAddress}`);
}

// Export the main function for hardhat-deploy
export default main;

// Allow running directly with `npx hardhat run`
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
