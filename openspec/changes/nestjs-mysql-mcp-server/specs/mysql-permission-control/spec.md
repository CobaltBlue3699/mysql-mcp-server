## ADDED Requirements

### Requirement: Granular Permission Control

The system SHALL support granular permission control for each SQL operation type via environment variables.

#### Scenario: Default permissions (read-only safe)

- **WHEN** no permission variables are set
- **THEN** `ALLOW_SELECT=true`, `ALLOW_VIEW=true` by default
- **AND** `ALLOW_INSERT=false`, `ALLOW_UPDATE=false`, `ALLOW_DELETE=false`, `ALLOW_DDL=false` by default

#### Scenario: Enable INSERT only

- **WHEN** `ALLOW_INSERT=true` and other write permissions are `false`
- **THEN** system SHALL allow INSERT operations
- **AND** block UPDATE, DELETE, DDL operations

#### Scenario: Enable SELECT and DDL for admin

- **WHEN** `ALLOW_SELECT=true` and `ALLOW_DDL=true`
- **THEN** system SHALL allow SELECT and DDL operations
- **AND** block INSERT, UPDATE, DELETE operations

### Requirement: Permission Enforcement

The system SHALL enforce operation permissions before executing queries.

#### Scenario: Block UPDATE when ALLOW_UPDATE=false

- **WHEN** `ALLOW_UPDATE=false` and user executes `UPDATE users SET name = 'new' WHERE id = 1`
- **THEN** system SHALL return error "UPDATE operation not allowed (ALLOW_UPDATE=false)"

#### Scenario: Block DELETE when ALLOW_DELETE=false

- **WHEN** `ALLOW_DELETE=false` and user executes `DELETE FROM users WHERE id = 1`
- **THEN** system SHALL return error "DELETE operation not allowed (ALLOW_DELETE=false)"

#### Scenario: Block DDL when ALLOW_DDL=false

- **WHEN** `ALLOW_DDL=false` and user executes `DROP TABLE users`
- **THEN** system SHALL return error "DDL operation not allowed (ALLOW_DDL=false)"

### Requirement: SELECT Queries Allowed by Default

The system SHALL allow SELECT queries when `ALLOW_SELECT` is not explicitly disabled.

#### Scenario: Allow SELECT when ALLOW_SELECT=true

- **WHEN** `ALLOW_SELECT=true` and user executes `SELECT * FROM users`
- **THEN** system SHALL execute the query
- **AND** return results normally

#### Scenario: Block SELECT when ALLOW_SELECT=false

- **WHEN** `ALLOW_SELECT=false` and user executes `SELECT * FROM users`
- **THEN** system SHALL return error "SELECT operation not allowed (ALLOW_SELECT=false)"

### Requirement: Operation Type Detection

The system SHALL detect SQL operation type case-insensitively.

#### Scenario: Case insensitive detection

- **WHEN** user executes `drop table users` with `ALLOW_DDL=false`
- **THEN** system SHALL detect lowercase keyword
- **AND** block the operation

#### Scenario: Detect embedded operations

- **WHEN** user executes `SELECT * FROM users; DROP TABLE users;` with `ALLOW_DDL=false`
- **THEN** system SHALL detect the DDL operation
- **AND** return error before executing

### Requirement: VIEW Operations

The system SHALL handle SHOW, DESCRIBE, EXPLAIN as VIEW operations controlled by `ALLOW_VIEW`.

#### Scenario: Allow DESCRIBE in VIEW mode

- **WHEN** `ALLOW_VIEW=true` and user executes `DESCRIBE users`
- **THEN** system SHALL execute the query
- **AND** return table structure

#### Scenario: Block DESCRIBE when ALLOW_VIEW=false

- **WHEN** `ALLOW_VIEW=false` and user executes `DESCRIBE users`
- **THEN** system SHALL return error "VIEW operation not allowed (ALLOW_VIEW=false)"
