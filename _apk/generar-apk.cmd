@echo off
rem Vuelve a generar la APK de prueba con la version actual de la carpeta Idiomas (todos los cursos).
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
cd /d "%~dp0"
call node copiar.mjs || goto :fin
call npx cap sync android || goto :fin
cd android
rem «clean» para que la APK no arrastre restos de la compilacion anterior (si no, pesa de mas).
call gradlew.bat clean assembleDebug || goto :fin
copy /y "app\build\outputs\apk\debug\app-debug.apk" "..\..\Paglot-prueba.apk"
echo.
echo Lista: Paglot-prueba.apk
:fin
pause
