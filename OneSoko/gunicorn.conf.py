# Gunicorn configuration file for OneSoko production deployment

import multiprocessing
import os

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers after this many requests, with a random variation
max_requests = 1000
max_requests_jitter = 100

# Preload application for better performance
preload_app = True

# User and group to run workers (only if running as root)
if os.getuid() == 0:  # Running as root
    user = "appuser"
    group = "appuser"

# Logging
log_dir = "/app/logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir, exist_ok=True)

accesslog = os.path.join(log_dir, "gunicorn_access.log")
errorlog = os.path.join(log_dir, "gunicorn_error.log")
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "onesoko_gunicorn"

# Server mechanics
daemon = False
pidfile = "/app/logs/gunicorn.pid"
tmp_upload_dir = "/tmp"

# Environment variables
raw_env = [
    "DJANGO_ENV=production",
]

# Worker process lifecycle hooks
def when_ready(server):
    server.log.info("OneSoko server is ready. Spawning workers")

def worker_int(worker):
    worker.log.info("Worker received INT or QUIT signal")

def pre_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def post_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def post_worker_init(worker):
    worker.log.info("Worker initialized (pid: %s)", worker.pid)

def worker_abort(worker):
    worker.log.info("Worker aborted (pid: %s)", worker.pid)
