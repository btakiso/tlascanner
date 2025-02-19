# TLAScanner Backend Setup

## Prerequisites

- Node.js (v20.x LTS recommended)
- PostgreSQL (latest version)
- npm or yarn

## Getting Started

1. **Install PostgreSQL**
   - Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
   - Make sure `psql` command is available in your terminal

2. **Environment Setup**

   ```bash
   # Copy the environment template
   cp .env.example .env
   
   # Edit .env file with your database credentials
   # Make sure DATABASE_URL is properly configured
   ```

3. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

4. **Database Setup**

   ```powershell
   # Run the database setup script
   ./scripts/setup-db.ps1
   
   # Initialize the database schema
   npm run db:setup
   ```

5. **Start the Development Server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

The server will start on `http://localhost:3000` by default.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project
- `npm start` - Start production server
- `npm run db:setup` - Set up database tables
- `npm run db:migrate` - Run database migrations
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run format` - Format code with prettier

## Troubleshooting

1. If you get database connection errors:
   - Check if PostgreSQL service is running
   - Verify your database credentials in `.env`
   - Make sure the database exists

2. If setup-db.ps1 fails:
   - Make sure PostgreSQL is installed and in your PATH
   - Check if you have proper permissions to create databases
   - Verify your PostgreSQL installation
