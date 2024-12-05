from flask import Flask, jsonify
import mysql.connector
import os

app = Flask(__name__)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DATABASE_HOST", "localhost"),
    "user": os.getenv("DATABASE_USER", "root"),
    "password": os.getenv("DATABASE_PASSWORD", "root"),
    "database": os.getenv("DATABASE_NAME", "dogopedia"),
}

# Database connection
def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

@app.route("/")
def home():
    return "Welcome to Dogopedia!"

@app.route("/<table_name>")
def get_table_data(table_name):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # Normalize table name to match database schema
        table_name = table_name.upper()
        cursor.execute(f"SELECT * FROM {table_name}")
        data = cursor.fetchall()
        return jsonify(data)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/test_db")
def test_db_connection():
    conn = None
    try:
        conn = get_db_connection()
        if conn.is_connected():
            return "Database connection successful!", 200
    except mysql.connector.Error as err:
        return f"Database connection failed: {str(err)}", 500
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
