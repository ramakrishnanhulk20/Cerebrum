const fs = require('fs');
const path = require('path');

// Read the artifact
const artifactPath = path.join(__dirname, '../artifacts/contracts/CerebrumFHEVM_v09.sol/CerebrumFHEVM_v09.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

// Read current config
const configPath = path.join(__dirname, '../src/config/contracts-v09.ts');
const currentConfig = fs.readFileSync(configPath, 'utf8');

// Find the start and end of the ABI array
const abiStartMatch = currentConfig.match(/export const CEREBRUM_ABI = /);
if (!abiStartMatch) {
  console.error('Could not find CEREBRUM_ABI export');
  process.exit(1);
}

const abiStart = abiStartMatch.index + abiStartMatch[0].length;

// Find where the ABI array ends (look for "] as const;")
const restOfFile = currentConfig.substring(abiStart);
const abiEndMatch = restOfFile.match(/\] as const;/);
if (!abiEndMatch) {
  console.error('Could not find end of ABI array');
  process.exit(1);
}

const abiEnd = abiStart + abiEndMatch.index + abiEndMatch[0].length;

// Build new config
const newConfig = 
  currentConfig.substring(0, abiStart) +
  JSON.stringify(artifact.abi, null, 2) + ' as const;' +
  currentConfig.substring(abiEnd);

// Write updated config
fs.writeFileSync(configPath, newConfig, 'utf8');

console.log('✅ Updated CEREBRUM_ABI in contracts-v09.ts');
console.log('✅ ABI now includes HealthDataPermissionGranted event');
