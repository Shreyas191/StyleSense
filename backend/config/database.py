from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings


class Database:
    client: AsyncIOMotorClient = None
    

database = Database()


async def get_database():
    return database.client[settings.DATABASE_NAME]


async def connect_to_mongo():
    database.client = AsyncIOMotorClient(settings.MONGODB_URL)
    print(f"Connected to MongoDB at {settings.MONGODB_URL}")


async def close_mongo_connection():
    if database.client:
        database.client.close()
        print("Closed MongoDB connection")
