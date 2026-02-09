#!/bin/bash

pip install -r requirements.txt


python backend/manage.py collectstatic --no-input
python backend/manage.py migrate

gunicorn backend.config.wsgi:application --bind 0.0.0.0:$PORT
