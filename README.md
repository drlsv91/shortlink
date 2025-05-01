# ShortLink - URL Shortening Service

A full-stack URL shortening service built with Node.js, Express, TypeScript, React, and PostgreSQL.

## Project Overview

ShortLink is a URL shortening service that allows users to shorten long URLs into compact, easy-to-share links. The solution consists of:

- **Frontend**: React with TypeScript, Vite, and ShadCN UI components
- **Backend**: Node.js with Express, Express-Validator and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest for both frontend and backend
- **Package Manager**: PNPM for efficient dependency management

## Project Structure

```
shortlink/
├── frontend/           # React frontend application
├── backend/            # Node.js Express API
├── docker-compose.yml  # Docker Compose configuration
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## Screenshots

### Create Short URL Interface

![Create Short URL Interface](/img/create-shortlink.png)
_The interface where users can enter long URLs and submit_

### List Shorten URLs Interface

![List URLs Interface](/img/list-urls.png)
_The interface showing a list of all shortened URLs with statistics and search functionality._

## Features

- URL shortening with custom algorithm
- URL redirection
- Interface for viewing and searching shortened URLs
- Complete REST API for programmatic access
- Detailed analytics for each shortened URL

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- pnpm

### Running with Docker

1. Clone the repository

```bash
git clone https://github.com/drlsv91/shortlink.git
cd shortlink
```

2. Start the services using Docker Compose

```bash
docker-compose up -d
```

This will:

- Start the PostgreSQL database on port 5432
- Start the backend API server on port 3000
- Start the frontend application on port 5173

3. Access the application

- Frontend: http://localhost:5174
- Backend API: http://localhost:3000

### Running Tests

#### Backend Tests

```bash
docker-compose exec backend pnpm test
```

#### Frontend Tests

```bash
docker-compose exec frontend pnpm test
```

## API Documentation

### Endpoints

- **POST /api/encode**

  - Request: `{ "originalUrl": "https://example.com" }`
  - Response: `{"originalUrl":"https://example.com", "shortUrl": "http://short.est/AbCdEf" }`

- **GET /api/decode**

  - Request: `{ "shortUrl": "http://short.est/AbCdEf" }`
  - Response: `{"originalUrl":"https://example.com", "shortUrl": "http://short.est/AbCdEf" }`

- **GET /api/statistic/{url_path}**

  - Response: `{ "originalUrl": "https://example.com", "createdAt": "2025-05-01T12:00:00Z", "visitCount": 42, ... }`

- **GET /api/list**

  - Response: `{ "data": [ ... ] }`

- **GET /{url_path}**
  - Redirects to the original URL

## Technical Decisions

### Architecture

This project follows a standard client-server architecture with a clear separation between:

- Frontend (Client): User-facing React application
- Backend (Server): RESTful API service
- Database: PostgreSQL for persistent storage

### URL Shortening Algorithm

The URL shortening algorithm uses a cryptographic hash-based approach with base62 encoding:

1. Combines the original URL with current timestamp to ensure uniqueness
2. Generates a SHA-256 hash of this combined data
3. Maps portions of the hash to characters from the base62 set (a-z, A-Z, 0-9)
4. Creates a fixed-length short code (6 characters) that is unique and non-sequential

This approach ensures security by making short URLs unpredictable while maintaining consistent length regardless of the original URL.

### Database Schema

The core database schema revolves around the `ShortUrl` entity, which includes:

- Original URL
- Short path
- Creation timestamp
- Visit Count

### Security Considerations

- Input validation to prevent malicious URL submissions
- No sensitive data stored in relation to URLs
