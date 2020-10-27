from typing import List

from pydantic import BaseModel

from .measurement import Measurement


class User(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True


class UserRegistration(BaseModel):
    username: str
    password: str


class UserUnfold(User):
    normal_threshold: int
    warning_threshold: int
    measurements: List[Measurement]


class UserList(BaseModel):
    objects: List[UserUnfold]


class AuthResponse(BaseModel):
    access_token: str
    token_type: str



