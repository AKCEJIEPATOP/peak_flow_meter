from typing import List

from pydantic import BaseModel

from .measurement import Measurement


class User(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True


class UserUnfold(User):
    measurements: List[Measurement]


class UserList(BaseModel):
    objects: List[UserUnfold]


class AuthResponse(BaseModel):
    access_token: str
    token_type: str



