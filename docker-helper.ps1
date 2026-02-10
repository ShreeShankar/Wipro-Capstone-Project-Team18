function Show-Menu {
    Clear-Host
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "      Insurance Policy Docker Helper      " -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "1. Start all services (Detached)"
    Write-Host "2. Stop all services"
    Write-Host "3. Build and Start (Rebuild images)"
    Write-Host "4. View Backend Logs"
    Write-Host "5. View Frontend Logs"
    Write-Host "6. View Database Logs"
    Write-Host "7. Push to Docker Hub"
    Write-Host "8. Remove all containers and volumes"
    Write-Host "9. Exit"
    Write-Host "==========================================" -ForegroundColor Cyan
}

while ($true) {
    Show-Menu
    $choice = Read-Host "Enter choice (1-9)"

    switch ($choice) {
        "1" { docker-compose up -d }
        "2" { docker-compose down }
        "3" { docker-compose up -d --build }
        "4" { docker-compose logs -f backend }
        "5" { docker-compose logs -f frontend }
        "6" { docker-compose logs -f db }
        "7" { .\push_to_docker.bat }
        "8" { docker-compose down -v --rmi all }
        "9" { exit }
        default { Write-Host "Invalid choice, please try again." -ForegroundColor Red; Start-Sleep -Seconds 2 }
    }
    if ($choice -ne "9") {
        Read-Host "Press Enter to continue..."
    }
}
