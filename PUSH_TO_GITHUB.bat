@echo off
title Push DataLens AI to GitHub
color 0A
cd /d "%~dp0"
echo ======================================================================
echo           DATALENS AI - GITHUB REPOSITORY SYNCHRONIZER
echo ======================================================================
echo.
echo Target Repository : https://github.com/barathcbe06-gif/datalens.git
echo Branch            : main
echo.
echo Checking Git status...
git status
echo.
echo ======================================================================
echo Starting push to GitHub...
echo ======================================================================
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ==================================================================
    echo [SUCCESS] Your updates have been successfully pushed to GitHub!
    echo ==================================================================
) else (
    echo ==================================================================
    echo [NOTICE] If prompted above or in your browser, please complete sign-in.
    echo ==================================================================
)
echo.
pause
