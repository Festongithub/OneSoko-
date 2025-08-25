"""
WSGI config for MyOneSoko project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
import sys
from pathlib import Path

from django.core.wsgi import get_wsgi_application

# Add the project directory to the Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Set the settings module based on environment
if os.environ.get('DJANGO_ENV') == 'production':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MyOneSoko.settings_production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MyOneSoko.settings')

application = get_wsgi_application()
