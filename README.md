# Complete GitHub README for Your Project

Here's a comprehensive, professional README.md file for your FHE Health Records project. Copy the entire content below and save it as `README.md`:

```markdown
# 🏥 Cerebrum - Fully Homomorphic Encrypted Health Records System

<div align="center">

![Cerebrum Banner](https://img.shields.io/badge/Cerebrum-FHE%20Health%20Records-emerald?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Zama fhEVM](https://img.shields.io/badge/Powered%20by-Zama%20fhEVM-blue?style=for-the-badge)](https://www.zama.ai/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-purple?style=for-the-badge)](https://sepolia.etherscan.io/)

**A privacy-preserving healthcare data platform built with Fully Homomorphic Encryption**

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage Guide](#-usage-guide)
  - [Patient Portal](#patient-portal)
  - [Researcher Portal](#researcher-portal)
- [Smart Contract](#-smart-contract)
- [FHE Decryption Flow](#-fhe-decryption-flow)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 Overview

**Cerebrum** is a revolutionary healthcare data management platform that leverages **Fully Homomorphic Encryption (FHE)** to ensure complete privacy and security of sensitive medical records. Built on Ethereum using Zama's fhEVM, Cerebrum allows patients to maintain full control over their health data while enabling authorized researchers to access and analyze encrypted information without ever viewing the raw data.

### The Problem

Traditional healthcare systems store medical records in plaintext or weakly encrypted formats, making them vulnerable to data breaches and unauthorized access. Even with encryption, data must be decrypted for processing, creating security vulnerabilities.

### Solution

Cerebrum implements **true end-to-end encryption** using FHE technology:
- ✅ Health records remain encrypted at ALL times on-chain
- ✅ Computations can be performed on encrypted data
- ✅ Only authorized parties can decrypt specific records
- ✅ Patients maintain complete ownership and control
- ✅ Decentralized architecture prevents single points of failure

---

## 🎯 Key Features

### For Patients
- 🔐 **End-to-End Encryption**: Upload health records encrypted with FHE
- 💰 **Data Monetization**: Earn ETH when researchers purchase access (80% revenue share)
- 🎛️ **Granular Control**: Grant/revoke access to specific records
- 📊 **Privacy Dashboard**: Track who has accessed your data
- 🔒 **Self-Custody**: Your data, your keys, your control

### For Researchers
- 🔬 **Secure Data Access**: Purchase one-time access to encrypted health data
- 🔓 **On-Demand Decryption**: Request decryption via Zama Gateway
- 📈 **Multi-Record Access**: Query multiple health records per patient
- ⚡ **Fast Processing**: Decryption results returned in 30-60 seconds
- 💡 **Fair Pricing**: Transparent fee structure (0.01 ETH per access)

### Core Capabilities
- **Encrypted Storage**: All health metrics (blood sugar, cholesterol, BMI) stored as FHE-encrypted values
- **Gateway Integration**: Zama's decryption oracle handles secure off-chain decryption
- **Smart Contract Callbacks**: Automated callback system stores decrypted results on-chain
- **Real-time Updates**: Auto-refresh polling system for seamless UX
- **Multi-Party Access**: Support for patients, researchers, and future lender portal

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Patient    │  │  Researcher  │  │    Lender    │      │
│  │   Portal     │  │    Portal    │  │   Portal     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                     Wagmi + Viem                             │
└─────────────────────────────┬───────────────────────────────┘
                              │
                     ┌────────▼─────────┐
                     │  Ethereum Node   │
                     │  (Sepolia)       │
                     └────────┬─────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
     ┌────────▼─────────┐          ┌─────────▼────────┐
     │  CerebrumFHEVM   │◄─────────┤  Zama Gateway    │
     │  Smart Contract  │          │  Decryption      │
     │                  │          │  Oracle          │
     └──────────────────┘          └──────────────────┘
              │
      ┌───────┴────────┐
      │                │
┌─────▼──────┐  ┌──────▼──────┐
│  Encrypted │  │  Decrypted  │
│  Health    │  │  Results    │
│  Records   │  │  Storage    │
└────────────┘  └─────────────┘
```

### FHE Workflow

1. **Patient Encrypts Data**: Health metrics encrypted client-side using Zama's FHE library
2. **On-Chain Storage**: Encrypted data stored in smart contract (never decrypted on-chain)
3. **Access Purchase**: Researchers pay fee to unlock access to specific patient records
4. **Decryption Request**: Authorized researcher requests decryption from Zama Gateway
5. **Off-Chain Decryption**: Gateway decrypts data securely and creates proof
6. **Callback Execution**: Gateway calls smart contract with decrypted values + proof
7. **Result Storage**: Decrypted data stored in mapping for researcher access
8. **Frontend Display**: React app queries and displays decrypted health metrics

---

## 💻 Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Wagmi** - Ethereum interactions
- **Viem** - Ethereum library

### Smart Contracts
- **Solidity 0.8.24** - Smart contract language
- **Zama fhEVM** - Fully Homomorphic Encryption
- **Hardhat** - Development environment
- **OpenZeppelin** - Security standards

### Infrastructure
- **Ethereum Sepolia** - Testnet deployment
- **Zama Gateway** - Decryption oracle
- **IPFS** (optional) - Decentralized file storage
- **MetaMask** - Wallet integration

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

```
node >= 18.0.0
npm >= 9.0.0
git
```

**Required Tools:**
- MetaMask browser extension
- Access to Sepolia testnet ETH (faucet)
- Basic understanding of Ethereum and Web3

### Installation

1. **Clone the repository**

```
git clone https://github.com/yourusername/cerebrum-fhe-health-records.git
cd cerebrum-fhe-health-records
```

2. **Install frontend dependencies**

```
cd frontend
npm install
```

3. **Install smart contract dependencies**

```
cd ../contracts
npm install
```

4. **Set up environment variables**

Create a `.env` file in the frontend directory:

```
VITE_CONTRACT_ADDRESS=0x5B9dCB5CaB452ffe2000F95ee29558c81682aE2a
VITE_CHAIN_ID=11155111
VITE_GATEWAY_URL=https://gateway.zama.ai
```

Create a `.env` file in the contracts directory:

```
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Configuration

1. **Update contract address** in `frontend/src/config/contracts.ts`:

```
export const CEREBRUM_CONTRACT_ADDRESS = '0x5B9dCB5CaB452ffe2000F95ee29558c81682aE2a';
```

2. **Configure Wagmi** in `frontend/src/config/wagmi.ts`:

```
import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});
```

3. **Start the development server**

```
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see the application.

---

## 📖 Usage Guide

### Patient Portal

#### 1. Register as a Patient

```
// Connect wallet and register
await writeContract({
  address: CONTRACT_ADDRESS,
  abi: CEREBRUM_ABI,
  functionName: 'registerPatient',
});
```

#### 2. Upload Encrypted Health Records

```
// Encrypt health data using FHE
const encryptedBloodSugar = await FHE.encrypt(120);
const encryptedCholesterol = await FHE.encrypt(100);
const encryptedBMI = await FHE.encrypt(24);

// Submit to smart contract
await writeContract({
  address: CONTRACT_ADDRESS,
  abi: CEREBRUM_ABI,
  functionName: 'addHealthRecord',
  args: [encryptedBloodSugar, encryptedCholesterol, encryptedBMI],
});
```

#### 3. Monitor Access

View which researchers have purchased access to your data in the dashboard.

### Researcher Portal

#### 1. Search for Patient

Enter patient's Ethereum address in the search field:

```
0x48018aA1a362108B28Ffd2A96f2e77EB83B66CE8
```

#### 2. Purchase Access

```
await writeContract({
  address: CONTRACT_ADDRESS,
  abi: CEREBRUM_ABI,
  functionName: 'purchaseResearcherAccess',
  args: [patientAddress],
  value: parseEther('0.01'), // 0.01 ETH
});
```

**Fee Distribution:**
- 80% (0.008 ETH) → Patient
- 20% (0.002 ETH) → Platform

#### 3. Request Decryption

```
await writeContract({
  address: CONTRACT_ADDRESS,
  abi: CEREBRUM_ABI,
  functionName: 'requestHealthRecordDecryption',
  args: [patientAddress, recordIndex],
});
```

**Decryption Process:**
- Request submitted to Zama Gateway
- Gateway decrypts data off-chain
- Callback triggered in 30-60 seconds
- Results stored in `decryptedRecords` mapping

#### 4. View Decrypted Data

```
const { data: decryptedRecord } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: CEREBRUM_ABI,
  functionName: 'decryptedRecords',
  args: [patientAddress, researcherAddress, recordIndex],
});

// Extract values
const [bloodSugar, cholesterol, bmi, timestamp, isDecrypted] = decryptedRecord;
```

---

## 📜 Smart Contract

### Deployed Contract

- **Network**: Ethereum Sepolia Testnet
- **Address**: `0x5B9dCB5CaB452ffe2000F95ee29558c81682aE2a`
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x5B9dCB5CaB452ffe2000F95ee29558c81682aE2a)

### Core Functions

#### Patient Functions

```
function registerPatient() external;
function addHealthRecord(
    einput encryptedBloodSugar,
    einput encryptedCholesterol,
    einput encryptedBMI,
    bytes calldata inputProof
) external;
```

#### Researcher Functions

```
function purchaseResearcherAccess(address _patient) external payable;
function requestHealthRecordDecryption(
    address _patient,
    uint256 _recordIndex
) external;
```

#### Gateway Callback

```
function callbackHealthRecordDecryption(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) public;
```

### Data Structures

```
struct HealthRecord {
    euint64 bloodSugar;
    euint64 cholesterol;
    euint64 bmi;
    uint256 timestamp;
}

struct DecryptedHealthRecord {
    uint64 bloodSugar;
    uint64 cholesterol;
    uint64 bmi;
    uint256 timestamp;
    bool isDecrypted;
}
```

### Security Features

- ✅ Access control with role-based permissions
- ✅ Reentrancy protection
- ✅ Input validation and proof verification
- ✅ Gateway signature verification
- ✅ Fee distribution with automatic transfers

---

## 🔐 FHE Decryption Flow

### Step-by-Step Process

```
sequenceDiagram
    participant R as Researcher
    participant C as Smart Contract
    participant G as Zama Gateway
    participant B as Blockchain

    R->>C: requestHealthRecordDecryption(patient, index)
    C->>C: Verify researcher has access
    C->>G: Emit DecryptionRequest event
    C->>B: Store pending request
    
    Note over G: Off-chain decryption (30-60s)
    
    G->>G: Decrypt FHE ciphertexts
    G->>G: Generate proof
    G->>C: callbackHealthRecordDecryption(requestId, cleartexts, proof)
    C->>C: Verify proof signature
    C->>C: Store decrypted results
    C->>B: Emit HealthRecordDecrypted event
    
    R->>C: Query decryptedRecords
    C->>R: Return decrypted health metrics
```

### Decryption Request

```
// Frontend triggers decryption
const tx = await requestDecryption({
  address: CONTRACT_ADDRESS,
  abi: CEREBRUM_ABI,
  functionName: 'requestHealthRecordDecryption',
  args: [patientAddress, BigInt(recordIndex)],
});

await tx.wait();
```

### Gateway Callback

```
function callbackHealthRecordDecryption(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) public {
    // Verify gateway signature
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);
    
    // Decode decrypted values
    uint64 bloodSugar = abi.decode(cleartexts[0:32], (uint64));
    uint64 cholesterol = abi.decode(cleartexts[32:64], (uint64));
    uint64 bmi = abi.decode(cleartexts[64:96], (uint64));
    
    // Store results
    decryptedRecords[patient][researcher][recordIndex] = DecryptedHealthRecord({
        bloodSugar: bloodSugar,
        cholesterol: cholesterol,
        bmi: bmi,
        timestamp: block.timestamp,
        isDecrypted: true
    });
}
```

### Polling for Results

```
useEffect(() => {
  if (decryptSuccess) {
    const interval = setInterval(() => {
      refetchRecord(); // Poll every 5 seconds
    }, 5000);
    
    setTimeout(() => {
      clearInterval(interval);
    }, 120000); // Stop after 2 minutes
  }
}, [decryptSuccess]);
```

---

## 📁 Project Structure

```
cerebrum-fhe-health-records/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── PatientDashboard.tsx
│   │   │   ├── ResearcherPortal.tsx
│   │   │   └── LenderPortal.tsx
│   │   ├── config/
│   │   │   ├── contracts.ts
│   │   │   └── wagmi.ts
│   │   ├── hooks/
│   │   │   └── useCerebrum.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── contracts/
│   ├── src/
│   │   └── CerebrumFHEVM.sol
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── verify.ts
│   ├── test/
│   │   └── Cerebrum.test.ts
│   ├── hardhat.config.ts
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── SECURITY.md
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Decryption Not Showing Results

**Problem**: Decrypted data returns all zeros

**Solution**:
- Verify you're using the correct patient address
- Check that record index matches the decrypted record
- Ensure you're connected with the same wallet that requested decryption
- Wait 60 seconds and manually refresh

```
// Correct query format
const { data } = useReadContract({
  functionName: 'decryptedRecords',
  args: [patientAddress, yourAddress, BigInt(recordIndex)],
});

// Extract data from array indices
const bloodSugar = data;
const cholesterol = data;[11]
const bmi = data;
```

#### 2. Transaction Fails on Submission

**Problem**: Transaction reverts with "Insufficient funds"

**Solution**:
- Get Sepolia testnet ETH from faucet
- Ensure you have enough ETH for gas + fees
- Check gas limit settings in MetaMask

#### 3. Gateway Callback Not Triggered

**Problem**: Waiting >2 minutes with no callback

**Solution**:
- Check Zama Gateway status
- Verify contract has correct callback function
- Look for `DecryptionRequest` event in transaction logs
- Check Etherscan for callback transaction

#### 4. Contract Read Functions Return Undefined

**Problem**: `useReadContract` returns undefined

**Solution**:
```
// Ensure args are properly formatted
args: searchedPatient && address 
  ? [searchedPatient as `0x${string}`, address as `0x${string}`, BigInt(recordIndex)]
  : undefined,
```

### Debug Mode

Enable detailed logging:

```
// Add to ResearcherPortal.tsx
useEffect(() => {
  console.log('🔍 Debug Info:', {
    patient: searchedPatient,
    researcher: address,
    recordIndex,
    recordData,
    isDecrypted,
  });
}, [searchedPatient, address, recordIndex, recordData]);
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Process

1. **Fork the repository**

```
git clone https://github.com/yourusername/cerebrum-fhe-health-records.git
cd cerebrum-fhe-health-records
git checkout -b feature/your-feature-name
```

2. **Make your changes**

Follow our coding standards:
- Use TypeScript for type safety
- Follow Airbnb style guide
- Write comprehensive tests
- Document new features

3. **Test your changes**

```
# Run frontend tests
cd frontend
npm test

# Run contract tests
cd contracts
npx hardhat test
```

4. **Submit a Pull Request**

- Describe your changes clearly
- Reference any related issues
- Ensure CI/CD passes
- Request review from maintainers

### Contribution Areas

- 🐛 **Bug Fixes**: Help identify and fix issues
- ✨ **New Features**: Implement lender portal, data analytics
- 📚 **Documentation**: Improve guides and examples
- 🎨 **UI/UX**: Enhance design and user experience
- 🔒 **Security**: Audit smart contracts and report vulnerabilities

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Cerebrum Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

### Built With

- [Zama](https://www.zama.ai/) - Fully Homomorphic Encryption technology
- [fhEVM](https://docs.zama.ai/fhevm) - FHE blockchain protocol
- [Ethereum](https://ethereum.org/) - Blockchain platform
- [React](https://react.dev/) - Frontend framework
- [Wagmi](https://wagmi.sh/) - React Hooks for Ethereum

### Special Thanks

- **Zama Team** for providing FHE infrastructure and support
- **Ethereum Community** for blockchain innovation
- **Open Source Contributors** who make projects like this possible

### Learn More

- [Zama Documentation](https://docs.zama.ai/)
- [fhEVM Guide](https://docs.zama.ai/fhevm)
- [Ethereum Development](https://ethereum.org/en/developers/)
- [Wagmi Documentation](https://wagmi.sh/react/getting-started)

---

## 📞 Support

Need help? Reach out:

- **Email**: support@cerebrum.health
- **Discord**: [Join our community](#)
- **Twitter**: [@CerebrumHealth](#)
- **Issues**: [GitHub Issues](https://github.com/yourusername/cerebrum-fhe-health-records/issues)

---

## 🗺️ Roadmap

### Phase 1 - MVP ✅ (Completed)
- [x] Patient registration and health record upload
- [x] Researcher access purchase system
- [x] FHE encryption/decryption flow
- [x] Gateway callback integration
- [x] Frontend dashboards

### Phase 2 - Enhanced Features (Q1 2025)
- [ ] Lender portal implementation
- [ ] Multi-signature access control
- [ ] Data analytics dashboard
- [ ] Mobile app (React Native)
- [ ] IPFS integration for metadata

### Phase 3 - Scalability (Q2 2025)
- [ ] Layer 2 deployment (Optimism/Arbitrum)
- [ ] Batch decryption optimization
- [ ] Enhanced privacy features (zero-knowledge proofs)
- [ ] Healthcare provider integration
- [ ] Insurance company partnerships

### Phase 4 - Enterprise (Q3 2025)
- [ ] HIPAA compliance certification
- [ ] Multi-chain support
- [ ] API for third-party integrations
- [ ] Advanced access control (roles, permissions)
- [ ] Audit logging and compliance tools

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by the Cerebrum Team

[Website](#) · [Documentation](#) · [Twitter](#) · [Discord](#)

</div>
```

***
