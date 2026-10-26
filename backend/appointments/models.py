
from datetime import datetime, timedelta

from django.db import models
from django.db.models import Q


class Patient(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Appointment(models.Model):
    class Status(models.TextChoices):
        UPCOMING = "upcoming", "Upcoming"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="appointments",
    )
    doctor = models.ForeignKey(
        "doctors.Doctor",
        on_delete=models.PROTECT,
        related_name="appointments",
    )
    appointment_date = models.DateField()
    start_time = models.TimeField()
    reason = models.CharField(max_length=500)
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.UPCOMING,
    )
    cancellation_reason = models.CharField(
        max_length=500,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["appointment_date", "start_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["doctor", "appointment_date", "start_time"],
                condition=Q(status="upcoming"),
                name="unique_active_doctor_slot",
            ),
        ]
        indexes = [
            models.Index(
                fields=[
                    "patient",
                    "status",
                    "appointment_date",
                    "start_time",
                ],
                name="patient_appt_lookup_idx",
            ),
        ]

    @property
    def end_time(self):
        return (
            datetime.combine(self.appointment_date, self.start_time)
            + timedelta(minutes=30)
        ).time()

    def __str__(self):
        return (
            f"{self.patient.name} with {self.doctor.name} on "
            f"{self.appointment_date} at {self.start_time:%H:%M}"
        )
