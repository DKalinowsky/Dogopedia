from flask import Flask, jsonify, request
import mysql.connector
import os
from flask_cors import CORS
import hashlib
import jwt
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Set a secret key for JWT - in production, use a secure, secret value.
app.config['SECRET_KEY'] = "01c0a5b66119f7836db00208abbfadbb11697a14a273c0d8a0fc82342e45b20ec7c04293280cb9a4d36e8054ca6c53a8af8c3eb8278ac12c147732c350291bff"

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DATABASE_HOST", "localhost"),
    "user": os.getenv("DATABASE_USER", "root"),
    "password": os.getenv("DATABASE_PASSWORD", "root"),
    "database": os.getenv("DATABASE_NAME", "dogopedia"),
}

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

def hash_password(password):
    # SHA256 hashing
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def create_jwt_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    return token

def decode_jwt_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Missing Authorization Header"}), 401
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({"error": "Invalid Authorization Header"}), 401
        token = parts[1]
        decoded = decode_jwt_token(token)
        if decoded is None:
            return jsonify({"error": "Invalid or expired token"}), 401
        request.user = decoded
        return f(*args, **kwargs)
    return decorated

@app.route("/")
def home():
    return "Welcome to Dogopedia!"

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

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    nickname = data.get('customer_nickname')
    email = data.get('email_addr')
    password = data.get('password')

    if not nickname or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    hashed_pass = hash_password(password)

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        insert_query = """
            INSERT INTO USER (customer_nickname, pass_hash, email_addr, is_banned, role)
            VALUES (%s, %s, %s, FALSE, 'user')
        """
        cursor.execute(insert_query, (nickname, hashed_pass, email))
        conn.commit()

        return jsonify({"message": "User registered successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    email = data.get('email_addr')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    hashed_pass = hash_password(password)

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        select_query = """
            SELECT user_id, role, is_banned FROM USER WHERE email_addr = %s AND pass_hash = %s
        """
        cursor.execute(select_query, (email, hashed_pass))
        user = cursor.fetchone()

        if user is None:
            return jsonify({"error": "Invalid email or password"}), 401

        if user['is_banned']:
            return jsonify({"error": "User is banned"}), 403

        token = create_jwt_token(user['user_id'], user['role'])
        return jsonify({"token": token}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/protected", methods=["GET"])
@token_required
def protected():
    # request.user contains decoded token data
    return jsonify({"message": "You have access to a protected resource", "user": request.user}), 200

# Catch-all route for retrieving table data
@app.route("/<table_name>", methods=["GET"])
def get_table_data(table_name):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
