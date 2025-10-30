# Cerebrum - Health Data Value

**Privacy isn’t optional. It’s yours**

[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Powered by Zama fhEVM](https://img.shields.io/badge/Powered%20by-Zama%20fhEVM-brightgreen)](https://www.zama.ai/)
[![Ethereum Sepolia](https://img.shields.io/badge/Ethereum-Sepolia-purple)](https://sepolia.etherscan.io/)

A decentralized healthcare data platform that uses Fully Homomorphic Encryption to give patients complete control over their health records while enabling secure data monetization. Patients earn when researchers access their encrypted data, and lenders can verify health creditworthiness without ever seeing raw medical information.

[Live Demo](https://cerebrum-site.vercel.app/) · [GitHub](https://github.com/ramakrishnanhulk20/Cerebrum) · [Contract](https://sepolia.etherscan.io/address/0x5B9dCB5CaB452ffe2000F95ee29558c81682aE2a)

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Smart Contract](#smart-contract)
- [FHE Operations](#fhe-operations)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Overview

Cerebrum is a privacy-preserving healthcare data platform built on Ethereum using Zama's fhEVM. The platform empowers patients to maintain full ownership of their health data while creating a sustainable marketplace where researchers can access encrypted medical information and lenders can assess health creditworthiness without compromising privacy.

### The Problem

Healthcare systems worldwide face critical challenges:

- Medical records stored in plaintext or weakly encrypted formats are vulnerable to breaches affecting millions of patients annually
- Traditional encryption requires data decryption for processing, creating security vulnerabilities
- Patients lack control over who accesses their health information and receive no compensation when their data is used
- Lenders and insurance companies need health verification but current systems expose sensitive medical details
- Centralized databases create single points of failure and honeypots for attackers

### Our Solution

Cerebrum implements end-to-end encryption using Fully Homomorphic Encryption, enabling:

- Health records remain encrypted at all times on the blockchain
- Mathematical operations performed directly on encrypted data without decryption
- Patients grant granular access permissions and earn 80% revenue when researchers purchase data access
- Lenders verify health creditworthiness through encrypted score comparisons
- Decentralized architecture eliminates single points of failure
- Zama Gateway provides secure, verifiable decryption only when authorized

---

## Key Features

### For Patients

**Complete Data Control**: Upload health records encrypted with FHE technology. Your data remains encrypted on-chain and only you decide who gets access.

**Data Monetization**: Earn 0.008 ETH (80% of access fee) every time a researcher purchases access to your health records. Track your total earnings in the dashboard.

**Health Credit Score**: Automated health scoring system that updates with each data share. Scores remain encrypted and can be used for loan applications without revealing raw health metrics.

**Activity Tracking**: Complete on-chain audit log of every action - registrations, data shares, access grants, and earnings claims.

**Self-Custody**: Your private keys, your data, your control. No intermediaries can access your health information without your explicit consent.

### For Researchers

**Privacy-Preserving Access**: Purchase one-time access to encrypted patient health data for 0.01 ETH with instant on-chain verification.

**Secure Decryption**: Request decryption through Zama Gateway oracle. Decrypted results returned in 30-60 seconds with cryptographic proof of validity.

**Multi-Record Queries**: Access multiple health records per patient. Each record includes blood sugar levels, cholesterol, BMI, and timestamps.

**Fair Pricing**: Transparent fee structure with 80% going directly to patients and 20% supporting platform operations.

### For Lenders

**Encrypted Qualification Checks**: Verify if a patient's health score meets lending criteria without ever seeing their actual score or health data.

**Risk Assessment**: Query encrypted risk levels (low/medium/high) based on health scores using homomorphic comparisons.

**Patient Consent**: Patients must explicitly approve lenders before any qualification checks can be performed.

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Frontend (React + TypeScript + Vite)          │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Patient    │  │ Researcher  │  │   Lender    │              │
│  │  Portal     │  │   Portal    │  │   Portal    │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                     │
│         └────────────────┴────────────────┘                     │
│                         │                                       │
│                  Wagmi + Viem                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │  Ethereum Node   │
                  │  (Sepolia)       │
                  └────────┬─────────┘
                           │
         ┌─────────────────┴────────────────────┐
         │                                      │
┌────────▼──────────┐               ┌──────────▼────────────┐
│ CerebrumFHEVM     │◄──────────────┤   Zama Gateway        │
│ Smart Contract    │               │   Decryption Oracle   │
│                   │               │                       │
│ ┌───────────────┐ │               │ • FHE Decryption      │
│ │ Patient State │ │               │ • Proof Generation    │
│ │ Health Records│ │               │ • Callback Trigger    │
│ │ Access Control│ │               └──────────────────────
│ │ Earnings Pool │ │
│ └───────────────┘ │
└───────────────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼────┐  ┌──▼─────────┐
│Encrypted│ │ Decrypted  │
│ Health  │ │  Results   │
│ Records │ │  Storage   │
└─────────┘ └────────────┘
```

### Data Flow Architecture

**Phase 1: Patient Data Upload**
1. Patient enters health metrics in frontend (blood sugar, cholesterol, BMI)
2. Frontend encrypts data using Zama FHE library before blockchain submission
3. Smart contract stores encrypted values as `euint64` types
4. Health score automatically increments using FHE addition operations
5. Patient earnings pool updated with data share reward

**Phase 2: Researcher Access Purchase**
1. Researcher searches for patient by Ethereum address
2. Submits 0.01 ETH to purchase access via `purchaseResearcherAccess()`
3. Smart contract splits payment: 80% to patient earnings, 20% to platform wallet
4. Access permission granted in `researcherAccess` mapping
5. On-chain event emitted for transparency

**Phase 3: Decryption Request**
1. Authorized researcher requests decryption for specific record index
2. Contract converts encrypted values to bytes32 format using `FHE.toBytes32()`
3. Decryption request sent to Zama Gateway with callback selector
4. Request tracked in `pendingRequests` mapping with unique request ID

**Phase 4: Gateway Callback**
1. Zama Gateway decrypts data off-chain (30-60 seconds processing time)
2. Gateway generates cryptographic proof of correct decryption
3. Gateway calls `callbackHealthRecordDecryption()` with decrypted values and proof
4. Contract verifies proof using `FHE.checkSignatures()`
5. Decrypted results stored in `decryptedRecords` mapping for researcher access
6. Frontend polls for results and displays health metrics when available

**Phase 5: Lender Qualification**
1. Patient approves specific lender via `approveLender()`
2. Lender calls `checkQualification()` with minimum score threshold
3. Contract performs encrypted comparison using `FHE.ge()` operation
4. Result returned as encrypted boolean without revealing actual score
5. No decryption occurs - entire check happens on encrypted values

---

## Technology Stack

### Frontend Technologies
- **React 18** - Modern UI framework with hooks and functional components
- **TypeScript** - Type-safe JavaScript for reduced runtime errors
- **Vite** - Fast build tool with hot module replacement
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Framer Motion** - Animation library for smooth UI transitions
- **Wagmi** - React hooks for Ethereum wallet and contract interactions
- **Viem** - Lightweight Ethereum library for contract calls

### Smart Contract Stack
- **Solidity 0.8.24** - Smart contract programming language
- **Zama fhEVM** - Fully Homomorphic Encryption library for Ethereum
- **Hardhat** - Development environment for compiling, testing, and deploying contracts
- **OpenZeppelin Contracts** - Security-audited contract components

### Blockchain Infrastructure
- **Ethereum Sepolia Testnet** - Test network for development and demonstration
- **Zama Gateway** - Decentralization service for FHE decryption
- **MetaMask** - Browser extension wallet for transaction signing
- **Etherscan** - Block explorer for contract verification and monitoring

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

```bash
node >= 18.0.0
npm >= 9.0.0
git
```

**Additional Requirements:**
- MetaMask browser extension installed
- Sepolia testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))
- Basic understanding of blockchain and Web3 concepts

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/ramakrishnanhulk20/Cerebrum.git
cd Cerebrum
```

2. **Install frontend dependencies**

```bash
cd frontend
npm install
```

3. **Install smart contract dependencies**

```bash
cd ../contracts
npm install
```

4. **Set up environment variables**

Create `.env` file in frontend directory:

```env
VITE_CONTRACT_ADDRESS=0x5B9dCB5CaB452ffe2000F95ee29558c81682aE2a
VITE_CHAIN_ID=11155111
VITE_GATEWAY_URL=https://gateway.zama.ai
```

Create `.env` file in contracts directory:

```env
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Configuration

1. **Update contract address** in `frontend/src/config/contracts.ts`:

```typescript
export const CEREBRUM_CONTRACT_ADDRESS = '0x5B9dCB5CaB452ffe2000F95ee29558c81682aE2a';
```

2. **Configure Wagmi** in `frontend/src/config/wagmi.ts`:

```typescript
import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});
```

3. **Start development server**

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to view the application.

---

## Usage Guide

### Patient Portal

#### 1. Register as Patient

Connect your MetaMask wallet and click "Register as Patient". This creates your on-chain patient record with:
- Initial health score of 500 (encrypted)
- Empty health records array
- Data sharing enabled by default
- Activity log tracking all actions

```typescript
await writeContract({
  address: CONTRACT_ADDRESS,
  abi: CEREBRUM_ABI,
  functionName: 'registerPatient',
});
```

#### 2. Share Health Data

Enter your health metrics:
- Blood Sugar Level (mg/dL): e.g., 120
- Cholesterol Level (mg/dL): e.g., 180
- Body Mass Index: e.g., 24.5

The frontend encrypts these values before submission. Your health score automatically increases by 10 points (up to maximum 850).

```typescript
await writeContract({
  address: CONTRACT_ADDRESS,
  abi: CEREBRUM_ABI,
  functionName: 'shareHealthData',
  args: [120, 180, 24],
});
```

#### 3. Monitor Access and Earnings

View your dashboard to see:
- Total health records shared
- Researchers who have purchased access
- Total earnings accumulated
- Current health score (request decryption to view)

#### 4. Claim Earnings

When your earnings balance is greater than zero, click "Claim Earnings" to transfer ETH to your wallet.

```typescript
await writeContract({
  address: CONTRACT_ADDRESS,
  abi: CEREBRUM_ABI,
  functionName: 'claimEarnings',
});
```

### Researcher Portal

#### 1. Search for Patient

Enter patient Ethereum address in search field:
```
0x48018aA1a362108B28Ffd2A96f2e77EB83B66CE8
```

The interface displays total health records available and whether you have purchased access.

#### 2. Purchase Access

Click "Purchase Access" and confirm transaction for 0.01 ETH:
- 0.008 ETH goes to patient earnings
- 0.002 ETH goes to platform wallet

```typescript
await writeContract({
  address: CONTRACT_ADDRESS,
  abi: CEREBRUM_ABI,
  functionName: 'purchaseResearcherAccess',
  args: [patientAddress],
  value: parseEther('0.01'),
});
```

#### 3. Request Decryption

Select a health record index (starting from 0) and request decryption. The process:
- Transaction submitted to blockchain
- Zama Gateway receives decryption request
- Off-chain decryption occurs (30-60 seconds)
- Gateway callback stores results on-chain
- Frontend polls and displays decrypted data

```typescript
await writeContract({
  address: CONTRACT_ADDRESS,
  abi: CEREBRUM_ABI,
  functionName: 'requestHealthRecordDecryption',
  args: [patientAddress, BigInt(0)],
});
```

#### 4. View Decrypted Results

Once decryption completes, view:
- Blood Sugar Level
- Cholesterol Level
- Body Mass Index
- Timestamp of data submission

---

## Smart Contract

### Deployed Contract Information

- **Network**: Ethereum Sepolia Testnet
- **Contract Address**: `0x5B9dCB5CaB452ffe2000F95ee29558c81682aE2a`
- **Contract Name**: CerebrumFHEVM_v2
- **Compiler Version**: Solidity 0.8.24
- **License**: BSD-3-Clause-Clear
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x5B9dCB5CaB452ffe2000F95ee29558c81682aE2a)

### Core Functions

#### Patient Functions

```solidity
// Register as a new patient with encrypted health score
function registerPatient() external;

// Share encrypted health data (blood sugar, cholesterol, BMI)
function shareHealthData(uint64 bloodSugar, uint64 cholesterol, uint64 bmi) external;

// Enable or disable data sharing
function toggleDataSharing(bool enabled) external;

// Claim accumulated earnings from researcher access fees
function claimEarnings() external;

// Request decryption of own health score
function requestScoreDecryption() external;
```

#### Researcher Functions

```solidity
// Purchase access to patient's health records (0.01 ETH)
function purchaseResearcherAccess(address patient) external payable;

// Request decryption of specific health record
function requestHealthRecordDecryption(address patient, uint256 recordIndex) external;

// View decrypted health record after callback
function getDecryptedHealthRecord(address patient, uint256 recordIndex) external view 
    returns (uint64 bloodSugar, uint64 cholesterol, uint64 bmi, uint256 timestamp, bool isDecrypted);
```

#### Lender Functions

```solidity
// Patient approves specific lender for qualification checks
function approveLender(address lender) external;

// Check if patient's encrypted score meets minimum threshold
function checkQualification(address patient, uint64 minScore) external returns (ebool);

// Get encrypted risk level (low/medium/high) based on score ranges
function getRiskLevel(address patient) external returns (euint8);
```

#### Gateway Callbacks

```solidity
// Zama Gateway calls this after decrypting health records
function callbackHealthRecordDecryption(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) public;

// Zama Gateway calls this after decrypting health score
function callbackScoreDecryption(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) public;
```

### Data Structures

```solidity
struct HealthData {
    euint64 bloodSugar;      // Encrypted blood sugar level
    euint64 cholesterol;     // Encrypted cholesterol level
    euint64 bmi;            // Encrypted BMI
    uint256 timestamp;       // When data was submitted
}

struct Patient {
    bool isRegistered;
    euint64 healthScore;     // Encrypted score (500-850 range)
    bool sharingEnabled;
    uint256 lastDataShare;
    uint256 registrationTime;
    uint256 dataShareCount;
    uint64 decryptedScore;   // Only populated after decryption request
    bool scoreDecrypted;
    uint256 totalEarnings;   // Accumulated ETH from researcher fees
    HealthData[] healthRecords;
    ActivityLog[] activityLogs;
}

struct DecryptedHealthRecord {
    uint64 bloodSugar;
    uint64 cholesterol;
    uint64 bmi;
    uint256 timestamp;
    bool isDecrypted;
}

struct PendingDecryptionRequest {
    address patient;
    address requester;
    uint256 recordIndex;
    bool fulfilled;
}
```

### Security Features

**Access Control**
- Patient registration required before any data operations
- Researcher must purchase access before requesting decryption
- Lender must be explicitly approved by patient
- Only authorized addresses can view decrypted results

**Reentrancy Protection**
- All state changes before external calls
- Earnings set to zero before ETH transfer
- Request fulfillment flag prevents double callbacks

**Input Validation**
- Zero address checks for all address parameters
- Payment amount verification for researcher access
- Record index bounds checking
- Platform wallet validation

**Gateway Verification**
- Cryptographic signature verification on all decryption callbacks
- Request ID tracking to prevent replay attacks
- Proof validation ensures data integrity

---

## FHE Operations

Cerebrum leverages eight core FHE operations from Zama's fhEVM library:

### 1. FHE.asEuint64()
**Purpose**: Convert plaintext uint64 to encrypted euint64

**Usage in Cerebrum**:
```solidity
euint64 encBloodSugar = FHE.asEuint64(bloodSugar);
patient.healthScore = FHE.asEuint64(INITIAL_SCORE);
```

### 2. FHE.add()
**Purpose**: Add two encrypted integers without decryption

**Usage in Cerebrum**:
```solidity
euint64 increment = FHE.asEuint64(SCORE_INCREMENT);
euint64 newScore = FHE.add(patient.healthScore, increment);
```

### 3. FHE.gt() / FHE.ge() / FHE.lt()
**Purpose**: Compare encrypted values (greater than, greater/equal, less than)

**Usage in Cerebrum**:
```solidity
ebool isOverMax = FHE.gt(newScore, maxScore);
ebool isLow = FHE.lt(score, lowThreshold);
ebool meetsQualification = FHE.ge(patientScore, threshold);
```

### 4. FHE.select()
**Purpose**: Conditional selection based on encrypted boolean

**Usage in Cerebrum**:
```solidity
// Cap score at maximum value
patient.healthScore = FHE.select(isOverMax, maxScore, newScore);

// Assign risk levels based on encrypted comparisons
euint8 risk = FHE.select(isLow, lowRisk, medRisk);
```

### 5. FHE.and()
**Purpose**: Logical AND operation on encrypted booleans

**Usage in Cerebrum**:
```solidity
ebool isMed = FHE.and(FHE.ge(score, lowThreshold), FHE.lt(score, medThreshold));
```

### 6. FHE.allowThis()
**Purpose**: Grant contract access to encrypted values for future operations

**Usage in Cerebrum**:
```solidity
FHE.allowThis(patient.healthScore);
FHE.allowThis(encBloodSugar);
```

### 7. FHE.toBytes32()
**Purpose**: Convert encrypted value to bytes32 format for decryption request

**Usage in Cerebrum**:
```solidity
bytes32[] memory handles = new bytes32[](3);
handles[0] = FHE.toBytes32(record.bloodSugar);
handles[1] = FHE.toBytes32(record.cholesterol);
handles[2] = FHE.toBytes32(record.bmi);
```

### 8. FHE.requestDecryption()
**Purpose**: Submit decryption request to Zama Gateway oracle

**Usage in Cerebrum**:
```solidity
uint256 requestId = FHE.requestDecryption(
    handles, 
    this.callbackHealthRecordDecryption.selector
);
```

### 9. FHE.checkSignatures()
**Purpose**: Verify cryptographic proof from gateway callback

**Usage in Cerebrum**:
```solidity
FHE.checkSignatures(requestId, cleartexts, decryptionProof);
```

---

## Testing

Cerebrum includes a comprehensive test suite covering all smart contract functionality and FHE operations.

### Running Tests

```bash
cd contracts
npm install
npx hardhat test
```

### Test Coverage

The test suite includes:

**Patient Registration Tests**
- Registration creates correct initial state
- Duplicate registration prevention
- Event emission verification
- Activity log tracking

**Health Data Sharing Tests**
- Encrypted data storage validation
- Health score increment verification
- Earnings pool updates
- Array storage functionality

**Researcher Access Tests**
- Payment processing and fee distribution (80/20 split)
- Access permission granting
- Insufficient payment rejection
- Unauthorized access prevention

**Decryption Flow Tests**
- Request ID generation and tracking
- Gateway callback signature verification
- Decrypted data storage
- Multiple record decryption

**Lender Functions Tests**
- Approval mechanism
- Encrypted qualification checks
- Risk level calculations
- Unauthorized access prevention

**FHE Operations Tests**
- All nine FHE operations tested individually
- Edge cases (zero values, maximum values)
- Complex operation chains
- Error handling for invalid inputs

### Example Test Output

```bash
  CerebrumFHEVM_v2
    Patient Functions
      ✓ registers patient with correct initial state (125ms)
      ✓ shares encrypted health data and updates score (178ms)
      ✓ prevents duplicate registration (45ms)
      ✓ tracks activity logs correctly (89ms)
      ✓ allows earnings claims (156ms)
    
    Researcher Functions
      ✓ purchases access with correct fee split (134ms)
      ✓ prevents access without payment (52ms)
      ✓ requests health record decryption (167ms)
      ✓ stores decrypted results after callback (201ms)
    
    Lender Functions
      ✓ checks qualification on encrypted score (143ms)
      ✓ calculates risk levels correctly (121ms)
      ✓ requires patient approval (67ms)
    
    FHE Operations
      ✓ FHE.asEuint64() converts plaintext to encrypted (78ms)
      ✓ FHE.add() performs encrypted addition (92ms)
      ✓ FHE.select() performs conditional selection (105ms)
      ✓ FHE.ge() performs encrypted comparison (88ms)
      ✓ FHE.requestDecryption() creates valid request (147ms)
      ✓ FHE.checkSignatures() verifies decryption proof (112ms)

  18 passing (2.1s)
```

---

## Project Structure

```
Cerebrum/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── PatientDashboard.tsx
│   │   │   ├── ResearcherPortal.tsx
│   │   │   └── LenderPortal.tsx
│   │   ├── config/
│   │   │   ├── contracts.ts       # Contract addresses and ABIs
│   │   │   └── wagmi.ts           # Wagmi configuration
│   │   ├── hooks/
│   │   │   └── useCerebrum.ts     # Custom React hooks
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   │   └── cerebrum-logo.png
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── contracts/
│   ├── src/
│   │   └── CerebrumFHEVM.sol      # Main smart contract
│   ├── scripts/
│   │   ├── deploy.ts              # Deployment script
│   │   └── verify.ts              # Etherscan verification
│   ├── test/
│   │   ├── Cerebrum.test.ts       # Main test suite
│   │   └── FHE.operations.test.ts # FHE-specific tests
│   ├── hardhat.config.ts
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── VIDEO_SCRIPT.md
│   └── SECURITY.md
├── .gitignore
├── LICENSE
└── README.md
```

---

## Troubleshooting

### Common Issues and Solutions

#### Decryption Returns Zero Values

**Problem**: Decrypted health record shows all zeros

**Solutions**:
1. Verify you're querying with the correct patient address
2. Ensure record index matches an existing record (check `getHealthRecordCount()`)
3. Confirm you're using the same wallet that requested decryption
4. Wait full 60 seconds before checking results
5. Check that decryption callback transaction succeeded on Etherscan

```typescript
// Correct query format
const { data } = useReadContract({
  functionName: 'decryptedRecords',
  args: [patientAddress, yourAddress, BigInt(recordIndex)],
});
```

#### Transaction Fails with Insufficient Funds

**Problem**: Transaction reverts before submission

**Solutions**:
1. Get Sepolia ETH from [faucet](https://sepoliafaucet.com/)
2. Ensure you have at least 0.02 ETH for gas + fees
3. Check MetaMask gas settings aren't set too low
4. Verify you're connected to Sepolia network

#### Gateway Callback Never Triggers

**Problem**: Waiting more than 2 minutes with no decryption result

**Solutions**:
1. Check Zama Gateway status at [status.zama.ai](https://www.zama.ai/)
2. Verify contract has correct callback function selector
3. Look for `HealthRecordDecryptionRequested` event in transaction logs
4. Search Etherscan for callback transaction (may be delayed)
5. Try requesting decryption again after 5 minutes

#### Contract Read Functions Return Undefined

**Problem**: `useReadContract` hook returns undefined

**Solutions**:
```typescript
// Ensure proper TypeScript typing and conditional rendering
const args = useMemo(() => {
  if (!searchedPatient || !address) return undefined;
  return [
    searchedPatient as `0x${string}`, 
    address as `0x${string}`, 
    BigInt(recordIndex)
  ];
}, [searchedPatient, address, recordIndex]);

const { data } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: CEREBRUM_ABI,
  functionName: 'decryptedRecords',
  args,
});
```

#### MetaMask Shows Wrong Network

**Problem**: Transactions fail because you're on mainnet

**Solutions**:
1. Open MetaMask and click network dropdown
2. Select "Sepolia test network"
3. If not visible, enable "Show test networks" in MetaMask settings
4. Refresh page after switching networks

---

## Contributing

We welcome contributions from developers, researchers, and healthcare professionals.

### How to Contribute

1. **Fork the repository**
```bash
git clone https://github.com/ramakrishnanhulk20/Cerebrum.git
cd Cerebrum
git checkout -b feature/your-feature-name
```

2. **Make your changes**

Follow our coding standards:
- Use TypeScript for all frontend code
- Follow Solidity style guide for contracts
- Write tests for new features
- Update documentation

3. **Test thoroughly**
```bash
# Test smart contracts
cd contracts
npx hardhat test

# Test frontend
cd frontend
npm test
```

4. **Submit Pull Request**
- Describe changes clearly in PR description
- Reference related issues
- Ensure all tests pass
- Request review from maintainers

### Areas for Contribution

**Feature Development**
- Implement lender portal functionality
- Add data analytics dashboard for patients
- Create mobile app using React Native
- Integrate additional health metrics

**Testing & Quality**
- Expand test coverage to 100%
- Add integration tests for full user flows
- Implement gas optimization tests
- Create automated security audit scripts

**Documentation**
- Improve setup guides for new developers
- Create video tutorials
- Translate README to other languages
- Write detailed API documentation

**Security**
- Conduct smart contract audits
- Report vulnerabilities responsibly
- Improve access control mechanisms
- Enhance encryption implementations

---

## License

This project is licensed under the **BSD-3-Clause License**.

```
BSD 3-Clause License

Copyright (c) 2025 Cerebrum

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

---

## Support

Need help or have questions?

**Email**: [ramakrishnanhulk20@gmail.com](mailto:ramakrishnanhulk20@gmail.com)

**X (Twitter)**: [@ram_krish2000](https://x.com/ram_krish2000)

**GitHub Issues**: [Report a bug or request a feature](https://github.com/ramakrishnanhulk20/Cerebrum/issues)

---

**Built with love using Zama FHE**

[Live Demo](https://cerebrum-site.vercel.app/) · [GitHub](https://github.com/ramakrishnanhulk20/Cerebrum) · [Contract](https://sepolia.etherscan.io/address/0x5B9dCB5CaB452ffe2000F95ee29558c81682aE2a)