@echo off
title PUENTE DIGITAL - SERVIDOR EDUCATIVO
echo ========================================================
echo   INICIANDO PUENTE DIGITAL - PLATAFORMA EDUCATIVA
echo ========================================================
echo.
echo Abriendo navegador en http://localhost:3000 ...
start "" http://localhost:3000
node server.js
pause
