from pydantic import BaseModel


class Measurement(BaseModel):
    id: int
    time: int
    value: int

    class Config:
        orm_mode = True
