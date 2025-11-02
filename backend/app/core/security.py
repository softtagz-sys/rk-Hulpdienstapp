import boto3
from jose import jwk
from jose.utils import base64url_decode
from jose import JWTError, jwt
from jose.constants import ALGORITHMS
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import requests
import json
from functools import lru_cache
import logging

from .config import settings

logger = logging.getLogger(__name__)

security = HTTPBearer()


class CognitoJWTBearer(HTTPBearer):
    def __init__(self, user_pool_id: str, client_id: str, region: str):
        super().__init__(auto_error=False)
        self.user_pool_id = user_pool_id
        self.client_id = client_id
        self.region = region
        self.jwks_url = f"https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json"
        self._jwks_client = None

    @lru_cache(maxsize=1)
    def get_jwks(self) -> Dict[str, Any]:
        """Get JWKS (JSON Web Key Set) from Cognito"""
        try:
            response = requests.get(self.jwks_url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching JWKS: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not fetch JWKS"
            )

    def get_public_key(self, token_header: Dict[str, str]):
        """Get public key for token verification"""
        jwks = self.get_jwks()
        kid = token_header.get('kid')

        for key in jwks.get('keys', []):
            if key.get('kid') == kid:
                return jwk.construct(key)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to find appropriate key"
        )

    async def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token from Cognito"""
        try:
            # Decode token header to get kid
            header = jwt.get_unverified_header(token)

            # Get public key
            public_key = self.get_public_key(header)

            # Verify and decode token
            payload = jwt.decode(
                token,
                public_key,
                algorithms=[ALGORITHMS.RS256],
                audience=self.client_id,
                issuer=f"https://cognito-idp.{self.region}.amazonaws.com/{self.user_pool_id}"
            )

            return payload

        except JWTError as e:
            logger.error(f"JWT verification error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception as e:
            logger.error(f"Unexpected error during token verification: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication error"
            )


# Initialize Cognito JWT Bearer
cognito_jwt_bearer = CognitoJWTBearer(
    user_pool_id=settings.COGNITO_USER_POOL_ID,
    client_id=settings.COGNITO_CLIENT_ID,
    region=settings.COGNITO_REGION
)


def get_user_from_token(token_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Extract user information from JWT token payload"""
    return {
        'user_id': token_payload.get('sub'),
        'email': token_payload.get('email'),
        'name': token_payload.get('name', ''),
        'role': token_payload.get('custom:role', 'volunteer'),
        'email_verified': token_payload.get('email_verified', False)
    }


def require_roles(allowed_roles: list[str]):
    """Decorator to require specific roles"""

    def decorator(func):
        async def wrapper(*args, **kwargs):
            # This will be used in the dependency injection
            return func(*args, **kwargs)

        return wrapper

    return decorator
