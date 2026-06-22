# Deployment Instructions

## Prerequisites
- Node.js installed.
- MongoDB database set up.
- Environment variables configured.

## Steps
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Set Up Database**:
   - Run the database setup script:
     ```bash
     node scripts/setupDatabase.js
     ```
3. **Start Development Server**:
   ```bash
   npm run dev
   ```
4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

This document provides instructions for deploying the application.