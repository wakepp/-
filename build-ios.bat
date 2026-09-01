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

echo [1/3] 安装项目依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [2/3] 同步 Capacitor 配置...
call npx cap sync ios
if %errorlevel% neq 0 (
    echo [提示] 首次运行，正在添加 iOS 平台...
    call npx cap add ios
    call npx cap sync ios
)

echo.
echo [3/3] 提交并推送到 GitHub...
git add .
git status --short
echo.

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
    echo ========================================
    pause
    exit /b 0
)

set /p commit_msg="请输入提交信息（直接回车使用默认）: "
if "%commit_msg%"=="" set commit_msg=更新命令助手
git commit -m "%commit_msg%"

echo.
echo 推送到 GitHub...
git push
if %errorlevel% neq 0 (
    echo [提示] 推送失败，请检查远程仓库和代理设置
) else (
    echo.
    echo ========================================
    echo  推送成功！
    echo  GitHub Actions 正在 macOS 环境编译 iOS IPA...
    echo  约5-10分钟后在以下位置下载：
    echo  https://github.com/wakepp/-/actions
    echo.
    echo  如需创建 Release（打 tag 自动发布）：
    echo  git tag v1.0
    echo  git push origin v1.0
    echo ========================================
)

echo.
pause
