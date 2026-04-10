## 1. Project Setup

- [ ] 1.1 Install dependencies: `@rekog/mcp-nest`, `@modelcontextprotocol/sdk`, `mysql2`, `zod@^4`, `@nestjs/config`
- [ ] 1.2 Create `.env.example` with all configuration variables (DB, pool, permissions, transport, logging)
- [ ] 1.3 Configure TypeScript path aliases for cleaner imports

## 2. MySQL Module Structure

- [ ] 2.1 Create `src/mysql/` directory structure
- [ ] 2.2 Create `src/mysql/config/mysql.config.ts` with environment variable interfaces
- [ ] 2.3 Create `src/mysql/types/index.ts` with shared TypeScript types

## 3. Connection Pool Implementation

- [ ] 3.1 Implement `src/mysql/mysql.service.ts` with mysql2 pool
- [ ] 3.2 Add configurable pool size from environment variables
- [ ] 3.3 Implement connection health check
- [ ] 3.4 Register in `src/mysql/mysql.module.ts`

## 4. MCP-Nest Integration

- [ ] 4.1 Configure `McpModule.forRoot()` with environment variable driven transport
- [ ] 4.2 Implement STDIO/HTTP-SSE/Streamable-HTTP transport switching via `MCP_TRANSPORT`
- [ ] 4.3 Set server name and version
- [ ] 4.4 Import MySqlModule into McpModule

## 5. Graceful Shutdown

- [ ] 5.1 Register shutdown hooks in NestJS
- [ ] 5.2 Stop MCP server accepting new requests
- [ ] 5.3 Wait for pending queries (max 30 seconds timeout)
- [ ] 5.4 Close all pool connections
- [ ] 5.5 Force close on timeout

## 6. Logging Configuration

- [ ] 6.1 Implement LOG_LEVEL environment variable support
- [ ] 6.2 Implement LOG_DIR environment variable support
- [ ] 6.3 Configure NestJS logger with file output
- [ ] 6.4 Add structured logging for MCP operations

## 7. Tools Implementation (@Tool Decorator)

- [ ] 7.1 Create `src/mysql/tools/list-tables.tool.ts` with `@Tool` decorator
- [ ] 7.2 Create `src/mysql/tools/describe-table.tool.ts` with `@Tool` decorator
- [ ] 7.3 Create `src/mysql/tools/execute-query.tool.ts` with `@Tool` decorator and Zod validation
- [ ] 7.4 Create `src/mysql/tools/list-databases.tool.ts` with `@Tool` decorator
- [ ] 7.5 Inject MySqlService into tools via constructor
- [ ] 7.6 Add query timeout support

## 8. DRY_RUN Mode

- [ ] 8.1 Add `DRY_RUN` environment variable to config
- [ ] 8.2 Inject config into tools and check mode
- [ ] 8.3 Modify `execute_query` to return columns + rowCount + dryRun flag, but rows=null
- [ ] 8.4 Add clear message indicating DRY_RUN mode to LLM

## 9. Granular Permission Control

- [ ] 9.1 Add permission environment variables to config: ALLOW_SELECT, ALLOW_VIEW, ALLOW_INSERT, ALLOW_UPDATE, ALLOW_DELETE, ALLOW_DDL
- [ ] 9.2 Implement SQL operation type detector (parse first keyword)
- [ ] 9.3 Create permission guard service
- [ ] 9.4 Integrate permission check into execute_query tool
- [ ] 9.5 Return clear error messages: "{OPERATION} not allowed (ALLOW\_{OPERATION}=false)"

## 10. Application Bootstrap

- [ ] 10.1 Update `src/main.ts` to bootstrap NestJS with McpModule
- [ ] 10.2 Add environment validation on startup

## 11. Testing

- [ ] 11.1 Create unit tests for `mysql.service.ts`
- [ ] 11.2 Create unit tests for each @Tool
- [ ] 11.3 Create integration tests for Schema Only mode
- [ ] 11.4 Create integration tests for Permission Control mode
