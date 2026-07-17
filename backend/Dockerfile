FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

COPY ./pyproject.toml /code/pyproject.toml

RUN uv pip install --system --no-cache -r /code/pyproject.toml

COPY ./app /code/app

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]