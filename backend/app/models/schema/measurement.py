from pydantic import BaseModel


class Measurement(BaseModel):
    id: int
    description: str

    class Config:
        orm_mode = True
