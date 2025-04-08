# TLAScanner Backend Development Plan (Simplified for Render Deployment)

## Technology Stack

### Core Technologies

- **Runtime**: Node.js 20.x LTS
- **Language**: TypeScript 5.x
- **Framework**: Express.js
  - Lightweight and flexible
  - Easy to deploy
  - Strong TypeScript support
  - Built-in middleware system

### Database

- **PostgreSQL on Render**
  - Managed PostgreSQL service
  - Automatic backups
  - SSL connections
  - Built-in monitoring

## Project Structure

```markdown
backend/
├── src/
│   ├── config/                 # Configuration management
│   │   ├── database.ts        # Database configuration
│   │   ├── api-keys.ts       # External API configurations
│   │   └── cors.ts           # CORS settings
│   │
│   ├── controllers/           # Route handlers
│   │   ├── scan/
│   │   │   ├── scan.controller.ts
│   │   │   └── scan.validation.ts
│   │   └── cve/
│   │       ├── cve.controller.ts
│   │       └── cve.validation.ts
│   │
│   ├── services/             # Business logic
│   │   ├── virustotal/      # VirusTotal integration
│   │   │   ├── client.ts    # API client
│   │   │   ├── types.ts     # Type definitions
│   │   │   └── utils.ts     # Helper functions
│   │   ├── nvd/            # NVD integration
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── sync.ts     # Database sync logic
│   │   └── malwarebazaar/  # MalwareBazaar integration
│   │       ├── client.ts
│   │       ├── types.ts
│   │       └── utils.ts
│   │
│   ├── models/              # Database models
│   │   ├── scan.model.ts   # Scan results schema
│   │   ├── cve.model.ts    # CVE cache schema
│   │   └── index.ts        # Model exports
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── api.types.ts    # API related types
│   │   ├── scan.types.ts   # Scanning related types
│   │   ├── cve.types.ts    # CVE related types
│   │   └── common.types.ts # Shared types
│   │
│   ├── middleware/         # Custom middleware
│   │   ├── rateLimiter.ts # Rate limiting
│   │   ├── validator.ts   # Request validation
│   │   └── error.ts       # Error handling
│   │
│   ├── utils/             # Utility functions
│   │   ├── async.ts      # Async helpers
│   │   ├── validation.ts # Validation helpers
│   │   └── logger.ts     # Logging utility
│   │
│   └── app.ts            # Application entry point
│
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   │   ├── services/
│   │   └── controllers/
│   ├── integration/     # Integration tests
│   │   ├── api/
│   │   └── database/
│   └── fixtures/        # Test data
│
├── scripts/             # Utility scripts
│   └── db-seed.ts      # Database seeding
│
├── .env.example        # Environment variables template
├── .eslintrc.js       # ESLint configuration
├── .prettierrc        # Prettier configuration
├── jest.config.js     # Jest configuration
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # Project documentation
```

### Key Components Explained

#### 1. Configuration (`/src/config`)

- **database.ts**: PostgreSQL connection and pool settings
- **api-keys.ts**: External API configurations and rate limits
- **cors.ts**: CORS settings for frontend integration

#### 2. Controllers (`/src/controllers`)

- **scan/**: Scanning functionality
  - File upload and scanning
  - URL scanning
  - Batch operations
- **cve/**: Vulnerability management
  - CVE lookups
  - Vulnerability searches
  - Advisory retrieval

#### 3. Services (`/src/services`)

- **virustotal/**: VirusTotal API integration
  - File/URL submission
  - Result retrieval
  - Rate limit handling
- **nvd/**: NVD API integration
  - CVE data synchronization
  - Local cache management
  - Search functionality
- **malwarebazaar/**: MalwareBazaar integration
  - Sample submission
  - Analysis retrieval
  - Results storage

#### 4. Models (`/src/models`)

- **user.model.ts**: User account management
- **scan.model.ts**: Scan results and history
- **cve.model.ts**: Local CVE cache

#### 5. Types (`/src/types`)

- Type definitions shared between frontend and backend
- API request/response types
- Database model types
- External API types

#### 6. Middleware (`/src/middleware`)

- **rateLimiter.ts**: Request rate limiting
- **validator.ts**: Request validation
- **error.ts**: Global error handling

#### 7. Utils (`/src/utils`)

- **async.ts**: Async operation helpers
- **crypto.ts**: Cryptographic functions
- **validation.ts**: Input validation helpers
- **logger.ts**: Logging utility

#### 8. Tests (`/tests`)

- Unit tests for individual components
- Integration tests for API endpoints
- Test fixtures and mock data

#### 9. Scripts (`/scripts`)

- Database seeding scripts
- Environment setup utilities
- Maintenance scripts

### File Naming Conventions

- Use kebab-case for directories
- Use camelCase for TypeScript/JavaScript files
- Add `.type.ts` suffix for type definition files
- Add `.test.ts` suffix for test files

### Code Organization Principles

1. **Separation of Concerns**: Each directory serves a specific purpose
2. **Modularity**: Components are self-contained and reusable
3. **Scalability**: Easy to add new features without modifying existing code
4. **Maintainability**: Clear structure makes code easy to maintain
5. **Testability**: Organized for effective testing

## Development Phases

### Phase 1: Initial Setup (Week 1)

1. Project setup
   - Initialize TypeScript project
   - Configure Express.js
   - Set up ESLint and Prettier
   - Configure environment variables

2. Database setup
   - Set up PostgreSQL on Render
   - Create database schema
   - Set up connection pooling
   - Create basic models

3. Core configuration
   - Environment management
   - Error handling
   - Request validation
   - CORS setup

### Phase 2: Core Features (Week 2)

1. system

- API key management
- Rate limiting middleware

2 . Database models

- User model
- Scan results model
- CVE cache model
- API keys model

3 . Base API endpoints

- Health check
- Basic CRUD operations

### Phase 3: API Integrations (Weeks 3-4)

#### VirusTotal Integration

- API client setup
- File/URL scanning endpoints
- Results caching in PostgreSQL
- Rate limit handling

#### NVD Integration

- CVE data fetching
- Local database caching
- Search endpoints
- Daily updates

#### MalwareBazaar Integration

- Sample submission
- Analysis retrieval
- Results storage

### Phase 4: Advanced Features (Week 5)

1. Scanning system
   - Async scan handling
   - Result aggregation
   - Report generation

2. Performance optimization
   - Query optimization
   - Response caching
   - Connection pooling

## API Integration Details

### VirusTotal API

- **Base URL**: <https://www.virustotal.com/api/v3>
- **Rate Limits**: 4 requests/minute (public API)
- **Endpoints**:
  - POST /files: Upload files for scanning
  - GET /analyses/{id}: Get scan results
  - POST /urls: Submit URLs for scanning
  - GET /domains/{domain}: Get domain reports
  - Batch operations for efficient API usage

### NVD API

- **Base URL**: <https://services.nvd.nist.gov/rest/json/cves/2.0>
- **Rate Limits**: 5 requests/30s
- **Endpoints**:
  - GET /cves: Search vulnerabilities
  - GET /cve/{id}: Get specific CVE details
  - GET /cpeDictionary: Get CPE dictionary
  - Support for advanced filtering and pagination

### MalwareBazaar

- **Base URL**: <https://mb-api.abuse.ch/api/v1>
- **Rate Limits**: Varies by endpoint
- **Endpoints**:
  - POST /submit: Submit samples
  - GET /get_info: Retrieve analysis
  - POST /download: Download samples
  - Support for multiple file formats

## API Endpoints and Data Flows

### URL Scanning

- `POST /api/scan/url/scan`
- `GET /api/scan/url/scan/results/:scanId`

### CVE Lookup

- `GET /api/cve/search`
- `GET /api/cve/:cveId`

## Security Measures

1. Rate Limiting
2. Input Validation
3. API Key Protection
4. Error Sanitization

## Scanning Process

1. Validate URL input
2. Check existing results in cache/DB
3. Submit to VirusTotal/MalwareBazaar
4. Store analysis results
5. Return threat assessment
