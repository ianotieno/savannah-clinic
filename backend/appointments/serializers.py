
from rest_framework import serializers

from doctors.models import Doctor, WorkingHour
from .models import Appointment, Patient


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "name", "email"]


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ["id", "name", "specialty", "is_active"]


class AppointmentSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)

    patient_id = serializers.IntegerField(read_only=True)
    doctor_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_id",
            "doctor",
            "doctor_id",
            "appointment_date",
            "start_time",
            "end_time",
            "reason",
            "status",
            "cancellation_reason",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class BookingSerializer(serializers.Serializer):
    patient_name = serializers.CharField(max_length=120)
    patient_email = serializers.EmailField()
    doctor_id = serializers.IntegerField(min_value=1)
    appointment_date = serializers.DateField()
    start_time = serializers.TimeField()
    reason = serializers.CharField(max_length=500, trim_whitespace=True)

    def validate_patient_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Patient name is required.")
        return value

    def validate_reason(self, value):
        if not value.strip():
            raise serializers.ValidationError("Appointment reason is required.")
        return value.strip()

    def validate_doctor_id(self, value):
        if not Doctor.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError(
                "The selected doctor does not exist or is inactive."
            )
        return value


class CancellationSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=500, trim_whitespace=True)

    def validate_reason(self, value):
        if not value.strip():
            raise serializers.ValidationError("A cancellation reason is required.")
        return value.strip()


class RescheduleSerializer(serializers.Serializer):
    appointment_date = serializers.DateField()
    start_time = serializers.TimeField()
