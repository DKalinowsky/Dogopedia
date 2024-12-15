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


@app.route("/user/info", methods=["GET"])
@token_required
def get_user():
    # request.user contains decoded token data
    user_id = request.user['user_id']
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT user_id, customer_nickname, role, email_addr FROM USER WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        if user:
            return jsonify(user), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# Endpoint to update user details
@app.route("/user", methods=["PUT"])
@token_required
def update_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    nickname = data.get('customer_nickname')
    email = data.get('email_addr')

    if not nickname and not email:
        return jsonify({"error": "No fields to update"}), 400

    user_id = request.user['user_id']
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if the new email already exists
        if email:
            cursor.execute("SELECT * FROM USER WHERE email_addr = %s AND user_id != %s", (email, user_id))
            if cursor.fetchone():
                return jsonify({"error": "Email already exists"}), 400

        # Perform updates
        if nickname:
            cursor.execute("UPDATE USER SET customer_nickname = %s WHERE user_id = %s", (nickname, user_id))
        if email:
            cursor.execute("UPDATE USER SET email_addr = %s WHERE user_id = %s", (email, user_id))
        conn.commit()
        return jsonify({"message": "User updated successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Endpoint to delete a user
@app.route("/user", methods=["DELETE"])
@token_required
def delete_user():
    user_id = request.user['user_id']
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM LIKED WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM USER WHERE user_id = %s", (user_id,))
        conn.commit()
        return jsonify({"message": "User and associated liked entries deleted successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/user/update-password", methods=["PUT"])
@token_required
def update_password():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not current_password or not new_password:
        return jsonify({"error": "Both current and new passwords are required"}), 400

    user_id = request.user['user_id']
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT pass_hash FROM USER WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()

        if user and hash_password(current_password) == user['pass_hash']:
            new_hashed_pass = hash_password(new_password)
            cursor.execute("UPDATE USER SET pass_hash = %s WHERE user_id = %s", (new_hashed_pass, user_id))
            conn.commit()
            return jsonify({"message": "Password updated successfully"}), 200
        else:
            return jsonify({"error": "Current password is incorrect"}), 401
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/user/favorites/add", methods=["POST"])
@token_required
def add_favorite_dog():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    dog_id = data.get('dog_id')
    user_id = request.user['user_id']

    if not dog_id:
        return jsonify({"error": "Dog ID is required"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the dog is already liked
        cursor.execute("SELECT * FROM LIKED WHERE user_id = %s AND dog_id = %s", (user_id, dog_id))
        existing_like = cursor.fetchone()
        if existing_like:
            return jsonify({"error": "Dog is already in favorites"}), 400

        # Add the dog to favorites
        cursor.execute("INSERT INTO LIKED (user_id, dog_id) VALUES (%s, %s)", (user_id, dog_id))
        conn.commit()

        return jsonify({"message": "Dog added to favorites successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/user/favorites/remove", methods=["DELETE"])
@token_required
def remove_favorite_dog():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    dog_id = data.get('dog_id')
    user_id = request.user['user_id']

    if not dog_id:
        return jsonify({"error": "Dog ID is required"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the dog is in favorites
        cursor.execute("SELECT * FROM LIKED WHERE user_id = %s AND dog_id = %s", (user_id, dog_id))
        existing_like = cursor.fetchone()
        if not existing_like:
            return jsonify({"error": "Dog is not in favorites"}), 404

        # Remove the dog from favorites
        cursor.execute("DELETE FROM LIKED WHERE user_id = %s AND dog_id = %s", (user_id, dog_id))
        conn.commit()

        return jsonify({"message": "Dog removed from favorites successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# New endpoint: Admin ban user
@app.route("/user/<int:user_id>/ban", methods=["PATCH"])
@token_required
def ban_user(user_id):
    # Check if the currently logged-in user is admin
    if request.user['role'] != 'admin':
        return jsonify({"error": "Forbidden"}), 403

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Set is_banned to True
        cursor.execute("UPDATE USER SET is_banned = TRUE WHERE user_id = %s", (user_id,))
        conn.commit()

        # Check if any row was actually updated
        if cursor.rowcount == 0:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"message": "User banned successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# New endpoint: Admin delete user
@app.route("/user/<int:user_id>", methods=["DELETE"])
@token_required
def admin_delete_user(user_id):
    # Check if the currently logged-in user is admin
    if request.user['role'] != 'admin':
        return jsonify({"error": "Forbidden"}), 403

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # First delete from LIKED table
        cursor.execute("DELETE FROM LIKED WHERE user_id = %s", (user_id,))
        # Then delete the user
        cursor.execute("DELETE FROM USER WHERE user_id = %s", (user_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"message": "User and associated liked entries deleted by admin successfully"}), 200
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
