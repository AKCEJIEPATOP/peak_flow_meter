from app.models.db import session_scope, engine, Base, User, Measurement


if __name__ == '__main__':
    Base.metadata.create_all(engine)

    with session_scope() as session:
        user = User(
            username='Astmatik',
            password_hash='$pbkdf2-sha256$29000$s1aq1fo/x1jL.b93rpXSWg$eUFDmZJzw3sWLtj0rwuI90vBZ1hTW9ElEL9i.qBXfgc',
            measurements=[
                Measurement(description='umer'),
                Measurement(description='naebal'),
            ],
        )
        session.add(user)
