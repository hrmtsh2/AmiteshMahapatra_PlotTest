import configparser
import os
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from utils import to_pretty_json

def load_config():
    config = configparser.ConfigParser()
    config.read(".config")
    return config

config = load_config()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/sbilab_db")

def create_app():
    app = FastAPI()    
    app.add_middleware(SessionMiddleware, secret_key=config['WEBAPP']['SESSION_SECRET'])
    return app

app = create_app()