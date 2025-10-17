# CSV Upload Guide for State Cost Data

## Overview
The CSV upload feature allows you to bulk update all state cost data at once. This is perfect for:
- Initial data import
- Periodic updates from external sources
- Bulk modifications across multiple states/categories
- Data migration from other systems

## CSV Template Structure

### Required Columns (Must be present)
1. **State** - The state where the cost applies
2. **Category** - The type of cost (e.g., Federal Tax, Healthcare)
3. **Item** - Specific cost item (e.g., Social Security, Health Insurance)
4. **Rate % of Wage** - Percentage of base salary (0-100)

### Optional Columns (Can be empty)
5. **Cost (USD) (Optional)** - Fixed dollar amount (if applicable)
6. **Notes (Optional)** - Additional information about the cost
7. **Source (Optional)** - Reference for the cost data

## CSV Template Example

```csv
State,Category,Item,Rate % of Wage,Cost (USD) (Optional),Notes (Optional),Source (Optional)
California,Federal Tax,Social Security,6.2,3100,Federal requirement,IRS
California,Federal Tax,Medicare,1.45,725,Federal requirement,IRS
California,Healthcare,Health Insurance,25,12500,Family coverage,HR Policy
Texas,Federal Tax,Social Security,6.2,3100,Federal requirement,IRS
Texas,Healthcare,Health Insurance,22,11000,Family coverage,HR Policy
```

## How to Use

### 1. Download Template
- Click the "Download Template" button in the admin interface
- This provides a sample CSV with the correct structure

### 2. Prepare Your Data
- Use the template as a starting point
- Ensure all required columns are present
- Fill in the data you want to update
- Leave optional columns empty if not needed

### 3. Upload CSV
- Click "Choose File" and select your CSV
- Review the preview (first 5 rows)
- Click "Upload & Update" to process

### 4. Review Results
- Success message shows summary of changes
- Check the table to see updated data
- Any errors will be displayed with row numbers

## Data Validation Rules

### Required Fields
- **State**: Must be a valid state name
- **Category**: Must be a valid cost category
- **Item**: Must be a non-empty string
- **Rate % of Wage**: Must be a number between 0 and 100

### Optional Fields
- **Cost (USD)**: If provided, must be a positive number
- **Notes**: Any text (will be trimmed)
- **Source**: Any text (will be trimmed)

### Business Rules
- Rate percentages are stored as decimal numbers (e.g., 6.2 for 6.2%)
- Cost amounts are stored as decimal numbers
- Empty optional fields are stored as NULL in the database

## Update Behavior

### Existing Records
- Records are matched by State + Category + Item combination
- If a match is found, the existing record is updated
- Rate %, Cost, Notes, and Source fields are updated

### New Records
- If no match is found, a new record is created
- A unique ID is automatically generated
- All fields are populated as provided

### Transaction Safety
- All updates are processed in a database transaction
- If any row fails, the entire upload is rolled back
- Partial updates are not allowed

## Error Handling

### Validation Errors
- Missing required headers
- Invalid file format
- Empty data rows
- Invalid data types

### Data Errors
- Missing required field values
- Invalid rate percentages (outside 0-100 range)
- Invalid cost amounts (negative numbers)

### Processing Errors
- Database connection issues
- Duplicate key violations
- Constraint violations

## Best Practices

### 1. Data Preparation
- Use the provided template
- Validate data before uploading
- Test with a small file first
- Backup existing data before major updates

### 2. File Format
- Use UTF-8 encoding
- Include header row
- Use comma as delimiter
- Handle quotes properly if needed

### 3. Content Guidelines
- Use consistent state names
- Use consistent category names
- Ensure rate percentages are reasonable
- Provide meaningful notes and sources

## Common Use Cases

### Initial Data Import
1. Export data from existing system
2. Format according to template
3. Upload and validate
4. Review and correct any errors

### Periodic Updates
1. Download current data
2. Make modifications in spreadsheet
3. Upload updated CSV
4. Verify changes in admin interface

### Data Migration
1. Map source fields to template
2. Transform data as needed
3. Validate transformed data
4. Upload and verify

## Troubleshooting

### Upload Fails
- Check file format (must be .csv)
- Verify required headers are present
- Ensure at least one data row exists
- Check file size (should be reasonable)

### Validation Errors
- Review error messages carefully
- Check row numbers in error messages
- Verify data types and ranges
- Ensure no empty required fields

### Processing Errors
- Check database connection
- Verify database permissions
- Review server logs for details
- Contact administrator if needed

## Security Considerations

### File Upload
- Only CSV files are accepted
- File size is limited
- Content is validated before processing
- No executable code is allowed

### Data Access
- Admin interface access should be restricted
- Database operations use parameterized queries
- Input validation prevents injection attacks
- Transaction rollback on errors

## Performance Notes

### Upload Limits
- Large files may take time to process
- Progress indicator shows upload status
- Database transactions ensure consistency
- Memory usage scales with file size

### Optimization Tips
- Break very large files into smaller chunks
- Use consistent data formats
- Minimize optional field updates
- Process during off-peak hours

## Support

If you encounter issues:
1. Check the error messages in the interface
2. Verify your CSV format matches the template
3. Review the validation rules
4. Test with a simple, small file first
5. Contact the system administrator for technical issues
