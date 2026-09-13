@echo off
title API 2 - Pedidos (porta 8081)

echo Subindo a API de Pedidos em http://localhost:8081 ...
echo Lembre-se: a API de Produtos (porta 8080) precisa estar no ar.
echo.

cd /d "%~dp0pedidos-api"

if not exist "node_modules" (
    echo Instalando dependencias...
    call npm.cmd install
)

call npm.cmd start

pause
