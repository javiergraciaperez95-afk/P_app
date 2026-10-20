@echo off
rem Genera la APK de Phuong App (Phuong-App.apk, en la carpeta de arriba) con la version actual de la app.
rem Hace falta Android Studio instalado (su Java y su SDK de Android).
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
cd /d "%~dp0"
call node copiar.mjs || goto :fin
call npx cap sync android || goto :fin
cd android
rem clean: para que la APK no arrastre restos de la compilacion anterior
call gradlew.bat clean assembleDebug || goto :fin
copy /y "app\build\outputs\apk\debug\app-debug.apk" "..\..\Phuong-App.apk"
echo.
echo Lista: Phuong-App.apk
:fin
pause
