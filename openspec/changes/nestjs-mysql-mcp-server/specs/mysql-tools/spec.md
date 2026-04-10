## ADDED Requirements

### Requirement: List Tables Tool

The system SHALL provide a tool to list all tables in the connected database.

#### Scenario: List all tables successfully

- **WHEN** user calls `list_tables` tool with no arguments
- **THEN** system SHALL return array of table names
- **AND** each entry SHALL include table name and approximate row count

#### Scenario: List tables from specific database

- **WHEN** user calls `list_tables` tool with `database` argument
- **THEN** system SHALL return tables from specified database
- **AND** filter results to only include tables from that database

### Requirement: Describe Table Tool

The system SHALL provide a tool to get detailed table structure.

#### Scenario: Get table structure successfully

- **WHEN** user calls `describe_table` tool with `table_name`
- **THEN** system SHALL return table structure including:
  - Column name
  - Data type
  - Nullable
  - Key information (PRI, UNI, MUL)
  - Default value
  - Extra (auto_increment, etc.)

#### Scenario: Describe non-existent table

- **WHEN** user calls `describe_table` tool with non-existent table name
- **THEN** system SHALL return error message "Table not found"

### Requirement: Execute Query Tool

The system SHALL provide a tool to execute SQL SELECT queries.

#### Scenario: Execute valid SELECT query

- **WHEN** user calls `execute_query` tool with `query: "SELECT * FROM users LIMIT 10"`
- **THEN** system SHALL execute the query
- **AND** return results as JSON array
- **AND** include column metadata

#### Scenario: Execute query with parameters

- **WHEN** user calls `execute_query` tool with parameterized query
- **THEN** system SHALL use prepared statements
- **AND** safely bind parameters

#### Scenario: Query returns empty result

- **WHEN** user executes query that matches no rows
- **THEN** system SHALL return empty array with `rowCount: 0`

### Requirement: List Databases Tool

The system SHALL provide a tool to list available databases.

#### Scenario: List all accessible databases

- **WHEN** user calls `list_databases` tool
- **THEN** system SHALL return array of database names
- **AND** exclude system databases (information_schema, mysql, performance_schema, sys)

### Requirement: Query Timeout

The system SHALL enforce a timeout on query execution.

#### Scenario: Long-running query is terminated

- **WHEN** `DB_QUERY_TIMEOUT` is set to 30 seconds
- **AND** a query takes longer than 30 seconds
- **THEN** system SHALL terminate the query
- **AND** return error "Query timeout exceeded"
