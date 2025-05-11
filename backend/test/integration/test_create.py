import pytest
from pymongo import MongoClient
from bson import ObjectId
from pymongo.errors import WriteError, ServerSelectionTimeoutError
from src.util.dao import DAO
import os


@pytest.fixture(scope="module")
def dao():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://root:root@localhost:27017')
    client = MongoClient(mongo_url)
    db = client['edutask']
    test_collection = db["video_test"]
    dao_instance = DAO(collection_name="video_test")
    dao_instance.collection = test_collection

    yield dao_instance

    db.drop_collection("video_test")
    client.close()


@pytest.fixture(autouse=True)
def clear_collection(dao):
    dao.collection.delete_many({})


# === TC01: URL present, DB available ===
def test_TC1_valid_data_db_available(dao):
    data = {"url": "https://www.youtube.com/watch?v=123"}
    result = dao.create(data)
    assert dao.collection.find_one({"_id": ObjectId(result["_id"])}) is not None


# === TC02: URL missing, DB available ===
def test_TC2_missing_url_db_available(dao):
    data = {"title": "Missing URL"}
    with pytest.raises(WriteError):
        dao.create(data)


# === TC03: URL present, DB unavailable ===
def test_TC3_valid_data_db_unavailable():
    bad_client = MongoClient("mongodb://localhost:9999", serverSelectionTimeoutMS=1000) # this reduces the wait time for testing purpose
    bad_db = bad_client['edutask']
    bad_collection = bad_db["video_test"]

    class FakeDAO:
        def __init__(self, collection):
            self.collection = collection

        def create(self, data):
            inserted_id = self.collection.insert_one(data).inserted_id
            return self.collection.find_one({"_id": inserted_id})

    fake_dao = FakeDAO(bad_collection)

    with pytest.raises(ServerSelectionTimeoutError):
        fake_dao.create({"url": "https://www.youtube.com/watch?v=456"})
