@echo off
:menu
cls
echo ==========================================
echo       Insurance Policy Docker Helper
echo ==========================================
echo 1. Start all services (Detached)
echo 2. Stop all services
echo 3. Build and Start (Rebuild images)
echo 4. View Backend Logs
echo 5. View Frontend Logs
echo 6. View Database Logs
echo 7. Push to Docker Hub
echo 8. Remove all containers and volumes
echo 9. Exit
echo ==========================================
set /p choice="Enter choice (1-9): "

if "%choice%"=="1" docker-compose up -d
if "%choice%"=="2" docker-compose down
if "%choice%"=="3" docker-compose up -d --build
if "%choice%"=="4" docker-compose logs -f backend
if "%choice%"=="5" docker-compose logs -f frontend
if "%choice%"=="6" docker-compose logs -f db
if "%choice%"=="7" call push_to_docker.bat
if "%choice%"=="8" docker-compose down -v --rmi all
if "%choice%"=="9" exit

pause
goto menu
