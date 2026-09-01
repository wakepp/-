@echo off
chcp 65001 >nul
echo ========================================
echo    命令助手 - Android 打包工具
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装：https://nodejs.org
    pause
    exit /b 1
)

REM 检查 Java/Android SDK
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [警告] 未检测到 Java，本地打包需要安装 JDK 17+
    echo 如果仅推送 GitHub 打包，可忽略此警告
)

echo [1/3] 安装项目依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [2/3] 同步 Capacitor 配置...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [提示] 首次运行，正在添加 Android 平台...
    call npx cap add android
    call npx cap sync android
)

echo.
echo [3/3] 检查 Git 仓库...
if not exist ".git" (
    echo 正在初始化 Git 仓库...
    git init
    git add .
    echo.
    echo ========================================
    echo  请执行以下命令完成 GitHub 推送：
    echo.
    echo  git remote add origin https://github.com/你的用户名/仓库名.git
    echo  git commit -m "初始提交"
    echo  git branch -M main
    echo  git push -u origin main
    echo.
    echo  推送后 GitHub Actions 将自动编译
    echo ========================================
) else (
    git add .
    git status
    echo.
    set /p commit_msg="请输入提交信息（直接回车使用默认）: "
    if "%commit_msg%"=="" set commit_msg=更新命令助手
    git commit -m "%commit_msg%"
    echo.
    echo 推送到 GitHub...
    git push
    if %errorlevel% neq 0 (
        echo [提示] 推送失败，请检查远程仓库设置
    ) else (
        echo.
        echo ========================================
        echo  推送成功！GitHub Actions 正在编译...
        echo  约5-10分钟后在以下位置下载：
        echo  https://github.com/你的用户名/仓库名/actions
        echo ========================================
    )
)

echo.
pause
