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

# New endpoint: Admin unban user
@app.route("/user/<int:user_id>/unban", methods=["PATCH"])
@token_required
def uban_user(user_id):

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Set is_banned to False
        cursor.execute("UPDATE USER SET is_banned = FALSE WHERE user_id = %s", (user_id,))
        conn.commit()

        # Check if any row was actually updated
        if cursor.rowcount == 0:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"message": "User unbanned successfully"}), 200
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
@app.route("/comments", methods=["POST"])
@token_required
def add_comment():
    """
    Add a new comment to a dog.
    Requires a valid JWT token.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    user_id = request.user['user_id']  # Extracted from the JWT
    dog_id = data.get("dog_id")
    comm_text = data.get("comm_text")
    comm_type = data.get("comm_type")

    # Validate required fields
    if not dog_id or not comm_text or not comm_type:
        return jsonify({"error": "dog_id, comm_text, and comm_type are required"}), 400

    # Validate comm_type
    if comm_type not in ['forum', 'care', 'entertainment']:
        return jsonify({"error": "Invalid comm_type. Must be one of 'forum', 'care', 'entertainment'."}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        insert_query = """
            INSERT INTO COMMENTS (user_id, dog_id, comm_text, comm_type)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(insert_query, (user_id, dog_id, comm_text, comm_type))
        conn.commit()

        # Get the last inserted comment ID
        new_comm_id = cursor.lastrowid

        return jsonify({
            "message": "Comment added successfully",
            "comment_id": new_comm_id
        }), 201

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/dogs/<int:dog_id>/comments", methods=["GET"])
def get_comments_for_dog(dog_id):
    """
    Retrieve all comments for a given dog_id.
    Does not require authentication.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # We can also join with USER if we want to show the nickname of the commenter
        select_query = """
            SELECT c.comm_id, c.user_id, u.customer_nickname, c.dog_id,
                   c.comm_text, c.comm_type
            FROM COMMENTS c
            JOIN USER u ON c.user_id = u.user_id
            WHERE c.dog_id = %s
        """
        cursor.execute(select_query, (dog_id,))
        comments = cursor.fetchall()

        return jsonify(comments), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/comments/<int:comm_id>", methods=["PUT"])
@token_required
def update_comment(comm_id):
    """
    Update an existing comment by its ID.
    The user must be the owner of the comment or an admin.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_comm_text = data.get("comm_text")
    new_comm_type = data.get("comm_type")

    if not new_comm_text and not new_comm_type:
        return jsonify({"error": "No fields to update"}), 400

    # Validate new_comm_type if provided
    if new_comm_type and new_comm_type not in ['forum', 'care', 'entertainment']:
        return jsonify({"error": "Invalid comm_type. Must be 'forum', 'care', 'entertainment'."}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1) Check if the comment exists
        cursor.execute("SELECT user_id FROM COMMENTS WHERE comm_id = %s", (comm_id,))
        comment = cursor.fetchone()
        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        # 2) Check if the user is the owner or admin
        owner_id = comment["user_id"]
        current_user_id = request.user["user_id"]
        current_user_role = request.user["role"]

        if current_user_id != owner_id and current_user_role != "admin":
            return jsonify({"error": "Forbidden: You are not allowed to update this comment"}), 403

        # 3) Update the comment
        update_fields = []
        update_values = []

        if new_comm_text:
            update_fields.append("comm_text = %s")
            update_values.append(new_comm_text)
        if new_comm_type:
            update_fields.append("comm_type = %s")
            update_values.append(new_comm_type)

        update_values.append(comm_id)  # for the WHERE clause
        update_query = f"UPDATE COMMENTS SET {', '.join(update_fields)} WHERE comm_id = %s"
        cursor.execute(update_query, tuple(update_values))
        conn.commit()

        return jsonify({"message": "Comment updated successfully"}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/comments/<int:comm_id>", methods=["DELETE"])
@token_required
def delete_comment(comm_id):
    """
    Delete a specific comment by its ID.
    The user must be the owner of the comment or an admin.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1) Check if the comment exists
        cursor.execute("SELECT user_id FROM COMMENTS WHERE comm_id = %s", (comm_id,))
        comment = cursor.fetchone()
        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        # 2) Check if the user is the owner or admin
        owner_id = comment["user_id"]
        current_user_id = request.user["user_id"]
        current_user_role = request.user["role"]

        if current_user_id != owner_id and current_user_role != "admin":
            return jsonify({"error": "Forbidden: You are not allowed to delete this comment"}), 403

        # 3) Delete the comment
        cursor.execute("DELETE FROM COMMENTS WHERE comm_id = %s", (comm_id,))
        conn.commit()

        return jsonify({"message": "Comment deleted successfully"}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/dog", methods=["POST"])
@token_required
def add_dog():
    """
    Create a new dog breed entry.
    Only accessible to administrators (admin role).
    """
    # Check if user is admin
    if request.user['role'] != 'admin':
        return jsonify({"error": "Forbidden: Only admins can add dog records."}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    race = data.get("race")
    size = data.get("size")
    category = data.get("category")
    traits = data.get("traits")
    allergies = data.get("allergies")
    age = data.get("age")
    description = data.get("description")
    cost_range = data.get("cost_range")
    activity = data.get("activity")
    # image handling is optional; left out here for simplicity

    # Basic validation
    if not race or not size or not age or not cost_range or not activity:
        return jsonify({"error": "Missing required fields: race, size, age, cost_range, activity"}), 400

    # Validate that `activity` matches the ENUM('low','medium','high') in the database
    if activity not in ["low", "medium", "high"]:
        return jsonify({"error": "Invalid activity type. Must be 'low', 'medium', or 'high'"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        insert_query = """
            INSERT INTO DOGS (race, size, category, traits, allergies, age, description, cost_range, activity)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(
            insert_query,
            (race, size, category, traits, allergies, age, description, cost_range, activity)
        )
        conn.commit()

        new_dog_id = cursor.lastrowid
        return jsonify({
            "message": "New dog breed added successfully",
            "dog_id": new_dog_id
        }), 201

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/dog/<int:dog_id>", methods=["PUT"])
@token_required
def update_dog(dog_id):
    """
    Update an existing dog breed entry by its dog_id.
    Only accessible to administrators (admin role).
    """
    # Check if user is admin
    if request.user['role'] != 'admin':
        return jsonify({"error": "Forbidden: Only admins can update dog records."}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    # Collect possible updated fields
    race = data.get("race")
    size = data.get("size")
    category = data.get("category")
    traits = data.get("traits")
    allergies = data.get("allergies")
    age = data.get("age")
    description = data.get("description")
    cost_range = data.get("cost_range")
    activity = data.get("activity")

    # Build the update query dynamically based on the fields provided
    update_fields = []
    update_values = []

    if race is not None:
        update_fields.append("race = %s")
        update_values.append(race)
    if size is not None:
        update_fields.append("size = %s")
        update_values.append(size)
    if category is not None:
        update_fields.append("category = %s")
        update_values.append(category)
    if traits is not None:
        update_fields.append("traits = %s")
        update_values.append(traits)
    if allergies is not None:
        update_fields.append("allergies = %s")
        update_values.append(allergies)
    if age is not None:
        update_fields.append("age = %s")
        update_values.append(age)
    if description is not None:
        update_fields.append("description = %s")
        update_values.append(description)
    if cost_range is not None:
        update_fields.append("cost_range = %s")
        update_values.append(cost_range)
    if activity is not None:
        # Validate that `activity` matches the ENUM('low','medium','high')
        if activity not in ["low", "medium", "high"]:
            return jsonify({"error": "Invalid activity type. Must be 'low', 'medium', or 'high'"}), 400
        update_fields.append("activity = %s")
        update_values.append(activity)

    # If no fields to update, respond early
    if not update_fields:
        return jsonify({"error": "No fields provided to update"}), 400

    # Prepare the SQL
    update_values.append(dog_id)  # this is for the WHERE clause
    update_query = f"UPDATE DOGS SET {', '.join(update_fields)} WHERE dog_id = %s"

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if the dog entry exists
        check_query = "SELECT dog_id FROM DOGS WHERE dog_id = %s"
        cursor.execute(check_query, (dog_id,))
        dog_exists = cursor.fetchone()
        if not dog_exists:
            return jsonify({"error": "Dog entry not found"}), 404

        # Perform the update
        cursor.execute(update_query, tuple(update_values))
        conn.commit()

        # Check if the update actually affected any rows
        if cursor.rowcount == 0:
            return jsonify({"warning": "No changes applied (row not found or no new data)."}), 200

        return jsonify({"message": "Dog breed updated successfully"}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/dog/<int:dog_id>", methods=["DELETE"])
@token_required
def delete_dog(dog_id):
    """
    Delete an existing dog breed entry by its ID.
    Only accessible to administrators (admin role).
    """
    if request.user['role'] != 'admin':
        return jsonify({"error": "Forbidden: Only admins can delete dog records."}), 403

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        select_query = "SELECT COUNT(*) FROM DOGS WHERE dog_id = %s"
        cursor.execute(select_query, (dog_id,))
        count_result = cursor.fetchone()

        if not count_result or count_result[0] == 0:
            return jsonify({"error": f"Dog breed with ID {dog_id} not found"}), 404

        delete_query = "DELETE FROM DOGS WHERE dog_id = %s"
        cursor.execute(delete_query, (dog_id,))
        conn.commit()

        return jsonify({
            "message": f"Dog breed with ID {dog_id} has been deleted successfully"
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/dog/request-update/<int:dog_id>", methods=["POST"])
@token_required
def request_dog_update(dog_id):
    """
    Allow users to submit a request to update a dog's details.
    The request is stored in the AWAITING table for admin review.
    """
    user_id = request.user['user_id']  # Get user ID from token

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    # Collect possible updated fields
    new_race = data.get("race")
    new_size = data.get("size")
    new_category = data.get("category")

    # Convert the traits list to a comma-separated string
    new_traits = ",".join(data.get("traits", []))  # Make sure it's a string, even if traits is empty

    new_allergies = data.get("allergies")
    new_age = data.get("age")
    new_description = data.get("description")
    new_cost_range = data.get("cost_range")
    new_activity = data.get("activity")

    # Validate activity ENUM
    if new_activity and new_activity not in ["low", "medium", "high"]:
        return jsonify({"error": "Invalid activity type. Must be 'low', 'medium', or 'high'"}), 400

    # Check if at least one field is provided
    if not any([new_race, new_size, new_category, new_traits, new_allergies, new_age, new_description, new_cost_range,
                new_activity]):
        return jsonify({"error": "No fields provided for update request"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the dog entry exists
        check_query = "SELECT dog_id FROM DOGS WHERE dog_id = %s"
        cursor.execute(check_query, (dog_id,))
        dog_exists = cursor.fetchone()
        if not dog_exists:
            return jsonify({"error": "Dog entry not found"}), 404

        # Insert the request into AWAITING table
        insert_query = """
            INSERT INTO AWAITING (user_id, dog_id, new_race, new_size, new_category, 
                                  new_traits, new_allergies, new_age, new_description, 
                                  new_cost_range, new_activity, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(insert_query, (
            user_id, dog_id, new_race, new_size, new_category,
            new_traits, new_allergies, new_age, new_description,
            new_cost_range, new_activity
        ))
        conn.commit()

        return jsonify({"message": "Update request submitted successfully"}), 201

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/awaiting/<int:request_id>", methods=["DELETE"])
@token_required
def delete_update_request(request_id):
    """
    Delete a pending dog update request.
    Only accessible to administrators (admin role).
    """
    # Check if user is admin
    if request.user['role'] != 'admin':
        return jsonify({"error": "Forbidden: Only admins can delete update requests."}), 403

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if request exists
        check_query = "SELECT request_id FROM AWAITING WHERE request_id = %s"
        cursor.execute(check_query, (request_id,))
        request_exists = cursor.fetchone()

        if not request_exists:
            return jsonify({"error": "Update request not found"}), 404

        # Delete the request
        delete_query = "DELETE FROM AWAITING WHERE request_id = %s"
        cursor.execute(delete_query, (request_id,))
        conn.commit()

        return jsonify({"message": "Update request deleted successfully"}), 200

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
