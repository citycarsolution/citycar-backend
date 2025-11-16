# Backend (Express + MongoDB)

## Setup
```bash
npm install
cp .env.example .env
# set MONGODB_URI
npm run dev
```

### Endpoints
- `GET /api/cars` — list cars
- `POST /api/cars/seed` — dev-only helper to insert sample cars
- `POST /api/bookings` — create a booking (expects JSON body)
- `GET /api/bookings/:id` — fetch booking by bookingId
