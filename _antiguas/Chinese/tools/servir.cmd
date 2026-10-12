@echo off
rem Doble clic: arranca el servidor local y abre la web en el navegador.
start "" "http://localhost:8000/"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port 8000
pause
