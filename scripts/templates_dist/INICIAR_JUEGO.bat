@echo off
title MTC Research Game - Servidor Local
cd /d "%~dp0"

echo ========================================================================
echo   MTC Research Game - Asistente para el Estado del Arte
echo ========================================================================
echo   Iniciando servidor local seguro en 127.0.0.1...
echo.
echo   Tu navegador web se abrira automaticamente en unos segundos.
echo   Para cerrar el juego, simplemente cierra esta ventana o presiona Ctrl+C.
echo ========================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"

if %errorlevel% neq 0 (
    echo.
    echo Ocurrio un error al ejecutar el servidor local.
    pause
)
