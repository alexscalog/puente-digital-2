@echo off
title PUENTE DIGITAL - SERVIDOR PYTHON
chcp 65001 > nul
echo ========================================================
echo   PUENTE DIGITAL - INICIADOR DE SERVIDOR PYTHON
echo ========================================================
echo.

:: Comprobar si Python está instalado en el sistema
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] AVISO: No se encontró Python instalado en las variables de entorno.
    echo.
    echo Para ejecutar con Python:
    echo 1. Descargá e instalá Python desde: https://www.python.org/downloads/
    echo 2. IMPORTANTE al instalar: Marcá la casilla "Add python.exe to PATH".
    echo.
    echo ----------------------------------------------------
    echo Mientras tanto, podés usar:
    echo - "iniciar_servidor.bat" (con Node.js)
    echo - O hacer doble clic en "index.html" directamente.
    echo ----------------------------------------------------
    echo.
    pause
    exit /b 1
)

echo [*] Python detectado correctamente.
echo [*] Iniciando servidor y base de datos SQLite...
echo.
echo [*] Abriendo navegador en http://localhost:8000 ...
start "" http://localhost:8000

python server.py
pause
