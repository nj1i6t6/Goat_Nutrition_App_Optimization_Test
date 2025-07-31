# 領頭羊博士 - 後端 API 服務

> 🐐 基於 Flask + SQLAlchemy 的山羊營養管理系統後端服務

## 📋 系統概述

本後端服務採用 Flask 3.0.3 框架，提供完整的 RESTful API，整合 Google Gemini AI 技術，為山羊營養管理系統提供核心業務邏輯支援。

## 🏗️ 技術架構

### 核心技術棧
- **Web 框架**：Flask 3.0.3
- **ORM**：SQLAlchemy 2.0.31
- **資料驗證**：Pydantic 2.7.1 (V1→V2 完整遷移)
- **資料庫遷移**：Alembic 1.13.1
- **AI 整合**：Google Generative AI 0.8.5
- **身份驗證**：Flask-Login 0.6.3
- **測試框架**：pytest 8.2.0 + pytest-cov 5.0.0
- **WSGI 伺服器**：Waitress 3.0.0
- **Excel 處理**：openpyxl 3.1.4 + pandas 2.2.2

### 專案結構
```
backend/
├── app/                        # Flask 應用程式核心
│   ├── __init__.py             # Flask 應用程式工廠
│   ├── error_handlers.py       # 統一錯誤處理器
│   ├── models.py               # SQLAlchemy 資料模型
│   ├── schemas.py              # Pydantic 資料驗證模型
│   ├── utils.py                # 工具函數與 AI 整合
│   └── api/                    # RESTful API 藍圖
│       ├── __init__.py         # API 藍圖註冊
│       ├── agent.py            # AI 代理人 API (18項功能)
│       ├── auth.py             # 身份驗證 API (10項功能)
│       ├── dashboard.py        # 儀表板數據 API (11項功能)
│       ├── data_management.py  # 數據管理 API (12項功能)
│       └── sheep.py            # 山羊管理 API (13項功能)
├── instance/                   # Flask 實例特定檔案
│   └── app.db                  # SQLite 開發資料庫
├── migrations/                 # Alembic 資料庫遷移
│   ├── env.py                  # 遷移環境配置
│   ├── script.py.mako          # 遷移腳本範本
│   └── versions/               # 資料庫版本控制
│       └── a6d3b4664bd0_add_esg_fields.py  # ESG 欄位遷移
└── tests/                      # 測試套件 ✅ 198/198 通過
    ├── conftest.py             # pytest 測試配置與夾具
    ├── test_agent_api.py       # AI 代理人 API 測試 (18 tests)
    ├── test_auth_api.py        # 身份驗證 API 測試 (10 tests)
    ├── test_dashboard_api.py   # 儀表板 API 測試 (11 tests)
    ├── test_data_management_api.py # 數據管理 API 測試 (12 tests)
    ├── test_sheep_api.py       # 山羊管理 API 測試 (13 tests)
    ├── test_*_enhanced.py      # 增強測試套件 (130+ tests)
    ├── test_*_error_handling.py # 錯誤處理測試
    └── test_*_events_api.py    # 事件管理測試
```

## 🚀 快速開始

### 環境需求
- Python 3.11+
- PostgreSQL 13+ (生產環境) / SQLite (開發環境)

### 安裝步驟

1. **建立虛擬環境**
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# 或 venv\Scripts\activate  # Windows
```

2. **安裝依賴套件**
```bash
pip install -r requirements.txt
```

3. **設定環境變數**
複製並編輯環境變數檔案：
```bash
cp .env.example .env
```

4. **初始化資料庫**
```bash
flask db upgrade
```

5. **啟動開發伺服器**
```bash
python run.py
```

## 📊 API 端點總覽

### 身份驗證 API (/api/auth)
- `POST /login` - 用戶登入
- `POST /register` - 用戶註冊  
- `GET /status` - 檢查登入狀態
- `POST /logout` - 用戶登出

### 山羊管理 API (/api/sheep)
- `GET /` - 取得山羊列表
- `POST /` - 新增山羊記錄
- `GET /<id>` - 取得單一山羊資料
- `PUT /<id>` - 更新山羊資料
- `DELETE /<id>` - 刪除山羊記錄

### AI 代理人 API (/api/agent)
- `POST /nutrition-advice` - 取得營養建議
- `POST /chat` - AI 對話諮詢
- `GET /daily-tips` - 每日小貼士

### 儀表板 API (/api/dashboard)
- `GET /stats` - 取得統計數據
- `GET /farm-report` - 生成牧場報告

### 數據管理 API (/api/data-management)
- `POST /export` - 匯出 Excel 檔案
- `POST /import` - 匯入 Excel 檔案
- `POST /analyze-file` - 分析檔案格式

## 🧪 測試覆蓋率

### 測試統計 ✅
- **總測試數量**：198 項測試全部通過
- **整體覆蓋率**：94% (1047行代碼中有65行未覆蓋)
- **測試執行時間**：~15秒

### 各模組覆蓋率
| 模組 | 覆蓋率 | 狀態 |
|------|--------|------|
| app/models.py | 96% | ✅ 優秀 |
| app/api/data_management.py | 98% | ✅ 優秀 |
| app/api/sheep.py | 98% | ✅ 優秀 |
| app/api/auth.py | 94% | ✅ 良好 |
| app/api/dashboard.py | 88% | ✅ 良好 |
| app/api/agent.py | 90% | ✅ 良好 |

### 執行測試
```bash
# 執行所有測試
pytest

# 執行測試並產生覆蓋率報告
pytest --cov=app --cov-report=html

# 執行特定測試檔案
pytest tests/test_sheep_api.py -v
```

## 🔧 開發工具

### 資料庫遷移
```bash
# 產生遷移檔案
flask db migrate -m "遷移描述"

# 套用遷移
flask db upgrade

# 查看遷移歷史
flask db history
```

### 除錯工具
```bash
# 執行認證除錯工具
python auth_debug.py

# 執行系統除錯測試
python debug_test.py

# 執行手動功能測試
python manual_functional_test.py
```

## 🐳 Docker 部署

### 建立 Docker 映像檔
```bash
docker build -t goat-nutrition-backend .
```

### 使用 Docker Compose
```bash
# 啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs backend
```

## 🔒 安全考量

### 身份驗證
- Flask-Login 會話管理
- 密碼雜湊 (Werkzeug Security)
- CSRF 保護

### 資料驗證
- Pydantic 模型驗證
- SQL 注入防護 (SQLAlchemy ORM)
- 輸入資料清理

### API 安全
- 身份驗證中介軟體
- 錯誤資訊過濾
- 請求速率限制 (建議實施)

## 📝 更新日誌

### v2.0.0 (2025-07-30)
- ✅ 完成 Pydantic V1→V2 遷移
- ✅ 提升測試覆蓋率至 94%
- ✅ 新增 ESG 永續指標支援
- ✅ 優化 AI 代理人回應速度
- ✅ 增強錯誤處理機制

### v1.5.0
- ✅ 整合 Google Gemini AI
- ✅ 實施完整測試套件
- ✅ 新增 Excel 匯入匯出功能
- ✅ 支援 Docker 容器化部署

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](../LICENSE) 檔案

## 📞 技術支援

如有任何技術問題，請透過以下方式聯繫：
- 建立 [GitHub Issue](https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test/issues)
- 發送郵件至專案維護者
