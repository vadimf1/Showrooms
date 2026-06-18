from rest_framework.pagination import PageNumberPagination
from django.conf import settings

class DefaultPagination(PageNumberPagination):
    page_size_query_param = 'page_size'
    page_query_param = 'page'

    def get_page_size(self, request):
        page_size = super().get_page_size(request)

        max_size = getattr(settings, 'MAX_PAGE_SIZE', 100)

        if page_size:
            return min(page_size, max_size)

        return page_size