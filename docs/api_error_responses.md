# Enhanced API Error Responses Documentation

## Overview

The Soccer Data Betting Club API now provides enhanced, structured error responses with detailed information to help developers understand and resolve issues quickly.

## Error Response Format

All API errors now return a consistent JSON structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "suggestion": "Actionable suggestion to fix the issue",
      "additional_field": "Context-specific information"
    },
    "timestamp": "2024-01-15T10:30:45.123456"
  }
}
```

## Error Codes and HTTP Status Codes

### Data-Related Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `DATA_NOT_FOUND` | 404 | No fixtures data files found in data/ directory |
| `EMPTY_DATA_FILE` | 404 | Data file exists but contains no data |
| `EMPTY_DATASET` | 404 | No fixtures data available in the loaded dataset |
| `DATA_PARSE_ERROR` | 422 | Unable to parse CSV data file format |
| `MISSING_DATA_FIELD` | 422 | Expected data field (like 'league', 'date') is missing |
| `DATE_PARSING_ERROR` | 422 | Unable to parse dates in data file |

### Request Validation Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed with field-specific errors |
| `INVALID_REQUEST_FORMAT` | 400 | Request format is invalid (malformed JSON) |
| `INVALID_DATA_VALUE` | 400 | Data contains invalid values |
| `INVALID_DATE_RANGE` | 400 | Date range is invalid (from_date after to_date) |
| `INVALID_FILENAME` | 400 | Filename contains invalid characters |

### Export-Related Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `EMPTY_EXPORT_DATA` | 400 | No fixtures provided for export |
| `EMPTY_DATAFRAME` | 400 | Fixtures data resulted in empty DataFrame |
| `DATAFRAME_CONVERSION_ERROR` | 400 | Unable to convert fixtures to DataFrame |

### File System Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `PERMISSION_DENIED` | 403 | Permission denied accessing required resources |
| `DIRECTORY_CREATE_ERROR` | 500 | Unable to create export directory |
| `FILE_WRITE_ERROR` | 500 | Unable to write export file |

### System Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected error occurred |

## Error Response Examples

### Data Not Found Error
```json
{
  "error": {
    "code": "DATA_NOT_FOUND",
    "message": "Required data files not found",
    "details": {
      "suggestion": "Run the comprehensive scraper first: python run.py comprehensive",
      "missing_files": "fixtures_*_simplified.csv files in data/ directory"
    },
    "timestamp": "2024-01-15T10:30:45.123456"
  }
}
```

### Validation Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field_errors": [
        "Field 'date_from' must be in YYYY-MM-DD format",
        "Field 'leagues' must be an array of league names"
      ],
      "suggestion": "Fix the field errors and retry the request"
    },
    "timestamp": "2024-01-15T10:30:45.123456"
  }
}
```

### Invalid Date Range Error
```json
{
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "Invalid date range: from_date cannot be after to_date",
    "details": {
      "date_from": "2024-12-01",
      "date_to": "2024-11-01",
      "suggestion": "Ensure date_from is before or equal to date_to"
    },
    "timestamp": "2024-01-15T10:30:45.123456"
  }
}
```

## Field Validation Rules

### Date Fields (`date_from`, `date_to`)
- Must be in YYYY-MM-DD format
- Must be valid calendar dates
- `date_from` must be before or equal to `date_to`

### Array Fields (`leagues`, `teams`)
- Must be arrays/lists
- Can be empty arrays
- Invalid values are logged but don't cause errors

### Export Fields
- `fixtures`: Required array of fixture objects
- `filename`: Optional string with alphanumeric characters, spaces, dots, and dashes only

## Backwards Compatibility

The enhanced error responses maintain backwards compatibility:
- All errors still return JSON format
- HTTP status codes remain appropriate
- The `error` field structure is new but doesn't break existing parsers
- Legacy endpoints continue to work with informative deprecation messages

## Logging

All errors are logged with:
- Function name where the error occurred
- Full error details
- Stack traces for unexpected errors
- Request context for debugging

## Client Implementation Guidelines

### Error Handling
```javascript
async function handleApiResponse(response) {
  if (!response.ok) {
    const errorData = await response.json();
    const error = errorData.error;
    
    // Display user-friendly message
    console.error(`${error.code}: ${error.message}`);
    
    // Show suggestion if available
    if (error.details.suggestion) {
      console.info(`Suggestion: ${error.details.suggestion}`);
    }
    
    // Handle specific error codes
    switch (error.code) {
      case 'DATA_NOT_FOUND':
        // Show message to run scraper
        break;
      case 'VALIDATION_ERROR':
        // Highlight invalid fields
        if (error.details.field_errors) {
          error.details.field_errors.forEach(fieldError => {
            console.warn(fieldError);
          });
        }
        break;
      default:
        // Generic error handling
    }
  }
}
```

### Retry Logic
```javascript
async function apiCallWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      
      const errorData = await response.json();
      const error = errorData.error;
      
      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${error.message}`);
      }
      
      // Retry server errors (5xx) with backoff
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
      
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

## Testing Error Responses

Use the included test script to verify error handling components:

```bash
python3 test_api_errors.py
```

This tests:
- Error response structure
- Filename validation rules
- Date format validation
- Field validation logic
