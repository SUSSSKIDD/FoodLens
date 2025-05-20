import os
# database.py
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise Exception("❌ MONGO_URI not found in environment variables!")

client = MongoClient(MONGO_URI)
db = client["FoodLens"]
users_collection = db["users"]
recipes_collection = db["saved_recipes"]
