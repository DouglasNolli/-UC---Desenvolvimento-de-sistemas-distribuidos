@echo off
title API 1 - Produtos (porta 8080)

rem Localiza o JDK 21 caso JAVA_HOME nao esteja definido no sistema.
if not defined JAVA_HOME (
    for /d %%d in ("C:\Program Files\Microsoft\jdk-21*") do set "JAVA_HOME=%%d"
)

if not defined JAVA_HOME (
    echo [ERRO] JDK 21 nao encontrado. Instale com: winget install Microsoft.OpenJDK.21
    pause
    exit /b 1
)

echo JAVA_HOME = %JAVA_HOME%
echo Subindo a API de Produtos em http://localhost:8080 ...
echo.

cd /d "%~dp0produtos-api"
call mvnw.cmd spring-boot:run

pause
