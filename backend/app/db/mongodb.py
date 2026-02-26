from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

class DataBase:
    client: AsyncIOMotorClient = None

db = DataBase()

async def connect_to_mongo():
    logging.info("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    logging.info("Connected securely to MongoDB!")

async def close_mongo_connection():
    logging.info("Closing connection with MongoDB...")
    if db.client:
        db.client.close()
        logging.info("Closed connection with MongoDB!")

def get_database():
    return db.client[settings.DATABASE_NAME]
