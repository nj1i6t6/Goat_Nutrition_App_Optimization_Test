# 領頭羊博士 - 智能飼養顧問 (Goat Nutrition Advisor)

這是一個基於 Vue.js 3 和 Flask 的現代化全端應用程式，旨在為羊隻飼養提供智能化的數據管理與營養建議。專案經過了前後端分離的重構，前端採用 Vue 3 帶來了流暢的使用者體驗，後端使用 Flask 提供穩定可靠的 API 服務。

## ✨ 核心功能

*   **儀表板:** 集中展示任務提醒、健康警示、羊群狀態及 ESG 指標。
*   **羊群總覽:** 高性能的虛擬化表格，支持對羊群數據的即時篩選、排序和模糊搜尋。
*   **羊隻管理:** 提供完整的新增、編輯、刪除 (CRUD) 功能，包含詳細的基本資料、事件日誌和歷史數據圖表。
*   **AI 飼養建議:** 結合羊隻的詳細數據，呼叫 Google Gemini AI 模型生成包含 ESG 永續性分析的專業飼養建議。
*   **AI 問答助理:** 提供互動式聊天介面，可針對特定羊隻的上下文進行提問。
*   **數據管理:** 支援透過 Excel 檔案進行批次資料的匯出與導入（支援標準範本和自訂格式映射）。
*   **系統設定:** 允許用戶自訂 API 金鑰和事件選項。
*   **版本控制:** 整合 Git 與一鍵上傳腳本，方便管理專案版本。

## 🛠️ 技術棧 (Tech Stack)

| 類別 | 技術 |
| :--- | :--- |
| **後端** | Python, Flask, Flask-SQLAlchemy, Flask-Migrate, Waitress |
| **前端** | Vue.js 3 (Composition API), Vite, Pinia, Vue Router, Axios |
| **UI 元件庫** | Element Plus |
| **資料庫** | PostgreSQL |
| **部署工具** | ngrok |

## 🏗️ 專案架構

本專案採用**統一服務**的生產部署模式。Flask 後端不僅負責提供所有 `/api` 的 RESTful API 接口，還同時託管由 Vite 打包生成的靜態前端檔案（位於 `frontend/dist`）。這種架構徹底解決了生產環境中的跨域資源共享 (CORS) 問題，並極大地簡化了部署流程。

## 🚀 設定與安裝

請按照以下步驟來設定您的本地開發環境。

### **前提條件**
請確保您的電腦已安裝以下軟體：
1.  **Git:** [下載地址](https://git-scm.com/downloads)
2.  **Python 3.8+:** [下載地址](https://www.python.org/downloads/)
3.  **Node.js 18+ (LTS):** [下載地址](https://nodejs.org/)
4.  **PostgreSQL:** [下載地址](https://www.postgresql.org/download/) (並確保已建立專案所需的資料庫和用戶)

### **1. 取得專案**
```bash
git clone https://github.com/nj1i6t6/goat-nutrition-app.git
cd goat-nutrition-app
```

### **2. 後端設定**
```powershell
# 進入後端目錄
cd backend

# 建立並啟動 Python 虛擬環境
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 安裝所有依賴套件
pip install -r requirements.txt

# 複製環境變數範本檔案
# (在 Windows PowerShell 中)
copy .env.example .env

# **重要：** 請打開 .env 檔案，並填寫您自己的資料庫連線資訊和一個隨機的 SECRET_KEY

# 初始化資料庫並應用所有遷移
# (確保您的 PostgreSQL 服務正在運行)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass # (如果需要)
$env:FLASK_APP = "run.py"
flask db upgrade
```

### **3. 前端設定**
```powershell
# 回到專案根目錄
cd ..

# 進入前端目錄
cd frontend

# 安裝所有 Node.js 依賴
npm install
```

## 🏃‍♂️ 運行應用程式

### **開發模式 (Development Mode)**
用於開發新功能和除錯。此模式提供自動重載和詳細的錯誤日誌。

1.  **啟動後端 (第一個終端機):**
    ```powershell
    cd backend
    .\.venv\Scripts\Activate.ps1
    python run.py 
    # 後端運行在 http://localhost:5001
    ```

2.  **啟動前端 (第二個終端機):**
    ```powershell
    cd frontend
    npm run dev
    # 前端開發伺服器運行在 http://localhost:5173
    ```

3.  在瀏覽器中打開 `http://localhost:5173`。

### **生產模式 (Production Mode)**
用於將專案打包、部署，或透過 ngrok 分享給他人。

1.  **前端打包 (只需在修改前端後執行一次):**
    ```powershell
    cd frontend
    npm run build
    ```

2.  **啟動後端統一伺服器 (一個終端機即可):**
    ```powershell
    cd backend
    .\.venv\Scripts\Activate.ps1
    waitress-serve --host=0.0.0.0 --port=5001 run:app
    # 您的應用現在可以透過 http://localhost:5001 訪問
    ```

3.  **(可選) 使用 ngrok 公開服務:**
    ```bash
    ngrok http 5001
    ```

## 📁 專案結構
```
goat-nutrition-app/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── __init__.py
│   │   └── models.py
│   ├── migrations/
│   ├── .env
│   ├── .env.example  <-- 環境變數範本
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── dist/  <-- 生產打包輸出
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── utils/
│   │   └── views/
│   ├── index.html
│   └── package.json
│
├── .gitignore
├── README.md  <-- 您正在閱讀的檔案
└── upload_to_github.ps1  <-- 一鍵上傳腳本
```