import os

worker_class = "gthread"
workers = int(os.environ.get("WEB_CONCURRENCY", 1))
threads = int(os.environ.get("THREADS", 4))
timeout = 60
keepalive = 5
