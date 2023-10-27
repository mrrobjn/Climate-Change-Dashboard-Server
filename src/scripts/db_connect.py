from pymongo import MongoClient

# Create a client
client = MongoClient("mongodb://localhost:27017/")

# Connect to your database
db = client["CCD"]

# Now you can perform operations on the db object
