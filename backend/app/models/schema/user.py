from typing import List, Optional

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
    sl_mean: Optional[List[int]]
    extra: Optional[List[int]]


class UserList(BaseModel):
    objects: List[UserUnfold]


class AuthResponse(BaseModel):
    access_token: str
    token_type: str



