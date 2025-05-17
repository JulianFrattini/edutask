import pytest
import pymongo
import json
from src.util.dao import DAO
from src.util.validators import getValidator
import pymongo.errors

@pytest.fixture(scope="function")
def dao_test_collection():
    client = pymongo.MongoClient("mongodb://localhost:27017")
    db = client["edutask"]

    collection_name = "todo"
    if collection_name in db.list_collection_names():
        db.drop_collection(collection_name)

    db.create_collection(
        collection_name,
        validator=getValidator(collection_name)
    )

    dao = DAO(collection_name)
    yield dao

    dao.drop()

def test_create_valid_document(dao_test_collection):
    data = {
        "description": "Finish integration tests",
        "done": False
    }
    result = dao_test_collection.create(data)
    assert result['description'] == data['description']
    assert result['done'] == data['done']
    assert '_id' in result


def test_create_missing_required_field(dao_test_collection):
    data = {
        "done": False
    }
    with pytest.raises(pymongo.errors.WriteError):
        dao_test_collection.create(data)

def test_create_invalid_field_type(dao_test_collection):
    data = {
        "description": "Wrong type for done",
        "done": "False"  # should be boolean
    }
    with pytest.raises(pymongo.errors.WriteError):
        dao_test_collection.create(data)

def test_create_duplicate_document(dao_test_collection):
    data = {
        "description": "Unique task",
        "done": False
    }
    dao_test_collection.create(data)
    with pytest.raises(pymongo.errors.WriteError):
        dao_test_collection.create(data)
