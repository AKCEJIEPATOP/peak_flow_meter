from typing import List, ContextManager
from contextlib import contextmanager

from sqlalchemy import Integer, Column, String, ForeignKey, create_engine
from sqlalchemy.orm import relationship, sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    password_hash = Column(String)
    token = Column(String, nullable=True)

    measurements: List['Measurement'] = relationship('Measurement', back_populates='user', cascade='all, delete')


class Measurement(Base):
    __tablename__ = 'measurements'

    id = Column(Integer, primary_key=True)
    description = Column(String)

    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship('User', back_populates='measurements')


engine = create_engine('sqlite:///db.db', echo=True)
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)


@contextmanager
def session_scope() -> ContextManager[Session]:
    session = DBSession()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
