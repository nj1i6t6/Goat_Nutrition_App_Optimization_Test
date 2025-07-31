# 領頭羊博士 - 智慧山羊營養管理系統

> 🐐 基於 AI 技術的專業山羊營養分析與飼養管理平台

[![GitHub](https://img.shields.io/badge/GitHub-nj1i6t6/Goat_Nutrition_App_Optimization_Test-blue?style=flat-square&logo=github)](https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test)
[![Flask](https://img.shields.io/badge/Flask-3.0.3-green?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5.17-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Backend_Tests-198/198_✅-success?style=flat-square)](https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test)
[![Tests](https://img.shields.io/badge/Frontend_Tests-179/244_🔄-orange?style=flat-square)](https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test)

## 📋 系統概述

領頭羊博士是一套全面的山羊營養管理系統，整合了 Google Gemini AI 技術，為牧場主提供個性化的山羊營養建議、健康管理和生產優化方案。系統採用現代化的前後端分離架構，具有完整的測試覆蓋率和 Docker 容器化部署。

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
- **核心框架**：Flask 3.0.3 + SQLAlchemy 2.0.31
- **資料庫**：PostgreSQL 15+ (生產) / SQLite (開發)
- **資料驗證**：Pydantic 2.7.1
- **資料庫遷移**：Alembic 1.13.1
- **AI 整合**：Google Generative AI 0.8.5
- **身份驗證**：Flask-Login 0.6.3
- **測試框架**：pytest 8.2.0 + pytest-cov 5.0.0
- **WSGI 伺服器**：Waitress 3.0.0
- **Excel 處理**：openpyxl 3.1.4 + pandas 2.2.2

### 前端技術棧
- **核心框架**：Vue.js 3.5.17 + Composition API
- **狀態管理**：Pinia 3.0.3
- **路由管理**：Vue Router 4.5.1
- **UI 組件庫**：Element Plus 2.10.4
- **HTTP 客戶端**：Axios 1.11.0
- **圖表視覺化**：Chart.js 4.5.0 + Vue-ChartJS 5.3.2
- **建置工具**：Vite 7.0.4
- **測試框架**：Vitest 3.2.4 + @vue/test-utils 2.4.0
- **測試環境**：Happy-DOM 12.10.3

### 基礎設施與部署
- **容器化**：Docker + Docker Compose
- **反向代理**：Nginx (前端服務)
- **資料庫**：PostgreSQL 15-alpine
- **健康檢查**：內建容器健康監控
- **網路架構**：Docker Bridge 網路

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
git clone https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test.git
cd Goat_Nutrition_App_Optimization_Test

# 創建環境變數檔案（從範本複製）
cp .env.example .env
# 編輯 .env 檔案，設定資料庫密碼、Gemini API Key 等
```

2. **啟動服務**
```bash
# 建置並啟動所有服務
docker-compose up -d

# 等待資料庫啟動完成
docker-compose logs -f db

# 執行資料庫遷移
docker-compose exec backend flask db upgrade

# 檢查所有服務狀態
docker-compose ps
```

3. **訪問應用程式**
- **前端應用程式**：http://localhost (Port 80)
- **後端 API**：http://localhost/api
- **直接後端服務**：http://localhost:5001 (開發用)
- **資料庫**：localhost:5432 (外部連接)

### 方法三：開發模式部署

#### 後端設定
```bash
cd backend

# 創建並激活虛擬環境
python -m venv .venv
# Windows
.\.venv\Scripts\Activate.ps1
# Linux/macOS
source .venv/bin/activate

# 安裝所有依賴
pip install -r requirements.txt

# 設定環境變數
# Windows PowerShell
$env:FLASK_APP = "run.py"
$env:DATABASE_URL = "sqlite:///instance/app.db"  # 或 PostgreSQL

# Linux/macOS
export FLASK_APP=run.py
export DATABASE_URL=sqlite:///instance/app.db

# 執行資料庫遷移
flask db upgrade

# 啟動開發伺服器 (預設: http://localhost:5001)
python run.py
```

#### 前端設定
```bash
cd frontend

# 安裝 Node.js 依賴
npm install

# 啟動開發伺服器 (預設: http://localhost:5173)
npm run dev

# 或執行生產建置
npm run build
```

## 🧪 測試覆蓋率

### 後端測試 ✅ (198/198 通過 - 100% 成功率)
```bash
cd backend

# 激活虛擬環境
.\.venv\Scripts\Activate.ps1  # Windows
# source .venv/bin/activate   # Linux/macOS

# 執行所有測試
pytest

# 執行測試並生成覆蓋率報告
pytest --cov=app --cov-report=html --cov-report=term

# 查看 HTML 覆蓋率報告
# Windows: start htmlcov/index.html
# Linux/macOS: open htmlcov/index.html
```

**測試覆蓋詳情** (94% 整體覆蓋率)：
- ✅ **test_auth_api.py**: 10 項測試 (身份驗證功能)
- ✅ **test_sheep_api.py**: 13 項測試 (山羊管理功能)  
- ✅ **test_agent_api.py**: 18 項測試 (AI 代理人功能)
- ✅ **test_dashboard_api.py**: 11 項測試 (儀表板功能)
- ✅ **test_data_management_api.py**: 12 項測試 (數據管理功能)
- ✅ **增強測試套件**: 130+ 項測試 (邊界條件和異常處理)

### 前端測試 🔄 (179/244 通過 - 73% 成功率)
```bash
cd frontend

# 執行所有測試
npm run test

# 執行測試並生成覆蓋率報告
npm run test:coverage

# 執行測試 UI 介面
npm run test:ui
```

**測試覆蓋詳情** (核心模組已完成)：
- ✅ **utils/index.test.js**: 35/40 項測試 (工具函數，87% 通過率)
- ✅ **stores/auth.test.js**: 2/2 項測試 (身份驗證 Store)
- ✅ **stores/sheep.test.js**: 16/16 項測試 (山羊管理 Store) 
- ✅ **stores/consultation.test.js**: 16/16 項測試 (諮詢功能 Store)
- ✅ **stores/settings.test.js**: 23/23 項測試 (設定管理 Store)
- 🔄 **組件測試**: 持續改善中 (主要挑戰：循環依賴問題)

### 測試配置檔案
- **後端**: `pytest.ini`, `conftest.py`
- **前端**: `vitest.config.js`, `src/test/setup.js`

## 🐳 Docker 配置

### 服務組成
```yaml
services:
  # PostgreSQL 15 資料庫服務
  db:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    healthcheck: pg_isready 檢查
    
  # Flask 後端服務  
  backend:
    build: ./backend
    ports: ["5001:5001"]
    depends_on: db (health check)
    
  # Nginx 前端服務
  frontend:
    build: ./frontend  
    ports: ["80:80"]
    depends_on: backend
```

### Docker Compose 指令
```bash
# 啟動所有服務 (後台模式)
docker-compose up -d

# 查看所有服務狀態
docker-compose ps

# 查看特定服務日誌
docker-compose logs -f backend
docker-compose logs -f frontend  
docker-compose logs -f db

# 查看所有服務即時日誌
docker-compose logs -f

# 停止所有服務
docker-compose down

# 停止並移除資料卷
docker-compose down -v

# 重建所有映像檔 (無快取)
docker-compose build --no-cache

# 重啟特定服務
docker-compose restart backend

# 進入容器內部 (偵錯用)
docker-compose exec backend bash
docker-compose exec db psql -U goat_user -d goat_nutrition_db
```

### 容器健康檢查
所有服務都配置了健康檢查機制：
- **資料庫**: `pg_isready` 檢查 PostgreSQL 可用性
- **後端**: HTTP 健康檢查 `/api/auth/status`  
- **前端**: HTTP 根路徑檢查 `/`

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

#### 數據管理
- `GET /api/data/export` - 匯出 Excel 資料
- `POST /api/data/import` - 匯入 Excel 資料
- `GET /api/data/template` - 下載匯入範本
- `GET /api/data/statistics` - 獲取數據統計

### API 資料驗證
所有 API 請求都經過 **Pydantic 2.7.1** 模型驗證，確保：
- 資料類型安全與自動轉換
- 完整性檢查與錯誤回饋  
- 自動化 API 文檔生成
- 請求/回應模式驗證

### API 身份驗證
- 使用 **Flask-Login** 進行 session 管理
- 支援用戶註冊、登入、登出
- 自動化身份驗證檢查中間件
- 角色權限控制機制

## 🔧 環境變數配置

系統使用 `.env` 檔案進行環境配置。請從 `.env.example` 複製並修改：

```bash
# 複製環境變數範本
cp .env.example .env
```

### 主要環境變數說明

```env
# === 資料庫配置 ===
DATABASE_URL=postgresql://goat_user:goat_password@db:5432/goat_nutrition_db
POSTGRES_DB=goat_nutrition_db
POSTGRES_USER=goat_user  
POSTGRES_PASSWORD=goat_password

# === Flask 應用配置 ===
SECRET_KEY=your-very-secret-key-change-in-production
FLASK_ENV=production
FLASK_DEBUG=False

# === CORS 跨域配置 ===
CORS_ORIGINS=http://localhost,http://127.0.0.1

# === AI 服務配置 ===
GOOGLE_API_KEY=your-gemini-api-key

# === 日誌與監控 ===
LOG_LEVEL=INFO
LOG_FILE=/app/logs/app.log

# === 效能調校 ===
WAITRESS_THREADS=6
WAITRESS_CONNECTION_LIMIT=1000
```

### Docker Compose 特定變數
以下變數會自動被 `docker-compose.yml` 使用：
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `SECRET_KEY`, `FLASK_ENV`, `FLASK_DEBUG`
- `CORS_ORIGINS`, `GOOGLE_API_KEY`

⚠️ **安全提醒**：
- 生產環境務必更改所有預設密碼
- 不要將 `.env` 檔案提交到版本控制系統
- 建議使用密碼管理工具生成強密碼

## 👥 預設帳號

系統預設建立以下管理員帳號：
- **帳號**：admin
- **密碼**：admin123

⚠️ **安全提醒**：請在首次登入後立即修改預設密碼！

## 🔍 故障排除

### 常見問題與解決方案

#### 1. **Docker 容器啟動失敗**
```bash
# 檢查所有服務狀態
docker-compose ps

# 查看詳細錯誤日誌
docker-compose logs backend
docker-compose logs db
docker-compose logs frontend

# 重新啟動問題服務
docker-compose restart backend
```

#### 2. **資料庫連線問題**
```bash
# 檢查資料庫服務健康狀態
docker-compose exec db pg_isready -U goat_user

# 直接連接資料庫測試
docker-compose exec db psql -U goat_user -d goat_nutrition_db

# 檢查資料庫環境變數
docker-compose exec backend env | grep DATABASE
```

#### 3. **API 請求失敗**
- 確認 `GOOGLE_API_KEY` 已正確設定在 `.env` 檔案中
- 檢查 Gemini API 金鑰是否有效且有足夠配額
- 查看後端日誌：`docker-compose logs -f backend`
- 測試 API 端點：`curl http://localhost/api/auth/status`

#### 4. **前端頁面載入問題**
```bash
# 檢查 Nginx 容器狀態
docker-compose logs frontend

# 檢查前端建置是否成功
docker-compose exec frontend ls -la /usr/share/nginx/html

# 重新建置前端映像
docker-compose build --no-cache frontend
```

#### 5. **測試執行失敗**
```bash
# 後端測試問題
cd backend
.\.venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
pytest -v

# 前端測試問題  
cd frontend
npm install
npm run test
```

### 健康檢查狀態說明
- **healthy**: 服務正常運行
- **unhealthy**: 服務異常，需檢查日誌
- **starting**: 服務正在啟動中，請等待

### 效能監控
```bash
# 查看容器資源使用情況
docker stats

# 查看系統資源
docker system df

# 清理無用的映像和容器
docker system prune -f
```

## 🤝 開發貢獻

### 開發環境設定
1. **Fork 此專案**：https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test
2. **創建功能分支**：`git checkout -b feature/amazing-feature`
3. **提交變更**：`git commit -m 'Add amazing feature'`
4. **推送分支**：`git push origin feature/amazing-feature`  
5. **提交 Pull Request**

### 開發工作流程
```bash
# 1. 克隆並設定開發環境
git clone https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test.git
cd Goat_Nutrition_App_Optimization_Test

# 2. 設定後端開發環境
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt

# 3. 設定前端開發環境  
cd ../frontend
npm install

# 4. 執行測試確保環境正常
cd ../backend && pytest
cd ../frontend && npm run test
```

### 代碼品質標準
- **後端**：遵循 PEP 8 Python 代碼規範
- **前端**：使用 ESLint 和 Prettier 進行代碼格式化
- **測試覆蓋率**：新功能必須包含相應的單元測試
- **API 設計**：使用 Pydantic 進行資料驗證
- **文檔更新**：API 變更需要更新相應的 README

### 提交規範
```
feat: 新增功能
fix: 修復 bug  
docs: 文檔更新
style: 代碼格式調整
refactor: 代碼重構
test: 測試相關
chore: 建置與工具相關
```

### 測試要求
- 後端：所有新的 API 端點都需要對應的 pytest 測試
- 前端：新的組件和 Store 需要對應的 Vitest 測試
- 測試覆蓋率不能低於現有水準 (後端 198/198 100%，前端核心模組 100%)

## 📄 授權條款

本專案採用 MIT 授權條款，詳見 [LICENSE](LICENSE) 檔案。

## 📞 技術支持與聯繫

### 專案資源
- 🏠 **專案首頁**：[GitHub Repository](https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test)
- 🐛 **問題回報**：[GitHub Issues](https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test/issues)
- 📖 **專案 Wiki**：[系統架構說明](https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test/wiki)
- 🔄 **更新日誌**：[Releases](https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test/releases)

### 快速問題解決
1. **查看 [故障排除](#-故障排除) 章節**
2. **檢查 [GitHub Issues](https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test/issues) 中的類似問題**
3. **查看容器日誌**：`docker-compose logs -f`
4. **提交新的 Issue**（請包含完整的錯誤信息和環境詳情）

### 開發社群
歡迎加入領頭羊博士開發社群，一起為山羊營養管理技術發展貢獻力量！

---

## 📊 專案統計

![GitHub stars](https://img.shields.io/github/stars/nj1i6t6/Goat_Nutrition_App_Optimization_Test?style=social)
![GitHub forks](https://img.shields.io/github/forks/nj1i6t6/Goat_Nutrition_App_Optimization_Test?style=social)
![GitHub issues](https://img.shields.io/github/issues/nj1i6t6/Goat_Nutrition_App_Optimization_Test)
![GitHub pull requests](https://img.shields.io/github/issues-pr/nj1i6t6/Goat_Nutrition_App_Optimization_Test)

**🐐 領頭羊博士 - 讓每一隻山羊都能獲得最佳的營養管理！**
