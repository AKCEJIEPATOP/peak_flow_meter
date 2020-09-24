import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import joinedload
from passlib.hash import pbkdf2_sha256

from app.models.db import session_scope, User
from app.models.schema.user import UserList, AuthResponse, User as UserSchema
from app.api.dependencies.auth import authenticated_user

router = APIRouter()


@router.post('/login', response_model=AuthResponse)
async def login(credentials: OAuth2PasswordRequestForm = Depends()):
    with session_scope() as session:
        user = session.query(User).filter(User.username == credentials.username).first()
        if user is None or not pbkdf2_sha256.verify(credentials.password, user.password_hash):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Invalid credentials')

        if user.token is None:
            user.token = secrets.token_hex(32)

        return AuthResponse(access_token=user.token, token_type='bearer')


@router.get('/list', response_model=UserList)
async def list_users():
    with session_scope() as session:
        users = session.query(User).options(joinedload(User.measurements)).all()
        session.expunge_all()

        return {'objects': users}


@router.get('/profile', response_model=UserSchema)
async def profile(user: UserSchema = authenticated_user):
    return user
