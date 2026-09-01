@echo off
chcp 65001 >nul
echo ========================================
echo    命令助手 - iOS GitHub 编译工具
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装：https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] 安装项目依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [2/4] 同步 Capacitor 配置...
call npx cap sync ios
if %errorlevel% neq 0 (
    echo [提示] 首次运行，正在添加 iOS 平台...
    call npx cap add ios
    call npx cap sync ios
)

echo.
echo [3/4] 检查 Git 仓库...
REM 定位 git 仓库根目录（向上查找 .git）
set "GIT_ROOT=%cd%"
:find_git
if exist "%GIT_ROOT%\.git" goto found_git
REM 上一级目录
for %%I in ("%GIT_ROOT%") do set "PARENT=%%~dpI"
set "PARENT=%PARENT:~0,-1%"
if "%PARENT%"=="%GIT_ROOT%" (
    echo [错误] 未找到 .git 目录，请先在项目根目录执行 git init
    pause
    exit /b 1
)
set "GIT_ROOT=%PARENT%"
goto find_git
:found_git
echo Git 仓库根目录: %GIT_ROOT%

REM 在 git 根目录执行 git 操作
cd /d "%GIT_ROOT%"

REM 检查是否有远程仓库
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo  尚未设置远程仓库，请执行：
    echo.
    echo  git remote add origin https://github.com/你的用户名/仓库名.git
    echo  git add .
    echo  git commit -m "更新命令助手"
    echo  git branch -M main
    echo  git push -u origin main
    echo.
    echo  推送后 GitHub Actions 将在 macOS 环境自动编译 iOS IPA
    echo  工作流: build-command-helper.yml
    echo ========================================
    pause
    exit /b 0
)

echo.
echo [4/4] 提交并推送到 GitHub...
git add .
git status --short
echo.
set /p commit_msg="请输入提交信息（直接回车使用默认）: "
if "%commit_msg%"=="" set commit_msg=更新命令助手
git commit -m "%commit_msg%"

echo.
echo 推送到 GitHub...
git push
if %errorlevel% neq 0 (
    echo [提示] 推送失败，请检查远程仓库设置
    echo 运行: git remote add origin https://github.com/你的用户名/仓库名.git
) else (
    echo.
    echo ========================================
    echo  推送成功！
    echo  GitHub Actions 正在 macOS 环境编译 iOS IPA...
    echo  工作流: Build 命令助手 iOS
    echo  约5-10分钟后在以下位置下载：
    echo  https://github.com/你的用户名/仓仓名/actions
    echo.
    echo  如需创建 Release（打 tag 自动发布）：
    echo  git tag cmd-v1.0
    echo  git push origin cmd-v1.0
    echo ========================================
)

echo.
pause
