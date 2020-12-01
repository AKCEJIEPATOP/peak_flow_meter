import secrets
import time
from datetime import datetime

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


def calculate_percentage(morning, evening):
    if not morning or not evening:
        return None
    return (evening - morning)/(0.5*(evening + morning))*100


def form_daily_stats(measurements):
    timings = [i.time / 1000 + 3 * 3600 for i in measurements]
    max_timestamp = max(timings)
    min_timestamp = min(timings)

    dt = datetime.utcfromtimestamp(min_timestamp)
    aligned_timestamp = min_timestamp - dt.second - dt.minute * 60 - dt.hour * 3600
    temp = int(aligned_timestamp)
    daily_stats = {}

    while temp < max_timestamp:
        dt = datetime.utcfromtimestamp(temp)
        date = f'{dt.day}.{dt.month}.{dt.year}'
        if date not in daily_stats:
            daily_stats[date] = {
                "day_start": int(temp * 1000),
                "day_end": int((temp + 24 * 3600) * 1000),
                'measurements': {
                    'morning': [],
                    'evening': [],
                },
            }
        temp += 24 * 60 * 60
    # print(daily_stats)

    for measurement in measurements:
        timestamp = measurement.time / 1000 + 3 * 60 * 60  # local offset
        dt = datetime.utcfromtimestamp(timestamp)
        date = f'{dt.day}.{dt.month}.{dt.year}'
        daily_stats[date]['measurements']['morning' if dt.hour < 12 else 'evening'].append(
            measurement.value
        )
    # print(daily_stats)

    for _, info in daily_stats.items():
        morning = info['measurements']['morning']
        morning = sum(morning) / len(morning) if len(morning) != 0 else None
        evening = info['measurements']['evening']
        evening = sum(evening) / len(evening) if len(evening) != 0 else None
        del info['measurements']
        info['morning'] = morning
        info['evening'] = evening
        info['percentage'] = calculate_percentage(morning, evening)
    # print(daily_stats)

    return daily_stats

    # daily_stats = {}
    # max_timestamp = measurements[0].time / 1000 + 3 * 60 * 60
    # min_timestamp = measurements[0].time / 1000 + 3 * 60 * 60
    # for measurement in measurements:
    #     timestamp = measurement.time / 1000 + 3 * 60 * 60  # local offset
    #     if timestamp > max_timestamp:
    #         max_timestamp = timestamp
    #     if timestamp < min_timestamp:
    #         min_timestamp = timestamp
    #
    #     dt = datetime.utcfromtimestamp(timestamp)
    #     aligned_timestamp = (timestamp - dt.second - dt.minute * 60 - dt.hour * 3600 * 1000).floor()
    #     date = f'{dt.day}.{dt.month}.{dt.year}'
    #     info = {
    #         "value": measurement.value,
    #         "hour": dt.hour,
    #         "day_start": aligned_timestamp,
    #         "day_end": aligned_timestamp + 24 * 3600 * 1000,
    #     }
    #     daily_stats[date] = [info] + (daily_stats[date] if date in daily_stats else [])
    #
    # temp = min_timestamp
    # while temp < max_timestamp:
    #     dt = datetime.utcfromtimestamp(temp)
    #     date = f'{dt.day}.{dt.month}.{dt.year}'
    #     if date not in daily_stats:
    #         daily_stats[date] = None
    #     temp += 24 * 60 * 60
    #
    # print(daily_stats)
    #
    # new_dict = {}
    # for day, stats in daily_stats.items():
    #     if stats is None:
    #         new_dict[day] = {
    #             "morning": None,
    #             "evening": None,
    #             "percentage": None,
    #             "day_start": stats[0]["day_start"],
    #             "day_end": stats[0]["day_end"],
    #         }
    #         continue
    #
    #     morning_sum = 0
    #     morning_count = 0
    #     evening_sum = 0
    #     evening_count = 0
    #     for stat in stats:
    #         if stat['hour'] < 12:
    #             morning_sum += stat['value']
    #             morning_count += 1
    #         else:
    #             evening_sum += stat['value']
    #             evening_count += 1
    #
    #     morning_avg = morning_sum / morning_count if morning_sum != 0 else None
    #     evening_avg = evening_sum / evening_count if evening_sum != 0 else None
    #     new_dict[day] = {
    #         "morning": morning_avg,
    #         "evening": evening_avg,
    #         "percentage": calculate_percentage(morning_avg, evening_avg),
    #         "day_start": stats[0]["day_start"],
    #         "day_end": stats[0]["day_end"],
    #     }
    # print(new_dict)


@router.get('/get_self_info', response_model=UserUnfold)
async def get_self_info(user: UserSchema = authenticated_user):
    with session_scope() as session:
        user = session.query(User).options(joinedload(User.measurements)).get(user.id)
        session.expunge(user)

        # Разбиение по дням
        user.daily_stats = form_daily_stats(user.measurements)

        # Плавающее среднее
        measurement_sum = 0
        user.sl_mean = []
        for i, measurement in enumerate(user.measurements):
            measurement_sum += measurement.value
            user.sl_mean += [int(measurement_sum / (i + 1))]

        # Экстраполяция
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
