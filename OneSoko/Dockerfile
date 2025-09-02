# Production Dockerfile for OneSoko Django Application
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=MyOneSoko.settings

# Install system dependencies
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd --create-home --shell /bin/bash app

# Set work directory
WORKDIR /app

# Change ownership of the app directory
RUN chown -R app:app /app

# Switch to app user
USER app

# Copy and install Python dependencies
COPY --chown=app:app requirements_basic.txt .
RUN pip install --no-cache-dir --user -r requirements_basic.txt

# Copy project files
COPY --chown=app:app . .

# Create necessary directories
RUN mkdir -p /app/logs /app/staticfiles /app/media

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python manage.py check

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "MyOneSoko.wsgi:application"]

# Expose port
EXPOSE 8000

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "MyOneSoko.wsgi:application"]
