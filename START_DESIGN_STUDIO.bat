@echo off
REM Interior Design Studio - Startup Script for Windows

echo ============================================
echo Furnish Studio - Design System
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.8+
    echo Download from: https://www.python.org/downloads/
    exit /b 1
)

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js 16+
    echo Download from: https://nodejs.org/
    exit /b 1
)

echo Python version:
python --version
echo Node version:
node --version
echo.

REM Install backend dependencies if needed
echo Installing Backend Dependencies...
cd Backend
if not exist node_modules (
    echo Running: npm install
    call npm install
)

REM Install Python dependencies
echo.
echo Installing Python Dependencies...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo Warning: Some Python packages may not have installed correctly
    echo Please run: pip install -r requirements.txt
)

cd ..

echo.
echo ============================================
echo Starting Services...
echo ============================================
echo.

REM Start backend in new window
echo Starting Backend Server on port 5000...
start cmd /k "cd Backend && npm start"

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start frontend in new window
echo Starting Frontend Server on port 3000...
start cmd /k "cd Furnish-Studio-main && npm start"

echo.
echo ============================================
echo Services Starting...
echo ============================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Design Studio: http://localhost:3000/design-studio
echo.
echo Waiting for servers to fully start...
echo This may take 30-60 seconds...
echo.
timeout /t 15 /nobreak

echo Opening Design Studio in browser...
start http://localhost:3000/design-studio

echo.
echo Done! Your interior design system is running.
echo.
echo Troubleshooting:
echo - If ports 3000/5000 are in use, close other applications
echo - Check firewall settings allow localhost connections
echo - Python dependencies must be installed (done above)
echo.
pause
