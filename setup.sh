#!/bin/bash

echo "🏝️  Welcome to SerendibGo - Unified Travel Platform Setup"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p server/routes server/controllers server/models server/middleware server/utils
mkdir -p client/src/components client/src/pages client/src/contexts client/src/hooks client/src/utils
mkdir -p docs diagrams

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Copy environment file
if [ ! -f .env ]; then
    echo "🔧 Setting up environment configuration..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your actual API keys and configuration"
else
    echo "✅ Environment file already exists"
fi

# Create .gitignore
echo "📝 Creating .gitignore file..."
cat > .gitignore << EOL
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
build/
dist/
*/build/
*/dist/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Database
*.db
*.sqlite

# Uploads
uploads/
public/uploads/
EOL

# Create initial documentation
echo "📚 Creating initial documentation..."
cat > docs/PROJECT_SETUP.md << EOL
# SerendibGo Project Setup Guide

## Initial Setup Complete! 🎉

Your SerendibGo project has been initialized with the following structure:

### Project Structure
\`\`\`
serendibgo/
├── client/                 # React.js Frontend
├── server/                 # Node.js + Express Backend
├── docs/                   # Project Documentation
├── diagrams/               # UML, DFD, System Diagrams
├── package.json           # Root package.json
├── README.md              # Project overview
└── .env                   # Environment configuration
\`\`\`

## Next Steps

### 1. Configure Environment Variables
Edit the \`.env\` file with your actual API keys:
- PayHere API credentials
- Google Maps API key
- SendGrid API key
- Backblaze B2 credentials
- OpenAI API key (for chatbot)

### 2. Set Up Database
- Install MongoDB locally or use MongoDB Atlas
- Install Redis for caching
- Update MONGODB_URI and REDIS_URL in .env

### 3. Start Development
\`\`\`bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run server    # Backend only
npm run client    # Frontend only
\`\`\`

### 4. Access Your Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/health

## Development Workflow

1. **Frontend Development**: Work in \`client/src/\`
2. **Backend Development**: Work in \`server/\`
3. **Database Models**: Define in \`server/models/\`
4. **API Routes**: Create in \`server/routes/\`
5. **Components**: Build in \`client/src/components/\`

## Available Scripts

- \`npm run dev\`: Start both frontend and backend
- \`npm run server\`: Start backend only
- \`npm run client\`: Start frontend only
- \`npm run build\`: Build frontend for production
- \`npm run install-all\`: Install all dependencies

## Team Collaboration

- Use Git for version control
- Create feature branches for new development
- Follow the Agile methodology outlined in the project plan
- Regular stand-ups and sprint reviews

Happy coding! 🚀
EOL

echo ""
echo "🎉 SerendibGo project setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Install MongoDB and Redis"
echo "3. Run 'npm run dev' to start development"
echo ""
echo "📚 Check docs/PROJECT_SETUP.md for detailed instructions"
echo ""
echo "🏝️  Welcome to SerendibGo - Connecting Sri Lanka's Tourism Ecosystem!"
