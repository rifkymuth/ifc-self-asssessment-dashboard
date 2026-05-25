# syntax=docker/dockerfile:1.7

FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=5000

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

EXPOSE 5000

# Shell form so ${PORT} is expanded from the environment. app:app is the
# module-level Flask instance created in app.py.
CMD gunicorn --bind "0.0.0.0:${PORT}" --workers 2 app:app
