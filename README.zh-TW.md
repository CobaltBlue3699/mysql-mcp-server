# MySQL MCP Server

基於 NestJS + MCP-Nest 建構的 MySQL Model Context Protocol 伺服器。

## 功能特點

- 🔌 **連線池** - 高效的 MySQL 連線管理
- 🔒 **權限控制** - 細粒度的 SQL 操作權限管理
- 🔍 **DRY_RUN 模式** - 驗證 SQL 但不返回實際資料
- 📝 **MCP Tools** - 標準化的資料庫操作工具
- 🌲 **優雅關閉** - 完善的資源清理機制
- 📁 **檔案日誌** - 可配置的日誌輸出

## 安裝

### 全域安裝（推薦）

```bash
npm install -g @johnson.lee/mysql-mcp-server
```

### 使用 npx

```bash
npx @johnson.lee/mysql-mcp-server
```

## 設定

設定環境變數：

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=your_database
```

### 權限控制

| 變數           | 預設值  | 說明                            |
| -------------- | ------- | ------------------------------- |
| `ALLOW_SELECT` | `true`  | 允許 SELECT 查詢                |
| `ALLOW_VIEW`   | `true`  | 允許 SHOW / DESCRIBE            |
| `ALLOW_INSERT` | `false` | 允許 INSERT                     |
| `ALLOW_UPDATE` | `false` | 允許 UPDATE                     |
| `ALLOW_DELETE` | `false` | 允許 DELETE                     |
| `ALLOW_DDL`    | `false` | 允許 CREATE/ALTER/DROP/TRUNCATE |

### DRY_RUN 模式

```bash
export DRY_RUN=true
```

啟用時，`execute_query` 會返回 columns 和 rowCount，但 rows 設為 null。

## 使用方式

### 直接執行

```bash
mcp-server-mysql
```

### 使用 npx

```bash
npx @johnson.lee/mysql-mcp-server
```

## 編輯器整合

### Claude Desktop

編輯 `~/.config/claude/claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@johnson.lee/mysql-mcp-server"],
      "env": {
        "DB_HOST": "localhost",
        "DB_USER": "root",
        "DB_PASSWORD": "your_password",
        "DB_NAME": "your_database"
      }
    }
  }
}
```

### Cursor

建立 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@johnson.lee/mysql-mcp-server"],
      "env": {
        "DB_HOST": "localhost",
        "DB_USER": "root",
        "DB_PASSWORD": "your_password",
        "DB_NAME": "your_database"
      }
    }
  }
}
```

## 可用工具

### list_tables

列出目前資料庫的所有表格。

### describe_table

取得表格結構（欄位、型別、主鍵等）。

```json
{
  "name": "describe_table",
  "arguments": { "tableName": "users" }
}
```

### execute_query

執行 SQL 查詢。

```json
{
  "name": "execute_query",
  "arguments": { "sql": "SELECT * FROM users LIMIT 10" }
}
```

### list_databases

列出所有可用的資料庫。

## 環境變數

| 變數            | 預設值      | 說明                                     |
| --------------- | ----------- | ---------------------------------------- |
| `DB_HOST`       | `localhost` | MySQL 主機                               |
| `DB_PORT`       | `3306`      | MySQL 連線埠                             |
| `DB_USER`       | `root`      | MySQL 使用者                             |
| `DB_PASSWORD`   | -           | MySQL 密碼                               |
| `DB_NAME`       | `test_db`   | 資料庫名稱                               |
| `DB_POOL_MIN`   | `2`         | 最小連線數                               |
| `DB_POOL_MAX`   | `10`        | 最大連線數                               |
| `MCP_TRANSPORT` | `stdio`     | 傳輸模式：stdio/http-sse/streamable-http |
| `LOG_LEVEL`     | `info`      | 日誌等級：debug/info/warn/error          |
| `LOG_DIR`       | `./logs`    | 日誌目錄                                 |

## 授權

MIT

---

[English](./README.md)
