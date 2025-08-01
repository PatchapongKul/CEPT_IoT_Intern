@echo off
echo Starting PMU Synchronization Dashboard...
echo ==========================================

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js version 14 or higher.
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo Checking required ports...
netstat -an | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo Port 3000 is already in use. Please free the port and try again.
    pause
    exit /b 1
)

netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo Port 3001 is already in use. Please free the port and try again.
    pause
    exit /b 1
)

:: Start backend
echo Starting backend server...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)

start "PMU Backend" cmd /k "npm start"

:: Wait for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend
echo Starting frontend server...
cd ..\frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)

start "PMU Frontend" cmd /k "npm start"

echo.
echo Dashboard is starting up...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo WebSocket: ws://localhost:3001
echo.
echo Both servers are now running in separate windows.
echo Close the command windows or press Ctrl+C in them to stop the servers.
pause
