# Finsecure Backend API

A comprehensive backend API for the Finsecure financial security platform, specifically designed for the Ghana market with GHS currency support.

## Features

- **Ghana-Focused**: All transactions in GHS (Ghana Cedi)
- **Local Context**: Ghana merchants, cities, and regions
- **Transaction Management**: Full CRUD operations for transactions
- **User Management**: Admin, analyst, and regular user roles
- **Alert System**: Real-time fraud detection and alerting
- **Dashboard Analytics**: Comprehensive reporting and statistics
- **Security**: JWT authentication, rate limiting, input validation
- **TypeScript**: Full type safety and IntelliSense support

## Tech Stack

- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **JWT** for authentication
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for request logging
- **Rate Limiting** for API protection

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
DEFAULT_CURRENCY=GHS
DEFAULT_COUNTRY=GH
```

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Production

Build and start the production server:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - Get all transactions (with filtering and pagination)
- `GET /api/transactions/:id` - Get single transaction
- `PATCH /api/transactions/:id/decision` - Update transaction decision
- `GET /api/transactions/:id/events` - Get transaction events

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get single alert
- `PATCH /api/alerts/:id` - Update alert
- `GET /api/alerts/top/:limit` - Get top alerts

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/chart/transactions` - Get transaction chart data
- `GET /api/dashboard/chart/risk-distribution` - Get risk distribution
- `GET /api/dashboard/chart/decisions` - Get decision breakdown
- `GET /api/dashboard/chart/alerts-by-severity` - Get alerts by severity
- `GET /api/dashboard/recent-activity` - Get recent activity

## Ghana-Specific Features

### Currency
- All amounts are in GHS (Ghana Cedi)
- Proper currency formatting for Ghana locale
- Realistic GHS amounts for local market

### Locations
- Ghana cities: Accra, Kumasi, Takoradi
- Ghana regions: Greater Accra, Ashanti, Western
- Accurate GPS coordinates for Ghana locations

### Merchants
- Local Ghana businesses: Shoprite Ghana, KFC Ghana, Melcom Ghana
- Realistic transaction patterns for Ghana market

## Health Check

The API includes a health check endpoint:
```
GET /health
```

Returns server status, environment info, and configuration.

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Validation errors if applicable
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **Input Validation**: All inputs validated and sanitized
- **JWT Authentication**: Secure token-based auth

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run build:watch` - Build with file watching
- `npm run clean` - Clean build directory
- `npm start` - Start production server

## License

ISC
