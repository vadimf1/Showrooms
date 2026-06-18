from datetime import date
from django.db.models import Sum, Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.cars.models.car import Car as CarInstance
from apps.core.models.enums import CarStatus
from apps.dealerships.models.showroom import Showroom
from apps.sales.models.sale import Sale
from apps.sales.models.test_drive import TestDrive

class DashboardView(APIView):
    def get(self, request):
        today = date.today()
        month_start = today.replace(day=1)

                                                                                
        total_cars = CarInstance.objects.count()
        available  = CarInstance.objects.filter(status=CarStatus.AVAILABLE).count()
        reserved   = CarInstance.objects.filter(status=CarStatus.RESERVED).count()
        showrooms  = Showroom.objects.count()

        sales_this_month = Sale.objects.filter(sale_date__gte=month_start)
        sold_count   = sales_this_month.count()
        revenue      = sales_this_month.aggregate(total=Sum('final_price'))['total'] or 0

        pending_td = TestDrive.objects.filter(status='PENDING').count()

                                                                                
        recent_sales = (
            Sale.objects
            .select_related('car__trim__car_model', 'showroom', 'employee')
            .order_by('-created_at')[:8]
        )
        recent_td = (
            TestDrive.objects
            .select_related('showroom')
            .order_by('-created_at')[:8]
        )

        activity = []

        for s in recent_sales:
            trim = s.car.trim if s.car else None
            car_model = trim.car_model if trim else None
            car_name = f"{car_model.make} {car_model.model}" if car_model else '—'
            dealer = f"{s.employee.first_name} {s.employee.last_name}".strip() if s.employee else '—'
            activity.append({
                'type': 'sale',
                'text': f'{dealer} продал {car_name} за {int(s.final_price):,} ₽'.replace(',', ' '),
                'meta': s.showroom.name if s.showroom else '',
                'created_at': s.created_at.isoformat(),
            })

        for td in recent_td:
            status_label = {
                'PENDING': 'Новая заявка',
                'CONFIRMED': 'Подтверждён',
                'COMPLETED': 'Завершён',
                'CANCELLED': 'Отменён',
            }.get(td.status, td.status)
            activity.append({
                'type': 'test_drive',
                'status': td.status,
                'text': f'{status_label} — {td.car_model_info} ({td.name})',
                'meta': td.showroom.name if td.showroom else '',
                'created_at': td.created_at.isoformat(),
            })

        activity.sort(key=lambda x: x['created_at'], reverse=True)

        return Response({
            'stats': {
                'total_cars': total_cars,
                'available': available,
                'reserved': reserved,
                'sold_this_month': sold_count,
                'revenue_this_month': float(revenue),
                'showrooms': showrooms,
                'pending_test_drives': pending_td,
            },
            'recent_activity': activity[:10],
        })
