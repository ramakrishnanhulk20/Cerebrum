const fs = require('fs');
const crypto = require('crypto');

console.log("🔍 Checking ABI Configuration...\n");

// Load frontend config
const contractsFile = fs.readFileSync('./src/config/contracts.ts', 'utf8');
const addressMatch = contractsFile.match(/export const CEREBRUM_CONTRACT_ADDRESS = '(0x[a-fA-F0-9]{40})'/);
const abiMatch = contractsFile.match(/export const CEREBRUM_ABI = (\[[\s\S]*?\]) as const;/);

// Load compiled artifact
const artifact = require('../artifacts/contracts/CerebrumFHEVM_v09.sol/CerebrumFHEVM_v09.json');

console.log("📋 CONTRACT ADDRESS:");
console.log("  Frontend:", addressMatch[1]);
console.log("  Expected:", "0x597a77E480fe69C50F84837C20a2fC7eCE4c1123");
console.log("  ✅ Match:", addressMatch[1].toLowerCase() === "0x597a77E480fe69C50F84837C20a2fC7eCE4c1123".toLowerCase());

console.log("\n📋 ABI COMPARISON:");
const frontendAbi = JSON.parse(abiMatch[1]);
const artifactAbi = artifact.abi;

console.log("  Frontend ABI items:", frontendAbi.length);
console.log("  Compiled ABI items:", artifactAbi.length);

const frontendHash = crypto.createHash('md5').update(JSON.stringify(frontendAbi)).digest('hex');
const artifactHash = crypto.createHash('md5').update(JSON.stringify(artifactAbi)).digest('hex');

console.log("  Frontend hash:", frontendHash);
console.log("  Artifact hash:", artifactHash);
console.log("  ✅ Exact Match:", frontendHash === artifactHash);

console.log("\n📋 KEY FUNCTIONS:");
const keyFunctions = [
  'registerPatient',
  'shareHealthData',
  'toggleDataSharing',
  'purchaseResearcherAccess',
  'approveLender',
  'checkEligibilityWithEncryptedThreshold',
  'claimEarnings',
  'getPatientInfo',
  'getEncryptedHealthScore',
  'getEncryptedHealthRecord'
];

keyFunctions.forEach(funcName => {
  const frontendFunc = frontendAbi.find(f => f.name === funcName);
  const artifactFunc = artifactAbi.find(f => f.name === funcName);
  
  if (frontendFunc && artifactFunc) {
    console.log(`  ✅ ${funcName}: ${frontendFunc.inputs?.length || 0} inputs, ${frontendFunc.outputs?.length || 0} outputs`);
  } else {
    console.log(`  ❌ ${funcName}: NOT FOUND`);
  }
});

console.log("\n📋 SPECIAL CHECKS:");
const shareHealthData = frontendAbi.find(f => f.name === 'shareHealthData');
console.log("  shareHealthData inputs:", shareHealthData?.inputs?.length, "(expected: 12)");
console.log("  ✅ Correct:", shareHealthData?.inputs?.length === 12);

const constants = [
  'BASE_RESEARCHER_FEE',
  'LENDER_CHECK_FEE',
  'TIER_PREMIUM',
  'TIER_COMPLETE',
  'TIER_STANDARD'
];

console.log("\n📋 CONSTANTS:");
constants.forEach(constName => {
  const found = frontendAbi.find(f => f.name === constName);
  console.log(`  ${found ? '✅' : '❌'} ${constName}`);
});

console.log("\n📋 EVENTS:");
const events = frontendAbi.filter(item => item.type === 'event');
console.log("  Total events:", events.length);
const keyEvents = [
  'PatientRegistered',
  'HealthDataShared',
  'ResearcherAccessPurchased',
  'DataSharingToggled',
  'EligibilityChecked',
  'LenderApprovalGranted'
];

keyEvents.forEach(eventName => {
  const found = events.find(e => e.name === eventName);
  console.log(`  ${found ? '✅' : '❌'} ${eventName}`);
});

console.log("\n✅ ABI CHECK COMPLETE!");
