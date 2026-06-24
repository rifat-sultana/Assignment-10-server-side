# API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Backend health check |
| GET | `/books/` | All books |
| GET | `/books/:id` | Single book by ID |
| PATCH | `/books/delivery/:id` | Request delivery for a book |
| GET | `/payment/` | Payment route check |
| GET | `/dashboard/stats/:email` | Dashboard stats by user email |
| GET | `/reviews/:email` | Reviews by user email |
| GET | `/deliveries/:email` | Deliveries by user email |
| GET | `/readingList/:email` | Reading list (delivered books) by user email |
| POST | `/wishlist/` | Add to wishlist |
| GET | `/wishlist/:email` | Get wishlist by user email |
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |
