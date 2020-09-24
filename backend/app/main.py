from fastapi import FastAPI

from app.api.routes.root import router

app = FastAPI()
app.include_router(router)
