from fastapi import APIRouter

from . import user

router = APIRouter()

router.include_router(user.router, prefix='/user', tags=['User'])


@router.get('/ping')
async def ping():
    return 'pong'
