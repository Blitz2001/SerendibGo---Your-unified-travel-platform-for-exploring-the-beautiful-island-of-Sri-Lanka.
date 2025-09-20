# Database Sharing Guide for SerendibGo

## 🌐 Method 1: MongoDB Atlas Access (RECOMMENDED)

### For the Database Owner (You):

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Navigate to your project** → **Database Access**
3. **Add New Database User**:
   - Username: `collaborator` (or their name)
   - Password: Generate secure password
   - Database User Privileges: `Read and write to any database`
4. **Network Access** → **Add IP Address**:
   - Add their IP or use `0.0.0.0/0` (allows from anywhere)
5. **Share the connection string**:
   ```
   mongodb+srv://collaborator:PASSWORD@cluster0.td0vk1q.mongodb.net/serendibgo?retryWrites=true&w=majority&appName=Cluster0
   ```

### For the Collaborator:

1. **Update `server/config.env`** with the new connection string
2. **Run the application**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

## 🔄 Method 2: Project Invitation

### Invite to Atlas Project:
1. **MongoDB Atlas** → **Project Settings**
2. **Invite Users** → Add their email
3. **Role**: `Project Data Access Admin` or `Project Owner`
4. They'll get email invitation to join your project

## 📦 Method 3: Database Export/Import

### Export Database (if you have MongoDB tools installed):
```bash
# Install MongoDB tools first
# Windows: Download from https://www.mongodb.com/try/download/database-tools

# Export
mongodump --uri="YOUR_CONNECTION_STRING" --out=./database_backup

# Share the backup folder
```

### Import Database (for collaborator):
```bash
# Import
mongorestore --uri="THEIR_CONNECTION_STRING" ./database_backup
```

## 🚀 Method 4: Complete Project Setup

### Share the entire project:

1. **Create a shared repository** (GitHub, GitLab, etc.)
2. **Include these files**:
   - All source code
   - `server/config.shared.env` (with placeholder credentials)
   - `DATABASE_SHARING_GUIDE.md` (this file)
   - `package.json` files
   - `README.md` with setup instructions

3. **Setup instructions for collaborator**:
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd serendibgo
   
   # Install dependencies
   npm run install-all
   
   # Setup database
   # 1. Create MongoDB Atlas account
   # 2. Create new cluster
   # 3. Update server/config.env with their connection string
   
   # Run the application
   npm run dev
   ```

## 🔐 Security Considerations

### Important Security Notes:
- **Never commit real credentials** to version control
- **Use environment variables** for sensitive data
- **Create separate database users** for collaborators
- **Limit IP access** when possible
- **Use strong passwords** for database users

### Environment File Structure:
```
server/
├── config.env          # Your personal config (DON'T SHARE)
├── config.shared.env   # Template for collaborators
└── .env.example        # Example file (safe to share)
```

## 📞 Support

If you need help with any of these methods, contact:
- **MongoDB Atlas Support**: https://support.mongodb.com/
- **Project Documentation**: Check the README.md file

## 🎯 Quick Start for Collaborator

1. **Get access** to the database (Method 1 or 2)
2. **Clone the project** from shared repository
3. **Install dependencies**: `npm run install-all`
4. **Update database connection** in `server/config.env`
5. **Run the application**: `npm run dev`
6. **Access**: http://localhost:3000

---

**Note**: The database contains sample data including users, tours, guides, hotels, and vehicles. All data is ready for development and testing.
