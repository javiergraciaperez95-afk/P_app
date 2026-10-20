@echo off
rem Abre Phuong App en el navegador del ordenador (hace falta Python). Cierra esta ventana para pararla.
cd /d "%~dp0"
start "" http://localhost:8310/index.html
python _herramientas\servir.py 8310
