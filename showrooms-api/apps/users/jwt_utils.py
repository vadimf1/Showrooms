import datetime
import jwt
from django.conf import settings

ACCESS_LIFETIME  = datetime.timedelta(hours=8)
REFRESH_LIFETIME = datetime.timedelta(days=30)

def _encode(payload: dict) -> str:
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def _decode(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])

def generate_tokens(user, first_name: str = '', last_name: str = '') -> dict:
    now = datetime.datetime.now(datetime.timezone.utc)
    access_payload = {
        'user_id':    str(user.id),
        'role':       user.role,
        'first_name': first_name,
        'last_name':  last_name,
        'type':       'access',
        'iat':        now,
        'exp':        now + ACCESS_LIFETIME,
    }
    refresh_payload = {
        'user_id': str(user.id),
        'type':    'refresh',
        'iat':     now,
        'exp':     now + REFRESH_LIFETIME,
    }
    return {
        'access':  _encode(access_payload),
        'refresh': _encode(refresh_payload),
    }

def decode_access(token: str) -> dict:
    payload = _decode(token)
    if payload.get('type') != 'access':
        raise jwt.InvalidTokenError('Not an access token')
    return payload

def decode_refresh(token: str) -> dict:
    payload = _decode(token)
    if payload.get('type') != 'refresh':
        raise jwt.InvalidTokenError('Not a refresh token')
    return payload
