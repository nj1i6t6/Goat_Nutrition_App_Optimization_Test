# 🔧 Codespaces 部署問題修復說明

## 修復的問題

### 1. 前端建置失敗
**問題**：`vite: not found` 錯誤
- 原因：`npm install --omit=dev` 排除了建構時需要的 vite 等開發依賴
- 修復：frontend/Dockerfile 中改為 `npm install`

### 2. Docker Compose 警告
**問題**：`version` 屬性過時警告
- 修復：移除 docker-compose.yml 中的 `version: '3.8'` 行

### 3. 環境變數缺失
**問題**：`.env` 檔案不存在
- 修復：創建完整的 .env 檔案，包含所有必要的環境變數

### 4. Codespaces 專用部署
**新增**：deploy-codespaces.sh 腳本專門針對 GitHub Codespaces 環境優化

## Codespaces 部署指令

在 GitHub Codespaces 中執行：

```bash
# 1. 確保最新代碼
git pull

# 2. 賦予執行權限
chmod +x deploy-codespaces.sh

# 3. 執行部署
./deploy-codespaces.sh
```

## 修復後的架構

- ✅ Node.js 20-alpine (支援 Vite 7)
- ✅ 完整的 npm 依賴安裝
- ✅ Codespaces 環境自動檢測
- ✅ 動態端口處理
- ✅ 資料庫自動初始化
- ✅ 健康檢查和錯誤處理

## 預期結果

部署成功後，在 Codespaces 的 PORTS 標籤中會看到：
- 端口 80：前端應用
- 端口 5001：後端 API
- 端口 5432：PostgreSQL 資料庫

## 如果仍有問題

1. 查看容器日誌：`docker-compose logs`
2. 檢查服務狀態：`docker-compose ps`  
3. 重新建置：`docker-compose build --no-cache`
