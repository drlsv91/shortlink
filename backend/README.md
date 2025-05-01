# ShortLink Backend

The Node.js Express backend API for the ShortLink URL shortening service.

## Technologies Used

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **TypeScript**: Type safety and developer experience
- **Prisma**: ORM for database interaction
- **PostgreSQL**: Relational database
- **Jest**: Testing framework
- **Supertest**: HTTP testing
- **dotenv**: Environment configuration
- **cors**: Cross-Origin Resource Sharing middleware
- **helmet**: Security middleware

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma     # Prisma schema definition
│   └── migrations/       # Database migrations
├── src/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express application setup
│   └── server.ts         # Server entry point
│   └── config.ts         # Env configuration
├── tests/                # Integration and Unit tests
├── .env.example          # Example environment variables
├── jest.config.js        # Jest configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
├── Dockerfile            # Docker configuration
└── README.md             # This file
```

## Features

- **URL Shortening API**: Create short URLs from long ones
- **URL Redirection**: Redirect short URLs to original URLs
- **Statistics Tracking**: Track visits and provide analytics
- **Search Functionality**: Search through shortened URLs
- **Data Persistence**: Store URLs in PostgreSQL database
- **Error Handling**: Comprehensive error responses
- **Input Validation**: Validate incoming requests
- **Logging**: Detailed logging for monitoring and debugging

## Development

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL (or Docker)

### Setup

1. Install dependencies

```bash
pnpm install
```

2. Set up environment variables
   Copy the `.env.example` file to `.env` and fill in the required values:

```
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/shortlink"

# URL Configuration
BASE_URL="http://short.est"
```

3. Generate Prisma client

```bash
pnpm prisma:generate
```

4. Set up the database and run migrations

```bash
pnpm prisma:migrate
```

5. Start the development server

```bash
pnpm dev
```

The API will be available at http://localhost:3000

### Available Scripts

- `pnpm dev`: Start development server with hot-reload
- `pnpm build`: Build for production
- `pnpm start`: Start production server from build
- `pnpm lint`: Lint code
- `pnpm test`: Run tests
- `pnpm test:coverage`: Run tests with coverage report
- `pnpm prisma:studio`: Open Prisma Studio for database management
- `pnpm prisma:migrate`: Run database migrations
- `pnpm prisma:generate`: Generate Prisma client

## API Documentation

### Endpoints

#### Create a Short URL

- **URL**: `POST /api/encode`
- **Body**: `{ "url": "https://example.com" }`
- **Response**: `{ "shortUrl": "http://short.est/AbCdEf" }`

#### Decode a Short URL

- **URL**: `GET /api/decode/{url_path}`
- **Response**: `{ "originalUrl": "https://example.com",... }`

#### Get URL Statistics

- **URL**: `GET /api/statistic/{url_path}`
- **Response**:

```json
{
  "id": "1711d6af-adc9-453e-893f-540a9149f274",
  "shortUrl": "http://short.est/AbCdEf",
  "shortPath": "AbCdEf",
  "originalUrl": "https://example.com",
  "createdAt": "2025-05-01T12:00:00Z",
  "visitCount": 42
}
```

#### List All URLs

- **URL**: `GET /api/list`
- **Query Parameters**:
  - `search`: Search term (optional)
- **Response**:

```json
{
  "data": [
    {
      "urlPath": "AbCdEf",
      "originalUrl": "https://example.com",
      "created": "2025-05-01T12:00:00Z",
      "visits": 42
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

#### Redirect to Original URL

- **URL**: `GET /{url_path}`
- **Action**: Redirects to the original URL

## Testing

The backend tests use Jest and Supertest. Run tests with:

```bash
pnpm test
```

## Building for Production

```bash
pnpm build
pnpm start
```

## Docker

A Dockerfile is provided for containerization. Build the image with:

```bash
docker build -t shortlink-backend .
```

Run the container with:

```bash
docker run -p 3000:3000 --env-file .env shortlink-backend
```

## Design Decisions

### URL Shortening Algorithm

The URL shortening algorithm uses a cryptographic hash-based approach with base62 encoding:

1. Combines the original URL with current timestamp to ensure uniqueness
2. Generates a SHA-256 hash of this combined data
3. Maps portions of the hash to characters from the base62 set (a-z, A-Z, 0-9)
4. Creates a fixed-length short code (6 characters) that is unique and non-sequential

This approach ensures security by making short URLs unpredictable while maintaining consistent length regardless of the original URL.

### Database Schema Design

The primary entity is the `Url` model:

```prisma
model Url {
  id          String   @id @default(uuid()) @db.Uuid
  originalUrl String
  shortPath   String   @unique
  createdAt   DateTime @default(now())
  visitCount  Int      @default(0)

  @@index([shortPath])
}
```

This schema allows for:

- Fast lookups by shortPath (indexed)

### API Design

The API follows RESTful principles with:

- Clear resource naming conventions
- Proper HTTP status codes
- Consistent error responses
- Appropriate use of HTTP methods
- Validation of all inputs
- Pagination for list endpoints

### Security Considerations

Security measures implemented:

- Helmet for HTTP header security
- CORS configuration to restrict origins
- Input validation to prevent injection attacks
- No sensitive data stored in relation to URLs
- Proper error handling to avoid information leakage

### Caching Strategy

To improve performance:

- Database queries are optimized
- Proper indexes are used for frequently queried fields
