# InvoiceApp MVP Requirements Checklist

## Product Goals
- Build a fast invoicing web app for freelancers and small studios.
- Support local payment methods (MoMo, Orange Money, bank, cash).
- Provide branded invoice PDFs and email delivery.

## MVP In Scope
- User auth with JWT.
- Clients CRUD.
- Invoices CRUD with line items.
- Invoice status transitions and tracking.
- Dashboard aggregates.
- Settings for business profile, invoice defaults, payment methods.
- PDF generation and invoice email sending.
- Responsive web app (mobile and desktop).

## Backend Endpoints (`/api/v1`)
### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PUT /auth/me`
- `POST /auth/me/logo`

### Clients
- `GET /clients`
- `POST /clients`
- `GET /clients/{client_id}`
- `PUT /clients/{client_id}`
- `DELETE /clients/{client_id}`

### Invoices
- `GET /invoices`
- `POST /invoices`
- `GET /invoices/{invoice_id}`
- `PUT /invoices/{invoice_id}`
- `DELETE /invoices/{invoice_id}`
- `PATCH /invoices/{invoice_id}/status`
- `GET /invoices/{invoice_id}/pdf`
- `POST /invoices/{invoice_id}/send`

### Dashboard
- `GET /dashboard/stats`

### Settings
- `GET /settings/payment-methods`
- `POST /settings/payment-methods`
- `PUT /settings/payment-methods/{id}`
- `DELETE /settings/payment-methods/{id}`
- `PATCH /settings/payment-methods/{id}/default`

## Backend Rules
- All data scoped to current `user_id`.
- Return `403` on cross-user access.
- Invoice totals are always computed server-side.
- Status transitions:
  - `draft -> sent`
  - `sent -> paid`
  - `sent -> overdue`
  - `overdue -> paid`
  - `any -> draft` allowed only when not paid
- Password hashing via bcrypt.
- JWT signed with `SECRET_KEY` (HS256), 7-day access token.

## Frontend Routes
- `/auth/login`
- `/auth/register`
- `/dashboard`
- `/invoices`
- `/invoices/new`
- `/invoices/:id`
- `/clients`
- `/clients/:id`
- `/settings`
- `*` (404)

## Core Screens and Flows
- Auth pages (login/register + validation).
- Dashboard (metrics + recent invoices + quick actions).
- Invoices list (search/filter/actions).
- Invoice builder (4 steps: client, details, line items, review/send).
- Invoice detail (preview + status + actions).
- Clients list/detail.
- Settings (profile/payment methods/defaults).

## Acceptance Criteria
- User can register, log in, and log out.
- User can create/edit/delete clients.
- User can create invoice with multi-line items and accurate totals.
- User can download invoice PDF.
- User can send invoice email to client.
- User can mark invoice paid.
- Dashboard totals are correct.
- App works on mobile (320px+) and desktop.
- API errors are shown clearly in UI.
- No unhandled server exceptions leak to clients.
