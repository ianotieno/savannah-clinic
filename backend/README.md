# Savannah Clinic Booking --- Backend API

Django REST Framework API backed by PostgreSQL for the Savannah
Informatics Implementation Engineer clinic-booking assessment.

> **Project status:** The Django system check has passed in local
> development. Automated tests still need to be added/run, and public
> deployment and CI/CD must be verified before being described as
> complete.

## Scenario and requirements

The assessment describes a clinic with five doctors. Patients should be
able to see available 30-minute slots for a doctor on a selected date,
book a slot, cancel an appointment, and reschedule an appointment.

The API must validate bookings, return meaningful errors with
appropriate HTTP status codes, prevent double booking, and include basic
automated test coverage. Bonus requirements include upcoming patient
appointments and preventing bookings less than one hour in advance.

## Technology

-   Python
-   Django
-   Django REST Framework
-   PostgreSQL
-   `django-cors-headers` for cross-origin requests from the frontend
-   `python-dotenv` for local environment configuration

## Project structure

``` text
backend/
├── manage.py
├── config/
│   ├── settings.py
│   └── urls.py
├── doctors/
│   ├── models.py
│   ├── views.py
│   └── urls.py
├── appointments/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── tests.py
├── .env
└── requirements.txt
```

Some files, including `tests.py` or `requirements.txt`, may need to be
created or updated as development continues. Do not commit `.env`.

## Data model

### Doctor

Stores a doctor's name, specialty, and active status.

### WorkingHour

Stores each doctor's working schedule by weekday, with a start and end
time. The current seed plan uses weekdays and 09:00--17:00 as sample
working hours; replace these with the clinic's confirmed schedule if one
is provided.

### Patient

Stores a patient's name and email address. The current implementation
uses a unique email address to identify patient records.

### Appointment

Connects a patient to a doctor and stores the appointment date, start
time, reason, status, and cancellation reason. The appointment model
represents 30-minute appointments. Cancelled appointments should not
reserve their previous slot.

## Design decisions and trade-offs

-   **Django REST Framework:** Provides serializers, API views, routing,
    and structured validation for a REST API.
-   **PostgreSQL:** Provides relational integrity and supports database
    constraints for booking consistency.
-   **Separate doctor and appointment apps:** Keeps doctor schedules and
    appointment operations separate rather than putting the entire
    system in one file.
-   **Working hours stored as data:** Allows each doctor to have a
    schedule rather than hard-coding hours in the booking endpoint.
-   **Appointment status:** A cancelled appointment is retained for
    history, while its slot becomes available again. This preserves a
    record of the cancellation.
-   **Double-booking protection:** The API checks availability, and the
    database should enforce uniqueness for active/upcoming appointments
    for the same doctor, date, and start time.
-   **Time zone:** The Django settings use `Africa/Nairobi`. Keep time
    handling consistent between the API, database, and frontend.
-   **Trade-off:** The initial system is intentionally small.
    Authentication, authorization, audit logging, notifications, and
    more advanced concurrency handling are future production-hardening
    work.

## Requirements

-   Python (use a version supported by the project's installed Django
    version)
-   PostgreSQL
-   A virtual environment

## Configure local environment

Create a local `.env` file in the `backend/` directory. Use the variable
names read by `config/settings.py`. For example, if the settings use
these names:

``` dotenv
DB_NAME=savannah_clinic
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=127.0.0.1
DB_PORT=5432
```

Adjust the names to match the actual settings file. Do not commit
credentials. Ensure the PostgreSQL database exists before running
migrations.

## Install and run locally

From the `backend/` directory:

``` bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py check
python manage.py runserver
```

The local API is commonly available at `http://127.0.0.1:8000/`.

If `requirements.txt` is not yet present, create it from the active
virtual environment after confirming the intended dependencies:

``` bash
pip freeze > requirements.txt
```

Review the generated file before committing it; it can include
environment-specific packages.

## API endpoints

The following routes reflect the current project routing described
during development. Confirm the request and response fields against the
current serializers/views before final submission.

  ---------------------------------------------------------------------------------------------------
  Method                  Endpoint                                            Purpose
  ----------------------- --------------------------------------------------- -----------------------
  `GET`                   `/api/doctors/`                                     List doctors

  `GET`                   `/api/appointments/`                                List appointments

  `POST`                  `/api/appointments/`                                Book an appointment

  `GET`                   `/api/doctors/{id}/availability/?date=YYYY-MM-DD`   Return 30-minute slots
                                                                              and their availability

  `PATCH`                 `/api/appointments/{id}/cancel/`                    Cancel an appointment
                                                                              with a reason

  `PATCH`                 `/api/appointments/{id}/reschedule/`                Move an appointment to
                                                                              a validated new slot

  `GET`                   `/api/patients/{id}/appointments/`                  List a patient's
                                                                              appointments, intended
                                                                              for the bonus
                                                                              requirement
  ---------------------------------------------------------------------------------------------------

### Booking validation

The booking API should reject requests when:

-   The doctor does not exist or is inactive.
-   The date/time is in the past.
-   The requested slot is outside the doctor's working hours.
-   The requested start time does not align with a 30-minute slot.
-   The slot is already booked.
-   The booking violates the one-hour advance-booking rule, if that rule
    is enabled.

Cancellation should require a reason, return a meaningful error if the
appointment is already cancelled, and release the slot. Rescheduling
should validate the new slot using the same rules as a new booking and
reject cancelled appointments.

## Seed data

The assessment scenario starts with five doctors. Working-hour records
must also exist for availability calculations to return slots. Seed
sample doctors and schedules using a repeatable management command or
Django shell script, and confirm the counts before testing. Avoid
inserting duplicate records when running the seed process more than
once.

## Tests and checks

Run Django's system checks:

``` bash
python manage.py check
```

Run the backend test suite:

``` bash
python manage.py test
```

Run tests for a specific app:

``` bash
python manage.py test appointments
```

A successful test command that reports `Found 0 test(s)` does **not**
demonstrate test coverage. Add tests for successful booking, invalid
requests, double booking, availability, cancellation (including repeated
cancellation), rescheduling, and the one-hour rule before submission.

## Deployment

**Public backend URL:** Not yet verified --- add the public URL after
deployment succeeds and the API has been tested externally.

For deployment, configure PostgreSQL credentials and other environment
variables through the hosting provider's environment settings, not in
committed source files. Configure `ALLOWED_HOSTS`, `DEBUG`, CORS
origins, static-file handling if needed, and production security
settings for the selected host.

## CI/CD

**CI/CD status:** Not yet verified/configured.

The assessment requires automated tests on every pull request and
automatic deployment when a pull request is merged into a designated
branch. Once configured, document the actual CI provider, workflow
filename, branch, test command, deployment target, and successful
verification.

## Security and future improvements

-   Add authentication and authorization before exposing patient records
    publicly.
-   Restrict patient appointment access to the appropriate patient or
    authorized staff.
-   Keep secrets out of source control and use HTTPS in production.
-   Add API-level and concurrency tests around simultaneous attempts to
    book the same slot.
-   Add logging, monitoring, and a database backup plan before real
    clinic use.
