from app.models.db import session_scope, engine, Base, User, Measurement
import time
import random
import os

if __name__ == '__main__':
    if os.path.isfile('db.db'):
        os.remove('db.db')

    Base.metadata.create_all(engine)

    marks = 5
    current_time = int(time.time() * 1000)
    time_step = 15 * 1000

    with session_scope() as session:
        user = User(
            username='TestUser',
            password_hash='$pbkdf2-sha256$29000$s1aq1fo/x1jL.b93rpXSWg$eUFDmZJzw3sWLtj0rwuI90vBZ1hTW9ElEL9i.qBXfgc',
            normal_threshold=100,
            warning_threshold=120,
            measurements=[
                Measurement(
                    time=current_time - (marks - i) * time_step,
                    value=110 + random.randrange(-15, 15, 1),
                ) for i in range(marks)
            ],
        )
        session.add(user)
