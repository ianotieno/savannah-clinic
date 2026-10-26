
from datetime import datetime, date as date_type, time, timedelta

from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from doctors.models import Doctor, WorkingHour
from .models import Appointment, Patient
from .serializers import (
    AppointmentSerializer,
    BookingSerializer,
    CancellationSerializer,
    RescheduleSerializer,
)


SLOT_DURATION = timedelta(minutes=30)
BOOKING_CUTOFF = timedelta(hours=1)


def make_local_datetime(appointment_date, start_time):
    """Combine a date and time using the configured local timezone."""
    naive_datetime = datetime.combine(appointment_date, start_time)
    return timezone.make_aware(
        naive_datetime,
        timezone.get_current_timezone(),
    )


def validate_slot(doctor, appointment_date, start_time, exclude_id=None):
    """Validate a requested slot before creating or moving an appointment."""

    if start_time.second != 0 or start_time.microsecond != 0:
        raise ValidationError({
            "start_time": "Use a start time on the hour or half-hour."
        })

    if start_time.minute not in (0, 30):
        raise ValidationError({
            "start_time": "Appointments must start on a 30-minute interval."
        })

    slot_start = make_local_datetime(appointment_date, start_time)
    now = timezone.now()

    if slot_start < now + BOOKING_CUTOFF:
        raise ValidationError({
            "appointment_date": (
                "Appointments must be booked at least one hour in advance."
            )
        })

    weekday = appointment_date.weekday()

    working_hours = WorkingHour.objects.filter(
        doctor=doctor,
        weekday=weekday,
    )

    slot_end = (
        datetime.combine(appointment_date, start_time) + SLOT_DURATION
    ).time()

    works_during_slot = any(
        start_time >= hours.start_time and slot_end <= hours.end_time
        for hours in working_hours
    )

    if not works_during_slot:
        raise ValidationError({
            "start_time": (
                "This slot is outside the doctor's working hours."
            )
        })

    existing = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=appointment_date,
        start_time=start_time,
        status=Appointment.Status.UPCOMING,
    )

    if exclude_id is not None:
        existing = existing.exclude(id=exclude_id)

    if existing.exists():
        raise ValidationError({
            "start_time": "This appointment slot has already been booked."
        })


class AppointmentCreateView(APIView):
    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        doctor = get_object_or_404(
            Doctor,
            id=data["doctor_id"],
            is_active=True,
        )

        try:
            with transaction.atomic():
                validate_slot(
                    doctor=doctor,
                    appointment_date=data["appointment_date"],
                    start_time=data["start_time"],
                )

                patient, _ = Patient.objects.get_or_create(
                    email=data["patient_email"].strip().lower(),
                    defaults={"name": data["patient_name"]},
                )

                appointment = Appointment.objects.create(
                    patient=patient,
                    doctor=doctor,
                    appointment_date=data["appointment_date"],
                    start_time=data["start_time"],
                    reason=data["reason"],
                )

        except ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            return Response(
                {"detail": "This appointment slot has already been booked."},
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED,
        )


class DoctorAvailabilityView(APIView):
    def get(self, request, doctor_id):
        doctor = get_object_or_404(
            Doctor,
            id=doctor_id,
            is_active=True,
        )

        raw_date = request.query_params.get("date")
        if not raw_date:
            return Response(
                {"date": "Please provide a date in YYYY-MM-DD format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            requested_date = date_type.fromisoformat(raw_date)
        except ValueError:
            return Response(
                {"date": "Invalid date. Use YYYY-MM-DD format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        hours = WorkingHour.objects.filter(
            doctor=doctor,
            weekday=requested_date.weekday(),
        ).order_by("start_time")

        slots = []
        now = timezone.now()

        for working_hour in hours:
            current = datetime.combine(
                requested_date,
                working_hour.start_time,
            )
            closing = datetime.combine(
                requested_date,
                working_hour.end_time,
            )

            while current + SLOT_DURATION <= closing:
                start_time = current.time()

                is_future_enough = (
                    make_local_datetime(requested_date, start_time)
                    >= now + BOOKING_CUTOFF
                )

                is_booked = Appointment.objects.filter(
                    doctor=doctor,
                    appointment_date=requested_date,
                    start_time=start_time,
                    status=Appointment.Status.UPCOMING,
                ).exists()

                slots.append({
                    "start_time": start_time.strftime("%H:%M"),
                    "end_time": (
                        current + SLOT_DURATION
                    ).time().strftime("%H:%M"),
                    "available": is_future_enough and not is_booked,
                })

                current += SLOT_DURATION

        return Response({
            "doctor": {
                "id": doctor.id,
                "name": doctor.name,
                "specialty": doctor.specialty,
            },
            "date": requested_date.isoformat(),
            "slots": slots,
        })


class AppointmentCancelView(APIView):
    def patch(self, request, appointment_id):
        serializer = CancellationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            appointment = get_object_or_404(
                Appointment.objects.select_for_update(),
                id=appointment_id,
            )

            if appointment.status == Appointment.Status.CANCELLED:
                return Response(
                    {"detail": "This appointment has already been cancelled."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if appointment.status == Appointment.Status.COMPLETED:
                return Response(
                    {"detail": "A completed appointment cannot be cancelled."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            appointment.status = Appointment.Status.CANCELLED
            appointment.cancellation_reason = (
                serializer.validated_data["reason"]
            )
            appointment.save(
                update_fields=[
                    "status",
                    "cancellation_reason",
                    "updated_at",
                ]
            )

        return Response(AppointmentSerializer(appointment).data)


class AppointmentRescheduleView(APIView):
    def patch(self, request, appointment_id):
        serializer = RescheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            with transaction.atomic():
                appointment = get_object_or_404(
                    Appointment.objects.select_for_update(),
                    id=appointment_id,
                )

                if appointment.status == Appointment.Status.CANCELLED:
                    return Response(
                        {"detail": "A cancelled appointment cannot be rescheduled."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if appointment.status == Appointment.Status.COMPLETED:
                    return Response(
                        {"detail": "A completed appointment cannot be rescheduled."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                validate_slot(
                    doctor=appointment.doctor,
                    appointment_date=data["appointment_date"],
                    start_time=data["start_time"],
                    exclude_id=appointment.id,
                )

                appointment.appointment_date = data["appointment_date"]
                appointment.start_time = data["start_time"]
                appointment.save(
                    update_fields=[
                        "appointment_date",
                        "start_time",
                        "updated_at",
                    ]
                )

        except ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            return Response(
                {"detail": "This appointment slot has already been booked."},
                status=status.HTTP_409_CONFLICT,
            )

        return Response(AppointmentSerializer(appointment).data)


class PatientAppointmentsView(APIView):
    def get(self, request, patient_id):
        patient = get_object_or_404(Patient, id=patient_id)
        today = timezone.localdate()

        appointments = patient.appointments.filter(
            status=Appointment.Status.UPCOMING,
            appointment_date__gte=today,
        ).select_related("doctor", "patient").order_by(
            "appointment_date",
            "start_time",
        )

        return Response(AppointmentSerializer(appointments, many=True).data)
