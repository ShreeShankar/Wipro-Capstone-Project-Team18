@echo off
set DOCKER_USER=haasif
set DOCKER_PASS=9959075632Aa@

echo Logging into Docker Hub...
echo %DOCKER_PASS% | docker login --username %DOCKER_USER% --password-stdin

if %ERRORLEVEL% NEQ 0 (
    echo Docker login failed.
    exit /b %ERRORLEVEL%
)

echo Pushing images to Docker Hub...
docker-compose push

echo Done!
