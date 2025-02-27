# Check if psql is available
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Write-Error "PostgreSQL (psql) is not installed or not in PATH. Please install PostgreSQL and ensure it's in your PATH."
    exit 1
}

# Load environment variables from .env file
$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
    Write-Error "Environment file (.env) not found. Please copy .env.example to .env and update with your database credentials."
    exit 1
}

$envContent = Get-Content $envPath -ErrorAction SilentlyContinue
if (-not $envContent) {
    Write-Error "Could not read .env file. Please ensure it exists and is readable."
    exit 1
}

foreach ($line in $envContent) {
    if ($line -match '^([^=]+)=(.*)$' -and -not $line.StartsWith('#')) {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value)
    }
}

# Check if required environment variables are set
$requiredVars = @("PGUSER", "PGHOST", "PGPORT", "PGDATABASE")
$missingVars = @()
foreach ($var in $requiredVars) {
    if (-not [Environment]::GetEnvironmentVariable($var)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Error "Missing required environment variables: $($missingVars -join ', '). Please check your .env file."
    exit 1
}

# Use PostgreSQL environment variables
$env:PGUSER = [Environment]::GetEnvironmentVariable("PGUSER")
$env:PGPASSWORD = [Environment]::GetEnvironmentVariable("PGPASSWORD")
$env:PGHOST = [Environment]::GetEnvironmentVariable("PGHOST")
$env:PGPORT = [Environment]::GetEnvironmentVariable("PGPORT")
$dbName = [Environment]::GetEnvironmentVariable("PGDATABASE")

Write-Host "Connecting with:"
Write-Host "User: $env:PGUSER"
Write-Host "Host: $env:PGHOST"
Write-Host "Port: $env:PGPORT"
Write-Host "Database: $dbName"

# Check if PostgreSQL server is running
try {
    $testConnection = psql -d postgres -c "SELECT 1;" -t 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Could not connect to PostgreSQL server. Please ensure PostgreSQL is running."
        exit 1
    }
} catch {
    Write-Error "Error connecting to PostgreSQL: $_"
    exit 1
}

# First, try to create the database if it doesn't exist
Write-Host "Creating database if it doesn't exist..."
try {
    # Check if database exists
    $dbExists = psql -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname = '$dbName';" 2>$null
    if ($dbExists -notmatch "1") {
        # Create database with appropriate locale settings
        # Try different locale formats for compatibility
        $createDbResult = $null
        try {
            $createDbResult = psql -d postgres -c "CREATE DATABASE $dbName WITH ENCODING 'UTF8' LC_COLLATE='en_US.utf8' LC_CTYPE='en_US.utf8';" 2>&1
        } catch {
            # If the first attempt fails, try with C locale which is always available
            try {
                $createDbResult = psql -d postgres -c "CREATE DATABASE $dbName WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C';" 2>&1
            } catch {
                Write-Error "Failed to create database with both locale settings. Error: $_"
                exit 1
            }
        }
    } else {
        Write-Host "Database $dbName already exists."
    }
} catch {
    Write-Error "Error creating database: $_"
    exit 1
}

# Now initialize schema
Write-Host "Initializing database schema..."
$initSqlPath = Join-Path $PSScriptRoot "..\src\config\init.sql"
if (-not (Test-Path $initSqlPath)) {
    Write-Error "SQL initialization file not found at: $initSqlPath"
    exit 1
}

try {
    $schemaResult = psql -d $dbName -f $initSqlPath 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to initialize database schema: $schemaResult"
        exit 1
    }
} catch {
    Write-Error "Error initializing schema: $_"
    exit 1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database setup completed successfully" -ForegroundColor Green
} else {
    Write-Error "Database setup failed with exit code $LASTEXITCODE"
    exit 1
}

# Clear PostgreSQL environment variables
$env:PGPASSWORD = ""
