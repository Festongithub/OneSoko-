# Simple Dockerfile for OneSoko Django Application

FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements_basic.txt .
RUN pip install --no-cache-dir -r requirements_basic.txt

# Copy project files
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs /app/staticfiles

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "MyOneSoko.wsgi:application"]
