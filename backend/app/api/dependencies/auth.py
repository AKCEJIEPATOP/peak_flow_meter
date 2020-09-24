from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer

from app.models.db import User, session_scope
from app.models.schema.user import User as UserSchema


oauth2_schema = OAuth2PasswordBearer(tokenUrl='/user/login')


@Depends
def authenticated_user(token: str = Depends(oauth2_schema)) -> UserSchema:
    with session_scope() as session:
        user = session.query(User).filter(User.token == token).first()
        if user is None:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Invalid token.')

        return UserSchema.from_orm(user)
