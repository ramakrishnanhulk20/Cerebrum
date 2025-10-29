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

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [support@cerebrum.health](mailto:support@cerebrum.health).

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
   ```bash
   git clone https://github.com/YOUR_USERNAME/cerebrum-fhe-health-records.git
   cd cerebrum-fhe-health-records
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/cerebrum-fhe-health-records.git
   ```

4. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

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

```markdown
**Bug Description:**
Decryption callback fails when requesting health record decryption for record index > 0

**Steps to Reproduce:**
1. Connect wallet to Researcher Portal
2. Purchase access for patient 0x123...
3. Select "Record #2" from dropdown
4. Click "Decrypt" button
5. Wait 60 seconds

**Expected Behavior:**
Decrypted data should display after 30-60 seconds

**Actual Behavior:**
Returns all zeros even after 2 minutes

**Environment:**
- OS: macOS 14.2
- Browser: Chrome 120.0
- Network: Sepolia
- Contract: 0x5B9d...
```

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

## Development Setup

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

### Smart Contract Setup

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

### Environment Configuration

Create `.env` files:

**Frontend `.env`:**
```bash
VITE_CONTRACT_ADDRESS=0x5B9dCB5CaB452ffe2000F95ee29558c81682aE2a
VITE_CHAIN_ID=11155111
VITE_GATEWAY_URL=https://gateway.zama.ai
```

**Contracts `.env`:**
```bash
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=your_api_key
```

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test your changes**:
   ```bash
   # Frontend tests
   cd frontend
   npm test
   npm run build
   
   # Contract tests
   cd contracts
   npx hardhat test
   npx hardhat coverage
   ```

3. **Lint your code**:
   ```bash
   npm run lint
   npm run format
   ```

4. **Update documentation** if needed

### Submitting a Pull Request

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub

3. **Fill out the PR template**:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to break)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots demonstrating the change

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my own code
- [ ] Commented complex code sections
- [ ] Updated documentation
- [ ] No new warnings generated
- [ ] Added tests covering changes
- [ ] All tests pass locally
```

### PR Review Process

- **2 approvals required** from maintainers
- **CI/CD must pass** (automated tests, linting)
- **No merge conflicts** with main branch
- **Documentation updated** if needed

### After Approval

Maintainers will merge your PR. You can then:

```bash
git checkout main
git pull upstream main
git push origin main
```

## Coding Standards

### TypeScript/React

```typescript
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
```

**Style Guidelines:**
- Use TypeScript for all new code
- Follow Airbnb React/TypeScript style guide
- Use functional components with hooks
- Prefer `const` over `let`
- Use meaningful variable and function names
- Keep functions small and focused
- Extract reusable logic into custom hooks

### Solidity

```solidity
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
```

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

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(researcher): add auto-refresh for decrypted records

- Implement polling every 5 seconds after decrypt request
- Stop auto-refresh after 2 minutes
- Add manual refresh button

Closes #123
```

```bash
fix(callback): correct data extraction from array indices

Previously using property names to extract decrypted data,
now correctly using array indices [0], [1], [2] to match
the tuple return format from the mapping.

Fixes #456
```

## Testing

### Frontend Testing

```bash
cd frontend
npm test                 # Run all tests
npm test -- --coverage   # With coverage report
npm test -- --watch      # Watch mode
```

```typescript
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
```

### Contract Testing

```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

```typescript
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
```

## Documentation

### Code Documentation
- Add JSDoc comments for all exported functions
- Explain complex logic with inline comments
- Document API endpoints and parameters
- Keep README.md updated with new features

### Documentation Files
Update relevant docs when making changes:

- `README.md` - Main project documentation
- `docs/ARCHITECTURE.md` - System architecture
- `docs/API.md` - API documentation
- `CHANGELOG.md` - Version history

## Community

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat and support
- **Twitter** - Project updates and announcements

### Getting Help
1. Check existing issues and discussions
2. Read the documentation thoroughly
3. Ask in Discord for quick help
4. Create a detailed GitHub issue for bugs

### Recognition
Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Featured on project website (if applicable)

## License

By contributing to Cerebrum, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to reach out:

- **Email**: [support@cerebrum.health](mailto:support@cerebrum.health)
- **Discord**: Join our server
- **Twitter**: @CerebrumHealth

Thank you for contributing to Cerebrum! 🚀
