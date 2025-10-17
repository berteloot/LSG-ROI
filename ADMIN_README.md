# Admin Section Documentation

## Overview
The admin section provides a comprehensive interface for managing state-specific cost data used in the ROI calculator. This includes payroll taxes, benefits, administrative costs, and other employer expenses.

## Access
Navigate to `/admin` in your application to access the admin panel.

## Features

### 1. Data Display
- **Table View**: Shows all state cost data in an organized table format
- **Columns**: State, Category, Item, Rate % of Wage, Cost (USD), Notes, Source
- **Sorting**: Data is automatically sorted by State → Category → Item

### 2. Search and Filtering
- **Global Search**: Search across all fields (state, category, item, notes, source)
- **State Filter**: Filter by specific state
- **Category Filter**: Filter by cost category
- **Clear Filters**: Reset all filters with one click

### 3. Data Management
- **Add New Items**: Create new cost entries with the "Add New Item" button
- **Edit Existing Items**: Click the edit icon to modify any field
- **Delete Items**: Remove entries with confirmation dialog
- **Save Changes**: Save edits with the save button
- **Cancel Edits**: Revert changes with the cancel button

### 4. Column Management
- **Toggle Optional Columns**: Show/hide Cost, Notes, and Source columns
- **Responsive Design**: Table adapts to different screen sizes

## Data Structure

### Required Fields
- **State**: The state where the cost applies
- **Category**: The type of cost (e.g., Federal Tax, Healthcare)
- **Item**: Specific cost item (e.g., Social Security, Health Insurance)
- **Rate % of Wage**: Percentage of base salary this cost represents

### Optional Fields
- **Cost (USD)**: Fixed dollar amount (if applicable)
- **Notes**: Additional information about the cost
- **Source**: Reference for the cost data (e.g., IRS, HR Policy)

## Predefined Categories
The system includes common cost categories:
- Federal Tax (Social Security, Medicare, FUTA)
- State Tax (SUTA, State Disability, State Income Tax)
- Healthcare (Health, Dental, Vision Insurance)
- Retirement (401(k), Pension, Profit Sharing)
- Paid Time Off (Vacation, Sick Leave, Holidays)
- Insurance & Protection (Life, Disability, Workers Comp)
- Administrative (Recruitment, Payroll, Legal)
- IT Infrastructure (Computers, Software, Cloud)
- Real Estate (Office Rent, Utilities, Maintenance)
- Workforce Management (Training, QA, Supervision)

## Usage Tips

### Adding New Data
1. Click "Add New Item"
2. Select State from dropdown
3. Choose Category from dropdown
4. Select Item from predefined options or type custom
5. Enter Rate % of Wage
6. Optionally add Cost, Notes, and Source
7. Click Save

### Editing Data
1. Click the edit icon (pencil) on any row
2. Modify the desired fields
3. Click Save to confirm or X to cancel

### Finding Data
1. Use the search bar for quick text search
2. Apply state/category filters for targeted results
3. Clear filters to see all data again

## API Endpoints

- `GET /api/admin/state-costs` - Fetch all state cost data
- `POST /api/admin/state-costs` - Create new cost entry
- `PUT /api/admin/state-costs/[id]` - Update existing entry
- `DELETE /api/admin/state-costs/[id]` - Delete entry

## Security Considerations

- This admin interface should be protected with appropriate authentication
- Consider implementing role-based access control
- Audit logging for data changes is recommended
- Validate all input data to prevent injection attacks

## Data Validation

The system validates:
- Required fields are not empty
- Rate percentages are valid numbers
- Cost amounts are valid numbers
- State names match predefined list
- Category names match predefined list

## Error Handling

- Network errors are displayed with retry options
- Validation errors show specific field requirements
- Database errors are logged and user-friendly messages displayed
- Confirmation dialogs prevent accidental deletions
