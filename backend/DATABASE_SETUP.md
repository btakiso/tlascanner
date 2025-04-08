# Database Setup Guide for TLA Scanner

This guide will help you set up the PostgreSQL database required for the TLA Scanner application.

## Prerequisites

1. **PostgreSQL Installation**
   - Install PostgreSQL 12 or higher
   - Make sure the `psql` command is available in your PATH
   - PostgreSQL service should be running

2. **Environment Configuration**
   - Copy `.env.example` to `.env` in the backend directory
   - Update the database credentials in the `.env` file:

   ```P
     PGUSER=postgres
     PGPASSWORD=your_password
     PGHOST=localhost
     PGPORT=5432
     PGDATABASE=tlascanner
     DATABASE_URL=postgresql://postgres:your_password@localhost:5432/tlascanner
     ```

## Setup Process

### Automatic Setup

Run the setup script from the backend directory:

```powershell
# From the backend directory
./scripts/setup-db.ps1
```

### Manual Setup

If the automatic setup fails, you can set up the database manually:

1. **Create the database**:

   ```sql
   CREATE DATABASE tlascanner WITH ENCODING 'UTF8';
   ```

2. **Install required extensions**:

   ```sql
   \c tlascanner
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

3. **Initialize the schema**:

   ```P
   psql -d tlascanner -f src/config/init.sql
   ```

## Common Issues and Solutions

### Locale Issues

If you encounter locale-related errors (e.g., `invalid locale name`), try creating the database with the C locale:

```sql
CREATE DATABASE tlascanner WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C';
```

### Connection Issues

1. **PostgreSQL not running**:
   - Windows: Check Services app to ensure PostgreSQL service is running
   - Start the service if it's not running

2. **Authentication failed**:
   - Verify your PostgreSQL username and password in the `.env` file
   - Check PostgreSQL's `pg_hba.conf` file to ensure local connections are allowed

3. **Port conflicts**:
   - Ensure no other service is using port 5432
   - If needed, change the port in both PostgreSQL config and your `.env` file

### Permission Issues

If you encounter permission issues:

1. Ensure your PostgreSQL user has the necessary privileges:

   ```sql
   ALTER USER postgres WITH SUPERUSER;
   ```

2. If using a different user, grant the necessary permissions:

   ```sql
   CREATE USER your_username WITH PASSWORD 'your_password';
   ALTER USER your_username WITH SUPERUSER;
   ```

## Verifying Setup

To verify your database setup:

```sql
psql -d tlascanner -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```

This should list all the tables created by the setup script.

## Need Help?

If you continue to experience issues with the database setup, please:

1. Check the error message carefully
2. Ensure PostgreSQL is properly installed and running
3. Verify your credentials in the `.env` file
4. Contact the project maintainer with the specific error message
