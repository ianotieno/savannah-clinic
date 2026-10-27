
from datetime import date, time, timedelta

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from appointments.models import Appointment, Patient
from doctors.models import Doctor, WorkingHour


class AppointmentAPITests(APITestCase):
    def setUp(self):
        self.doctor = Doctor.objects.create(
            name="Dr. Test",
            specialty="General Practitioner",
            is_active=True,
        )

        today = date.today()
        self.patient = Patient.objects.create(
            name="Test Patient",
            email="patient@example.com",
        )

        # Configure Monday-Friday working hours.
        for weekday in range(5):
            WorkingHour.objects.create(
                doctor=self.doctor,
                weekday=weekday,
                start_time=time(9, 0),
                end_time=time(17, 0),
            )

        self.list_url = "/api/appointments/"
        self.booking_url = "/api/appointments/"

    def test_appointment_list_returns_success(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_request_requires_patient_name(self):
        response = self.client.post(
            self.booking_url,
            {
                "patient_email": "patient@example.com",
                "doctor_id": self.doctor.id,
                "appointment_date": (date.today() + timedelta(days=2)).isoformat(),
                "start_time": "10:00",
                "reason": "Routine check-up",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
