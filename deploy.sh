#!/bin/bash

# 領頭羊博士 - 自動化部署腳本
# 此腳本用於一鍵部署整個應用程式到生產環境

set -e  # 遇到錯誤立即退出

echo "🐐 領頭羊博士 - 開始部署程序 🐐"
echo "========================================"

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝，請先安裝 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安裝，請先安裝 Docker Compose"
    exit 1
fi

# 檢查環境變數檔案
if [ ! -f ".env" ]; then
    echo "⚠️  .env 檔案不存在，創建範例環境變數檔案..."
    cat > .env << EOF
# 資料庫配置
DATABASE_URL=postgresql://goat_user:goat_password@db:5432/goat_nutrition_db
POSTGRES_DB=goat_nutrition_db
POSTGRES_USER=goat_user
POSTGRES_PASSWORD=goat_password

# Flask 配置
SECRET_KEY=your-secret-key-change-in-production
FLASK_ENV=production
FLASK_DEBUG=False

# CORS 配置
CORS_ORIGINS=http://localhost,http://127.0.0.1

# Google Gemini API
GOOGLE_API_KEY=your-gemini-api-key

# 日誌配置
LOG_LEVEL=INFO
EOF
    echo "📝 請編輯 .env 檔案，設定正確的環境變數後再次執行部署腳本"
    exit 1
fi

echo "✅ 環境檢查完成"

# 停止現有容器
echo "🛑 停止現有容器..."
docker-compose down

# 建置映像檔
echo "🔨 建置應用程式映像檔..."
docker-compose build --no-cache

# 啟動服務
echo "🚀 啟動服務..."
docker-compose up -d

# 等待資料庫啟動
echo "⏳ 等待資料庫啟動..."
sleep 15

# 執行資料庫遷移
echo "🗃️  執行資料庫遷移..."
docker-compose exec -T backend flask db upgrade

# 檢查服務狀態
echo "🔍 檢查服務狀態..."
docker-compose ps

# 等待應用程式完全啟動
echo "⏳ 等待應用程式啟動..."
sleep 10

# 測試應用程式是否正常運行
echo "🧪 測試應用程式連線..."
if curl -f -s http://localhost/api/auth/status > /dev/null; then
    echo "✅ 應用程式啟動成功！"
    echo ""
    echo "🎉 部署完成！"
    echo "========================================"
    echo "📱 前端應用程式: http://localhost"
    echo "🔗 API 端點: http://localhost/api"
    echo "📊 查看日誌: docker-compose logs -f"
    echo "🛑 停止服務: docker-compose down"
    echo ""
    echo "📋 預設管理員帳號："
    echo "   帳號: admin"
    echo "   密碼: admin123"
    echo "   (請在首次登入後立即修改密碼)"
else
    echo "❌ 應用程式啟動失敗，請檢查日誌："
    echo "   docker-compose logs"
    exit 1
fi
