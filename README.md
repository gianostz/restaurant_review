# Restaurant Review

A microservices-based restaurant review platform built with Spring Boot and React.

## Architecture

```
restaurant-review/
├── user-service/         # Authentication & user management ($USER_SERVICE_PORT)
├── review-service/       # Review CRUD ($REVIEW_SERVICE_PORT)
├── restaurant-service/   # Restaurant CRUD & search ($RESTAURANT_SERVICE_PORT)
└── restaurant-frontend/  # React frontend ($FRONTEND_PORT)
```

All three backend services share a single PostgreSQL database and authenticate requests using JWT tokens issued by `user-service`.

## Tech Stack

**Backend**
- Java 21, Spring Boot 3.4.4
- Spring Security, Spring Data JPA
- PostgreSQL 15
- jjwt 0.12.6
- Lombok, Bean Validation
- Testcontainers (integration tests)

**Frontend**
- React 19, TypeScript, Vite
- Redux Toolkit, React Router v7
- React Hook Form, Tailwind CSS, Axios

## Quick Start

### Run everything with Docker

```bash
# Copy and configure environment variables
cp .env.example .env   # fill in your values

docker-compose up
```

| Service | Default URL | Port variable |
|---|---|---|
| Frontend | http://localhost:5173 | `FRONTEND_PORT` |
| user-service | http://localhost:8080 | `USER_SERVICE_PORT` |
| review-service | http://localhost:8081 | `REVIEW_SERVICE_PORT` |
| restaurant-service | http://localhost:8082 | `RESTAURANT_SERVICE_PORT` |

### Local backend development (DB only in Docker)

```bash
docker-compose -f docker-compose.postgres.yml up
cd <service-dir>
./mvnw spring-boot:run
```

### Local frontend development

```bash
cd restaurant-frontend
npm install
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | Database name |
| `POSTGRES_HOST` | Database host |
| `POSTGRES_PORT` | Database port |
| `USER_SERVICE_PORT` | External port for user-service (default `8080`) |
| `REVIEW_SERVICE_PORT` | External port for review-service (default `8081`) |
| `RESTAURANT_SERVICE_PORT` | External port for restaurant-service (default `8082`) |
| `FRONTEND_PORT` | External port for the frontend (default `5173`) |
| `JWT_SECRET` | Shared secret for JWT signing (all services) |
| `JWT_EXPIRATION` | Token expiration in milliseconds (e.g. `3600000` for 1h) |

## API Reference

### user-service — `http://localhost:$USER_SERVICE_PORT`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/users/register` | No | Register a new user |
| POST | `/users/login` | No | Login, returns JWT token |
| GET | `/users/user/{id}` | Yes | Get user by ID |

### review-service — `http://localhost:$REVIEW_SERVICE_PORT`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/reviews/?page=0&pageSize=10` | Yes | List all reviews (paginated, newest first) |
| POST | `/reviews/create` | Yes | Create a new review |
| DELETE | `/reviews/review/{id}` | Yes | Delete a review (owner only) |

**Review creation body:**
```json
{
  "restaurantId": 1,
  "rating": 8,
  "comment": "Great food!"
}
```
Rating must be between 1 and 10.

### restaurant-service — `http://localhost:$RESTAURANT_SERVICE_PORT`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/restaurant/create` | Yes | Create a new restaurant |
| GET | `/restaurant/restaurant/{id}` | Yes | Get restaurant by ID |
| GET | `/restaurant/search?partialName=...` | Yes | Search restaurants by name (paginated) |

**Restaurant types:** `RISTORANTE`, `OSTERIA`, `TRATTORIA`, `SUSHI`, `PIZZA`, `TRAPIZZINO`, `BOWL`, `ORIENTALE`

## Authentication

All endpoints except `/users/register` and `/users/login` require a valid JWT token:

```
Authorization: Bearer <token>
```

Tokens are issued by `user-service` on login and validated independently by each service using the shared `JWT_SECRET`. Tokens expire after 1 hour by default.

## Development

### Build & test a backend service

```bash
cd <service-dir>

./mvnw clean package          # Build JAR
./mvnw test                   # Run all tests
./mvnw test -Dtest=MyTest     # Run a specific test class
./mvnw spotless:apply         # Format code (Google Java Format)
./mvnw clean package -DskipTests  # Build without tests
```

Tests are organized as:
- `src/test/java/.../unit/` — unit tests with Mockito
- `src/test/java/.../integration/` — integration tests with Testcontainers

### Frontend commands

```bash
npm run dev    # Start Vite dev server
npm run build  # Production build
npm run lint   # ESLint
```

### Backend layer structure

Each service follows: `controller → service → repository → model`, with `dto/`, `config/`, `exception/`, and `validation/` packages.
