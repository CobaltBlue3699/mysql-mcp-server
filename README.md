# MySQL MCP Server

A Model Context Protocol server for MySQL databases, built with NestJS and MCP-Nest.

## Features

- 🔌 **Connection Pool** - Efficient MySQL connection management
- 🔒 **Permission Control** - Granular SQL operation permissions
- 🔍 **DRY_RUN Mode** - Validate SQL without returning data
- 📝 **MCP Tools** - Standardized database operations
- 🌲 **Graceful Shutdown** - Clean resource cleanup
- 📁 **File Logging** - Configurable log output

## Installation

### Global Installation (Recommended)

```bash
npm install -g @johnson.lee/mysql-mcp-server
```

### Using npx

```bash
npx @johnson.lee/mysql-mcp-server
```

## Configuration

Set environment variables:

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=your_database
```

### Permission Control

| Variable       | Default | Description                      |
| -------------- | ------- | -------------------------------- |
| `ALLOW_SELECT` | `true`  | Allow SELECT queries             |
| `ALLOW_VIEW`   | `true`  | Allow SHOW / DESCRIBE            |
| `ALLOW_INSERT` | `false` | Allow INSERT                     |
| `ALLOW_UPDATE` | `false` | Allow UPDATE                     |
| `ALLOW_DELETE` | `false` | Allow DELETE                     |
| `ALLOW_DDL`    | `false` | Allow CREATE/ALTER/DROP/TRUNCATE |

### DRY_RUN Mode

```bash
export DRY_RUN=true
```

When enabled, `execute_query` returns columns and rowCount but rows are set to null.

## Usage

### Direct Run

```bash
mcp-server-mysql
```

### Using npx

```bash
npx @johnson.lee/mysql-mcp-server
```

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

List all available databases.

## Environment Variables

| Variable        | Default     | Description                               |
| --------------- | ----------- | ----------------------------------------- |
| `DB_HOST`       | `localhost` | MySQL host                                |
| `DB_PORT`       | `3306`      | MySQL port                                |
| `DB_USER`       | `root`      | MySQL user                                |
| `DB_PASSWORD`   | -           | MySQL password                            |
| `DB_NAME`       | `test_db`   | Database name                             |
| `DB_POOL_MIN`   | `2`         | Min pool connections                      |
| `DB_POOL_MAX`   | `10`        | Max pool connections                      |
| `MCP_TRANSPORT` | `stdio`     | Transport: stdio/http-sse/streamable-http |
| `LOG_LEVEL`     | `info`      | Log level: debug/info/warn/error          |
| `LOG_DIR`       | `./logs`    | Log directory                             |

## License

MIT

---

[中文版](./README.zh-TW.md)
