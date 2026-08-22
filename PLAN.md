# Tours & Travels Web App — Nepal — Development Plan

A web app for discovering destinations and touring/adventure activities across Nepal, booking trips, and paying online. ReactJS frontend, Django backend, PostgreSQL, eSewa/Khalti payments.

## Tech Stack
| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, React Router, React Query, Axios |
| Auth (frontend) | React Context for session state (JWT in localStorage) |
| Backend | Django + Django REST Framework |
| Auth (backend) | JWT via `djangorestframework-simplejwt` |
| DB | PostgreSQL |
| Media | Pillow (image upload), `MEDIA_ROOT` (S3/Cloudinary later) |
| Payments | eSewa or Khalti (initiate + verify + callback) |
| Admin | Django Admin (superadmin) + staff admin with restricted permissions |
| Misc | `django-cors-headers`, `django-filter`, `whitenoise`, `psycopg` |

## Project Structure
```
tour/
├── backend/
│   ├── config/                  # settings, urls, wsgi/asgi
│   ├── accounts/                # custom User, register/login/me
│   ├── destinations/            # Destination, ActivityCategory, Activity, galleries
│   ├── bookings/                # Booking model + API
│   ├── payments/                # eSewa/Khalti integration
│   ├── requirements.txt
│   └── .env                     # SECRET_KEY, DB creds, payment keys
└── frontend/
    ├── src/
    │   ├── api/                 # axios client + React Query hooks
    │   ├── context/             # AuthContext
    │   ├── components/          # Navbar, DestinationCard, ActivityCard, BookingForm...
    │   ├── pages/               # Home, DestinationDetail, ActivityDetail, Activities, Book, MyBookings, Login, Register
    │   ├── routes/
    │   └── App.jsx
    └── package.json
```

## Data Model
- **User** — custom AbstractUser, email-based login
- **Destination** — name, slug, province, description, cover_image, gallery (multiple images via separate model)
- **ActivityCategory** — name (Adventure, Culture, Hiking/Trekking, Water Sports, Cycling, Scenic), slug, icon
- **Activity** — FK→Destination, FK→ActivityCategory, name, slug, description, image, price (NPR), duration, capacity, difficulty
- **Booking** — FK→User, FK→Activity, travel_date, travelers, total_price, status (pending/confirmed/cancelled)
- **Payment** — FK→Booking, gateway (esewa/khalti), transaction_id, status, amount

## Adventure Activity Features
The app highlights both touring activities and adventure sports, each linked to a destination where they are actually offered:

| Activity | Category | Typical Location |
|---|---|---|
| Bungee Jumping | Adventure | Bhote Koshi (near Kathmandu) |
| Zip Flyer / Ziplining | Adventure | Pokhara, Nagarkot |
| Paragliding | Adventure | Pokhara |
| Rock Climbing | Adventure | Dhuili Khel (Kathmandu), Astaum |
| Canoeing / Dugout | Water Sports | Chitwan, Pokhara |
| Rafting | Water Sports | Trishuli River, Seti River |
| Cycling / MTB | Cycling | Nagarkot, Kathmandu Valley, Mustang |
| Paragliding Tandem | Adventure | Pokhara |
| Cultural Tours | Culture | Kathmandu (Durbar Squares), Lumbini, Janakpur |
| Trekking | Hiking/Trekking | Everest Region, Annapurna, Manaslu |

### UI features around adventure activities
- **Activities page** — grid of all activities with category filter chips (Adventure / Water Sports / Cycling / Culture / Trekking...)
- **Activity detail page** — images, price, duration, difficulty, capacity, "Book Now"
- **Destination detail page** — lists its available activities with prices
- **Home page** — featured activity carousel/section

## API Endpoints
```
POST /api/auth/register/          POST /api/auth/login/
GET  /api/auth/me/                POST /api/auth/refresh/

GET  /api/destinations/           GET /api/destinations/{slug}/
GET  /api/activities/             GET /api/activities/{id}/
GET  /api/activities/?category={slug}&destination={slug}   # filters
GET  /api/categories/

POST /api/bookings/               GET /api/bookings/          (own bookings)
GET  /api/bookings/{id}/          PATCH /api/bookings/{id}/cancel

POST /api/payments/initiate/      # creates Booking(PENDING) + returns payment payload
POST /api/payments/verify/        # gateway callback → confirm booking
```

## Auth Flow (book-first)
- Browse destinations, activities (incl. adventure sports) freely — **no login required**
- Clicking "Book" with no session → redirect to login/register page with a `next` param
- After auth, user returns to booking form; JWT stored in localStorage and attached to all requests

## Admin
- **Superadmin** — Django `/admin/` with full superuser access
- **Staff admins** — Django admin registered for Destination / ActivityCategory / Activity / Booking / Payment; permissions limited to managing destinations, activities (incl. prices) via `django.contrib.auth` groups
- Custom admin actions: bulk price update, approve/cancel bookings

## Build Phases

**Phase 1 — Backend setup**
- Create venv, Django project `config`, install deps, configure `.env` + PostgreSQL
- Custom User model, `django-cors-headers`, JWT setup

**Phase 2 — Destinations, Categories & Activities**
- Models (Destination, ActivityCategory, Activity + gallery), admin registrations, DRF serializers/viewsets, image upload
- Seed data for ~8 destinations and ~20 activities covering the adventure table above

**Phase 3 — Bookings & Payments**
- Booking + Payment models, booking API, price calculation (per traveler, activity price × travelers)
- eSewa/Khalti initiate + verify endpoints (sandbox keys), webhook/callback handler

**Phase 4 — Frontend foundation**
- Scaffold Vite + Tailwind, React Router, AuthContext, axios client, React Query setup
- Home page (destinations grid + featured activities), Destination detail page (gallery + activities), Activities page (category filters), Activity detail page

**Phase 5 — Auth + Booking flow**
- Register/Login pages with `next` redirect, MyBookings page
- Booking form (date, travelers, price preview) → payment redirect → verify → confirmation page

**Phase 6 — Admin panel & polish**
- Django admin customization, permission groups, seed script
- Loading/error states, responsive design, empty states

**Phase 7 — Testing & deployment**
- Backend: pytest/DRF tests for auth, bookings, payments
- Frontend: Vitest for key flows
- Optional: dockerize (Dockerfile + docker-compose for Django + PG), deploy to Render/VPS/Hostinger

**Status: all 7 phases implemented and verified.**
- Backend: 26 pytest tests green (`backend/requirements-dev.txt` for dev deps), `manage.py check` clean
- Frontend: 9 Vitest tests green, lint 0 errors, production build OK
- Deployment: `backend/Dockerfile`, root `docker-compose.yml` (postgres + Django), `backend/.env.example`, `frontend/.env.example` (supports `VITE_API_URL` for split-origin prod)

## Key Risks / Notes
- eSewa/Khalti sandbox needs merchant test keys; keep them in `.env`, never commit
- Image storage: start local `MEDIA_ROOT`, plan for S3/Cloudinary later
- First-booking auth: bookings API requires `IsAuthenticated`; public endpoints are read-only
- Adventure safety: add "difficulty" + "what's included" fields to Activity for trust
