## 1. Project Setup

- [x] 1.1 Install dependencies: `@rekog/mcp-nest`, `@modelcontextprotocol/sdk`, `mysql2`, `zod@^4`, `@nestjs/config`
- [x] 1.2 Create `.env.example` with all configuration variables (DB, pool, permissions, transport, logging)
- [x] 1.3 Configure TypeScript path aliases for cleaner imports

## 2. MySQL Module Structure

- [x] 2.1 Create `src/mysql/` directory structure
- [x] 2.2 Create `src/mysql/config/mysql.config.ts` with environment variable interfaces
- [x] 2.3 Create `src/mysql/types/index.ts` with shared TypeScript types

## 3. Connection Pool Implementation

- [x] 3.1 Implement `src/mysql/mysql.service.ts` with mysql2 pool
- [x] 3.2 Add configurable pool size from environment variables
- [x] 3.3 Implement connection health check
- [x] 3.4 Register in `src/mysql/mysql.module.ts`

## 4. MCP-Nest Integration

- [x] 4.1 Configure `McpModule.forRoot()` with environment variable driven transport
- [x] 4.2 Implement STDIO/HTTP-SSE/Streamable-HTTP transport switching via `MCP_TRANSPORT`
- [x] 4.3 Set server name and version
- [x] 4.4 Import MySqlModule into McpModule

## 5. Graceful Shutdown

- [x] 5.1 Register shutdown hooks in NestJS
- [x] 5.2 Stop MCP server accepting new requests
- [x] 5.3 Wait for pending queries (max 30 seconds timeout)
- [x] 5.4 Close all pool connections
- [x] 5.5 Force close on timeout

## 6. Logging Configuration

- [x] 6.1 Implement LOG_LEVEL environment variable support
- [x] 6.2 Implement LOG_DIR environment variable support
- [x] 6.3 Configure NestJS logger with file output
- [x] 6.4 Add structured logging for MCP operations

## 7. Tools Implementation (@Tool Decorator)

- [x] 7.1 Create `src/mysql/tools/list-tables.tool.ts` with `@Tool` decorator
- [x] 7.2 Create `src/mysql/tools/describe-table.tool.ts` with `@Tool` decorator
- [x] 7.3 Create `src/mysql/tools/execute-query.tool.ts` with `@Tool` decorator and Zod validation
- [x] 7.4 Create `src/mysql/tools/list-databases.tool.ts` with `@Tool` decorator
- [x] 7.5 Inject MySqlService into tools via constructor
- [x] 7.6 Add query timeout support

## 8. DRY_RUN Mode

- [x] 8.1 Add `DRY_RUN` environment variable to config
- [x] 8.2 Inject config into tools and check mode
- [x] 8.3 Modify `execute_query` to return columns + rowCount + dryRun flag, but rows=null
- [x] 8.4 Add clear message indicating DRY_RUN mode to LLM

## 9. Granular Permission Control

- [x] 9.1 Add permission environment variables to config: ALLOW_SELECT, ALLOW_VIEW, ALLOW_INSERT, ALLOW_UPDATE, ALLOW_DELETE, ALLOW_DDL
- [x] 9.2 Implement SQL operation type detector (parse first keyword)
- [x] 9.3 Create permission guard service
- [x] 9.4 Integrate permission check into execute_query tool
- [x] 9.5 Return clear error messages: "{OPERATION} not allowed (ALLOW\_{OPERATION}=false)"

## 10. Application Bootstrap

- [x] 10.1 Update `src/main.ts` to bootstrap NestJS with McpModule
- [x] 10.2 Add environment validation on startup

## 11. Testing

- [x] 11.1 Create unit tests for `mysql.service.ts`
- [x] 11.2 Create unit tests for each @Tool
- [x] 11.3 Create integration tests for Schema Only mode (via DRY_RUN)
- [x] 11.4 Create integration tests for Permission Control mode
