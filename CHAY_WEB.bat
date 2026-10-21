@echo off
title CHESS NIGHT - Web Dat Ve Live Show
color 0C
echo =======================================================
echo     CHESS NIGHT - LIVE SHOW SINH NHAT CAU LAC BO
echo =======================================================
echo.
echo Dang khoi dong may chu xem truoc tren may tinh...
echo.
cd /d "%~dp0"
echo Truy cap trang web tai: http://localhost:3000
echo Nhan Ctrl + C de dung may chu.
echo.
start http://localhost:3000
npm run dev
pause
