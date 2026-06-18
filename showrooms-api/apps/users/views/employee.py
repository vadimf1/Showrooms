from django.db.models import Q
from rest_framework.viewsets import ModelViewSet
from apps.users.models.employee import Employee
from apps.users.serializers.employee import EmployeeSerializer

class EmployeeViewSet(ModelViewSet):
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        qs = Employee.objects.select_related('user', 'address', 'showrooms').all()
        search = self.request.query_params.get('search', '').strip()
        if search:
            for token in search.split():
                qs = qs.filter(
                    Q(first_name__icontains=token) |
                    Q(last_name__icontains=token) |
                    Q(user__username__icontains=token) |
                    Q(position__icontains=token) |
                    Q(showrooms__name__icontains=token)
                )
        return qs
