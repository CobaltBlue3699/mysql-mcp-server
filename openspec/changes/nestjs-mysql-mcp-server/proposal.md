## Why

MySQL MCP Server 是一個基於 Model Context Protocol (MCP) 的服務，讓 AI agents 能夠安全地探索和查詢 MySQL 資料庫。需要使用 NestJS 框架配合 MCP-Nest 庫來實作，確保生產級的穩定性、可測試性和可擴展性。

此專案需支援：

- 透過環境變數設定資料庫連線
- Schema Only 模式（僅暴露結構，不含實際資料）
- Read Only 模式（唯讀存取，防止資料修改）
- 連線池優化以支援多客戶端同時連線

## What Changes

建立一個全新的 mysql-mcp-server 專案，包含：

1. **NestJS + MCP-Nest 整合**
   - 使用 `@rekog/mcp-nest` 實作 MCP 協議
   - 使用 `@Tool` decorator 宣告式定義 tools
   - 支援 STDIO 傳輸（本地模式）

2. **環境變數驅動的資料庫設定**
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `DRY_RUN=true` - 執行查詢但不返回實際資料，讓 LLM 驗證語法
   - 細粒度權限控制：
     - `ALLOW_SELECT=true|false` - 允許 SELECT (預設 true)
     - `ALLOW_VIEW=true|false` - 允許 SHOW, DESCRIBE (預設 true)
     - `ALLOW_INSERT=true|false` - 允許 INSERT (預設 false)
     - `ALLOW_UPDATE=true|false` - 允許 UPDATE (預設 false)
     - `ALLOW_DELETE=true|false` - 允許 DELETE (預設 false)
     - `ALLOW_DDL=true|false` - 允許 CREATE/ALTER/DROP/TRUNCATE (預設 false)

3. **MySQL 連線池管理**
   - 使用 mysql2 的連線池
   - 可配置的池大小（`DB_POOL_MIN`, `DB_POOL_MAX`）
   - 連線健康檢查和自動重連
   - 優雅關閉（SIGTERM/SIGINT 清理連線池）

4. **傳輸方式配置**
   - `MCP_TRANSPORT`: `stdio`（預設）| `http-sse` | `streamable-http`
   - `MCP_HOST`: HTTP 模式綁定位址（預設 `0.0.0.0`）
   - `MCP_PORT`: HTTP 模式埠號（預設 `3000`）

5. **日誌設定**
   - `LOG_LEVEL`: `debug` | `info` | `warn` | `error`（預設 `info`）
   - `LOG_DIR`: 日誌目錄（預設 `./logs`）

6. **MCP Tools 實作**
   - `list_tables` - 列出所有表格
   - `describe_table` - 取得表格結構
   - `execute_query` - 執行 SELECT 查詢（唯讀）
   - `list_databases` - 列出可用資料庫

## Capabilities

### New Capabilities

- `mysql-connection-pool`: MySQL 連線池管理，包含連線設定、生命週期管理、健康檢查
- `mysql-mcp-server`: MCP Server 主體，處理 protocol 握手、tools 註冊、請求路由
- `mysql-tools`: MCP Tools 實作，包含 list_tables, describe_table, execute_query
- `mysql-dry-run`: DRY_RUN 模式實作，讓 LLM 驗證查詢語法而不暴露資料
- `mysql-permission-control`: 細粒度權限控制，ALLOW_SELECT/INSERT/UPDATE/DELETE/DDL/VIEW

## Impact

- **新目錄**: `src/mysql/` - MySQL 相關模組
- **新設定檔**: `.env.example` - 環境變數範例
- **依賴**: `@rekog/mcp-nest`, `@modelcontextprotocol/sdk`, `mysql2`, `zod@^4`, `@nestjs/config`
