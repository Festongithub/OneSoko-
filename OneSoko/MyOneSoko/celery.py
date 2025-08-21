# Install: pip install celery redis django-celery-beat django-celery-results

# Celery Configuration for Background Tasks
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MyOneSoko.settings')

app = Celery('MyOneSoko')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Configuration
CELERY_BROKER_URL = 'redis://localhost:6379/4'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/5'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Task routing for different queues
CELERY_TASK_ROUTES = {
    'OneSokoApp.tasks.send_email': {'queue': 'emails'},
    'OneSokoApp.tasks.process_payment': {'queue': 'payments'},
    'OneSokoApp.tasks.generate_reports': {'queue': 'reports'},
    'OneSokoApp.tasks.optimize_images': {'queue': 'images'},
}

# Worker configuration
CELERY_WORKER_CONCURRENCY = 4  # Number of worker processes
CELERY_WORKER_PREFETCH_MULTIPLIER = 1  # Disable prefetching for fair distribution
CELERY_TASK_ACKS_LATE = True  # Acknowledge tasks after completion
CELERY_WORKER_DISABLE_RATE_LIMITS = False

# Task time limits
CELERY_TASK_TIME_LIMIT = 300  # 5 minutes hard limit
CELERY_TASK_SOFT_TIME_LIMIT = 240  # 4 minutes soft limit

# Beat scheduler for periodic tasks
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Monitoring
CELERY_SEND_TASK_EVENTS = True
CELERY_TASK_SEND_SENT_EVENT = True

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
