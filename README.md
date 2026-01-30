# Secure Authentication Service

A production-ready RESTful authentication service built with Node.js, Express, PostgreSQL, and Redis. This service implements secure user authentication, OAuth 2.0 integration, role-based access control (RBAC), and robust security measures.

## Features

- **Authentication**: User registration, login, and secure session management using JWT (JSON Web Tokens).
- **Token Management**: Secure access and refresh token rotation strategy.
- **OAuth 2.0**: Integration with Google and GitHub for single sign-on (SSO).
- **Authorization**: Role-Based Access Control (RBAC) middleware for protecting routes (e.g., Admin, User).
- **Security**: 
  - Rate limiting to prevent abuse.
  - Helmet for secure HTTP headers.
  - Bcrypt for password hashing.
  - Input validation and sanitation.
- **Infrastructure**: Fully Dockerized environment with PostgreSQL and Redis.
- **Testing**: Integrated Jest test suite.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Containerization**: Docker & Docker Compose

## Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.
- Node.js (optional, for local development outside Docker).

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd auth-service
```

### 2. Environment Configuration

Copy the example environment file to create your local configuration:

```bash
cp .env.example .env
```

Review the `.env` file and update any placeholder values, especially for OAuth credentials if you intend to test social login:

- `JWT_SECRET` / `JWT_REFRESH_SECRET`: Generate strong random strings.
- `GOOGLE_CLIENT_ID` / `SECRET`: Obtain from Google Cloud Console.
- `GITHUB_CLIENT_ID` / `SECRET`: Obtain from GitHub Developer Settings.

### 3. Run with Docker

Build and start the services:

```bash
docker-compose up --build
```

The service will be available at `http://localhost:8080`.

## API Documentation

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login with email & password | No |
| `POST` | `/api/auth/refresh` | Refresh access token using refresh token | No |
| `GET` | `/api/auth/google` | Initiate Google OAuth flow | No |
| `GET` | `/api/auth/github` | Initiate GitHub OAuth flow | No |

### User Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | Get current user's profile | Yes |
| `PATCH` | `/api/users/me` | Update current user's profile | Yes |
| `GET` | `/api/users` | Get all users (Admin only) | Yes (Admin) |

## Development

### Database Seeding

The database is automatically initialized with tables and optional seed data when the Docker container starts, utilizing the scripts in `seeds/`.

### Running Tests

To run the test suite inside the container:

```bash
docker-compose exec app npm test
```

Or locally (requires local DB/Redis setup):

```bash
npm test
```

## Project Structure

```
├── src/
│   ├── config/         # Database and third-party configs
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth, RBAC, Rate limiting middleware
│   ├── routes/         # API Route definitions
│   └── index.js        # App entry point
├── seeds/              # SQL scripts for DB initialization
├── tests/              # Jest test files
├── Dockerfile          # App container definition
└── docker-compose.yml  # Service orchestration
```
