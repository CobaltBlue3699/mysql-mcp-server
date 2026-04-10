## ADDED Requirements

### Requirement: DRY_RUN Mode Toggle

The system SHALL support a DRY_RUN mode controlled by environment variable.

#### Scenario: DRY_RUN mode disabled (default)

- **WHEN** `DRY_RUN` is not set or set to `false`
- **THEN** system SHALL return full query results including data

#### Scenario: DRY_RUN mode enabled

- **WHEN** `DRY_RUN` is set to `true`
- **THEN** system SHALL execute the query
- **AND** return column metadata
- **AND** return row count
- **BUT** `rows` SHALL be `null` or empty
- **AND** response SHALL include `dryRun: true` flag

### Requirement: DRY_RUN Response Format

The system SHALL return a structured response indicating DRY_RUN mode.

#### Scenario: Execute query in DRY_RUN mode

- **WHEN** `DRY_RUN=true` and user executes `SELECT id, name FROM users WHERE active = 1`
- **THEN** response SHALL include:
  ```json
  {
    "dryRun": true,
    "columns": ["id", "name"],
    "rowCount": 5,
    "rows": null,
    "message": "DRY_RUN mode: Query validated but data not returned. Set DRY_RUN=false to get actual data."
  }
  ```

### Requirement: DRY_RUN for LLM Validation

The system SHALL provide clear indication that DRY_RUN mode is active for LLM to validate queries.

#### Scenario: LLM receives DRY_RUN response

- **WHEN** LLM receives DRY_RUN response
- **THEN** LLM SHALL understand:
  - Query syntax is valid
  - Query returns columns (names and types)
  - Query matches N rows
  - Actual data is hidden by design

#### Scenario: Clear error messages

- **WHEN** query has syntax error in DRY_RUN mode
- **THEN** system SHALL return the MySQL error message
- **AND** dryRun flag SHALL still be `true`
- **AND** message SHALL indicate this is a validation error

### Requirement: DRY_RUN Detection

The system SHALL detect DRY_RUN mode from environment variable at startup.

#### Scenario: DRY_RUN mode change requires restart

- **WHEN** application is running with `DRY_RUN=false`
- **AND** environment variable is changed to `DRY_RUN=true`
- **THEN** system SHALL continue using previous setting
- **AND** require application restart to apply change
