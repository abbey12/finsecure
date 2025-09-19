# FinSecure Frontend

A modern React-based frontend for the FinSecure financial security platform. This application provides a comprehensive interface for monitoring transactions, managing alerts, and configuring security rules with role-based access control.

## Features

- **Modern UI/UX**: Built with React 18, TypeScript, and Tailwind CSS
- **Authentication**: Secure login with MFA support
- **Role-Based Access**: Different dashboards and features for Regular Users, Analysts, and Administrators
- **Dashboard**: Real-time statistics and charts (role-specific)
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Live data updates and notifications

## User Roles

### Regular User
- **Dashboard**: Personal transaction monitoring and security status
- **Profile**: Account settings and security preferences
- **Transactions**: View personal transaction history
- **Alerts**: Personal security alerts and notifications

### Analyst
- **Dashboard**: System-wide statistics and monitoring
- **Transactions**: Monitor and analyze all transactions
- **Alerts**: Manage and respond to security alerts
- **Users**: View user information and behavior profiles

### Administrator
- **Dashboard**: Comprehensive system overview
- **Transactions**: Full transaction management
- **Alerts**: Complete alert management system
- **Users**: User management and account administration
- **Rules**: Security rule configuration
- **Analytics**: Advanced analytics and reporting

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Headless UI** - Accessible components
- **Heroicons** - Icons

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finsecure-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Testing Different User Roles

The application includes mock authentication that supports different user roles based on email:

- **Regular User**: Use any email (e.g., `user@example.com`)
- **Analyst**: Use email containing "analyst" (e.g., `analyst@example.com`)
- **Administrator**: Use email containing "admin" (e.g., `admin@example.com`)

For MFA verification, use any 6-digit code.

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout/         # Layout components (Header, Sidebar)
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Dashboard.tsx   # Admin/Analyst dashboard
│   ├── UserDashboard.tsx # Regular user dashboard
│   ├── UserProfile.tsx # User profile settings
│   └── Transactions.tsx # Transaction monitoring
├── services/           # API services
│   ├── api.ts         # API client and endpoints
│   └── mockData.ts    # Mock data for development
├── types/              # TypeScript type definitions
│   └── index.ts       # All type definitions
├── App.tsx            # Main app component
└── index.tsx          # App entry point
```

## Key Components

### Authentication
- **Login Page**: Email/password authentication with MFA support
- **AuthContext**: Manages authentication state across the app
- **Protected Routes**: Route protection based on authentication status
- **Role-Based Routes**: Access control based on user role

### Dashboards
- **Admin Dashboard**: System-wide statistics, charts, and monitoring
- **User Dashboard**: Personal transaction monitoring and security status
- **Statistics Cards**: Key metrics display
- **Charts**: Transaction trends and risk distribution
- **Recent Alerts**: Latest security alerts

### User Management
- **User Profile**: Personal information, security settings, device management
- **Password Management**: Secure password change with validation
- **Device Management**: View and manage trusted devices
- **Notification Preferences**: Customize alert preferences

### Layout
- **Sidebar**: Dynamic navigation menu with role-based filtering
- **Header**: Search, notifications, and user profile
- **Responsive Design**: Mobile-friendly navigation

## API Integration

The frontend communicates with the backend through RESTful APIs:

- **Authentication**: Login, MFA verification, logout
- **Dashboard**: Statistics, charts, recent alerts (role-specific)
- **Transactions**: List, details, events (filtered by role)
- **Alerts**: List, details, updates, assignment
- **Users**: Management, devices, behavior profiles
- **Rules**: Configuration and management

## Styling

The application uses Tailwind CSS with a custom design system:

- **Primary Colors**: Blue (#3B82F6) for main actions
- **Success Colors**: Green for positive states
- **Warning Colors**: Yellow for caution states
- **Danger Colors**: Red for error states
- **Custom Components**: Pre-built components for consistency

## Development

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Component-based architecture

### State Management
- React Context for global state (auth)
- Local state for component-specific data
- React Query for server state (planned)

### Testing
- Jest for unit testing
- React Testing Library for component testing
- Cypress for E2E testing (planned)

## Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
Set the following environment variables for production:

```env
REACT_APP_API_BASE_URL=https://api.finsecure.com
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
