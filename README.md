# Task Manager Server

Backend API for the Task Manager application. The server uses Express, TypeScript, Sequelize, and MySQL.

## Requirements

Install the following on the machine before running the server:

- Node.js 20 or newer
- npm, included with Node.js
- MySQL 8 or newer, running locally or on an accessible server
- Git, if cloning the project from a repository

The configured MySQL user must be able to connect to MySQL and create the configured database on the first run. If the database already exists, normal database access is sufficient.

## First-time setup

From the `Server` directory:

```bash
npm install
```

Create the local environment file from the template:

```bash
copy .env.example .env
```

On macOS or Linux, use:

```bash
cp .env.example .env
```

Open `.env` and set the database credentials and a private JWT secret. Do not commit `.env` or share its values.

For a fresh database, set:

```env
DB_SYNC=sync
```

Then start the server:

```bash
npm run dev
```

The server will create the configured database if permitted, connect to MySQL, create the tables, and listen on the configured port. The default address is:

- API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`
- Swagger documentation: `http://localhost:5000/docs`
- OpenAPI JSON: `http://localhost:5000/openapi.json`

After the first successful schema synchronization, use `DB_SYNC=none` for normal development and production. This prevents the application from changing the database schema at startup.

## Environment variables

The complete template is in `.env.example`.

### Server and security

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Runtime environment | `development` |
| `JWT_SECRET` | Secret used to sign and verify JWTs | long random secret |
| `SALT_ROUNDS` | bcrypt password hashing cost | `12` |
| `CORS_ORIGIN` | Allowed browser origin; use `*` only for local testing | `*` |

The API rate limiter applies to `/api`: 100 requests per IP every 15 minutes. Helmet is enabled for HTTP security headers.

For a PowerShell-generated JWT secret, run:

```powershell
[Convert]::ToBase64String([byte[]](1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Database

| Variable | Purpose | Example |
| --- | --- | --- |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | local password |
| `DB_NAME` | Database name | `task_management_db` |
| `DB_SYNC` | Schema startup behavior | `none`, `sync`, `alter`, or `force` |
| `DB_LOG` | Enable Sequelize SQL logging | `false` |
| `DB_TIMEZONE` | Reserved environment setting; the current Sequelize configuration uses UTC (`+00:00`) | `+00:00` |
| `DB_POOL_MAX` | Maximum database connections | `10` |
| `DB_POOL_MIN` | Minimum database connections | `0` |
| `DB_POOL_ACQUIRE` | Connection acquisition timeout in milliseconds | `30000` |
| `DB_POOL_IDLE` | Idle connection timeout in milliseconds | `10000` |

`DB_SYNC=force` drops and recreates tables. Use it only when intentionally resetting a local database. Do not use it against production data.

### Seeder variables

The seeders use these optional variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `TEST_ADMIN_EMAIL` | Seed administrator login email | `admin@company.com` |
| `TEST_ADMIN_PASSWORD` | Seed administrator login password | `Password123` |
| `TEST_ADMIN_NAME` | Seed administrator display name | `Site Administrator` |
| `SEED_USER1_EMAIL` | First demo user email | `ahmad.ali@company.com` |
| `SEED_USER2_EMAIL` | Second demo user email | `sara.mohamed@company.com` |
| `SEED_USER3_EMAIL` | Third demo user email | `khaled.hassan@company.com` |

Change the default seed credentials before sharing a development environment.

## Seed the database

Make sure the database tables exist first. On a fresh database, start the server once with `DB_SYNC=sync`, or run the seed command with that setting in `.env`.

Run all seeders with:

```bash
npm run seed
```

The seed process creates:

- One administrator and three demo users
- Three demo projects
- Project memberships with manager/member roles
- Sample tasks for the projects

The seeders use transactions and `findOrCreate`, so rerunning them does not intentionally duplicate the standard seed records. The seeded administrator credentials are the values of `TEST_ADMIN_EMAIL` and `TEST_ADMIN_PASSWORD`.

## Development commands

```bash
npm run dev       # Start with TypeScript watch mode
npm start         # Start the server directly
npm run build     # Compile and type-check the server
npm run seed      # Run all database seeders
```

## Troubleshooting

- **Cannot connect to MySQL:** verify that MySQL is running and that `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD` are correct.
- **Database does not exist:** allow the configured MySQL user to create databases, or create `DB_NAME` manually.
- **Tables do not exist:** set `DB_SYNC=sync` once, run the server or seeder, then change it back to `none`.
- **CORS errors:** set `CORS_ORIGIN` to the exact browser frontend origin, including the protocol and without a trailing slash.
- **Port already in use:** change `PORT` and expose that same port with ngrok.
