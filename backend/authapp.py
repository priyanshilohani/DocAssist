# from flask import Flask, request, jsonify
# from pymongo import MongoClient
# import bcrypt
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)

# # MongoDB connection
# try:
#     mongo_client = MongoClient("mongodb://localhost:27017/")
#     db = mongo_client["DocAssist"]
#     users_collection = db["users"]
#     print("Connected to MongoDB successfully!")
# except Exception as e:
#     print(f"Error connecting to MongoDB: {e}")

# # Home Route
# @app.route("/", methods=["GET"])
# def home():
#     return jsonify({"message": "Welcome to the Flask Auth API!"})

# # Registration Endpoint
# @app.route("/signup", methods=["POST"])
# def register_user():
#     data = request.json
#     username = data.get("username")
#     email = data.get("email")
#     password = data.get("password")

#     if not username or not email or not password:
#         return jsonify({"error": "Username, email, and password are required"}), 400

#     hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
#     user = {
#         "user_id": email,
#         "username": username,
#         "email": email,
#         "password": hashed_password.decode('utf-8')
#     }

#     if users_collection.find_one({"email": email}):
#         return jsonify({"error": "User already exists!"}), 400

#     try:
#         users_collection.insert_one(user)
#         return jsonify({"message": "User registered successfully!"})
#     except Exception as e:
#         return jsonify({"error": f"Error registering user: {e}"}), 500

# # Login Endpoint
# @app.route("/login", methods=["POST"])
# def login_user():
#     data = request.json
#     email = data.get("email")
#     password = data.get("password")

#     if not email or not password:
#         return jsonify({"error": "Email and password are required"}), 400

#     try:
#         user = users_collection.find_one({"email": email})
#         if not user:
#             return jsonify({"error": "Invalid credentials"}), 400

#         if bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
#             return jsonify({"message": "Login successful"})
#         else:
#             return jsonify({"error": "Invalid credentials"}), 400
#     except Exception as e:
#         return jsonify({"error": f"Error during login: {e}"}), 500

# if __name__ == "__main__":
#     app.run(debug=True, port=5001)

from flask import Flask, request, jsonify
from pymongo import MongoClient
import bcrypt
import jwt
import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Secret key for encoding JWT tokens (You should keep this secret and secure)
SECRET_KEY = "your_secret_key_here"

# MongoDB connection
try:
    mongo_client = MongoClient("mongodb://localhost:27017/")
    db = mongo_client["DocAssist"]
    users_collection = db["users"]
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Home Route
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Flask Auth API!"})
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # Check if username or email already exists in the database
    existing_user = users_collection.find_one({"$or": [{"username": username}, {"email": email}]})
    if existing_user:
        return jsonify({"error": "Username or email already exists!"}), 400

    # Hash password for security (use bcrypt)
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Ensure user_id is email (if schema expects user_id to be email)
    new_user = {
        "user_id": email,  # This should match your MongoDB schema
        "username": username,
        "email": email,
        "password": hashed_password.decode('utf-8'),
    }

    # Insert new user into the database
    try:
        users_collection.insert_one(new_user)
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Login Endpoint
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
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            }, SECRET_KEY, algorithm="HS256")
            
            return jsonify({"message": "Login successful", "token": token})
        else:
            return jsonify({"error": "Invalid credentials"}), 400
    except Exception as e:
        return jsonify({"error": f"Error during login: {e}"}), 500

# Protected Route (Example)
@app.route("/protected", methods=["GET"])
def protected_route():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Token is missing!"}), 401
    
    try:
        token = token.split(" ")[1]  # Assumes the token is sent as "Bearer <token>"
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return jsonify({"message": f"Hello {decoded_token['username']}, you have access to this route."})
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token!"}), 401

if __name__ == "__main__":
    app.run(debug=True, port=5001)
