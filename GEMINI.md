# MySQL MCP Server 專案規範與指引

本文件為 Gemini CLI 提供關於 `@johnson.lee/mysql-mcp-server` 專案的背景資訊、開發規範與操作指令。

## 專案概述

本專案是一個基於 **NestJS** 與 **MCP-Nest** 開發的 **Model Context Protocol (MCP)** 伺服器，旨在讓 AI 助理（如 Claude、Cursor）能夠透過標準化協議安全地與 MySQL 資料庫進行互動。

### 核心技術棧
- **框架**: NestJS (v11+)
- **MCP 整合**: `@rekog/mcp-nest`, `@modelcontextprotocol/sdk`
- **資料庫驅動**: `mysql2/promise`
- **驗證**: `zod` (用於工具參數驗證)
- **環境配置**: `@nestjs/config`

### 主要功能
- **連接池管理**: 高效處理 MySQL 連接。
- **權限控管**: 細粒度控制 SQL 操作（SELECT, INSERT, UPDATE, DELETE, DDL, VIEW）。
- **DRY_RUN 模式**: 驗證 SQL 語法而不回傳實際數據，確保安全性。
- **優雅停機 (Graceful Shutdown)**: 確保在進程結束前關閉資料庫連接並完成待處理查詢。

---

## 建置與運行指令

### 開發與建置
- **安裝依賴**: `pnpm install`
- **建置專案**: `pnpm run build`
- **開發模式啟動**: `pnpm run start:dev`
- **生產模式啟動**: `pnpm run start:prod`
- **程式碼格式化**: `pnpm run format`
- **程式碼檢查 (Lint)**: `pnpm run lint`

### 測試指令
- **單元測試**: `pnpm run test`
- **E2E 測試**: `pnpm run test:e2e`
- **測試覆蓋率**: `pnpm run test:cov`

---

## 開發規範與慣例

### 1. 模組化架構 (NestJS)
- 遵循 NestJS 的模組化架構。核心邏輯應封裝在 `src/mysql/` 模組中。
- **Service**: 處理資料庫連接與底層查詢（如 `MySqlService`）。
- **Guard**: 處理安全與權限驗證（如 `PermissionGuardService`）。
- **Tools**: 使用 `@Tool` 裝飾器定義 MCP 工具，並放置於 `src/mysql/tools/`。

### 2. MCP 工具定義
- 每個工具必須使用 `zod` 定義參數結構。
- 工具內部應調用 `PermissionGuardService` 進行權限檢查。
- 範例：
  ```typescript
  @Tool({
    name: 'tool_name',
    description: '功能描述',
    parameters: z.object({ ... })
  })
  ```

### 3. 安全與權限
- **禁止硬編碼憑證**: 必須使用環境變數（透過 `ConfigModule`）進行配置。
- **權限檢查**: 所有的 SQL 執行工具都必須通過 `PermissionGuardService.checkPermission()`。
- **SQL 注入防護**: 儘量使用參數化查詢（Prepared Statements）。

### 4. 錯誤處理
- 使用 NestJS 內建的 `HttpException` 或其子類（如 `ForbiddenException`）來處理工具內部的錯誤。
- 所有的資料庫操作應有適當的 `try-catch` 區塊並記錄日誌。

### 5. 日誌規範
- 使用 NestJS 的 `Logger` 類別進行日誌記錄。
- 敏感資訊（如密碼、私密內容）嚴禁記錄於日誌中。

---

## 檔案結構概覽

- `src/main.ts`: 應用程式進入點，初始化 Nest 應用與 MCP 傳輸層。
- `src/mysql/`: 核心資料庫模組。
    - `mysql.service.ts`: 資料庫連接池與查詢執行邏輯。
    - `permission.guard.ts`: SQL 操作類別偵測與權限驗證。
    - `tools/`: 定義所有 MCP 工具（如 `execute_query`, `describe_table` 等）。
- `openspec/`: 存放 OpenSpec 相關的變更提案與設計文件。
- `test/`: 存放整合測試與 E2E 測試。
