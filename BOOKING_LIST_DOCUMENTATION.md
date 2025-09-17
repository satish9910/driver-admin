# Booking List Page - Advanced Booking Management

This document describes the new advanced booking list page that implements the enhanced API endpoint with filtering, pagination, and status management features.

## Features

### 1. **Advanced Filtering**
- **Settlement Status**: Filter by settled/pending bookings
- **Driver Selection**: Filter by specific driver
- **Booking Status**: Filter by booking status (0=Pending, 1=Completed, 2=In Progress)
- **Date Range**: Filter by start and end dates

### 2. **Comprehensive Display**
- **Summary Cards**: Overview of total bookings, settled bookings, pending bookings, and total settled amount
- **Detailed Table**: Shows booking ID, driver info, customer, route, dates, status, settlement status, expenses, receiving amounts, and difference
- **Color-coded Differences**: Green for positive differences, red for negative differences

### 3. **Pagination**
- Server-side pagination with configurable page sizes
- Navigation controls (First, Previous, Next, Last)
- Page info display (showing X to Y of Z bookings)

### 4. **API Integration**
The component uses the new API endpoint: `GET /api/admin/bookings`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `settled`: Filter by settlement status (true/false)
- `driverId`: Filter by specific driver ID
- `status`: Filter by booking status (0, 1, 2)
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)

**Response Structure:**
```json
{
  "success": true,
  "bookings": [
    {
      "booking": {
        "_id": "booking_id",
        "status": 1,
        "driver": { "name": "Driver Name", "drivercode": "D001" },
        "settlement": { "isSettled": true, "settlementAmount": 1000 },
        "data": [
          { "key": "Customer", "value": "John Doe" },
          { "key": "From city", "value": "Delhi" }
        ]
      },
      "dutyInfo": {
        "totalKm": 150,
        "formattedDuration": "8 hours"
      },
      "totals": {
        "expense": { "totalExpense": 2000 },
        "receiving": { "totalReceiving": 1800 },
        "difference": 200
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "summary": {
    "totalBookings": 50,
    "settledBookings": 30,
    "pendingBookings": 20,
    "totalSettledAmount": 45000
  }
}
```

## Usage

### Accessing the Page
The new booking list is available at `/booking-list` and can be accessed through the sidebar navigation under "Booking List".

### Navigation Integration
- **Route**: `/booking-list`
- **Sidebar Item**: "Booking List" 
- **Permissions**: Requires `manage_bookings` permission

### Key Components Used
- `Card`, `CardContent`, `CardHeader`, `CardTitle` - Layout containers
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` - Data display
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` - Filter dropdowns
- `Calendar`, `Popover` - Date selection
- `Badge` - Status indicators
- `Button` - Actions and navigation

### State Management
- `filters`: Current filter state including pagination
- `bookings`: Array of booking details from API
- `drivers`: List of available drivers for filtering
- `pagination`: Pagination information
- `summary`: Summary statistics

## Benefits Over Previous Implementation

1. **Server-side Processing**: All filtering and pagination handled by the backend
2. **Better Performance**: Only loads required data based on filters
3. **Rich Filtering**: Multiple filter criteria can be combined
4. **Comprehensive Data**: Shows expense, receiving, and settlement information in one view
5. **Better UX**: Clear status indicators and summary information
6. **Responsive Design**: Works well on mobile and desktop devices

## Future Enhancements

- Export functionality for filtered results
- Bulk operations (settlement, status updates)
- Real-time updates for settlement status
- Advanced search within results
- Custom column visibility controls