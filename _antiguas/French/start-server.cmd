@echo off
rem Inicia el servidor local de la web (doble clic en este archivo).
title Français - servidor local
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server\serve.ps1"
if errorlevel 1 pause
