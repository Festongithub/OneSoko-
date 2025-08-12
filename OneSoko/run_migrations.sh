#!/bin/bash

# Activate virtual environment
source env/bin/activate

# Make migrations
echo "Making migrations..."
python manage.py makemigrations

# Apply migrations
echo "Applying migrations..."
python manage.py migrate

echo "Migrations completed!" 