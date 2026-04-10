---
<p align="center">
<img src="https://img.shields.io/npm/v/@johnson.lee/mysql-mcp-server?style=flat&label=npm" alt="npm version">
<img src="https://img.shields.io/npm/l/@johnson.lee/mysql-mcp-server" alt="license MIT">
</p>
</p>
---

# MySQL MCP Server

基於 NestJS 和 MCP-Nest 建構的 MySQL Model Context Protocol (MCP) 伺服器。讓 AI 助理（如 Claude 和 Cursor）透過標準化協定與 MySQL 資料庫互動。

[English](./README.md) · [繁體中文](./README.zh-TW.md)

---

## 概述

MySQL MCP Server 將 MySQL 資料庫操作暴露為 MCP 工具，讓 AI 助理能夠：

- 查詢和探索資料庫結構
- 執行帶有權限控制的 SQL 查詢
- 列出表格、描述表格結構和瀏覽資料庫
- 支援多種傳輸模式（stdio、HTTP SSE、Streamable HTTP）

## 功能特點

|                  | 說明                                                             |
| ---------------- | ---------------------------------------------------------------- |
| **連線池**       | 高效的 MySQL 連線管理，可設定連線池大小                          |
| **權限控制**     | 細粒度的 SQL 操作權限管理（SELECT、INSERT、UPDATE、DELETE、DDL） |
| **DRY_RUN 模式** | 驗證 SQL 查詢但不返回實際資料                                    |
| **MCP 工具**     | 透過 Model Context Protocol 暴露標準化的資料庫操作               |
| **優雅關閉**     | 程序終止時完善清理資源                                           |
| **檔案日誌**     | 可設定的日誌輸出，支援輪轉                                       |

## 環境需求

- Node.js 18+
- MySQL 5.7+ 資料庫
- npm 或 pnpm 套件管理器

## 安裝

```bash
# 全域安裝（推薦）
npm install -g @johnson.lee/mysql-mcp-server

# 或使用 npx
npx @johnson.lee/mysql-mcp-server
```

## 快速開始

```bash
# 設定環境變數
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=your_database

# 啟動伺服器
mysql-mcp
```

## 設定

透過環境變數設定：

### 資料庫連線

| 變數          | 預設值    | 說明         |
| ------------- | --------- | ------------ |
| `DB_HOST`     | localhost | MySQL 主機   |
| `DB_PORT`     | 3306      | MySQL 連接埠 |
| `DB_USER`     | root      | MySQL 使用者 |
| `DB_PASSWORD` | -         | MySQL 密碼   |
| `DB_NAME`     | test_db   | 資料庫名稱   |
| `DB_POOL_MIN` | 2         | 最小連線數   |
| `DB_POOL_MAX` | 10        | 最大連線數   |

### 權限控制

| 變數           | 預設值 | 說明                            |
| -------------- | ------ | ------------------------------- |
| `ALLOW_SELECT` | true   | 允許 SELECT 查詢                |
| `ALLOW_VIEW`   | true   | 允許 SHOW / DESCRIBE            |
| `ALLOW_INSERT` | false  | 允許 INSERT                     |
| `ALLOW_UPDATE` | false  | 允許 UPDATE                     |
| `ALLOW_DELETE` | false  | 允許 DELETE                     |
| `ALLOW_DDL`    | false  | 允許 CREATE/ALTER/DROP/TRUNCATE |

### 伺服器選項

| 變數            | 預設值 | 說明                                     |
| --------------- | ------ | ---------------------------------------- |
| `MCP_TRANSPORT` | stdio  | 傳輸模式：stdio/http-sse/streamable-http |
| `LOG_LEVEL`     | info   | 日誌等級：debug/info/warn/error          |
| `LOG_DIR`       | ./logs | 日誌目錄                                 |
| `DRY_RUN`       | false  | 驗證 SQL 但不返回資料                    |

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

列出 MySQL 伺服器上所有可用的資料庫。

---

由 [NestJS](https://nestjs.com) 和 [MCP-Nest](https://github.com/rekog/mcp-nest) 建構
