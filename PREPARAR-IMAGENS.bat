@echo off
setlocal
cd /d "%~dp0"

if not exist "%~dp0scripts\baixar-e-preparar-imagens.ps1" (
  echo ERRO: script PowerShell nao encontrado.
  pause
  exit /b 2
)

echo Preparando as fotografias. Arquivos ja baixados serao reutilizados.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\baixar-e-preparar-imagens.ps1"
set "PS_EXIT=%ERRORLEVEL%"

if not "%PS_EXIT%"=="0" (
  echo.
  echo A preparacao nao terminou. Os downloads validos foram preservados.
  echo Execute este BAT novamente mais tarde para continuar.
) else (
  echo.
  echo SUCESSO: pacote final criado.
)
echo.
pause
exit /b %PS_EXIT%
