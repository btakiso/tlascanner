# Check if psql is available
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Write-Error "PostgreSQL (psql) is not installed or not in PATH"
    exit 1
}

# Load environment variables from .env file
$envContent = Get-Content .env
foreach ($line in $envContent) {
    if ($line -match '^([^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value)
    }
}

# Parse DATABASE_URL
$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) {
    Write-Error "DATABASE_URL not found in .env file"
    exit 1
}

# Extract database connection details
if ($dbUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
} else {
    Write-Error "Invalid DATABASE_URL format"
    exit 1
}

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPassword

# First, try to create the database if it doesn't exist
Write-Host "Creating database if it doesn't exist..."
psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c "CREATE DATABASE $dbName WITH ENCODING 'UTF8' LC_COLLATE='en_US.utf8' LC_CTYPE='en_US.utf8';" 2>$null

# Now initialize schema
Write-Host "Initializing database schema..."
psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "src/config/init.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database setup completed successfully"
} else {
    Write-Error "Database setup failed"
    exit 1
}

# Clear PGPASSWORD
$env:PGPASSWORD = ""
