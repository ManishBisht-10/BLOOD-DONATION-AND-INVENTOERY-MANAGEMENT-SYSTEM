from config import get_db_connection


def main():
    try:
        conn = get_db_connection()
        # mysql-connector provides is_connected(); handle missing attribute gracefully
        connected = getattr(conn, "is_connected", lambda: True)()
        print("Connection successful:", connected)
        try:
            conn.close()
        except Exception:
            pass
    except Exception as e:
        print("Connection failed:", e)


if __name__ == "__main__":
    main()
