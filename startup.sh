#!/bin/bash
gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 30 cloud_api_server:app
