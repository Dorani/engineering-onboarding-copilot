import psycopg

from pgvector.psycopg import register_vector

from app.config import settings


def get_connection():
    connection = psycopg.connect(settings.database_url)
    register_vector(connection)
    return connection