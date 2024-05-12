import json
import pytest
import pymongo
from pymongo.errors import WriteError
from unittest.mock import mock_open, patch
from src.util.dao import DAO
from src.util.validators import getValidator

SIMPLIFIED_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["firstName", "lastName", "email"],
        "properties": {
            "firstName": {"bsonType": "string", "description": "must be a string"},
            "lastName": {"bsonType": "string", "description": "must be a string"},
            "age": {"bsonType": "int"},
            "email": {
            "bsonType": "string",
            "description": "must be a string and is required",
            "pattern": "^.+@.+\\..+$"
        }
        }
    }
}

@pytest.fixture(scope="function")
def dao():
    # Initialize DAO with the test database
    dao_instance = DAO(collection_name='user')
    yield dao_instance
    # Clean up before tests to ensure isolation
    dao_instance.collection.delete_many({})

# Testing a non-existent collection
def test_validator_file_not_found():
    with patch('builtins.open', side_effect=FileNotFoundError):
        with pytest.raises(FileNotFoundError):
            getValidator('no_existing_collection')

## Testing JSON file with malformed content
def test_malformed_json_error():
    not_valid_json = mock_open(read_data='{not a valid json}')
    with patch('builtins.open', not_valid_json):
        with patch('json.load', side_effect=json.JSONDecodeError("Expecting value", "", 0)):
            with pytest.raises(json.JSONDecodeError):
                getValidator('malformed_collection')

# Testing to fetch cached validator
def test_fetch_cached_validator():
    with patch('builtins.open', mock_open(read_data=json.dumps(SIMPLIFIED_VALIDATOR))):
        # Fetch and cache the validator
        validator_initial = getValidator('new_collection')
        assert validator_initial['$jsonSchema']['bsonType'] == "object", "Initial fetch didn't work as expected."

        # Fetch the validator again and it should come from the cache
        validator_cached = getValidator('new_collection')
        assert validator_cached == validator_initial, "Cached validator did not match the fetched validator."

# Case 1
def test_create_valid_user(dao):
    """
    Ensure a new collection is correctly created with a properly initialized object.
    """

    valid_user = {"firstName": "John", "lastName": "Doe", "age": 20, "email": "john.doe@example.com"}
    created_user = dao.create(valid_user)
    assert created_user is not None
    assert created_user['email'] == "john.doe@example.com"
    dao.collection.delete_many({"email": "john@example.com"}) 

# Case 2
def test_attempt_to_create_duplicate_data_raises_error(dao):
    """
    Verify that attempting to add a user with an existing email raises a DuplicateKeyError, ensuring email uniqueness.
    """

    # The first set of data should be inserted without any issues.
    valid_data = {
        "firstName": "John",
        "lastName": "Doe",
        "age": 25,
        "email": "john@example.com",
    }
    dao.create(valid_data)

    # Inserting another document with the same 'email' should fail because 'email' is unique.
    duplicate_data = {
        "firstName": "Jane",
        "lastName": "Doe",
        "age": 25,
        "email": "john@example.com",  # Same email as in valid_data
    }

    with pytest.raises(Exception) as exception:
        dao.create(duplicate_data)
        assert str(exception.value) == f"DuplicateKeyError raised as expected: {e}"

# Case 3
def test_create_valid_does_not_match_bson_unique(dao):
    """
    Test the creation with incorrect BSON type should raise a validation error.
    """

    invalid_bson_type_data = {
        "firstName": ["John"],
        "lastName": ["Sven"],
        "age": "30",
        "email": "john.sven@example.com",
    }

    # Try to create a document with incorrect BSON types
    with pytest.raises(Exception) as exc_info:
        dao.create(invalid_bson_type_data)

    # Check if the exception message indicates a type mismatch
    assert 'Document failed validation' in str(exc_info.value), "Expected type mismatch error did not occur"
    assert exc_info.value.code == 121, "Expected error code for BSON type mismatch did not match" 

# Case 4
def test_create_invalid_data(dao):
    """
    Test the attempting to create a user with invalid data types for all fields results in a WriteError.
    """
    invalid_data = {
        "firstName": 123,
        "lastName": 43,
        "age": "Eleven",
        "email": "john@example.com",
    }
    with pytest.raises(pymongo.errors.WriteError) as excinfo:
        dao.create(invalid_data)
    assert 'Document failed validation' in str(excinfo.value)


# Case 5, test not valid data, no match with the BSON but with unique identifier.
def test_create_with_invalid_data_and_type_errors(dao):
    invalid_data = {
        "firstName": 123,
        "lastName": 213,
        "age": "twenty",
        "email": "not-an-email"
    }

    # Attempt to insert invalid data and expect validation failure
    with pytest.raises(WriteError) as exc_info:
        dao.create(invalid_data)

    assert 'Document failed validation' in str(exc_info.value), "Expected validation error did not occur"
    assert exc_info.value.code == 121, "Expected error code for validation failure did not match"


# Case 6, test valid data, no match with BSON and not unique.
def test_valid_data_not_unique_type_mismatch(dao):
    # Insert with valid data
    valid_user = {"firstName": "Nisreen", "lastName": "Adb", "age": 11, "email": "nisreen@example.com"}
    result = dao.create(valid_user)
    assert result is not None

    # Trying to insert another record with non-matching BSON types and no-unique email
    invalid_user = {"firstName": "Nisreen", "lastName": "Adb", "age": "eleven", "email": 123}
    with pytest.raises(WriteError) as exc_info:
        dao.create(invalid_user)

    # Check for error code and message in the exception details
    assert exc_info.value.code == 121, "Expected MongoDB error code 121 for validation failure"
    assert "Document failed validation" in str(exc_info.value), "Expected document validation failure message"


# Case 7, test not valid data, no match and not unique.
def test_invalid_not_unique_data_type_mismatch(dao):
    user_data = {"firstName": "Sara", "lastName": "ka", "age": 13, "email": "sara@example.com"}
    result = dao.create(user_data)
    assert result is not None, "Initial insertion should succeed."

    invalid_user = {"firstName": 123, "lastName": "ka", "age": "thirteen","email": "sara@example.com"}
    with pytest.raises(WriteError) as exc_info:
        dao.create(invalid_user)

    error_message = str(exc_info.value)
    assert "Document failed validation" in error_message, "Expected document validation failure message."