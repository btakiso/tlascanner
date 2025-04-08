# Script to run database migrations

# Navigate to the backend directory
Set-Location -Path "$PSScriptRoot\..\backend"

# Compile TypeScript files if needed
Write-Host "Compiling TypeScript files..."
npm run build

# Run the migrations script
Write-Host "Running database migrations..."
node dist/config/run-migrations.js

Write-Host "Database migrations completed."
