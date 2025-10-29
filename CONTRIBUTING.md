# Contributing to Cerebrum

🎉 First off, thank you for considering contributing to Cerebrum! We welcome contributions from the community and are excited to work with you.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to support@cerebrum.health.

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- MetaMask wallet
- Basic understanding of React, TypeScript, and Solidity
- Familiarity with Ethereum and Web3 concepts

### Fork and Clone

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:

git clone https://github.com/YOUR_USERNAME/cerebrum-fhe-health-records.git
cd cerebrum-fhe-health-records

3. **Add upstream remote**:
   
git remote add upstream https://github.com/ORIGINAL_OWNER/cerebrum-fhe-health-records.git

4. **Create a new branch**:

git checkout -b feature/your-feature-name


---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When submitting a bug report, include:**

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** (if applicable)
- **Environment details**:
  - OS and version
  - Browser and version
  - Node.js version
  - Network (Sepolia, Mainnet, etc.)
- **Error messages** and console logs

**Example Bug Report:**

Bug Description:
Decryption callback fails when requesting health record decryption for record index > 0

Steps to Reproduce:

Connect wallet to Researcher Portal

Purchase access for patient 0x123...

Select "Record #2" from dropdown

Click "Decrypt" button

Wait 60 seconds

Expected Behavior:
Decrypted data should display after 30-60 seconds

Actual Behavior:
Returns all zeros even after 2 minutes

Environment:

OS: macOS 14.2

Browser: Chrome 120.0

Network: Sepolia

Contract: 0x5B9d...


### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title** describing the enhancement
- **Detailed description** of the proposed functionality
- **Use cases** demonstrating the value
- **Mockups or diagrams** (if applicable)
- **Implementation ideas** (optional)

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Simple issues perfect for newcomers
- `help wanted` - Issues where we need community help
- `bug` - Known bugs that need fixing
- `documentation` - Documentation improvements

---

## Development Setup

### Frontend Setup

cd frontend
npm install
npm run dev

Visit `http://localhost:5173`

### Smart Contract Setup

cd contracts
npm install
npx hardhat compile
npx hardhat test


### Environment Configuration

Create `.env` files:

**Frontend `.env`:**

VITE_CONTRACT_ADDRESS=0x5B9dCB5CaB452ffe2000F95ee29558c81682aE2a
VITE_CHAIN_ID=11155111
VITE_GATEWAY_URL=https://gateway.zama.ai


**Contracts `.env`:**

PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=your_api_key

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:

git fetch upstream
git rebase upstream/main


2. **Test your changes**:

Frontend tests
cd frontend
npm test
npm run build

Contract tests
cd contracts
npx hardhat test
npx hardhat coverage


3. **Lint your code**:

npm run lint
npm run format


4. **Update documentation** if needed

### Submitting a Pull Request

1. **Push to your fork**:

git push origin feature/your-feature-name


2. **Create Pull Request** on GitHub

3. **Fill out the PR template**:

Description
Brief description of changes

Type of Change
 Bug fix (non-breaking change fixing an issue)

 New feature (non-breaking change adding functionality)

 Breaking change (fix or feature causing existing functionality to break)

 Documentation update

Testing
 Unit tests pass

 Integration tests pass

 Manual testing completed

Screenshots (if applicable)
Add screenshots demonstrating the change

Checklist
 Code follows project style guidelines

 Self-reviewed my own code

 Commented complex code sections

 Updated documentation

 No new warnings generated

 Added tests covering changes

 All tests pass locally

 
### PR Review Process

- **2 approvals required** from maintainers
- **CI/CD must pass** (automated tests, linting)
- **No merge conflicts** with main branch
- **Documentation updated** if needed

### After Approval

Maintainers will merge your PR. You can then:

git checkout main
git pull upstream main
git push origin main

---

## Coding Standards

### TypeScript/React

// Use functional components with TypeScript
const PatientDashboard: React.FC = () => {
// Use descriptive variable names
const [patientRecords, setPatientRecords] = useState<HealthRecord[]>([]);

// Comment complex logic
useEffect(() => {
// Fetch and decrypt patient records on mount
fetchPatientRecords();
}, []);

return (
<div className="dashboard-container">
{/* Component JSX */}
</div>
);
};


**Style Guidelines:**
- Use TypeScript for all new code
- Follow Airbnb React/TypeScript style guide
- Use functional components with hooks
- Prefer `const` over `let`
- Use meaningful variable and function names
- Keep functions small and focused
- Extract reusable logic into custom hooks

### Solidity

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Health Record Management
/// @notice Manages encrypted health records using FHE
/// @dev Uses Zama's fhEVM for encryption
contract CerebrumFHEVM {
/// @notice Adds a new health record for the patient
/// @param encryptedBloodSugar Encrypted blood sugar value
/// @dev Only callable by registered patients
function addHealthRecord(
einput encryptedBloodSugar,
einput encryptedCholesterol,
einput encryptedBMI,
bytes calldata inputProof
) external onlyPatient {
// Implementation
}
}


**Solidity Standards:**
- Follow Solidity 0.8.24 best practices
- Use NatSpec comments for all public functions
- Implement proper access control
- Include input validation
- Emit events for state changes
- Write comprehensive tests
- Gas optimization where possible

### File Naming

- React components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Smart contracts: `PascalCase.sol`
- Tests: `ComponentName.test.tsx` or `ContractName.test.ts`

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format

<type>(<scope>): <subject>

<body> <footer> ```
Types
feat: New feature

fix: Bug fix

docs: Documentation only

style: Code style changes (formatting, no logic change)

refactor: Code refactoring

perf: Performance improvements

test: Adding or updating tests

chore: Maintenance tasks

feat(researcher): add auto-refresh for decrypted records

- Implement polling every 5 seconds after decrypt request
- Stop auto-refresh after 2 minutes
- Add manual refresh button

Closes #123

fix(callback): correct data extraction from array indices

Previously using property names to extract decrypted data,
now correctly using array indices , ,  to match[9]
the tuple return format from the mapping.

Fixes #456

Testing

Frontend Testing

cd frontend
npm test                 # Run all tests
npm test -- --coverage   # With coverage report
npm test -- --watch      # Watch mode

import { render, screen, waitFor } from '@testing-library/react';
import { PatientDashboard } from './PatientDashboard';

describe('PatientDashboard', () => {
  it('should display patient health records', async () => {
    render(<PatientDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Blood Sugar')).toBeInTheDocument();
    });
  });
});

cd contracts
npx hardhat test
npx hardhat coverage

import { expect } from "chai";
import { ethers } from "hardhat";

describe("CerebrumFHEVM", function () {
  it("Should register a new patient", async function () {
    const [owner, patient] = await ethers.getSigners();
    const Cerebrum = await ethers.deployContract("CerebrumFHEVM");
    
    await Cerebrum.connect(patient).registerPatient();
    
    expect(await Cerebrum.isPatient(patient.address)).to.be.true;
  });
});

Documentation
Code Documentation
Add JSDoc comments for all exported functions

Explain complex logic with inline comments

Document API endpoints and parameters

Keep README.md updated with new features

Documentation Files
Update relevant docs when making changes:

README.md - Main project documentation

docs/ARCHITECTURE.md - System architecture

docs/API.md - API documentation

CHANGELOG.md - Version history

Community
Communication Channels
GitHub Issues - Bug reports and feature requests

GitHub Discussions - General questions and ideas

Discord - Real-time chat and support

Twitter - Project updates and announcements

Getting Help
Check existing issues and discussions

Read the documentation thoroughly

Ask in Discord for quick help

Create a detailed GitHub issue for bugs

Recognition
Contributors will be:

Listed in CONTRIBUTORS.md

Mentioned in release notes

Featured on project website (if applicable)

License
By contributing to Cerebrum, you agree that your contributions will be licensed under the MIT License.

Questions?
Feel free to reach out:

Email: support@cerebrum.health

Discord: Join our server

Twitter: @CerebrumHealth

Thank you for contributing to Cerebrum! 🚀


***

## 3. CODE_OF_CONDUCT.md (Community Standards)

Save as: `CODE_OF_CONDUCT.md`

```markdown
# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, caste, color, religion, or sexual
identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

## Our Standards

### Examples of behavior that contributes to a positive environment:

* **Being respectful** of differing opinions, viewpoints, and experiences
* **Giving and gracefully accepting** constructive feedback
* **Accepting responsibility** and apologizing to those affected by our mistakes
* **Focusing on what is best** not just for us as individuals, but for the overall community
* **Showing empathy** towards other community members
* **Using welcoming and inclusive language**
* **Being patient** with new contributors learning the project

### Examples of unacceptable behavior:

* The use of sexualized language or imagery, and sexual attention or advances of any kind
* Trolling, insulting or derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information without explicit permission
* Dismissing or attacking inclusion-oriented requests
* Other conduct which could reasonably be considered inappropriate in a professional setting
* Sustained disruption of community spaces
* Pattern of inappropriate social contact

## Enforcement Responsibilities

Project maintainers are responsible for clarifying and enforcing our standards of
acceptable behavior and will take appropriate and fair corrective action in
response to any behavior that they deem inappropriate, threatening, offensive,
or harmful.

Project maintainers have the right and responsibility to remove, edit, or reject
comments, commits, code, wiki edits, issues, and other contributions that are
not aligned to this Code of Conduct, and will communicate reasons for moderation
decisions when appropriate.

## Scope

This Code of Conduct applies within all community spaces, and also applies when
an individual is officially representing the community in public spaces.
Examples of representing our community include:

* Using an official project email address
* Posting via an official social media account
* Acting as an appointed representative at an online or offline event
* Participating in project-related forums and chat rooms

## Enforcement

### Reporting

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the project team responsible for enforcement at:

**conduct@cerebrum.health**

All complaints will be reviewed and investigated promptly and fairly.

All community leaders are obligated to respect the privacy and security of the
reporter of any incident.

### What to Include in a Report

* **Contact information** (if you wish to be contacted)
* **Names (real, nicknames, or pseudonyms)** of any individuals involved
* **Description of the incident**, including any available documentation
* **Where and when the incident occurred**
* **Whether the incident is ongoing**
* **Any other information** you believe we should have

### Confidentiality

All reports will be handled with discretion. We will respect confidentiality requests for the purpose of protecting victims of abuse.

## Enforcement Guidelines

Project maintainers will follow these Community Impact Guidelines in determining
the consequences for any action they deem in violation of this Code of Conduct:

### 1. Correction

**Community Impact**: Use of inappropriate language or other behavior deemed
unprofessional or unwelcome in the community.

**Consequence**: A private, written warning from project maintainers, providing
clarity around the nature of the violation and an explanation of why the
behavior was inappropriate. A public apology may be requested.

### 2. Warning

**Community Impact**: A violation through a single incident or series of actions.

**Consequence**: A warning with consequences for continued behavior. No
interaction with the people involved, including unsolicited interaction with
those enforcing the Code of Conduct, for a specified period of time. This
includes avoiding interactions in community spaces as well as external channels
like social media. Violating these terms may lead to a temporary or permanent ban.

### 3. Temporary Ban

**Community Impact**: A serious violation of community standards, including
sustained inappropriate behavior.

**Consequence**: A temporary ban from any sort of interaction or public
communication with the community for a specified period of time. No public or
private interaction with the people involved, including unsolicited interaction
with those enforcing the Code of Conduct, is allowed during this period.
Violating these terms may lead to a permanent ban.

### 4. Permanent Ban

**Community Impact**: Demonstrating a pattern of violation of community
standards, including sustained inappropriate behavior, harassment of an
individual, or aggression toward or disparagement of classes of individuals.

**Consequence**: A permanent ban from any sort of public interaction within the
project community.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage],
version 2.1, available at
[https://www.contributor-covenant.org/version/2/1/code_of_conduct.html](https://www.contributor-covenant.org/version/2/1/code_of_conduct.html)[v2.1].

Community Impact Guidelines were inspired by
[Mozilla's code of conduct enforcement ladder][Mozilla CoC].

For answers to common questions about this code of conduct, see the FAQ at
[https://www.contributor-covenant.org/faq](https://www.contributor-covenant.org/faq)[FAQ]. Translations are available at
[https://www.contributor-covenant.org/translations](https://www.contributor-covenant.org/translations)[translations].

[homepage]: https://www.contributor-covenant.org
[v2.1]: https://www.contributor-covenant.org/version/2/1/code_of_conduct.html
[Mozilla CoC]: https://github.com/mozilla/diversity
[FAQ]: https://www.contributor-covenant.org/faq
[translations]: https://www.contributor-covenant.org/translations

## Contact

For questions about this Code of Conduct, contact:
* Email: conduct@cerebrum.health
* Discord: [Join our server](#)

---

**Last Updated**: October 29, 2025

