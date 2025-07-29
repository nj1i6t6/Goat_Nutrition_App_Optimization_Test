# 領頭羊博士 - 智慧山羊營養管理系統

> 🐐 基於 AI 技術的專業山羊營養分析與飼養管理平台

## 📋 系統概述

領頭羊博士是一套全面的山羊營養管理系統，整合了 Google Gemini AI 技術，為牧場主提供個性化的山羊營養建議、健康管理和生產優化方案。系統支援山羊基礎資料管理、營養需求分析、健康監控、生產記錄追蹤等功能。

## ✨ 主要功能

### 🏠 核心管理功能
- **山羊檔案管理**：完整的山羊基本資料、血統記錄、生產履歷
- **智慧營養分析**：基於個體差異的精準營養需求計算
- **健康監控系統**：疫苗接種、驅蟲提醒、健康狀態追蹤
- **生產記錄管理**：產奶量、繁殖記錄、成長數據分析

### 🤖 AI 智慧功能
- **個性化營養建議**：結合山羊品種、生理狀態、環境條件的營養方案
- **智慧對話諮詢**：24/7 AI 代理人提供專業飼養建議
- **預測性健康分析**：基於歷史數據的健康風險預警
- **生產效能優化**：數據驅動的生產管理建議

### 📊 數據分析功能
- **牧場綜合儀表板**：即時數據概覽和關鍵指標監控
- **Excel 數據匯入匯出**：支援批量數據處理和報表生成
- **歷史趨勢分析**：成長曲線、產量變化、健康趨勢追蹤
- **ESG 永續指標**：環境友好和動物福利評估

## 🏗️ 技術架構

### 後端技術棧
- **框架**：Flask 3.0.3 + SQLAlchemy ORM
- **資料庫**：PostgreSQL 13+
- **API 驗證**：Pydantic 數據驗證
- **AI 整合**：Google Gemini API
- **部署**：Waitress WSGI 伺服器

### 前端技術棧
- **框架**：Vue.js 3 + Composition API
- **狀態管理**：Pinia
- **UI 組件庫**：Element Plus
- **打包工具**：Vite 5
- **測試框架**：Vitest

### 基礎設施
- **容器化**：Docker + Docker Compose
- **資料庫遷移**：Alembic
- **API 文檔**：自動化 API 文檔生成
- **日誌系統**：結構化日誌記錄

## 🚀 快速部署

### 方法一：使用自動化部署腳本（推薦）

#### Windows 用戶
```cmd
# 下載項目後，直接執行部署腳本
deploy.bat
```

#### Linux/macOS 用戶
```bash
# 賦予執行權限並執行部署腳本
chmod +x deploy.sh
./deploy.sh
```

#### GitHub Codespaces 用戶
```bash
# 專用於 Codespaces 環境的部署腳本（已修復 Node.js 版本問題）
chmod +x deploy-codespaces.sh
./deploy-codespaces.sh
```

### 方法二：手動 Docker 部署

1. **環境準備**
```bash
# 克隆項目
git clone <repository-url>
cd Goat_Nutrition_App_Optimization_Test

# 創建環境變數檔案
cp .env.example .env
# 編輯 .env 檔案，設定資料庫密碼、API Key 等
```

2. **啟動服務**
```bash
# 建置並啟動所有服務
docker-compose up -d

# 執行資料庫遷移
docker-compose exec backend flask db upgrade
```

3. **訪問應用程式**
- 前端應用程式：http://localhost
- API 端點：http://localhost/api

### 方法三：開發模式部署

#### 後端設定
```bash
cd backend

# 創建虛擬環境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安裝依賴
pip install -r requirements.txt

# 設定環境變數
export FLASK_APP=run.py
export DATABASE_URL=postgresql://user:password@localhost/goat_db

# 執行資料庫遷移
flask db upgrade

# 啟動開發伺服器
python run.py
```

#### 前端設定
```bash
cd frontend

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

## 🧪 測試

### 後端測試 ✅ (64/64 通過)
```bash
cd backend

# 執行所有測試
pytest

# 執行測試並生成覆蓋率報告
pytest --cov=app --cov-report=html

# 查看覆蓋率報告
open htmlcov/index.html

# 測試結果摘要
# ✅ test_agent_api.py: 18 項測試 (AI 代理人功能)
# ✅ test_auth_api.py: 10 項測試 (身份驗證功能)  
# ✅ test_dashboard_api.py: 11 項測試 (儀表板功能)
# ✅ test_data_management_api.py: 12 項測試 (數據管理功能)
# ✅ test_sheep_api.py: 13 項測試 (山羊管理功能)
```

### 前端測試
```bash
cd frontend

# 執行單元測試
npm run test

# 執行測試並監控檔案變化
npm run test:watch

# 生成測試覆蓋率報告
npm run test:coverage
```

## 🐳 Docker 配置

### 服務組成
- **backend**：Flask 應用程式服務
- **frontend**：Nginx 提供的前端靜態檔案服務
- **db**：PostgreSQL 資料庫服務

### Docker Compose 指令
```bash
# 啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f [service-name]

# 停止服務
docker-compose down

# 重建映像檔
docker-compose build --no-cache
```

## 📚 API 文檔

### 主要 API 端點

#### 身份驗證
- `POST /api/auth/login` - 用戶登入
- `POST /api/auth/register` - 用戶註冊
- `GET /api/auth/status` - 檢查登入狀態
- `POST /api/auth/logout` - 用戶登出

#### 山羊管理
- `GET /api/sheep/` - 獲取所有山羊列表
- `POST /api/sheep/` - 新增山羊記錄
- `GET /api/sheep/{ear_num}` - 獲取特定山羊詳情
- `PUT /api/sheep/{ear_num}` - 更新山羊資料
- `DELETE /api/sheep/{ear_num}` - 刪除山羊記錄

#### AI 代理
- `POST /api/agent/recommendation` - 獲取營養建議
- `POST /api/agent/chat` - AI 對話諮詢
- `GET /api/agent/tip` - 獲取每日小貼士

#### 儀表板
- `GET /api/dashboard/data` - 獲取儀表板數據
- `GET /api/dashboard/farm_report` - 獲取牧場報告

### API 驗證
所有 API 請求都經過 Pydantic 模型驗證，確保數據完整性和類型安全。

## 🔧 環境變數配置

創建 `.env` 檔案並設定以下變數：

```env
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
```

## 👥 預設帳號

系統預設建立以下管理員帳號：
- **帳號**：admin
- **密碼**：admin123

⚠️ **安全提醒**：請在首次登入後立即修改預設密碼！

## 🔍 故障排除

### 常見問題

1. **資料庫連線失敗**
   - 檢查 PostgreSQL 服務是否正常運行
   - 確認 `DATABASE_URL` 環境變數設定正確
   - 查看資料庫容器日誌：`docker-compose logs db`

2. **API 請求失敗**
   - 確認 Google Gemini API Key 設定正確
   - 檢查網路連線是否正常
   - 查看後端服務日誌：`docker-compose logs backend`

3. **前端頁面無法載入**
   - 確認前端容器是否正常啟動
   - 檢查 Nginx 配置是否正確
   - 查看前端服務日誌：`docker-compose logs frontend`

### 日誌查看
```bash
# 查看所有服務日誌
docker-compose logs

# 查看特定服務日誌
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# 即時查看日誌
docker-compose logs -f
```

## 🤝 開發貢獻

### 開發環境設定
1. Fork 此專案
2. 創建功能分支：`git checkout -b feature/amazing-feature`
3. 提交變更：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

### 代碼規範
- 後端遵循 PEP 8 Python 代碼規範
- 前端使用 ESLint 和 Prettier 進行代碼格式化
- 所有新功能需要包含相應的單元測試
- API 變更需要更新相應的文檔

## 📄 授權條款

本專案採用 MIT 授權條款，詳見 [LICENSE](LICENSE) 檔案。

## 📞 技術支持

如遇到技術問題或需要功能建議，歡迎通過以下方式聯繫：

- 📧 Email：support@goat-nutrition.com
- 🐛 Issues：[GitHub Issues](https://github.com/your-repo/issues)
- 📖 Wiki：[項目 Wiki](https://github.com/your-repo/wiki)

---

**🐐 領頭羊博士 - 讓每一隻山羊都能獲得最佳的營養管理！**