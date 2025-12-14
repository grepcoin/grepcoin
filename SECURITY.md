# Security Policy

## Reporting a Vulnerability

The security of GrepCoin is a top priority. If you discover a security vulnerability, please follow the responsible disclosure process below.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email us at:

**security@greplabs.io**

Include the following information:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** (what an attacker could achieve)
4. **Affected component** (website, smart contracts, API, etc.)
5. **Any proof-of-concept** code or screenshots
6. **Your contact information** for follow-up

### What to Expect

- **Acknowledgment:** We will acknowledge your report within 48 hours
- **Assessment:** We will assess the vulnerability and determine its severity
- **Updates:** We will keep you informed of our progress
- **Resolution:** We aim to resolve critical issues within 7 days
- **Credit:** With your permission, we will credit you for the discovery

### Scope

The following are in scope for security reports:

**Smart Contracts:**
- GrepToken.sol
- GrepStakingPool.sol
- Any deployed contracts on Base Sepolia or Base Mainnet

**Website (grepcoin.io):**
- Authentication bypass
- Unauthorized access to user data
- Cross-site scripting (XSS)
- SQL injection
- Server-side request forgery (SSRF)
- Remote code execution

**API Endpoints:**
- Authentication/authorization issues
- Data exposure
- Rate limiting bypass
- Input validation failures

### Out of Scope

The following are NOT in scope:

- Social engineering attacks
- Physical attacks
- Denial of service (DoS) attacks
- Issues in third-party dependencies (report to the maintainers)
- Issues requiring physical access to a user's device
- Issues in environments other than production
- Clickjacking on pages with no sensitive actions
- Missing security headers that don't lead to direct exploitation
- Rate limiting on non-sensitive endpoints

## Security Best Practices for Users

### Wallet Security

- **Never share your private keys or seed phrases**
- Use a hardware wallet for significant holdings
- Verify contract addresses before transactions
- Be cautious of phishing sites impersonating GrepCoin

### Safe Usage

- Always access GrepCoin via **grepcoin.io**
- Check the URL before connecting your wallet
- Review transaction details before signing
- Start with small amounts when testing

### Recognizing Scams

GrepCoin team will **NEVER**:
- Ask for your private keys or seed phrase
- Send unsolicited DMs asking for funds
- Promise guaranteed returns
- Pressure you to make quick decisions

## Smart Contract Security

### Audits

Our smart contracts undergo security review. Audit reports will be published when available.

### Known Risks

- **Smart Contract Risk:** Contracts may contain undiscovered vulnerabilities
- **Lock Period Risk:** Staked tokens are locked for specified periods
- **Market Risk:** Token value may fluctuate significantly

For a complete list of risks, see our [Risk Disclaimer](https://grepcoin.io/disclaimer).

## Bug Bounty Program

We may offer rewards for qualifying vulnerability reports. Current program details:

| Severity | Reward Range |
|----------|--------------|
| Critical | Up to $5,000 |
| High | Up to $2,000 |
| Medium | Up to $500 |
| Low | Up to $100 |

**Critical:** Direct loss of user funds, complete authentication bypass
**High:** Significant data exposure, major business logic flaws
**Medium:** Limited data exposure, minor authentication issues
**Low:** Best practice violations, minor information disclosure

Rewards are at our discretion and depend on:
- Quality of the report
- Potential impact
- Complexity of exploitation
- Whether the issue was previously known

## Responsible Disclosure Guidelines

To qualify for potential rewards:

1. **Don't access user data** beyond what's necessary to demonstrate the vulnerability
2. **Don't modify or delete data**
3. **Don't degrade service** or perform destructive testing
4. **Don't publicly disclose** before we've had a chance to fix the issue
5. **Act in good faith** to avoid privacy violations

## Security Updates

Security updates will be announced via:
- GitHub Security Advisories
- Our Discord #announcements channel
- Email to registered users (for critical issues)

## Contact

**Security Issues:** security@greplabs.io

**General Inquiries:** hello@greplabs.io

---

Thank you for helping keep GrepCoin secure!

*GrepLabs LLC - Delaware, USA*
