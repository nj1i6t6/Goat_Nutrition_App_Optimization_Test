@echo off
REM 領頭羊博士 - Windows 自動化部署腳本
REM 此腳本用於一鍵部署整個應用程式到生產環境

echo 🐐 領頭羊博士 - 開始部署程序 🐐
echo ========================================

REM 檢查 Docker 是否安裝
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安裝，請先安裝 Docker Desktop
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose 未安裝，請先安裝 Docker Compose
    exit /b 1
)

REM 檢查環境變數檔案
if not exist ".env" (
    echo ⚠️  .env 檔案不存在，創建範例環境變數檔案...
    (
        echo # 資料庫配置
        echo DATABASE_URL=postgresql://goat_user:goat_password@db:5432/goat_nutrition_db
        echo POSTGRES_DB=goat_nutrition_db
        echo POSTGRES_USER=goat_user
        echo POSTGRES_PASSWORD=goat_password
        echo.
        echo # Flask 配置
        echo SECRET_KEY=your-secret-key-change-in-production
        echo FLASK_ENV=production
        echo FLASK_DEBUG=False
        echo.
        echo # CORS 配置
        echo CORS_ORIGINS=http://localhost,http://127.0.0.1
        echo.
        echo # Google Gemini API
        echo GOOGLE_API_KEY=your-gemini-api-key
        echo.
        echo # 日誌配置
        echo LOG_LEVEL=INFO
    ) > .env
    echo 📝 請編輯 .env 檔案，設定正確的環境變數後再次執行部署腳本
    exit /b 1
)

echo ✅ 環境檢查完成

REM 停止現有容器
echo 🛑 停止現有容器...
docker-compose down

REM 建置映像檔
echo 🔨 建置應用程式映像檔...
docker-compose build --no-cache

REM 啟動服務
echo 🚀 啟動服務...
docker-compose up -d

REM 等待資料庫啟動
echo ⏳ 等待資料庫啟動...
timeout /t 15 /nobreak >nul

REM 執行資料庫遷移
echo 🗃️  執行資料庫遷移...
docker-compose exec -T backend flask db upgrade

REM 檢查服務狀態
echo 🔍 檢查服務狀態...
docker-compose ps

REM 等待應用程式完全啟動
echo ⏳ 等待應用程式啟動...
timeout /t 10 /nobreak >nul

REM 測試應用程式是否正常運行
echo 🧪 測試應用程式連線...
curl -f -s http://localhost/api/auth/status >nul
if errorlevel 1 (
    echo ❌ 應用程式啟動失敗，請檢查日誌：
    echo    docker-compose logs
    exit /b 1
) else (
    echo ✅ 應用程式啟動成功！
    echo.
    echo 🎉 部署完成！
    echo ========================================
    echo 📱 前端應用程式: http://localhost
    echo 🔗 API 端點: http://localhost/api
    echo 📊 查看日誌: docker-compose logs -f
    echo 🛑 停止服務: docker-compose down
    echo.
    echo 📋 預設管理員帳號：
    echo    帳號: admin
    echo    密碼: admin123
    echo    (請在首次登入後立即修改密碼)
)

pause
