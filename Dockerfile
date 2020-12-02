FROM python:3.8

ADD . /app

WORKDIR /app

RUN pip install poetry
RUN poetry config virtualenvs.create false
RUN poetry install

CMD ["python", "backend/run.py"]