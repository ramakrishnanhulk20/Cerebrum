# Cerebrum - Health Data Value

**Privacy isn’t optional. It’s yours**

[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![FHEVM](https://img.shields.io/badge/FHEVM-Zama-brightgreen)](https://docs.zama.org/protocol)
[![Ethereum Sepolia](https://img.shields.io/badge/Ethereum-Sepolia-purple)](https://sepolia.etherscan.io/)
[![fhevmjs](https://img.shields.io/badge/fhevmjs-latest-blue)](https://www.npmjs.com/package/fhevmjs)
[![YouTube](https://img.shields.io/badge/YouTube-Watch%20Demo-red?logo=youtube&logoColor=white)](https://youtu.be/A7h1CDHMxP4?si=0GCaqexvfX5dTgQY)

A healthcare data marketplace built on Ethereum using Zama's **FHEVM**. Patients maintain complete ownership of their encrypted health records while earning from data monetization. Researchers access encrypted data **instantly** (0–2 seconds), and lenders verify creditworthiness without ever seeing raw medical information—all powered by **Fully Homomorphic Encryption** and **User Decryption with EIP-712 signatures**.

[Live Demo](https://cerebrum-site.vercel.app/) · [GitHub](https://github.com/ramakrishnanhulk20/Cerebrum) · [Docs](./docs)

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Solution](#solution)
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
- [Demo Video](#demo-video)

---

## Overview

Cerebrum is a privacy-first healthcare data marketplace built on **Ethereum** with **Zama's FHEVM**. Using Fully Homomorphic Encryption and **instant User Decryption** (0–2 seconds via EIP-712 signatures), the platform enables:

- **Patients** to own, control, and monetize their encrypted health data
- **Researchers** to access encrypted medical records with automatic permission grants (no patient re-signing)
- **Lenders** to verify health creditworthiness through encrypted TRUE/FALSE checks (never seeing actual scores)

All health data remains **encrypted on-chain at all times**—computations happen on ciphertext, and decryption is instant when authorized.

### The Problem

Healthcare systems worldwide face critical challenges:

- Medical records stored in plaintext or weakly encrypted formats are vulnerable to breaches affecting millions of patients annually
- Traditional encryption requires data decryption for processing, creating security vulnerabilities
- Patients lack control over who accesses their health information and receive no compensation when their data is used
- Lenders and insurance companies need health verification but current systems expose sensitive medical details
- Centralized databases create single points of failure and honeypots for attackers

### Solution: FHEVM with User Decryption

Cerebrum leverages **FHEVM** to create a significant improvement in privacy-preserving healthcare:

**Encryption & Privacy**
- Health records remain **encrypted on-chain at all times** using FHE
- Mathematical operations performed directly on encrypted data (no decryption required)
- **User Decryption** via EIP-712 signatures: 0–2 seconds

**Access Control**
- `FHE.allowThis`: Contract manages encrypted data securely
- `FHE.allowTransient`: **Automatic one-time access grants** for researchers (no patient re-signing)
- `FHE.allow`: Granular permissions for User Decryption

**Economics**
- Patients earn **80% of researcher access fees** (0.008 ETH per purchase)
- Transparent, on-chain revenue distribution

**Security**
- Decentralized architecture eliminates single points of failure
- Cryptographic proofs ensure data integrity
- Lenders see only encrypted TRUE/FALSE results (never actual scores)

---

## Key Features

### 🏥 For Patients

**Complete Data Control**
- Encrypt health records on your device with **fhevmjs**
- Submit data with an input proof for cryptographic verification
- Only you decide who gets access—your keys, your control

**Instant Decryption** ⚡
- View your encrypted health score in **0–2 seconds** via EIP-712 signature
- No waiting for callbacks or polling
- Sign once, decrypt instantly

**Data Monetization**
- Earn **0.008 ETH (80%)** every time a researcher purchases access
- Track total earnings in real-time dashboard
- Claim earnings anytime to your wallet

**Health Credit Score**
- Automated scoring system (500-850 range) that updates with each data share
- Scores remain **fully encrypted** on-chain
- Use for loan applications without revealing raw health metrics

**Activity Tracking**
- Complete on-chain audit log of all actions
- Monitor who accessed your data and when
- Full transparency with zero trust required

### 🔬 For Researchers

**Instant Access with FHE.allowTransient**
- Purchase access for **0.01 ETH** per patient
- **Automatic permission grant** in same transaction (no patient re-signing needed!)
- Access resets when patient shares new data (fresh monetization opportunity)

**Lightning-Fast Decryption** ⚡
- Decrypt health records in **0-2 seconds** with EIP-712 signatures
- No waiting for Gateway callbacks (was 30-60 seconds in v0.8)
- Batch decrypt multiple values simultaneously

**Comprehensive Data Access**
- View all health records: blood sugar, cholesterol, BMI, blood pressure, heart rate, weight, height
- Access encrypted risk scores: diabetes, heart disease, stroke predictions
- Timestamps for longitudinal analysis

**Fair & Transparent Pricing**
- **80% to patients** (0.008 ETH)
- **20% platform fee** (0.002 ETH)
- **46% cheaper gas** than v0.8 (no callback transactions)

### 💰 For Lenders

**Zero-Knowledge Credit Checks**
- Verify if patient's health score meets lending criteria **without seeing actual score**
- Receive encrypted **TRUE/FALSE** result only (complete privacy preservation)
- Instant verification in 0-2 seconds via User Decryption

**Encrypted Threshold Comparisons**
- Submit your minimum score threshold (e.g., 650) **encrypted on client-side**
- Contract performs `FHE.ge()` comparison on encrypted values
- Never reveals patient's actual health score (quantum-secure privacy)

**Patient Consent Required**
- Patients must explicitly approve each lender via `approveLender()`
- Granular access control—patients revoke access anytime
- Full transparency with on-chain audit trail

---

## Architecture

### System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                 Frontend (React + TypeScript + Vite)                 │
│                          fhevmjs (Relayer SDK)                       │
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │  Patient    │    │ Researcher  │    │   Lender    │              │
│  │  Dashboard  │    │   Portal    │    │   Portal    │              │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘              │
│         │                  │                  │                     │
│         │  ┌───────────────┴──────────────────┘                     │
│         │  │                                                        │
│         │  │  • createEncryptedInput() - Client-side encryption     │
│         │  │  • User Decryption - EIP-712 signatures (0-2s)         │
│         │  │  • Wagmi v2 + ethers v6 - Wallet integration           │
│         │  │                                                        │
│         └──┴────────────────┬───────────────────────────────────────┘
│                             │
│                    ┌────────▼─────────┐
│                    │  Ethereum Node   │
│                    │  (Sepolia)       │
│                    └────────┬─────────┘
│                             │
│              ┌──────────────┴──────────────┐
│              │                             │
│    ┌─────────▼──────────┐       ┌─────────▼──────────┐
│    │   CerebrumFHEVM    │       │   Zama Gateway     │
│    │  Smart Contract    │◄──────┤   (User Decrypt)   │
│    │                    │       │                    │
│    │ • FHE.allowThis    │       │ • EIP-712 verify   │
│    │ • FHE.allowTransient│      │ • Instant decrypt  │
│    │ • FHE.allow        │       │ • 0–2 second       │
│    │ • NO CALLBACKS ✅  │       │   response time    │
│    │                    │       └────────────────────┘
│    │ ┌────────────────┐ │
│    │ │Patient Registry││
│    │ │Encrypted Health││
│    │ │Access Control  ││
│    │ │Earnings Pool   ││
│    │ └────────────────┘ │
│    └────────────────────┘
│             │
│        ┌────┴─────┐
│        │          │
│   ┌────▼─────┐  ┌─▼──────────────┐
│   │Encrypted │  │ Client-Side    │
│   │ Health   │  │ Decryption     │
│   │ Records  │  │ (0-2 seconds)  │
│   │ (euint64)│  │ via EIP-712    │
│   └──────────┘  └────────────────┘
└──────────────────────────────────────────────────────────────────────┘

📊 Performance Highlights:
  • Decryption: 0–2s end-to-end
  • On-chain computation on encrypted data
  • No callback complexity or polling
```

### Data Flow Architecture (User Decryption)

#### Phase 1: Patient Data Upload ⚡

```typescript
// Client-side encryption with fhevmjs
const { handles, inputProof } = await createEncryptedHealthData(
  provider, contract, userAddress,
  { bloodSugar, cholesterol, bmi, bloodPressure, heartRate, weight, height }
);

// Submit to blockchain with proof
await contract.shareHealthData([...handles], age, exercise, sleep, inputProof);
```

1. Patient enters 8 health metrics in frontend
2. **Frontend encrypts data** using `createEncryptedInput()` from fhevmjs v0.9
3. Returns **encrypted handles + inputProof** for verification
4. Smart contract stores as `euint64` with `FHE.allowThis()` permissions
5. Health score auto-increments using `FHE.add()` operations

#### Phase 2: Researcher Access Purchase 💰

```solidity
// Automatic access grant via FHE.allowTransient - NO patient re-signing!
function purchaseResearcherAccess(address patient) external payable {
  // ... payment validation ...
  researcherAccess[patient][msg.sender] = true;
  
  // Grant transient access to all records automatically
  FHE.allowTransient(patients[patient].healthRecords[i].bloodSugar, msg.sender);
  // ... repeat for all fields ...
}
```

1. Researcher submits **0.01 ETH** to purchase access
2. **FHE.allowTransient** grants automatic one-time access (revolutionary!)
3. Payment split: **80% patient** (0.008 ETH), **20% platform** (0.002 ETH)
4. **No patient interaction needed** for access grant
5. On-chain event emitted for transparency

#### Phase 3: Instant User Decryption ⚡ (0–2 seconds)

```typescript
// User Decryption with EIP-712 signatures
const encrypted = await contract.getEncryptedHealthRecord(patient, recordIndex);
const { bloodSugar, cholesterol, bmi, ... } = await decryptHealthRecord(encrypted);
// Result in 0-2 seconds! 🎉
```

1. Researcher calls `getEncryptedHealthRecord()` to retrieve ciphertext
2. Frontend requests User Decryption via **EIP-712 signature**
3. User signs once (MetaMask popup)
4. fhevmjs sends signature + ciphertext to Zama Gateway
5. Gateway decrypts and returns plaintext in **0-2 seconds**
6. Frontend displays results **instantly** (no polling, no callbacks!)

**Key Properties:**
- ❌ No `requestDecryption()` transaction
- ❌ No Gateway callbacks or polling
- ✅ One signature, instant results

#### Phase 4: Lender Qualification (Zero-Knowledge) 🔐

```typescript
// Lender never sees actual score!
const { handles, inputProof } = await createEncryptedThreshold(provider, contract, user, 650);
await contract.checkEligibilityWithEncryptedThreshold(patient, handles[0], inputProof);

// Decrypt result (TRUE/FALSE only)
const encrypted = await contract.getEncryptedEligibilityResult(patient);
const isEligible = await decryptBool(encrypted); // true or false
```

1. Patient approves lender via `approveLender()`
2. Lender encrypts threshold (e.g., 650) on **client-side**
3. Contract performs `FHE.ge(patientScore, threshold)` → encrypted `ebool`
4. Lender decrypts **TRUE/FALSE** result in 0-2 seconds
5. **Lender never sees actual health score!** (quantum-secure privacy)

---

## Technology Stack

### Frontend Stack 🎨
- **React 18** - Modern UI with hooks and functional components
- **TypeScript** - Type-safe development for reliability
- **Vite** - Lightning-fast build tool with HMR
- **Tailwind CSS** - Utility-first responsive design
- **Framer Motion** - Smooth animations and transitions
- **Wagmi v2** - Type-safe React hooks for Ethereum
- **ethers v6** - Ethereum library for wallet integration
- **fhevmjs** - Zama's FHE SDK (Relayer SDK) for encryption/decryption
- **react-hot-toast** - Beautiful toast notifications

### Smart Contract Stack ⚡
- **Solidity 0.8.24** - Smart contract language
- **Zama FHEVM** - Fully Homomorphic Encryption on-chain
- **Hardhat/Foundry** - Development environment and testing
- **TFHE.sol** - FHE operations (add, select, ge, allowThis, allowTransient)

### Encryption & Privacy 🔐
- **fhevmjs** - Client-side encryption and User Decryption
- **createEncryptedInput()** - Input encryption with proof generation
- **EIP-712 Signatures** - Typed data signing for decryption authorization
- **FHE Operations**: `asEuint64`, `add`, `ge`, `select`, `allowThis`, `allowTransient`

### Blockchain Infrastructure 🌐
- **Ethereum Sepolia Testnet** - Development and testing network
- **Zama Gateway** - User Decryption service (0-2 second response)
- **MetaMask** - Browser wallet for transaction signing
- **Etherscan** - Contract verification and monitoring

### Key FHEVM Patterns 🚀
```solidity
// Client-side encryption
createEncryptedInput(contractAddress, userAddress)
  .add64(value)
  .encrypt()

// Contract permissions
FHE.allowThis(encryptedValue)        // Contract manages data
FHE.allowTransient(value, researcher) // One-time automatic grant
FHE.allow(value, patient)            // User Decryption permission

// Instant decryption (0–2s)
instance.decrypt(contractAddress, encryptedHandle) // EIP-712 signature
```

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

4. **Install dependencies**

```bash
npm install
```

5. **Set up environment variables**

Create `.env` file in root directory:

```env
# Contract configuration (update after deployment)
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_CHAIN_ID=11155111

# Zama Gateway configuration
VITE_GATEWAY_URL=https://gateway.zama.ai

# For contract deployment
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Configuration & Deployment

#### 1. Deploy Smart Contract

```bash
# Using Foundry
forge create contracts/CerebrumFHEVM_v09.sol:CerebrumFHEVM_v09 \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args $PLATFORM_WALLET $RISK_SCORING_ADDRESS \
  --verify --etherscan-api-key $ETHERSCAN_KEY

# Or using Hardhat
npx hardhat run scripts/deploy.js --network sepolia
```

#### 2. Update Contract Address

Update `src/config/contracts-v09.ts`:

```typescript
export const CEREBRUM_CONTRACT_ADDRESS = '0xYourDeployedContractAddress' as const;
export const CEREBRUM_ABI = [...]; // Full ABI included
```

#### 3. Initialize FHEVM in App

Update `src/App.tsx`:

```typescript
import { useFhevmInit } from './hooks/useFhevmV09';

function App() {
  const { isInitialized, isInitializing, error } = useFhevmInit();
  
  if (isInitializing) return <div>Initializing FHEVM...</div>;
  if (error) return <div>Failed to initialize: {error.message}</div>;
  if (!isInitialized) return <div>Please connect your wallet</div>;
  
  return <RouterProvider router={router} />;
}
```

#### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

#### 5. Build for Production

```bash
npm run build
npm run preview  # Test production build locally
```

---

## Usage Guide

### Patient Dashboard

The `Patient Dashboard` page is where users manage encrypted health data, build their encrypted health credit score, and approve lenders.

#### 1. Register as Patient

1. Connect your wallet (MetaMask or another EVM wallet).
2. Navigate to the `Patient Dashboard` from the navbar.
3. If you are new, you will see a call-to-action card titled **"Register as Patient"** with a `Register Now` button.
4. Click `Register Now` and confirm the transaction. This creates your on-chain patient record with:
   - Initial encrypted health score.
   - Empty health records array.
   - Data sharing enabled by default.
   - Activity log tracking all actions.

Under the hood, the app calls `registerPatient()` on `CerebrumFHEVM_v09`.

#### 2. Share Health Data ⚡

Once registered, the top of the dashboard shows a hero section with a mini workflow: **Share Health Data → Build Credit Score → Earn Rewards**. To add a new encrypted health record:

1. Scroll to the **"Share Health Data"** form.
2. Fill in the metrics (all values are encrypted client-side):
   - Blood sugar level (mg/dL)
   - Cholesterol (mg/dL)
   - BMI
   - Blood pressure (systolic & diastolic)
   - Heart rate (BPM)
   - Weight (kg)
   - Height (cm)
   - Age, weekly exercise minutes, sleep hours per night
3. Click the primary **"Share Data"** button.
4. Confirm the transaction in your wallet.

Behind the scenes:

- The UI uses `usePatientFhevm` (in `useFhevmV09.ts`) to call `encryptHealthData(...)`.
- Zama's Relayer SDK (`fhevmjs`) runs `createEncryptedInput`, returning encrypted handles + `inputProof`.
- The app calls `shareHealthData(...)` with 8 encrypted handles, plaintext lifestyle parameters, and the proof.
- The contract updates your encrypted health score and emits activity logs.

#### 3. View Score & Enable Instant Decrypt

The **"Credit Score"** card on the stats grid shows your encrypted health score. You can:

- Click **"Enable Instant Decrypt"** (one-time) to grant `FHE.allow()` permission for user decryption.
- Then click **"Decrypt Instantly"** (or similar CTA) to trigger User Decryption via EIP-712 signature.

Under the hood:

- The dashboard reads `getEncryptedHealthScore(address)` to fetch your encrypted score handle.
- The `handleInstantDecrypt` flow uses `useDecryptUint64` and `fhevmjs` to:
  - Sign an EIP-712 message.
  - Send handle + signature to Zama Gateway.
  - Receive the plaintext score in ~0–2 seconds and render it in the card.

#### 4. Monitor Access, Activity, and Earnings

The rest of the dashboard shows:

- **Quick Stats** bar: number of data shares and total ETH earned.
- **Activity Timeline / Recent Transactions**: last few `Health Data Shared` and other actions.
- **Health Data History** cards (per record): timestamps and high-level info.
- **Lender Approvals** section: addresses you have approved, with ability to revoke.

Use the **"Refresh Data"** button in the Quick Actions bar to re-fetch on-chain state.

#### 5. Claim Earnings

When your earnings balance is greater than zero, a `Quick Claim` button appears in the Quick Actions bar.

1. Click **"Quick Claim"**.
2. Confirm the transaction in your wallet.
3. Your accumulated ETH is transferred from the contract to your wallet.

This calls `claimEarnings()` on the contract.

#### 6. Control Data Sharing & Lender Approvals

- Use the **"Data Sharing"** toggle on the dashboard to call `toggleDataSharing()` and pause/resume new data sharing.
- In the **"Lender Approvals"** section:
  - Enter a lender address and click **"Approve Lender"** to call `approveLender(address lender)`.
  - Use the **"Revoke"** button next to an address to call `revokeLender(address lender)` and prevent future checks.

These controls drive what lenders see in the `Lender Portal` and whether they can run eligibility checks.

---

### Researcher Analytics Portal

The `Researcher Analytics Portal` page is designed for researchers to browse patients, purchase access, decrypt health records, and view risk analytics.

#### 1. Browse & Search Patients

1. Navigate to **"Researcher Portal"** from the navbar.
2. At the top, you will see a hero section with a **search bar** labeled "Search patient by address (0x...)".
3. Below that, a mini guide shows the workflow: **Browse Patients → Purchase Access → Analyze Data**.
4. Use the **"Patient Discovery"** section:
   - Tabs: `All`, `Purchased`, `Recent` (labels may appear as `All Patients`, `Purchased`, `Recently Viewed`).
   - Each patient card shows address, sharing status, and number of records.
   - Clicking a card selects that patient and scrolls to the detailed panel.

#### 2. Purchase Access

1. In the selected patient panel, use the `Purchase Access` button (or equivalent CTA) when you have not yet purchased access.
2. Confirm the transaction in your wallet.
3. The access pricing card shows dynamic pricing based on data quality (via `calculateAccessPrice`).

Under the hood, the portal calls:

- `purchaseResearcherAccess(patient)` with the correct ETH value.
- The contract uses `FHE.allowTransient` to grant transient permissions for encrypted records and splits the fee (majority to patient, rest to platform).

#### 3. Decrypt Health Records (User Decryption)

Once access is purchased and a patient is selected:

1. Use the **"Health Records"** section to choose a `Record Index` from the dropdown or slider.
2. Click **"Decrypt Health Record"**.
3. The portal will either:
   - Use cached handles from a previous permission grant (stored in `localStorage`), or
   - Call `getEncryptedHealthRecord(patient, recordIndex)` as a transaction to emit a `HealthDataPermissionGranted` event.
4. After permission is granted, Zama's Relayer SDK performs User Decryption and populates the **"Decrypted Health Data"** panel with:
   - Blood sugar, cholesterol, BMI.
   - Blood pressure, heart rate.
   - Weight, height.

The React code uses `useResearcherFhevm` to call `decryptHealthRecord(handles)` from the event.

#### 4. Decrypt Risk Scores & Analytics

For risk analytics on the same record:

1. Click **"Decrypt Risk Scores"** in the analytics section.
2. The portal either uses cached risk handles or calls `getEncryptedRiskScores(patient, recordIndex)` as a transaction.
3. After the permission event is parsed, it calls `decryptRiskScores(handles)`.
4. The **Analytics Dashboard** panel shows decrypted:
   - Diabetes risk.
   - Heart disease risk.
   - Stroke risk.
5. The analytics UI also includes trend charts and summary badges derived from these values.

This flow uses FHEVM entirely on ciphertext, with user decryption only at the UI layer.

---

### Lender Portal

The `Lender Portal` page allows lenders to run encrypted eligibility checks and see a history of checks without ever seeing raw health scores.

#### 1. Discover Patients & Approvals

1. Navigate to **"Lender Portal"** from the navbar.
2. At the top, you will see global stats: total registered patients, how many have approved you, and the privacy level.
3. In the **"Patient Discovery"** section:
   - Tabs:
     - `All Patients` – every registered patient.
     - `Approved Me` – patients who have called `approveLender` for your address.
     - `Previously Checked` – patients you have already run eligibility checks on.
   - Use the **"Refresh"** button to re-fetch on-chain state.
4. Click a patient card to select them and scroll to the detailed **"Patient"** panel.

Patients must approve you from their `Patient Dashboard` before you can check eligibility.

#### 2. Set Credit Score Criteria

Use the **"Set Your Credit Score Criteria"** card to choose a minimum health credit score:

1. Move the slider between 500 and 850.
2. The UI highlights `High Risk`, `Medium Risk`, or `Low Risk` buckets based on your selection.
3. The chosen value is used as the encrypted threshold during checks.

Internally, this threshold is passed to `encryptThreshold(minScore)` from `useLenderFhevm` when you run a check.

#### 3. Run Encrypted Eligibility Check

With a patient selected and approval granted:

1. Scroll to the **"Eligibility Check"** card.
2. Confirm that the `Minimum Requirement` value matches your slider.
3. Click **"Check Eligibility (Pay 0.01 ETH)"** and confirm the transaction.

Under the hood:

- The portal calls `encryptThreshold(minCreditScore)` to create an encrypted `inEuint64` threshold.
- It calls `checkEligibilityWithEncryptedThreshold(patient, threshold, inputProof)` on the contract.
- The contract compares the patient's encrypted health score with the encrypted threshold (`FHE.ge`) and stores an encrypted `ebool` result, as well as a history entry (min score, amount paid, timestamp).

#### 4. Decrypt Result (TRUE/FALSE)

After a check completes for the selected patient:

1. A **"Decrypt Result (Client-Side)"** button appears below the `Eligibility Check` card.
2. Click it to start User Decryption via EIP-712 signature.
3. In 0–2 seconds, the **Eligibility Result** card shows:
   - `✓ Meets Requirements` or `✕ Does Not Meet Requirements`.
   - A note like `Patient's encrypted score ≥ 650` (no actual score revealed).

This uses `decryptEligibilityResult` from `useLenderFhevm` and Zama Gateway. Lenders only ever see a boolean.

#### 5. View Eligibility History

Below the result card, the **"Eligibility Check History"** section lists past checks for this patient:

- Minimum score used.
- Amount paid in ETH.
- Timestamp of each check.

This is backed by `getEligibilityHistory(patient, lender)` on the contract and lets lenders audit their own usage without compromising patient privacy.

---

## Smart Contract

### Contract Information

- **Contract Name**: `CerebrumFHEVM_v09.sol`
- **Network**: Ethereum Sepolia Testnet
- **Compiler Version**: Solidity 0.8.24
- **FHEVM**: Uses User Decryption (no callbacks)
- **License**: BSD-3-Clause-Clear
- **File Location**: `contracts/CerebrumFHEVM_v09.sol`

### Key Contract Capabilities

- `shareHealthData(inEuint64[] memory, bytes calldata inputProof)` — encrypted input with proof
- `getEncryptedHealthScore(address)` — returns encrypted score for User Decryption
- `getEncryptedHealthRecord(address, uint256)` — returns 8 encrypted values
- `getEncryptedRiskScores(address, uint256)` — returns 3 encrypted risk scores
- `getEncryptedEligibilityResult(address)` — returns encrypted TRUE/FALSE
- `FHE.allowThis()` for contract data management
- `FHE.allowTransient()` in researcher access flows for automatic grants
- `FHE.allow()` for User Decryption permissions

### Core Functions (v0.9 API)

#### Patient Functions

```solidity
// Register as a new patient with encrypted health score (500 initial)
function registerPatient() external;

// Share encrypted health data with inputProof (v0.9 pattern)
function shareHealthData(
    inEuint64 memory bloodSugar,
    inEuint64 memory cholesterol,
    inEuint64 memory bmi,
    inEuint64 memory bloodPressureSystolic,
    inEuint64 memory bloodPressureDiastolic,
    inEuint64 memory heartRate,
    inEuint64 memory weight,
    inEuint64 memory height,
    uint8 age,
    uint16 exerciseMinutesPerWeek,
    uint8 sleepHoursPerNight,
    bytes calldata inputProof  // ← New v0.9 requirement
) external;

// Get encrypted health score for User Decryption (0-2s)
function getEncryptedHealthScore(address patient) external view returns (euint64);

// Claim accumulated earnings from researcher access fees
function claimEarnings() external;

// Toggle data sharing on/off
function toggleDataSharing(bool enabled) external;
```

#### Researcher Functions

```solidity
// Purchase access with automatic FHE.allowTransient grant (0.01 ETH)
function purchaseResearcherAccess(address patient) external payable;

// Get encrypted health record for User Decryption
function getEncryptedHealthRecord(address patient, uint256 recordIndex) 
    external view returns (
        euint64 bloodSugar,
        euint64 cholesterol,
        euint64 bmi,
        euint64 bloodPressureSystolic,
        euint64 bloodPressureDiastolic,
        euint64 heartRate,
        euint64 weight,
        euint64 height
    );

// Calculate comprehensive risk scores (diabetes, heart disease, stroke)
function calculateComprehensiveRisk(address patient, uint256 recordIndex) external;

// Get encrypted risk scores for User Decryption
function getEncryptedRiskScores(address patient, uint256 recordIndex)
    external view returns (
        euint64 diabetesRisk,
        euint64 heartDiseaseRisk,
        euint64 strokeRisk
    );
```

#### Lender Functions

```solidity
// Patient approves specific lender for qualification checks
function approveLender(address lender) external;

// Check eligibility with encrypted threshold (lender never sees score!)
function checkEligibilityWithEncryptedThreshold(
    address patient,
    inEuint64 memory threshold,
    bytes calldata inputProof
) external;

// Get encrypted TRUE/FALSE result for User Decryption
function getEncryptedEligibilityResult(address patient) 
    external view returns (ebool);
```

#### View Functions

```solidity
// Get patient information
function getPatientInfo(address patient) external view returns (
    bool isRegistered,
    bool sharingEnabled,
    uint256 totalEarnings,
    uint256 recordCount
);

// Get total registered patients
function getTotalPatients() external view returns (uint256);

// Get health record count for patient
function getHealthRecordCount(address patient) external view returns (uint256);
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

// Older callback-based structures have been removed in favor of User Decryption
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

## FHE Operations (v0.9)

Cerebrum v0.9 leverages the latest FHE operations from Zama's TFHE library:

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

### 6. FHE.allowThis() 🆕
**Purpose**: Grant contract permanent access to manage encrypted values

**Usage in Cerebrum v0.9**:
```solidity
// Contract needs permission to manipulate encrypted data
FHE.allowThis(patient.healthScore);
FHE.allowThis(encBloodSugar);
FHE.allowThis(healthRecord.cholesterol);
```

### 7. FHE.allowTransient() 🆕⚡
**Purpose**: Grant one-time automatic access to address (revolutionary!)

**Usage in Cerebrum v0.9**:
```solidity
// Automatic researcher access grant - NO patient re-signing needed!
function purchaseResearcherAccess(address patient) external payable {
    // ... payment processing ...
    
    // Automatically grant access to all health record fields
    for (uint256 i = 0; i < recordCount; i++) {
        FHE.allowTransient(healthRecords[i].bloodSugar, msg.sender);
        FHE.allowTransient(healthRecords[i].cholesterol, msg.sender);
        // ... grants for all 8 fields ...
    }
}
```

### 8. FHE.allow() 🆕
**Purpose**: Grant specific address permission for User Decryption

**Usage in Cerebrum v0.9**:
```solidity
// Patient can decrypt their own score
FHE.allow(patient.healthScore, patientAddress);

// Lender can decrypt TRUE/FALSE eligibility result
FHE.allow(eligibilityResults[patient], lenderAddress);
```

### 9. createEncryptedInput() (Client-Side) 🆕
**Purpose**: Encrypt data on client before blockchain submission

**Usage in Cerebrum v0.9**:
```typescript
// Frontend encryption with fhevmjs v0.9
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add64(bloodSugar);
input.add64(cholesterol);
// ... add all 8 health metrics ...
const { handles, inputProof } = input.encrypt();

// Submit encrypted handles + proof to contract
await contract.shareHealthData([...handles], age, exercise, sleep, inputProof);
```

### 10. User Decryption (Client-Side) 🆕⚡
**Purpose**: Instant decryption with EIP-712 signatures (0-2 seconds)

**Usage in Cerebrum v0.9**:
```typescript
// Get encrypted ciphertext from contract
const encrypted = await contract.getEncryptedHealthScore(patientAddress);

// Decrypt with EIP-712 signature (user signs once)
const decrypted = await fhevmInstance.decrypt(contractAddress, encrypted);
// Result in 0-2 seconds! 🚀
```

---

## Testing

Cerebrum includes a comprehensive test suite for FHEVM v0.9 covering all smart contract functionality and FHE operations.

> **📋 Important Note**: The Gateway Oracle (`requestDecryption`) has been deprecated by Zama. We now use **User Decryption** with EIP-712 signatures for instant decryption (0-2 seconds). See [Testing Guide](./TESTING_GUIDE_V09.md) for details.

### Running Tests

```bash
# Run all v0.9 tests
npx hardhat test test/CerebrumFHEVM_v09.test.js

# Run specific test suite
npx hardhat test --grep "Patient Registration"

# With gas reporting
REPORT_GAS=true npx hardhat test

# With coverage
npx hardhat coverage
```

### Test Coverage

The v0.9 test suite includes **78 comprehensive tests** covering:

**Deployment & Initialization (v0.9)**
- Contract deployment with platform wallet and risk library
- v0.9 constants initialization
- Tier constants (STANDARD, PREMIUM, COMPLETE)
- Zero address validation

**Patient Registration (with FHE.allowThis)**
- Registration creates encrypted health score
- `FHE.allowThis()` permission grants
- `FHE.allow()` for User Decryption
- Duplicate registration prevention
- Activity log tracking
- Sharing enabled list management

**Data Sharing Controls (v0.9)**
- Toggle sharing on/off
- Sharing enabled count updates
- Event emission verification
- Access control validation

**Lender Approval System (v0.9)**
- Lender approval/revocation
- Approved patients tracking
- Zero address prevention
- Multiple lender support

**Researcher Access (with FHE.allowTransient)**
- Payment processing with 80/20 split
- **Automatic access grants** (no patient re-signing!)
- Insufficient payment rejection
- Researcher purchase tracking
- Multiple researcher support

**Earnings Management (v0.9)**
- Earnings accumulation from multiple purchases
- Claim earnings with reentrancy protection
- Zero earnings prevention
- Event emission verification

**Lender Eligibility (Zero-Knowledge)**
- Eligibility checks with encrypted thresholds
- Approval requirement enforcement
- Eligibility history tracking
- Payment validation

**View Functions (v0.9)**
- Patient info retrieval
- Total patients/data shares
- Patient list management
- Sharing enabled patients
- Health record counts
- Activity logs

**Admin Functions (v0.9)**
- Platform wallet updates
- Ownership transfer
- Owner-only restrictions
- Zero address validation

**Complete Workflows**
- Full patient workflow: register → purchase → claim
- Multi-researcher access scenarios
- Multi-patient researcher workflows
- Lender approval and eligibility flows
- Complete ecosystem with all actors

**Edge Cases & Security**
- Zero initial state handling
- Reentrancy protection
- Large numbers of patients
- State consistency validation

### Test Output

```bash
  CerebrumFHEVM_v09 - FHEVM v0.9 Test Suite

📋 Contract Deployed:
  Main Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  Risk Scoring: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  Platform Wallet: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

    Deployment & Initialization
      ✔ Should deploy with correct platform wallet (89ms)
      ✔ Should deploy with correct risk scoring library
      ✔ Should set correct owner
      ✔ Should initialize v0.9 constants correctly
      ✔ Should initialize tier constants
      ✔ Should have zero initial patients
      ✔ Should have zero initial data shares
      ✔ Should revert deployment with zero platform wallet

    Patient Registration (v0.9 with FHE)
      ✔ Should register patient successfully (52ms)
      ✔ Should initialize patient with encrypted health score
      ✔ Should prevent duplicate registration
      ✔ Should track multiple patient registrations
      ✔ Should add patient to sharing enabled list by default
      ✔ Should create activity log entry for registration

    Data Sharing Controls (v0.9)
      ✔ Should toggle sharing to disabled
      ✔ Should toggle sharing back to enabled
      ✔ Should update sharing enabled count correctly
      ✔ Should prevent toggle if not registered
      ✔ Should track activity log for toggles

    Lender Approval System (v0.9)
      ✔ Should approve lender successfully
      ✔ Should track approved patients for lender
      ✔ Should revoke lender approval
      ✔ Should prevent zero address approval
      ✔ Should prevent unregistered patient from approving
      ✔ Should allow multiple lender approvals

    Researcher Access Purchase (v0.9 with Auto-Grants)
      ✔ Should purchase access with correct payment
      ✔ Should split payment 80/20 correctly
      ✔ Should emit correct event with payment details
      ✔ Should prevent insufficient payment
      ✔ Should prevent access to unregistered patient
      ✔ Should allow multiple researchers to purchase access
      ✔ Should track researcher purchase count
      ✔ Should track purchased patients list

    Earnings Claims (v0.9)
      ✔ Should claim earnings successfully
      ✔ Should emit EarningsDistributed event
      ✔ Should reset earnings to zero after claim
      ✔ Should prevent claim with zero earnings
      ✔ Should prevent unregistered patient from claiming
      ✔ Should accumulate earnings from multiple purchases

    Lender Eligibility Checks (v0.9 Zero-Knowledge)
      ✔ Should check eligibility with plaintext threshold
      ✔ Should prevent check without approval
      ✔ Should prevent check with insufficient payment
      ✔ Should track eligibility history
      ✔ Should prevent check on unregistered patient

    View Functions (v0.9)
      ✔ Should return correct patient info
      ✔ Should return correct total patients
      ✔ Should return correct total data shares
      ✔ Should return complete patient list
      ✔ Should return sharing enabled patients
      ✔ Should return correct health record count
      ✔ Should return registration status correctly
      ✔ Should return sharing status correctly
      ✔ Should return activity logs

    Admin Functions (v0.9)
      ✔ Should allow owner to update platform wallet
      ✔ Should prevent non-owner from updating platform wallet
      ✔ Should prevent zero address platform wallet
      ✔ Should allow owner to transfer ownership
      ✔ Should prevent non-owner from transferring ownership
      ✔ Should prevent transferring to zero address

    Complete Workflows (v0.9 End-to-End)
      ✔ Full patient workflow: register → toggle → claim (145ms)
      ✔ Multi-researcher access workflow
      ✔ Multi-patient researcher workflow
      ✔ Lender approval and eligibility workflow
      ✔ Complete ecosystem workflow with all actors

    Edge Cases & Security (v0.9)
      ✔ Should handle zero initial state correctly
      ✔ Should prevent reentrancy in claimEarnings
      ✔ Should handle large numbers of patients
      ✔ Should maintain state consistency across operations


  78 passing (2.4s)

```

### Integration Testing on Sepolia

For **User Decryption** testing (requires live Gateway):

1. Deploy contracts: `npm run deploy:sepolia`
2. Start frontend: `npm run dev`
3. Test instant decryption (0-2 seconds with EIP-712 signatures)
4. Verify automatic researcher access grants (FHE.allowTransient)

See [Testing Guide](./TESTING_GUIDE_V09.md) for complete details on v0.9 testing strategy.

---

## Project Structure

```
Cerebrum/
├── src/                           # Frontend source
│   ├── components/
│   │   ├── common/
│   │   │   └── Navbar.tsx
│   │   └── CopyButton.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── PatientDashboard.tsx   # Patient portal
│   │   ├── ResearcherPortal.tsx   # Researcher portal
│   │   ├── LenderPortal.tsx       # Lender portal
│   │   └── DocsPage.tsx           # Documentation page
│   ├── config/
│   │   ├── contracts.ts           # v0.8 contract (legacy)
│   │   ├── contracts-v09.ts       # v0.9 contract (current) ⚡
│   │   ├── wagmi.ts               # Wagmi v2 configuration
│   │   └── theme.ts               # Theme configuration
│   ├── hooks/
│   │   ├── useCerebrum.ts         # v0.8 hooks (legacy)
│   │   └── useFhevmV09.ts         # v0.9 hooks (current) ⚡
│   ├── utils/
│   │   └── fhevm-v09.ts           # v0.9 encryption/decryption ⚡
│   ├── contexts/
│   │   └── ThemeContext.tsx
│   ├── types/
│   │   └── index.ts
│   ├── assets/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── contracts/
│   ├── CerebrumFHEVM.sol          # v0.8 contract (legacy)
│   └── CerebrumFHEVM_v09.sol      # v0.9 contract (current) ⚡
├── test/
│   └── CerebrumFHEVM.test.js      # Contract tests
├── public/
│   └── index.html
├── docs/                          # v0.9 Migration Documentation
│   ├── FHEVM_V09_MIGRATION.md     # Complete migration guide ⚡
│   ├── FRONTEND_V09_COMPLETE.md   # Frontend integration ⚡
│   ├── QUICK_REFERENCE.md         # v0.9 quick reference ⚡
│   ├── ARCHITECTURE_DIAGRAM.md    # System architecture ⚡
│   ├── DEPLOYMENT_CHECKLIST.md    # Deployment guide ⚡
│   └── V09_MIGRATION_COMPLETE.md  # Migration summary ⚡
├── package.json                   # Dependencies (fhevmjs@^0.9.2)
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── LICENSE
└── README.md
```

**Key Files for v0.9:**
- ⚡ `contracts/CerebrumFHEVM_v09.sol` - Smart contract with User Decryption
- ⚡ `src/utils/fhevm-v09.ts` - Encryption/decryption utilities
- ⚡ `src/hooks/useFhevmV09.ts` - React hooks for all user types
- ⚡ `src/config/contracts-v09.ts` - Simplified ABI (no callbacks)
- ⚡ `docs/` - Complete v0.9 migration documentation

---

## Troubleshooting

### Common Issues and Solutions

#### User Decryption Fails or Returns Error

**Problem**: Decryption throws error or user rejects signature

**Solutions**:
1. **User rejected EIP-712 signature**: User must sign the decryption request in MetaMask
2. **No FHE.allow permission**: Ensure contract called `FHE.allow(value, yourAddress)`
3. **Wrong contract address**: Verify you're using correct deployed contract address
4. **FHEVM not initialized**: Call `useFhevmInit()` in App.tsx before any decryption

```typescript
// Proper error handling
try {
  const decrypted = await decryptUint64(encrypted);
} catch (error) {
  if (error.code === 4001) {
    toast.error('You rejected the decryption signature');
  } else {
    toast.error('Decryption failed. Check console for details.');
    console.error(error);
  }
}
```

#### Transaction Fails with Insufficient Funds

**Problem**: Transaction reverts before submission

**Solutions**:
1. Get Sepolia ETH from [faucet](https://sepoliafaucet.com/)
2. Ensure you have at least 0.02 ETH for gas + fees
3. Check MetaMask gas settings aren't set too low
4. Verify you're connected to Sepolia network

#### FHEVM Instance Not Initialized

**Problem**: "FHEVM instance not initialized" error when encrypting/decrypting

**Solutions**:
1. **Add useFhevmInit() in App.tsx**:
```typescript
import { useFhevmInit } from './hooks/useFhevmV09';

function App() {
  const { isInitialized, isInitializing, error } = useFhevmInit();
  
  if (isInitializing) return <div>Initializing FHEVM...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!isInitialized) return <div>Connect wallet first</div>;
  
  return <YourApp />;
}
```

2. **Ensure wallet is connected** before any FHE operations
3. **Check Gateway URL** in environment variables
4. **Verify fhevmjs version**: Should be `^0.9.2` in package.json

#### Encrypted Input Proof Validation Fails

**Problem**: Transaction reverts with "Invalid proof" error

**Solutions**:
1. **Use correct contract address** when creating encrypted input:
```typescript
// Must match deployed contract address
const input = instance.createEncryptedInput(CONTRACT_ADDRESS, userAddress);
```

2. **Don't reuse inputProof**: Generate new proof for each transaction
3. **Ensure fhevmjs is initialized** before encryption
4. **Check user address matches signer**: User creating proof must sign transaction

```typescript
// Correct flow
const { address } = useAccount(); // Connected wallet
const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
input.add64(value);
const { handles, inputProof } = input.encrypt();
// Use immediately - don't store for later use
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

---

## Demo Video

[Watch on YouTube](https://youtu.be/A7h1CDHMxP4?si=d-_nD3qaaJ-AhRkz)

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

## Star History

If you find Cerebrum useful, please consider giving it a ⭐ on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=ramakrishnanhulk20/Cerebrum&type=Date)](https://star-history.com/#ramakrishnanhulk20/Cerebrum&Date)

---

**Built with ❤️ using Zama FHEVM**

[Live Demo](https://cerebrum-site.vercel.app/) · [GitHub](https://github.com/ramakrishnanhulk20/Cerebrum)

---

### Tech Stack Badges

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity&logoColor=white)
![fhevmjs](https://img.shields.io/badge/fhevmjs-0.9.2-00D4AA?logo=zap&logoColor=white)
![Wagmi](https://img.shields.io/badge/Wagmi-2.12.9-purple?logo=ethereum&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)
