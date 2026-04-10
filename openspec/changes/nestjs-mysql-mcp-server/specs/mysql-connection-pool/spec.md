## ADDED Requirements

### Requirement: MySQL Connection Pool Initialization

The system SHALL initialize a MySQL connection pool upon application startup using configuration from environment variables.

#### Scenario: Successful pool initialization with valid credentials

- **WHEN** application starts with valid `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- **THEN** system creates a connection pool with configured size
- **AND** pool is ready to acquire connections

#### Scenario: Pool initialization fails with invalid credentials

- **WHEN** application starts with invalid database credentials
- **THEN** system SHALL throw an exception with clear error message
- **AND** application exits with non-zero code

### Requirement: Configurable Pool Size

The system SHALL support configurable connection pool size via environment variables.

#### Scenario: Default pool size when not configured

- **WHEN** `DB_POOL_MIN` and `DB_POOL_MAX` are not set
- **THEN** system SHALL use default values of `DB_POOL_MIN=2` and `DB_POOL_MAX=10`

#### Scenario: Custom pool size when configured

- **WHEN** `DB_POOL_MIN=5` and `DB_POOL_MAX=20` are set
- **THEN** system SHALL create pool with min 5 and max 20 connections

### Requirement: Connection Health Check

The system SHALL verify connection health before executing queries.

#### Scenario: Healthy connection

- **WHEN** a query is executed on a healthy connection
- **THEN** system SHALL execute the query and return results

#### Scenario: Connection lost and reconnected

- **WHEN** connection is lost during idle
- **THEN** system SHALL automatically reconnect on next query
- **AND** query execution continues normally

### Requirement: Graceful Shutdown

The system SHALL properly close all connections when application receives shutdown signal.

#### Scenario: Graceful shutdown on SIGTERM

- **WHEN** application receives SIGTERM signal
- **THEN** system SHALL stop accepting new MCP requests
- **AND** wait for pending queries to complete (max 30 seconds)
- **AND** close all pool connections
- **AND** exit cleanly with code 0

#### Scenario: Graceful shutdown on SIGINT

- **WHEN** application receives SIGINT (Ctrl+C)
- **THEN** system SHALL perform the same cleanup as SIGTERM
- **AND** exit cleanly

#### Scenario: Shutdown timeout

- **WHEN** graceful shutdown exceeds 30 seconds
- **THEN** system SHALL force close all connections
- **AND** exit with code 1
