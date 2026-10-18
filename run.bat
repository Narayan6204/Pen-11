@echo off
set "ROOT=%~dp0"
cd /d "%ROOT%"
if not exist "%ROOT%venv\Scripts\python.exe" (
	echo Pen 11 virtual environment not found.
	echo Run: py -3 -m venv "%ROOT%venv"
	echo Then: "%ROOT%venv\Scripts\python.exe" -m pip install -r "%ROOT%requirements.txt"
	pause
	exit /b 1
)
"%ROOT%venv\Scripts\python.exe" "%ROOT%main.py"
