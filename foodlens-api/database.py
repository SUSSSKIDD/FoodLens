import os
# database.py
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")  # Update if using cloud MongoDB
db = client["foodlens"]
users_collection = db["users"]
recipes_collection = db["saved_recipes"]  # ✅ Add this
