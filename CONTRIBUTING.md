# Contributing to GrepCoin

Thank you for your interest in contributing to GrepCoin! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@greplabs.io.

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
# Clone the repository
git clone https://github.com/grepcoin/grepcoin.git
cd grepcoin

# Install all dependencies (from root)
npm install

# Web App (Next.js)
cd apps/web
cp .env.example .env
# Configure your .env file with database URL, API keys, etc.
npm run db:push    # Set up database schema
npm run db:seed    # Seed initial data
npm run dev        # Start dev server

# Smart Contracts (Hardhat)
cd packages/contracts
npm install
npm test           # Run 47 tests

# AI Agents (Optional)
cd packages/agents
npm install
npm run agent:community -- --interactive

# Discord Bot (Optional)
cd apps/discord-bot
cp .env.example .env
# Add your Discord bot token
npm run dev
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

**Web App:**
```bash
cd apps/web
npm run lint       # Run ESLint
npm run build      # Build to check for errors
npm run test       # Run tests (if configured)
```

**Smart Contracts:**
```bash
cd packages/contracts
npm test                    # Run all 47 tests
npm run coverage            # Check test coverage
npm run lint                # Run Solidity linter
```

**Agents:**
```bash
cd packages/agents
npm test                    # Run agent tests
npm run lint                # Run linter
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

### Project Structure

GrepCoin uses a monorepo architecture with the following structure:

```
grepcoin/
├── apps/
│   ├── web/                 # Next.js 15 web application
│   └── discord-bot/         # Discord community bot
├── packages/
│   ├── contracts/           # Solidity smart contracts
│   ├── agents/              # AI agent system
│   ├── anti-cheat/          # Game anti-cheat system
│   └── subgraph/            # The Graph indexer
└── docs/                    # Documentation
```

### Web App Development

**File Structure:**
- Pages go in `apps/web/src/app/`
- Reusable components in `apps/web/src/components/`
- Hooks in `apps/web/src/hooks/`
- Utilities in `apps/web/src/lib/`
- API routes in `apps/web/src/app/api/`
- Database schema in `apps/web/prisma/schema.prisma`

**State Management:**
- Use React Context for global state (Auth, Staking)
- Use custom hooks for Web3 integration (wagmi v3)
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

1. Create page in `apps/web/src/app/games/[game-name]/page.tsx`
2. Add game to `apps/web/src/app/games/page.tsx` game list
3. Add game to database seed (`apps/web/prisma/seed.ts`)
4. Create API endpoint in `apps/web/src/app/api/games/[game-name]/score/route.ts`
5. Implement anti-cheat validation (see `packages/anti-cheat`)
6. Implement scoring and GREP reward logic
7. Test thoroughly on multiple devices

Game requirements:
- Mobile-friendly controls
- Clear instructions
- Score submission via API
- Integration with staking multipliers
- Anti-cheat validation
- Proper error handling

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
