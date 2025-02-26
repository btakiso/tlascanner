# Check if psql is available
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Write-Error "PostgreSQL (psql) is not installed or not in PATH"
    exit 1
}

# Load environment variables from .env file
$envPath = Join-Path $PSScriptRoot "..\.env"
$envContent = Get-Content $envPath
foreach ($line in $envContent) {
    if ($line -match '^([^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value)
    }
}

# Use PostgreSQL environment variables directly
$env:PGUSER = $env:PGUSER
$env:PGPASSWORD = $env:PGPASSWORD
$env:PGHOST = $env:PGHOST
$env:PGPORT = $env:PGPORT
$dbName = $env:PGDATABASE

Write-Host "Connecting with:"
Write-Host "User: $env:PGUSER"
Write-Host "Host: $env:PGHOST"
Write-Host "Port: $env:PGPORT"
Write-Host "Database: $dbName"

# First, try to create the database if it doesn't exist
Write-Host "Creating database if it doesn't exist..."
psql -d postgres -c "CREATE DATABASE $dbName WITH ENCODING 'UTF8' LC_COLLATE='en_US.utf8' LC_CTYPE='en_US.utf8';" 2>$null

# Now initialize schema
Write-Host "Initializing database schema..."
$initSqlPath = Join-Path $PSScriptRoot "..\src\config\init.sql"
psql -d $dbName -f $initSqlPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database setup completed successfully"
} else {
    Write-Error "Database setup failed"
    exit 1
}

# Clear PostgreSQL environment variables
$env:PGPASSWORD = ""
