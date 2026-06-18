from rest_framework.viewsets import ModelViewSet
from apps.feedback.models import Contact
from apps.feedback.serializers.contact import ContactSerializer

class ContactViewSet(ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer