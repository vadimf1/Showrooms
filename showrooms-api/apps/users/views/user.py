from rest_framework.viewsets import ModelViewSet
from apps.users.models.user import User
from apps.users.serializers.user import UserSerializer

class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
