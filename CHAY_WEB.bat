@echo off
title SẮC I. VÁN CỜ - Web Dat Ve Live Show
color 0C
echo =======================================================
echo     SẮC I. VÁN CỜ - LIVE SHOW SINH NHẬT CLB DTU ACOUSTIC
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
