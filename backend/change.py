from flask import Flask, request, jsonify
from pymongo import MongoClient
import bcrypt
import jwt
import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Secret key for encoding JWT tokens (Store this securely, e.g., in environment variables)
SECRET_KEY = "your_secret_key_here"

# MongoDB connection
try:
    mongo_client = MongoClient("mongodb://localhost:27017/")
    db = mongo_client["DocAssist"]
    users_collection = db["users"]
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Store blacklisted tokens
blacklisted_tokens = set()

# Home Route
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Flask Auth API!"})


# User Signup Route
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "All fields (username, email, password) are required!"}), 400

    # Check if user already exists
    existing_user = users_collection.find_one({"$or": [{"username": username}, {"email": email}]})
    if existing_user:
        return jsonify({"error": "Username or email already exists!"}), 400

    # Hash password using bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    new_user = {
        "user_id": email,  # Email used as user_id
        "username": username,
        "email": email,
        "password": hashed_password.decode('utf-8'),
    }

    try:
        users_collection.insert_one(new_user)
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# User Login Route
@app.route("/login", methods=["POST"])
def login_user():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user = users_collection.find_one({"email": email})
        if not user:
            return jsonify({"error": "Invalid credentials"}), 400

        if bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
            # Generate JWT Token
            token = jwt.encode({
                "user_id": user["email"],
                "username": user["username"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
            }, SECRET_KEY, algorithm="HS256")

            return jsonify({"message": "Login successful", "token": token}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 400
    except Exception as e:
        return jsonify({"error": f"Error during login: {e}"}), 500


# Logout Route
@app.route("/logout", methods=["POST"])
def logout():
    token = request.headers.get("Authorization")
    
    if not token:
        return jsonify({"error": "Token is required!"}), 400

    try:
        token = token.split(" ")[1]  # Extract actual token from "Bearer <token>"
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

        # Blacklist the token
        blacklisted_tokens.add(token)

        return jsonify({"message": "Logged out successfully!"}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has already expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token!"}), 401


# Protected Route (Requires valid token)
@app.route("/protected", methods=["GET"])
def protected_route():
    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"error": "Token is missing!"}), 401

    try:
        token = token.split(" ")[1]  # Extract actual token
        if token in blacklisted_tokens:  # Check if token is blacklisted
            return jsonify({"error": "Token is blacklisted! Please log in again."}), 401

        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return jsonify({"message": f"Hello {decoded_token['username']}, you have access to this route."})
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token!"}), 401


# Run Flask App
if __name__ == "__main__":
    app.run(debug=True, port=5001)
