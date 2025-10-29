# Security Policy

## Overview

Cerebrum takes security seriously. This document outlines our security practices, how to report vulnerabilities, and what you can expect from us.

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**⚠️ Please do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability within Cerebrum, please follow these steps:

### 1. Contact Us Privately

Send a detailed report to: **security@cerebrum.health**

### 2. Include the Following Information

- **Type of vulnerability** (e.g., buffer overflow, SQL injection, XSS)
- **Full paths** of source file(s) related to the vulnerability
- **Location of the affected code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the vulnerability** (what an attacker could do)
- **Suggested fix** (if you have one)

### 3. Encryption (Optional)

For sensitive reports, you can use our PGP key:

-----BEGIN PGP PUBLIC KEY BLOCK-----
[PGP Key will be provided here]
-----END PGP PUBLIC KEY BLOCK-----


## What to Expect

### Our Response Timeline

- **Within 24 hours**: Initial acknowledgment of your report
- **Within 72 hours**: Detailed response with our assessment
- **Within 7 days**: Status update on fix progress
- **Within 30 days**: Public disclosure (if applicable)

### Our Process

1. **Acknowledge** - We'll confirm receipt of your report
2. **Investigate** - Our team will investigate the vulnerability
3. **Develop Fix** - We'll develop and test a fix
4. **Deploy** - We'll deploy the fix to production
5. **Disclose** - We'll coordinate public disclosure with you

## Disclosure Policy

### Coordinated Disclosure

We believe in coordinated disclosure and will work with you to:

- Understand the full scope of the vulnerability
- Develop and test an appropriate fix
- Determine an appropriate disclosure timeline
- Credit you appropriately (if desired)

### Public Disclosure

After a fix is deployed, we will:

- Publish a security advisory on GitHub
- Update CHANGELOG.md with security notice
- Credit the reporter (if permitted)
- Notify affected users

## Security Best Practices

### For Users

1. **Keep Software Updated**
   - Always use the latest version
   - Subscribe to security advisories
   - Monitor GitHub releases

2. **Protect Private Keys**
   - Never share your private keys
   - Use hardware wallets for production
   - Enable 2FA on all accounts

3. **Verify Smart Contracts**
   - Check contract addresses match official ones
   - Verify on Etherscan before interacting
   - Be cautious of phishing attempts

4. **Monitor Transactions**
   - Review all transactions before signing
   - Check gas prices and limits
   - Verify recipient addresses

### For Developers

1. **Code Review**
   - All code must be reviewed
   - Security-sensitive code needs extra scrutiny
   - Use automated security scanning tools

2. **Dependency Management**
   - Keep dependencies updated
   - Audit new dependencies
   - Use `npm audit` regularly

3. **Testing**
   - Write comprehensive tests
   - Include security test cases
   - Perform fuzzing tests on contracts

4. **Access Control**
   - Implement proper authentication
   - Use role-based access control
   - Validate all inputs

## Known Security Considerations

### Smart Contract Security

**FHE Encryption**: Data is encrypted using Zama's fhEVM, providing computational privacy. However:
- Decryption requests are visible on-chain
- Access control is critical for maintaining privacy
- Gateway callbacks must verify signatures

**Access Control**: The system uses role-based access:
- Patients control their own data
- Researchers must purchase access
- Gateway has special callback permissions

**Reentrancy**: All state-changing functions use proper checks-effects-interactions patterns to prevent reentrancy attacks.

### Frontend Security

**Wallet Security**: 
- Never store private keys in frontend
- Always validate user inputs
- Sanitize data before display

**API Security**:
- Validate all smart contract responses
- Check transaction status before proceeding
- Handle errors gracefully

## Security Audits

### Audit Status

| Component | Auditor | Date | Status | Report |
|-----------|---------|------|--------|--------|
| Smart Contracts | TBD | TBD | Pending | TBD |
| Frontend | TBD | TBD | Pending | TBD |

### Request an Audit

We welcome security audits from the community. If you're interested in auditing our code:

1. Contact us at security@cerebrum.health
2. Review our codebase on GitHub
3. Follow responsible disclosure guidelines
4. Submit your findings privately

### Out of Scope

- Issues in third-party dependencies (unless we can fix)
- Social engineering attacks
- Physical attacks
- Denial of Service attacks
- Issues requiring unlikely user interaction

## Contact

For security-related questions or concerns:

- **Email**: security@cerebrum.health
- **PGP Key**: [Link to PGP key]

---

## Security Hall of Fame

We'd like to thank the following individuals for responsibly disclosing security vulnerabilities:

*(List will be populated as vulnerabilities are discovered and fixed)*

---

**Last Updated**: October 29, 2025

*This security policy is subject to change. Please check back regularly for updates.*
