# API Query Parameters

The Database Querying API supports the following query parameters:

## Sorting
- `sort`: Sort by fields
    - Format: `field:direction`
    - Multiple sorts: `field1:asc,field2:desc`
    - Example: `sort=lastName:asc,createdAt:desc`

## Field Selection
- `fields`: Select specific fields to return
    - Format: comma-separated field names
    - Example: `fields=name,email,age`

## Filtering
- Simple equality: `field=value`
    - Example: `status=active`

- Comparison operators:
    - `field_gt`: Greater than
    - `field_gte`: Greater than or equal
    - `field_lt`: Less than
    - `field_lte`: Less than or equal
    - `field_ne`: Not equal
    - Example: `age_gt=20&age_lt=30`

- Array operators:
    - `field_in`: In array of values
    - `field_nin`: Not in array of values
    - Example: `tags_in=javascript,mongodb`

- Text search:
    - `field_regex`: Regular expression match
    - `field_options`: Regex options (default: 'i' for case-insensitive)
    - Example: `name_regex=john`