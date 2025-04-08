# TLA Scanner Setup Helper Script
# This script helps with common setup issues

Write-Host "TLA Scanner Setup Helper" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: This script is not running as Administrator. Some operations may fail." -ForegroundColor Yellow
    Write-Host "Consider restarting this script as Administrator if you encounter permission issues." -ForegroundColor Yellow
    Write-Host ""
}

# Check if PostgreSQL is installed
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Write-Host "ERROR: PostgreSQL is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install PostgreSQL from https://www.postgresql.org/download/windows/" -ForegroundColor Red
    Write-Host "Make sure to check 'Add to PATH' during installation." -ForegroundColor Red
    exit 1
}

Write-Host "PostgreSQL installation found at: $($psql.Source)" -ForegroundColor Green

# Check PostgreSQL service status
$pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
if (-not $pgService) {
    Write-Host "ERROR: PostgreSQL service not found." -ForegroundColor Red
    Write-Host "Please make sure PostgreSQL is properly installed." -ForegroundColor Red
    exit 1
}

if ($pgService.Status -ne "Running") {
    Write-Host "PostgreSQL service is not running. Current status: $($pgService.Status)" -ForegroundColor Yellow
    
    # Try to start the service
    Write-Host "Attempting to start PostgreSQL service..." -ForegroundColor Cyan
    try {
        if ($isAdmin) {
            Start-Service $pgService.Name
            Start-Sleep -Seconds 2
            $pgService = Get-Service -Name $pgService.Name
            if ($pgService.Status -eq "Running") {
                Write-Host "Successfully started PostgreSQL service." -ForegroundColor Green
            } else {
                Write-Host "Failed to start PostgreSQL service. Please start it manually from Services." -ForegroundColor Red
                Write-Host "1. Press Win+R, type 'services.msc' and press Enter" -ForegroundColor Yellow
                Write-Host "2. Find the PostgreSQL service" -ForegroundColor Yellow
                Write-Host "3. Right-click and select 'Start'" -ForegroundColor Yellow
                exit 1
            }
        } else {
            Write-Host "Cannot start service without administrator privileges." -ForegroundColor Red
            Write-Host "Please start the PostgreSQL service manually:" -ForegroundColor Yellow
            Write-Host "1. Press Win+R, type 'services.msc' and press Enter" -ForegroundColor Yellow
            Write-Host "2. Find the PostgreSQL service" -ForegroundColor Yellow
            Write-Host "3. Right-click and select 'Start'" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "Error starting PostgreSQL service: $_" -ForegroundColor Red
        Write-Host "Please start it manually from Services." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "PostgreSQL service is running." -ForegroundColor Green
}

# Check if .env file exists
$envPath = Join-Path $PSScriptRoot "backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "WARNING: .env file not found in the backend directory." -ForegroundColor Yellow
    $exampleEnvPath = Join-Path $PSScriptRoot "backend\.env.example"
    
    if (Test-Path $exampleEnvPath) {
        Write-Host "Creating .env file from .env.example..." -ForegroundColor Cyan
        Copy-Item $exampleEnvPath $envPath
        Write-Host ".env file created. Please edit it with your database credentials." -ForegroundColor Green
    } else {
        Write-Host "ERROR: .env.example file not found. Please create a .env file manually." -ForegroundColor Red
        exit 1
    }
}

# Run the database setup script with proper path
Write-Host ""
Write-Host "Running database setup script..." -ForegroundColor Cyan
$setupScriptPath = Join-Path $PSScriptRoot "backend\scripts\setup-db.ps1"

if (Test-Path $setupScriptPath) {
    try {
        & $setupScriptPath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database setup completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "Database setup failed with exit code $LASTEXITCODE" -ForegroundColor Red
            Write-Host "Please check the error messages above for more details." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Error running setup script: $_" -ForegroundColor Red
    }
} else {
    Write-Host "ERROR: Setup script not found at: $setupScriptPath" -ForegroundColor Red
    exit 1
}
