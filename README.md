---
<p align="center">
<img src="https://img.shields.io/npm/v/@johnson.lee/mysql-mcp-server?style=flat&label=npm" alt="npm version">
<img src="https://img.shields.io/npm/l/@johnson.lee/mysql-mcp-server" alt="license MIT">
</p>
</p>
---

# MySQL MCP Server

A Model Context Protocol (MCP) server for MySQL databases, built with NestJS and MCP-Nest. Enables AI assistants like Claude and Cursor to interact with MySQL databases through a standardized protocol.

[English](./README.md) · [繁體中文](./README.zh-TW.md)

---

## Overview

MySQL MCP Server exposes MySQL database operations as MCP tools, allowing AI assistants to:

- Query and explore database schemas
- Execute SQL queries with permission controls
- List tables, describe table structures, and browse databases
- Run in multiple transport modes (stdio, HTTP SSE, Streamable HTTP)

## Features

|                        | Description                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| **Connection Pool**    | Efficient MySQL connection management with configurable pool size        |
| **Permission Control** | Granular SQL operation permissions (SELECT, INSERT, UPDATE, DELETE, DDL) |
| **DRY_RUN Mode**       | Validate SQL queries without returning actual data                       |
| **MCP Tools**          | Standardized database operations exposed via Model Context Protocol      |
| **Graceful Shutdown**  | Clean resource cleanup on process termination                            |
| **File Logging**       | Configurable log output with rotation support                            |

## Prerequisites

- Node.js 18+
- MySQL 5.7+ database
- npm or pnpm package manager

## Installation

```bash
# Global installation (recommended)
npm install -g @johnson.lee/mysql-mcp-server

# Or use npx
npx @johnson.lee/mysql-mcp-server
```

## Quick Start

```bash
# Set environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=your_database

# Run the server
mysql-mcp
```

## Configuration

Configure via environment variables:

### Database Connection

| Variable      | Default   | Description          |
| ------------- | --------- | -------------------- |
| `DB_HOST`     | localhost | MySQL host           |
| `DB_PORT`     | 3306      | MySQL port           |
| `DB_USER`     | root      | MySQL user           |
| `DB_PASSWORD` | -         | MySQL password       |
| `DB_NAME`     | test_db   | Database name        |
| `DB_POOL_MIN` | 2         | Min pool connections |
| `DB_POOL_MAX` | 10        | Max pool connections |

### Permission Control

| Variable       | Default | Description                      |
| -------------- | ------- | -------------------------------- |
| `ALLOW_SELECT` | true    | Allow SELECT queries             |
| `ALLOW_VIEW`   | true    | Allow SHOW / DESCRIBE            |
| `ALLOW_INSERT` | false   | Allow INSERT                     |
| `ALLOW_UPDATE` | false   | Allow UPDATE                     |
| `ALLOW_DELETE` | false   | Allow DELETE                     |
| `ALLOW_DDL`    | false   | Allow CREATE/ALTER/DROP/TRUNCATE |

### Server Options

| Variable        | Default | Description                               |
| --------------- | ------- | ----------------------------------------- |
| `MCP_TRANSPORT` | stdio   | Transport: stdio/http-sse/streamable-http |
| `LOG_LEVEL`     | info    | Log level: debug/info/warn/error          |
| `LOG_DIR`       | ./logs  | Log directory                             |
| `DRY_RUN`       | false   | Validate SQL without returning data       |

## Editor Integration

### Claude Desktop

Edit `~/.config/claude/claude_desktop_config.json`:

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

Create `.cursor/mcp.json`:

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

## Available Tools

### list_tables

List all tables in the current database.

### describe_table

Get table structure (columns, types, keys, etc.).

```json
{
  "name": "describe_table",
  "arguments": { "tableName": "users" }
}
```

### execute_query

Execute SQL queries.

```json
{
  "name": "execute_query",
  "arguments": { "sql": "SELECT * FROM users LIMIT 10" }
}
```

### list_databases

List all available databases on the MySQL server.

---

Built with [NestJS](https://nestjs.com) and [MCP-Nest](https://github.com/rekog/mcp-nest)
