#!/usr/bin/env python3
"""
Production WSGI server for IoT-23 ML API
"""

from cloud_api_server import app
import logging
from logging.handlers import RotatingFileHandler
import os

if __name__ == '__main__':
    # Setup logging
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    file_handler = RotatingFileHandler('logs/api.log', maxBytes=10240000, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('IoT-23 ML API startup')

    # Run with Gunicorn in production
    import subprocess
    import sys
    
    cmd = [
        'gunicorn',
        '--bind', '0.0.0.0:5000',
        '--workers', '4',
        '--timeout', '30',
        '--keep-alive', '2',
        '--max-requests', '1000',
        '--max-requests-jitter', '100',
        '--log-level', 'info',
        '--access-logfile', 'logs/access.log',
        '--error-logfile', 'logs/error.log',
        'cloud_api_server:app'
    ]
    
    subprocess.run(cmd)
