# 領頭羊博士 - 前端應用程式

> 🐐 基於 Vue.js 3 + Element Plus 的山羊營養管理系統前端應用程式

## 📋 系統概述

本前端應用程式採用 Vue.js 3 與 Composition API，結合 Element Plus UI 組件庫，提供直觀易用的山羊營養管理介面。支援響應式設計，適配各種裝置尺寸。

## 🏗️ 技術架構

### 核心技術棧
- **核心框架**：Vue.js 3.5.17 + Composition API
- **狀態管理**：Pinia 2.2.6
- **路由管理**：Vue Router 4.5.0
- **UI 組件庫**：Element Plus 2.9.1
- **HTTP 客戶端**：Axios 1.7.9
- **建構工具**：Vite 7.0.2
- **測試框架**：Vitest 3.0.4
- **圖表組件**：Chart.js 4.4.7 + vue-chartjs 5.3.3
- **檔案處理**：SheetJS 0.20.3

### 專案結構
```
frontend/
├── public/                     # 靜態資源目錄
│   ├── vite.svg                # Vite 圖標
│   └── templates/              # 檔案範本
│       └── goat_import_template.xlsx  # Excel 匯入範本
├── src/                        # 前端源代碼
│   ├── App.vue                 # Vue 根組件
│   ├── main.js                 # 應用程式入口點
│   ├── style.css               # 全域樣式
│   ├── api/                    # API 客戶端
│   │   └── index.js            # Axios HTTP 客戶端配置
│   ├── assets/                 # 靜態資源
│   │   └── styles/             # 樣式檔案
│   ├── components/             # 可重用組件
│   │   ├── common/             # 通用組件
│   │   │   └── FieldHelper.vue # 欄位助手組件
│   │   └── sheep/              # 山羊相關組件
│   │       ├── SheepFilter.vue     # 山羊篩選器
│   │       ├── SheepModal.vue      # 山羊資料模態框
│   │       ├── SheepTable.vue      # 山羊資料表格
│   │       └── tabs/               # 分頁組件
│   │           ├── BasicInfoTab.vue    # 基本資料分頁
│   │           ├── EventsLogTab.vue    # 事件記錄分頁
│   │           └── HistoryTab.vue      # 歷史數據分頁
│   ├── router/                 # Vue Router 路由配置
│   │   └── index.js            # 路由定義與配置
│   ├── stores/                 # Pinia 狀態管理
│   │   ├── auth.js             # 身份驗證狀態
│   │   ├── chat.js             # 聊天功能狀態  
│   │   ├── consultation.js     # 諮詢功能狀態
│   │   ├── settings.js         # 設定功能狀態
│   │   └── sheep.js            # 山羊資料狀態
│   ├── utils/                  # 工具函數
│   │   ├── errorHandler.js     # 錯誤處理工具
│   │   └── index.js            # 通用工具函數
│   └── views/                  # 頁面級組件
│       ├── AppLayout.vue       # 應用程式主版面
│       ├── ChatView.vue        # AI 聊天頁面
│       ├── ConsultationView.vue # 諮詢頁面
│       ├── DashboardView.vue   # 儀表板頁面
│       ├── DataManagementView.vue # 數據管理頁面
│       ├── LoginView.vue       # 登入頁面
│       ├── SettingsView.vue    # 設定頁面
│       └── SheepListView.vue   # 山羊列表頁面
└── tests/                      # 測試套件
    ├── mocks.js                # 測試 Mock 工具
    ├── setup.js                # 測試環境設定
    └── [組件名].test.js        # 各組件測試檔案
```

## 🚀 快速開始

### 環境需求
- Node.js 20+
- npm 或 yarn

### 安裝步驟

1. **安裝依賴套件**
```bash
npm install
```

2. **啟動開發伺服器**
```bash
npm run dev
```

3. **建構生產版本**
```bash
npm run build
```

4. **預覽建構結果**
```bash
npm run preview
```

## 📱 主要功能頁面

### 🏠 儀表板 (DashboardView)
- 牧場綜合統計數據
- 圖表視覺化展示
- 即時數據監控
- 關鍵指標概覽

### 🐐 山羊管理 (SheepListView)
- 山羊列表瀏覽與篩選
- 新增/編輯/刪除山羊資料
- 批量操作支援
- 詳細資料檢視

### 🤖 AI 聊天 (ChatView) 
- 智慧營養諮詢對話
- 個性化建議生成
- 歷史對話記錄
- 即時回應體驗

### 📊 數據管理 (DataManagementView)
- Excel 檔案匯入匯出
- 數據格式驗證
- 批量處理支援
- 範本檔案下載

### ⚙️ 系統設定 (SettingsView)
- 用戶偏好設定
- 系統參數配置
- 事件類型管理
- 個人資料編輯

## 🧪 測試架構

### 測試統計
- **測試配置**：多種配置支援不同測試需求
  - `vitest.config.js` - 標準測試配置
  - `vitest.config.simple.js` - 簡化測試配置
  - `vitest.config.isolated.js` - 隔離測試配置
  - `vitest.config.minimal.js` - 最小測試配置
  - `vitest.config.essential.js` - 核心測試配置

### 測試類型
- **單元測試**：組件邏輯測試
- **整合測試**：組件間互動測試
- **Store 測試**：Pinia 狀態管理測試
- **API 測試**：HTTP 請求回應測試

### 執行測試
```bash
# 執行所有測試
npm run test

# 執行測試並監聽檔案變化
npm run test:watch

# 執行簡化測試
npm run test:simple

# 執行隔離測試
npm run test:isolated

# 產生測試覆蓋率報告
npm run coverage
```

## 🎨 UI/UX 設計

### Element Plus 組件使用
- **表格組件**：`el-table` 用於數據展示
- **表單組件**：`el-form` 用於數據輸入
- **對話框**：`el-dialog` 用於模態框
- **導航**：`el-menu` 用於側邊欄導航
- **圖表**：Chart.js 整合用於數據視覺化

### 響應式設計
- 支援桌面、平板、手機裝置
- 彈性網格佈局
- 適應性字體大小
- 觸控友好的介面元素

## 🔧 開發工具配置

### Vite 配置特色
- 快速熱重載 (HMR)
- TypeScript 支援 (可選)
- CSS 預處理器支援
- 自動導入組件
- 建構優化 (代碼分割、壓縮)

### ESLint 與程式碼品質
```bash
# 執行程式碼檢查
npm run lint

# 自動修復程式碼風格問題
npm run lint:fix
```

## 📦 建構與部署

### 本地建構
```bash
# 建構生產版本
npm run build

# 分析建構結果
npm run analyze
```

### Docker 部署
```bash
# 建立 Docker 映像檔
docker build -t goat-nutrition-frontend .

# 執行容器
docker run -p 80:80 goat-nutrition-frontend
```

## 🔍 除錯與效能

### 開發工具
- Vue DevTools 瀏覽器擴充功能
- Vite 開發伺服器內建除錯
- Network 面板監控 API 請求
- Console 日誌記錄

### 效能優化
- 路由懶載入 (Lazy Loading)
- 組件動態導入
- 圖片壓縮與優化
- CDN 資源加速
- Service Worker 快取 (可選)

## 📋 已知問題與解決方案

### 循環依賴問題
某些組件間存在循環依賴，已透過動態導入方式解決：
```javascript
// 避免循環依賴的動態導入範例
const router = await import('@/router')
```

### 測試環境問題
針對 Vitest instanceof 錯誤，建立隔離測試配置解決。

## 🤝 開發規範

### Vue 組件規範
- 使用 Composition API
- 單檔組件 (SFC) 結構
- 清晰的 props 定義
- 事件命名規範

### 程式碼風格
- ESLint + Prettier 自動格式化
- 駝峰命名法 (camelCase)
- 組件名稱使用帕斯卡命名 (PascalCase)
- 檔案名稱使用短橫線命名 (kebab-case)

## 📄 測試文件

專案包含詳細的測試文件：
- `test-simplification-plan.md` - 測試精簡化計劃
- `test-structure-cleanup-report.md` - 測試結構清理報告  
- `test-simplification-results.md` - 測試精簡化成果

## 📞 技術支援

如有任何前端相關問題，請透過以下方式聯繫：
- 建立 [GitHub Issue](https://github.com/nj1i6t6/Goat_Nutrition_App_Optimization_Test/issues)
- 查看 [Vue.js 官方文檔](https://vuejs.org/)
- 參考 [Element Plus 組件文檔](https://element-plus.org/)
