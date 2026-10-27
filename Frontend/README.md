# Savannah Clinic Booking --- Frontend

A React + TypeScript frontend for the Savannah Informatics
Implementation Engineer clinic-booking assessment. It provides a
dashboard for viewing appointments and doctors, booking appointments,
checking live doctor availability, cancelling appointments, and
rescheduling appointments through the Django REST API.

> **Project status:** Local development is in progress. Do not treat
> this application as publicly deployed until a working public URL has
> been verified.

## Features

-   View clinic appointments and doctor information.
-   Book appointments using doctor availability returned by the backend.
-   Display available 30-minute appointment slots for a selected doctor
    and date.
-   Cancel appointments with a reason.
-   Reschedule an eligible appointment.
-   Display API errors and loading states.
-   Use the backend API as the source of appointment and doctor data.

## Technology

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   Axios for HTTP requests
-   Lucide React for icons

## Project structure

The frontend is located at the project root. The Django backend is in
`backend/`.

``` text
savannah-clinic/
├── src/
│   ├── components/
│   │   └── appointments/
│   ├── data/
│   ├── services/
│   ├── types.ts
│   └── App.tsx
├── backend/
└── package.json
```

The exact structure may evolve as the project develops.

## Requirements

-   Node.js and npm
-   The Django backend and PostgreSQL database running locally

Check installed versions:

``` bash
node --version
npm --version
```

## Run locally

From the project root:

``` bash
npm install
npm run dev
```

Vite prints the local frontend URL in the terminal (commonly
`http://localhost:5173`). Open the URL it prints.

In a separate terminal, start the backend by following
`backend/README.md`. The frontend needs the backend API to be running
for live data and booking operations.

## API configuration

The frontend's API client is in `src/services/`. Confirm the base URL
configured in `src/services/api.ts` (or the corresponding API
configuration file) before running the application. For local
development, it should point to the Django API, commonly:

``` text
http://127.0.0.1:8000/api
```

If the API base URL is configured with a Vite environment variable, use
the variable name expected by the existing API client and define it in a
local `.env` file. Do not commit secrets or machine-specific
configuration.

## Main API operations

The frontend communicates with the backend for operations such as:

  -------------------------------------------------------------------------------------------
  Operation                           API route
  ----------------------------------- -------------------------------------------------------
  List appointments                   `GET /api/appointments/`

  List doctors                        `GET /api/doctors/`

  Check a doctor's availability       `GET /api/doctors/{id}/availability/?date=YYYY-MM-DD`

  Book an appointment                 `POST /api/appointments/`

  Cancel an appointment               `PATCH /api/appointments/{id}/cancel/`

  Reschedule an appointment           `PATCH /api/appointments/{id}/reschedule/`

  Get a patient's appointments        `GET /api/patients/{id}/appointments/`
  -------------------------------------------------------------------------------------------

The backend API is authoritative for booking validation. Client-side
checks improve the user experience but must not replace server-side
validation.

## Build and quality checks

Create a production build:

``` bash
npm run build
```

Run the development server:

``` bash
npm run dev
```

If lint scripts are configured in `package.json`, run the project's
configured lint command as well.

## Design and implementation decisions

-   **React and TypeScript:** Components and types help separate UI
    concerns and catch common data-shape errors during development.
-   **API-backed data:** Doctor and appointment data should come from
    Django rather than being treated as permanent frontend-only state.
-   **Availability from the server:** The UI requests available slots
    for the selected doctor and date so the displayed choices reflect
    backend booking rules.
-   **Server-side validation:** The backend must re-check a slot when a
    booking or reschedule request is submitted because availability can
    change after the UI loads.
-   **Trade-off:** This is a small clinic application. A larger
    production system would likely add authentication, role-based
    access, stronger patient-data protections, monitoring, and more
    comprehensive accessibility and end-to-end tests.

## Deployment

**Public frontend URL:** Not yet verified --- add the deployed URL after
deployment succeeds and the public application has been tested.

For a production deployment, configure the frontend API base URL to
point to the deployed backend. Ensure the backend allows the deployed
frontend origin through its CORS configuration.

## CI/CD

**CI/CD status:** Not yet verified/configured.

The assessment asks for a pipeline that runs tests on pull requests and
automatically deploys when a pull request is merged into a designated
branch. Document the actual workflow file, branch name, checks, and
deployment provider here once configured and tested. Do not describe
automatic deployment as active until it has been verified.

## Known scope and next steps

-   Add and run automated frontend tests.
-   Verify booking, cancellation, and rescheduling end-to-end against
    the live API.
-   Confirm API base URL and CORS configuration for production.
-   Add the verified deployment URL and actual CI/CD details.
