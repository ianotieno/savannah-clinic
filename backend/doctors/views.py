
from rest_framework.generics import ListAPIView

from .models import Doctor
from .serializers import DoctorSerializer


class DoctorListView(ListAPIView):
    serializer_class = DoctorSerializer

    def get_queryset(self):
        return Doctor.objects.filter(is_active=True).order_by("name")
