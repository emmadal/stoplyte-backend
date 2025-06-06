# StopLyte Backend Service

## Overview

This is the backend service for the StopLyte platform, built with NestJS and Prisma. It provides API endpoints for the StopLyte mobile and web application which is built with Vue.js and Capacitor for cross-platform deployment.

## Technologies

- **Framework**: [NestJS](https://nestjs.com/) v11
- **ORM**: [Prisma](https://www.prisma.io/) v6.9.0
- **Authentication**: Firebase Authentication
- **Storage**: AWS S3
- **Notifications**: AWS SNS/SES
- **Database**: PostgreSQL (via Prisma)

## Project Structure

```
├── .gitignore
├── nest-cli.json
├── package.json
├── .prettierrc
├── README.md
├── tsconfig.build.json
├── tsconfig.json
├── vercel.json
│
├── prisma/                # Prisma schema and database migrations
├── src/
│   ├── accounts/          # User account management
│   ├── admin/             # Admin panel related functionality
│   ├── buyers/            # Buyer-related features
│   ├── database/          # Database connection and configuration
│   ├── decorators/        # Custom decorators
│   ├── firebase/          # Firebase authentication integration
│   ├── notifications/     # Notification services
│   ├── partners/          # Partner management
│   ├── properties/        # Property listings and management
│   ├── storage/           # File storage services
│   ├── utils/             # Utility functions
│   ├── app.module.ts      # Main application module
│   └── main.ts            # Application entry point
├── public/                # Static assets
└── test/                  # Test files
```

## Prerequisites

- Node.js (v20+)
- Yarn
- PostgreSQL database
- Firebase project
- AWS accounts for S3, SNS, and SES services

## Installation

1. Clone the repository
2. Navigate to the directory
3. Install dependencies:
   ```bash
   yarn install
   ```
4. Copy `.env.sample` to `.env` and configure the environment variables:
   ```bash
   cp .env.sample .env
   ```
5. Set up the following environment variables in the `.env` file:
   - Database connection string
   - Firebase credentials
   - AWS credentials
   - Other application-specific settings

## Database Setup

The application uses Prisma ORM to interact with the database:

```bash
# Generate Prisma client from existing database schema
yarn db:generate

# Or if setting up a new database
npx prisma db push
```

## Running the Application

```bash
# Development mode
yarn start:dev

# Production build
yarn build
yarn start:prod

# Debug mode
yarn start:debug
```

The API server will be available at `http://localhost:3006` (or the port specified in your `.env` file).

## API Documentation

The API endpoints are organized by modules:

- **Accounts**: User registration, authentication, and profile management
- **Properties**: Property listing, search, and management
- **Buyers**: Buyer-related functionality
- **Partners**: Partner management and integration
- **Admin**: Administrative features and reporting
- **Storage**: File upload and management

## Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## Deployment

The backend is configured for deployment on Vercel (using `vercel.json`). You can also deploy to other cloud providers such as AWS, GCP, or Azure.

## Contributing

1. Follow the established project structure
2. Write tests for new features
3. Use the existing linting rules: `yarn lint`
4. Format code before committing: `yarn format`

## License

This project is licensed under the terms specified in the `package.json` file.