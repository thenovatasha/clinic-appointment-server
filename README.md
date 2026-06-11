# clinic-appointment

# How to run with Docker: 
```bash
docker compose up --build
```

Note: Ensure that port 3000 is available

# To run without Docker (using NPM): 
> [!NOTE]
> Requires Node.js v24.14.1 or above.

Follow these commands in sequence: 
```bash
npm i
````
```
npm run build
```
```bash
npx drizzle-kit generate
```
```bash
npm start
```

# To run Test: 
```bash
npm run test
```

# Examples of API calls to test the appointment scheduling system:
This also acts as a scenario to manually verify the system behaves as expected under various conditions. There are 2 patients, 2 clinicians, and a series of appointment booking and querying actions.

1. Create Patient A
   
```bash
curl -s -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Emily",
    "lastName": "Carter",
    "dateOfBirth": "2001-10-03"
  }'
```
3. Create Patient B

```bash
curl -s -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "James",
    "lastName": "Whitfield",
    "dateOfBirth": "1995-03-22"
  }'
```

4. Create Clinician A

```bash
curl -s -X POST http://localhost:3000/clinicians \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Daniel",
    "lastName": "Morgan"
  }'
```

5. Create Clinician B

```bash
curl -s -X POST http://localhost:3000/clinicians \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Sarah",
    "lastName": "Ellison"
  }'
```

6. Book Appointment — Patient A + Doctor A

```bash
curl -s -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "start": "2026-06-14T10:00:00Z",
    "end": "2026-06-14T11:00:00Z",
    "patientId": 1,
    "clinicianId": 1
  }'
```

7. Book Appointment — Patient A + Doctor B (different time)

```bash
curl -s -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "start": "2026-06-14T13:00:00Z",
    "end": "2026-06-14T14:00:00Z",
    "patientId": 1,
    "clinicianId": 2
  }'
```

8. Book Appointment — Patient B + Doctor A (starts exactly when Doctor A's first appointment ends)

```bash
curl -s -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "start": "2026-06-14T11:00:00Z",
    "end": "2026-06-14T12:00:00Z",
    "patientId": 2,
    "clinicianId": 1
  }'
```

9. Attempt overlapping appointment — Doctor A already booked 10:00–11:00 (should conflict)

```bash
curl -s -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "start": "2026-06-14T10:30:00Z",
    "end": "2026-06-14T11:30:00Z",
    "patientId": 2,
    "clinicianId": 1
  }'
```

10. Query all appointments as admin

```bash
curl -s http://localhost:3000/appointments \
  -H "x-role: admin"
```

11. Query appointments for Doctor 1 between two times

```bash
curl -s "http://localhost:3000/appointments?from=2026-06-14T09:00:00Z&to=2026-06-14T12:00:00Z" \
  -H "x-role: admin" \
  -H "x-clinician-id: 1"
```

12. Query with invalid ISO datetime

```bash
curl -s "http://localhost:3000/appointments?from=14-06-2026&to=not-a-date" \
  -H "x-role: admin"
```

13. Book with invalid ISO datetime

```bash
curl -s -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "start": "14-06-2026 10:00",
    "end": "14-06-2026 11:00",
    "patientId": 1,
    "clinicianId": 1
  }'
```

14. Book with valid datetime but start is after end

```bash
curl -s -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "start": "2026-06-14T15:00:00Z",
    "end": "2026-06-14T13:00:00Z",
    "patientId": 1,
    "clinicianId": 1
  }'
```

# Design Decisions
## Architecture
The application is structured into three layers: Routers, Handlers, and a Database Layer.

Routers define routes and compose middleware to enforce constraints per route.
Handlers contain the application logic, delegating to utility middleware for input validation, constraint checking, and error handling.
Database Layer is a thin translation layer. It takes inputs as-is and converts them directly to SQL queries with no additional logic.

This separation keeps concerns isolated and makes each layer independently testable.

## Date Handling
SQLite has no native datetime type. Dates are stored as ISO 8601 strings, which allows lexicographical ordering to stand in for chronological ordering - a lightweight solution that avoids introducing extra dependencies or custom SQL functions.

## ORM
Drizzle ORM was chosen to reduce boilerplate around database interactions and provide type-safe query building without the overhead of a heavier ORM. It also exposes raw SQL where needed, though that wasn't required here.

## Input Validation
Input validation is handled by Zod, applied as middleware at the router level. This keeps validation declarative and colocated with the route definitions rather than scattered through handler logic.

## Role-Based Access
The X-Role header is used to communicate role context rather than query parameters, which are reserved for narrowing query scope. This keeps the two concerns: access control and data filtering, keeping them clearly separated.

## Functional Middleware
A functional approach was taken over class-based design. Middleware and handlers are plain functions, which keeps composition simple and avoids the overhead of managing class hierarchies for what are ultimately stateless operations.

## Error Messages
API error responses are intentionally vague. Exposing internal error details (stack traces, query failures, schema information) is a common information-leakage vector, so errors are kept generic at the boundary.

## Testing
Unit tests mock database calls and assert that the correct handlers and middleware are invoked for a given request. The tradeoff here is coverage depth. Without end-to-end tests, integration-level bugs between layers aren't caught automatically. This was offset by manual verification via Postman and curl, which provided reasonable confidence given the time constraints.
