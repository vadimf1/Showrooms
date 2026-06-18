from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models.auth_token import AuthToken

class TokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.headers.get('Authorization', '')
        if not header.startswith('Token '):
            return None
        token_str = header[6:]
        try:
            auth_token = AuthToken.objects.select_related('user').get(token=token_str)
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed('Invalid token')
        return (auth_token.user, auth_token)
