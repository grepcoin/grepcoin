# Contributing to GrepCoin

Thank you for your interest in contributing to GrepCoin! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Be respectful and considerate in all interactions
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

Unacceptable behavior includes harassment, trolling, or any form of discrimination.

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. Check the [existing issues](https://github.com/grepcoin/grepcoin/issues) to avoid duplicates
2. Ensure you're using the latest version
3. Collect relevant information (browser, OS, error messages, steps to reproduce)

When submitting a bug report, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots or error messages if applicable
- Your environment (browser, OS, Node version)

### Suggesting Features

We welcome feature suggestions! Please:

1. Check existing issues and discussions first
2. Clearly describe the problem the feature would solve
3. Explain your proposed solution
4. Consider the impact on existing users

### Pull Requests

#### Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

#### Development Setup

```bash
# Website (Next.js)
cd website
pnpm install
cp .env.example .env
# Configure your .env file
pnpm dev

# Smart Contracts (Hardhat)
cd contracts-dev
npm install
npx hardhat test
```

#### Making Changes

1. Write clear, readable code
2. Follow the existing code style
3. Add tests for new functionality
4. Update documentation as needed
5. Keep commits atomic and well-described

#### Code Style

**TypeScript/JavaScript:**
- Use TypeScript for all new code
- Use functional components with hooks
- Prefer named exports
- Use meaningful variable names
- Add JSDoc comments for complex functions

**Solidity:**
- Follow Solidity style guide
- Use NatSpec comments for all public functions
- Write comprehensive tests
- Consider gas optimization

#### Testing

**Website:**
```bash
pnpm lint       # Run linter
pnpm build      # Build to check for errors
```

**Smart Contracts:**
```bash
npx hardhat test              # Run all tests
npx hardhat coverage          # Check coverage (if configured)
```

#### Submitting

1. **Push** your branch to your fork
2. **Open a Pull Request** against `main`
3. Fill out the PR template completely
4. Link any related issues
5. Wait for review

### PR Requirements

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New code has test coverage
- [ ] Documentation updated if needed
- [ ] No console.log or debug code
- [ ] Commits are clean and well-described

## Development Guidelines

### Website Development

**File Structure:**
- Pages go in `src/app/`
- Reusable components in `src/components/`
- Hooks in `src/hooks/`
- Utilities in `src/lib/`
- API routes in `src/app/api/`

**State Management:**
- Use React Context for global state (Auth, Staking)
- Use React Query for server state
- Keep component state local when possible

**Styling:**
- Use Tailwind CSS classes
- Follow existing color scheme (grep-purple, grep-pink, etc.)
- Ensure responsive design
- Test on mobile viewports

### Smart Contract Development

**Security First:**
- Always consider attack vectors
- Use OpenZeppelin contracts when possible
- Follow checks-effects-interactions pattern
- Be mindful of reentrancy

**Testing:**
- Write tests for all functions
- Test edge cases and failure modes
- Test with realistic values
- Consider gas costs

**Documentation:**
- Use NatSpec for all public/external functions
- Document state variables
- Explain complex logic

## Game Development

Adding a new game:

1. Create page in `src/app/games/[game-name]/page.tsx`
2. Add game to `src/app/games/page.tsx` game list
3. Add game to database seed (`prisma/seed.ts`)
4. Implement scoring and GREP reward logic
5. Test thoroughly on multiple devices

Game requirements:
- Mobile-friendly controls
- Clear instructions
- Score submission via API
- Integration with staking multipliers

## Getting Help

- **Discord:** Join our Discord for real-time help
- **Issues:** Open an issue for bugs or features
- **Discussions:** Use GitHub Discussions for questions

## Recognition

Contributors are recognized in:
- The project README
- Release notes for significant contributions
- Our Discord community

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to GrepCoin!
