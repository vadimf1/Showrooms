from collections import defaultdict
from datetime import date, time, datetime, timedelta

from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.dealerships.models.showroom import Showroom
from apps.users.models.employee import Employee
from apps.sales.models.test_drive import TestDrive, TestDriveStatus

def _generate_slots(work_start: time, work_end: time) -> list[time]:
    slots, current = [], datetime.combine(date.today(), work_start)
    end = datetime.combine(date.today(), work_end)
    while current < end:
        slots.append(current.time())
        current += timedelta(hours=1)
    return slots

class AvailabilityView(APIView):

    def get(self, request):
        showroom_id = request.query_params.get('showroom_id')
        date_str    = request.query_params.get('date')
        time_str    = request.query_params.get('time')

        try:
            showroom = Showroom.objects.get(pk=showroom_id)
        except (Showroom.DoesNotExist, Exception):
            return Response({'error': 'showroom not found'}, status=status.HTTP_404_NOT_FOUND)

                                         
        employees = list(Employee.objects.filter(showrooms=showroom))
        employee_count = len(employees)

        if employee_count == 0:
            return Response([])

        if not date_str and not time_str:
            return self._available_dates(showroom, employee_count)

        if date_str and not time_str:
            return self._available_slots(showroom, date_str, employee_count)

        if date_str and time_str:
            return self._available_employees(showroom, date_str, time_str, employees)

        return Response({'error': 'invalid params'}, status=status.HTTP_400_BAD_REQUEST)

    def _available_dates(self, showroom: Showroom, employee_count: int) -> Response:
        today     = timezone.localtime(timezone.now()).date()
        date_from = today
        date_to   = today + timedelta(days=30)
        slots     = _generate_slots(showroom.work_start, showroom.work_end)

                                                               
        bookings = (
            TestDrive.objects
            .filter(
                showroom=showroom,
                status=TestDriveStatus.CONFIRMED,
                preferred_date__range=(date_from, date_to),
                preferred_time__isnull=False,
            )
            .values_list('preferred_date', 'preferred_time')
        )

                                                        
        busy: dict[date, dict[time, int]] = defaultdict(lambda: defaultdict(int))
        for d, t in bookings:
            busy[d][t] += 1

        available = []
        for i in range(30):
            d = today + timedelta(days=i)
            for slot in slots:
                if busy[d][slot] < employee_count:
                    available.append(str(d))
                    break

        return Response(available)

    def _available_slots(self, showroom: Showroom, date_str: str, employee_count: int) -> Response:
        try:
            d = date.fromisoformat(date_str)
        except ValueError:
            return Response({'error': 'invalid date'}, status=status.HTTP_400_BAD_REQUEST)

        slots = _generate_slots(showroom.work_start, showroom.work_end)

                                                         
        bookings = (
            TestDrive.objects
            .filter(
                showroom=showroom,
                status=TestDriveStatus.CONFIRMED,
                preferred_date=d,
                preferred_time__isnull=False,
            )
            .values_list('preferred_time', flat=True)
        )

        busy: dict[time, int] = defaultdict(int)
        for t in bookings:
            busy[t] += 1

        return Response([
            slot.strftime('%H:%M')
            for slot in slots
            if busy[slot] < employee_count
        ])

    def _available_employees(
        self, showroom: Showroom, date_str: str, time_str: str, employees: list
    ) -> Response:
        try:
            d = date.fromisoformat(date_str)
            t = time.fromisoformat(time_str)
        except ValueError:
            return Response({'error': 'invalid date or time'}, status=status.HTTP_400_BAD_REQUEST)

                                                             
        busy_ids = set(
            TestDrive.objects
            .filter(
                showroom=showroom,
                status=TestDriveStatus.CONFIRMED,
                preferred_date=d,
                preferred_time=t,
            )
            .values_list('employee_id', flat=True)
        )

        return Response([
            {'id': str(e.id), 'first_name': e.first_name, 'last_name': e.last_name, 'position': e.position}
            for e in employees
            if e.id not in busy_ids
        ])
