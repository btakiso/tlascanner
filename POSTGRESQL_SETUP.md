# PostgreSQL Setup Guide for TLA Scanner

This guide will help you set up and start PostgreSQL for the TLA Scanner application.

## Starting PostgreSQL Service

### Method 1: Using Services App

1. Press `Win + R` to open the Run dialog
2. Type `services.msc` and press Enter
3. Find the PostgreSQL service (usually named "postgresql-x64-xx" where xx is the version number)
4. Right-click on the service and select "Start"
5. Wait for the service to start

### Method 2: Using Command Line (Admin PowerShell)

1. Right-click on the Start menu and select "Windows PowerShell (Admin)"
2. Run the following command to find the PostgreSQL service:

   ```powershell
   Get-Service -Name postgresql*
   ```

3. Start the service:

   ```powershell
   Start-Service postgresql*
   ```

### Method 3: Using PostgreSQL Tools

1. Open the Start menu and search for "pgAdmin"
2. Launch pgAdmin
3. If prompted about starting the PostgreSQL service, click "Yes"

## Setting Up PostgreSQL for First Use

If this is your first time using PostgreSQL:

1. The default username is usually `postgres`
2. You may need to set a password if you haven't already:
   - Open Command Prompt as Administrator
   - Run: `psql -U postgres`
   - If prompted for a password and you don't know it, you may need to reset it:
     - Exit psql (type `\q` and press Enter)
     - Run: `psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'your_new_password';"`
     - Update the password in your `.env` file

## Verifying PostgreSQL is Running

To verify PostgreSQL is running:

```powershell
# Check service status
Get-Service -Name postgresql*

# Test connection
psql -U postgres -c "SELECT version();"
```

## Running the TLA Scanner Setup

Once PostgreSQL is running:

1. Navigate to the TLA Scanner root directory in PowerShell
2. Run the helper script:

   ```powershell
   .\setup-helper.ps1
   ```

This script will:

- Check if PostgreSQL is installed and running
- Start PostgreSQL if it's not running (requires admin privileges)
- Create a `.env` file if it doesn't exist
- Run the database setup script with the correct path

## Troubleshooting

### "psql is not recognized as an internal or external command"

PostgreSQL binaries are not in your PATH. You can:

1. Add PostgreSQL bin directory to your PATH:
   - Typical location: `C:\Program Files\PostgreSQL\XX\bin` (where XX is the version)
   - Or run commands with full path: `"C:\Program Files\PostgreSQL\XX\bin\psql"`

### Cannot Connect to Server

If you see errors like "could not connect to server":

1. Make sure the PostgreSQL service is running
2. Check if PostgreSQL is listening on the default port (5432):

   ```powershell
   netstat -an | findstr 5432
   ```

3. Check if any firewall is blocking the connection

### Permission Denied

If you see "permission denied" errors:

1. Make sure you're using the correct username and password
2. Check the PostgreSQL log files for more details:
   - Typically located at: `C:\Program Files\PostgreSQL\XX\data\log`
