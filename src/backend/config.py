import os

try:
    import mysql.connector
except Exception as e:
    raise ImportError(
        "Missing dependency 'mysql-connector-python'. Install it with:\n\n"
        "    pip install mysql-connector-python\n\n"
        "Or add it to your project's requirements.txt and install dependencies."
    ) from e


class Config:
    """Database configuration.

    Values are taken from environment variables if present, otherwise sensible defaults
    are used for local development.
    """

    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "bdims")


def get_db_connection():
    """Return a MySQL connection. Raises a RuntimeError with actionable info on failure."""
    try:
        conn = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            autocommit=True,
        )
        return conn
    except mysql.connector.Error as err:
        raise RuntimeError(
            f"Failed to connect to MySQL: {err}. Check DB credentials and that the MySQL server "
            f"is running on {Config.DB_HOST} and accessible from this machine."
        ) from err
