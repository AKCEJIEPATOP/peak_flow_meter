import secrets
import time

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import joinedload
from passlib.hash import pbkdf2_sha256

from app.exstrapolate import extrapolation
from app.models.db import session_scope, User, Measurement
from app.models.schema.user import UserList, AuthResponse, User as UserSchema, UserUnfold, \
    UserRegistration
from app.api.dependencies.auth import authenticated_user

router = APIRouter()


@router.post('/register')
async def register(user: UserRegistration):
    with session_scope() as session:
        exists_user = session.query(User).filter(User.username == user.username).first()

        if exists_user is not None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, 'Пользователь уже существует')

        new_user = User(
            username=user.username,
            password_hash=pbkdf2_sha256.hash(user.password),
            token=secrets.token_hex(32),
            normal_threshold=100,
            warning_threshold=120,
        )
        session.add(new_user)

        return AuthResponse(access_token=new_user.token, token_type='bearer')


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


@router.get('/get_self_info', response_model=UserUnfold)
async def get_self_info(user: UserSchema = authenticated_user):
    with session_scope() as session:
        user = session.query(User).options(joinedload(User.measurements)).get(user.id)
        session.expunge(user)
        measurement_sum = 0
        user.sl_mean = []
        for i, measurement in enumerate(user.measurements):
            measurement_sum += measurement.value
            user.sl_mean += [int(measurement_sum / (i + 1))]
        user.extra = None
        if len(user.measurements) > 4:
            x = [i.time for i in user.measurements]
            y = [i.value for i in user.measurements]
            user.extra = extrapolation(x, y)
        return user


@router.post('/add_measurement')
async def add_measurement(value: int, user: UserSchema = authenticated_user):
    with session_scope() as session:
        user = session.query(User).get(user.id)
        user.measurements.append(Measurement(time=int(round(time.time() * 1000)), value=value))
