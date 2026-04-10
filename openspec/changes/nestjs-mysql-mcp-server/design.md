## Context

基於 NestJS 框架的 MySQL MCP Server，使用 `@rekog/mcp-nest` 實作 MCP 協議。目標是建立一個可配置的、安全的資料庫探索工具，支援 AI agents 透過 MCP 協議查詢 MySQL 結構和資料。

**現有環境**:

- NestJS starter 專案結構
- TypeScript 預設配置
- 已有 pnpm 作為 package manager

**Stakeholders**:

- AI agents 需要資料庫探索能力
- 資料庫管理員需要安全、可控的資料庫存取

## Goals / Non-Goals

**Goals:**

- 實作標準 MCP Server 行為（initialize, tools/list, tools/call）
- 支援多種傳輸模式：STDIO、HTTP+SSE、Streamable HTTP
- 環境變數驅動的設定
- DRY_RUN 模式和細粒度權限控制安全模式
- 高效的 MySQL 連線池管理
- 完整的 TypeScript 型別安全

**Non-Goals:**

- 資料庫遷移或 schema 修改
- 多元資料庫支援（僅 MySQL）
- Authentication/Authorization（MCP 協議外的安全由主程式負責）

## Decisions

### Decision 1: MCP-Nest 框架

**選擇**: `@rekog/mcp-nest`

**理由**:

- NestJS 原生整合，完美支援 DI
- `@Tool` decorator 宣告式定義 tools
- 多傳輸支援：STDIO、HTTP+SSE、Streamable HTTP
- Zod 參數驗證
- Guard-based 授權機制

**替代方案考慮**:

- 自行使用 `@modelcontextprotocol/sdk` → 需要自己處理 NestJS 整合

### Decision 2: mysql2 vs TypeORM

**選擇**: `mysql2` (直接驅動)

**理由**:

- 輕量，無 ORM 學習曲線
- 連線池管理簡單直接
- 適用於純粹的查詢工具

**替代方案考慮**:

- TypeORM → 過度設計，查詢工具不需要 ORM 功能
- Prisma → 同上，且 MySQL 支援較新

### Decision 3: 連線池策略

**選擇**: 基於 `mysql2/promise` 的連線池

```typescript
// 配置項
DB_POOL_MIN: number = 2; // 最小閒置連線
DB_POOL_MAX: number = 10; // 最大連線數
DB_POOL_ACQUIRE_TIMEOUT: number = 30000; // 取得連線超時
```

**理由**:

- 支援多客戶端並發
- 自動連線回收
- 可監控池狀態

### Decision 3.5: 傳輸方式配置

**選擇**: 環境變數驅動的傳輸方式

```typescript
// 配置項
MCP_TRANSPORT: 'stdio' | 'http-sse' | 'streamable-http';
MCP_HOST: string = '0.0.0.0'; // HTTP 模式綁定
MCP_PORT: number = 3000; // HTTP 模式埠號
```

**理由**:

- STDIO 預設適合本地 CLI 工具
- HTTP 模式適合遠端部署
- 單一程式支援兩種模式

### Decision 3.6: 日誌配置

**選擇**: 環境變數驅動的日誌設定

```typescript
// 配置項
LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error' = 'info';
LOG_DIR: string = './logs';
```

**理由**:

- 可動態調整日誌詳細程度
- 檔案日誌便於除錯
- 配合 NestJS Logger

### Decision 4: Module 架構 (MCP-Nest 模式)

```
src/
├── main.ts                    # 應用入口，bootstrap McpModule
├── app.module.ts              # Root module，import McpModule
└── mysql/
    ├── mysql.module.ts        # Feature module
    ├── mysql.service.ts       # 業務邏輯（connection pool 操作）
    ├── tools/
    │   ├── list-tables.tool.ts    # @Tool decorator
    │   ├── describe-table.tool.ts  # @Tool decorator
    │   └── execute-query.tool.ts   # @Tool decorator
    ├── config/
    │   └── mysql.config.ts    # 環境變數介面
    └── types/
        └── index.ts           # 共用型別
```

**理由**:

- MCP-Nest 使用 `@Tool` decorator 自動發現 tools
- NestJS DI 注入 MySqlService 到 tools
- 符合 MCP-Nest 最佳實踐

### Decision 5: 細粒度權限控制

每個操作類型都有獨立的環境變數控制：

| 環境變數       | 預設值  | 說明                               |
| -------------- | ------- | ---------------------------------- |
| `ALLOW_SELECT` | `true`  | 允許 SELECT 查詢                   |
| `ALLOW_VIEW`   | `true`  | 允許 SHOW, DESCRIBE                |
| `ALLOW_INSERT` | `false` | 允許 INSERT                        |
| `ALLOW_UPDATE` | `false` | 允許 UPDATE                        |
| `ALLOW_DELETE` | `false` | 允許 DELETE                        |
| `ALLOW_DDL`    | `false` | 允許 CREATE, ALTER, DROP, TRUNCATE |

**實作方式**:

```typescript
// 工具級別裝飾器
@Tool({
  name: 'execute_query',
  description: 'Execute SQL query',
  authorizedOperations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], // 動態過濾
})
```

**DRY_RUN 模式** (`DRY_RUN=true`):

```typescript
// 執行查詢但標記為 DRY_RUN
if (config.dryRun) {
  const dryRunResult = {
    columns: result.columns,
    rows: null, // 不返回實際資料
    rowCount: result.rowCount,
    dryRun: true, // 標記為 DRY_RUN
    message: 'DRY_RUN mode: Query validated but data not returned',
  };
  return dryRunResult;
}
```

**用途**：

- 讓 LLM 驗證 SQL 語法正確性
- 確認查詢返回哪些列
- 驗證 JOIN、GROUP BY 等複雜語法
- 不暴露實際資料

**細粒度權限實作**:

```typescript
// 解析 SQL 語句類型
const OPERATION_PATTERNS = {
  SELECT: /\bSELECT\b/i,
  INSERT: /\bINSERT\b/i,
  UPDATE: /\bUPDATE\b/i,
  DELETE: /\bDELETE\b/i,
  DDL: /\b(CREATE|ALTER|DROP|TRUNCATE)\b/i,
  VIEW: /\b(SHOW|DESCRIBE|EXPLAIN)\b/i,
};

// 權限檢查
const operation = detectOperation(query);
if (!config[`ALLOW_${operation}`]) {
  throw new ForbiddenException(
    `${operation} not allowed (ALLOW_${operation}=false)`,
  );
}
```

## Risks / Trade-offs

| Risk                 | Mitigation                                        |
| -------------------- | ------------------------------------------------- |
| 連線池耗盡           | 設定 `DB_POOL_ACQUIRE_TIMEOUT`，監控池使用        |
| SQL Injection        | 參數化查詢，不拼接用戶輸入到 SQL                  |
| 權限模式被繞過       | 正規表示式檢查 query，並使用 MySQL 使用者權限限制 |
| DRY_RUN 模式資料洩漏 | 確認模式實作了結果過濾                            |
| 長時間查詢佔用連線   | 設定 `DB_QUERY_TIMEOUT`                           |

## Open Questions

（所有關鍵設計已確認）
