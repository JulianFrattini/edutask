import unittest
from unittest.mock import MagicMock, patch, mock_open
from src.util.dao import DAO
from src.util.validators import getValidator  # Import getValidator function

class TestCreateMethod(unittest.TestCase):

    @patch('src.util.dao.getValidator', return_value={})
    @patch('pymongo.MongoClient')
    def setUp(self, mock_mongo_client, mock_getValidator):
        self.mock_database = MagicMock()  # Mock MongoDB database object
        mock_mongo_client.return_value.edutask = self.mock_database  # Set MongoDB database mock
        self.dao = DAO(collection_name="test_collection")
        self.dao.collection = MagicMock()  # Mock the MongoDB collection

    def tearDown(self):
        self.dao.collection = None  # Clean up any data created

    def test_create_compliant_data_insertion(self):
        compliant_data = {
            "title": "Test Title",
            "description": "Test Description"
        }
        self.dao.collection.insert_one.return_value.inserted_id = "test_id"

        result = self.dao.create(compliant_data)
        self.dao.collection.insert_one.assert_called_once_with(compliant_data)


    def test_create_compliant_data_result(self):
        compliant_data = {
            "title": "Test Title",
            "description": "Test Description"
        }
        self.dao.collection.insert_one.return_value.inserted_id = "test_id"  # Mock insert_one method

        created_obj = {"_id": "test_id", "title": "Test Title", "description": "Test Description"}
        self.dao.collection.find_one.return_value = created_obj  # Mock find_one method

        result = self.dao.create(compliant_data)
        self.assertIsNotNone(result)
        self.assertIsInstance(result, dict)
        self.assertIn('_id', result)
        self.assertEqual(result['_id'], "test_id")
        self.assertEqual(result['title'], "Test Title")
        self.assertEqual(result['description'], "Test Description")

    def test_create_compliant_data_find_one_call(self):
        compliant_data = {
            "title": "Test Title",
            "description": "Test Description"
        }
        self.dao.collection.insert_one.return_value.inserted_id = "test_id"

        result = self.dao.create(compliant_data)
        self.dao.collection.find_one.assert_called_once_with({'_id': "test_id"})  # Assert find_one call

    def test_create_non_compliant_data(self):
        non_compliant_data = {
            "email": "test@example.com"
        }
        self.dao.collection.insert_one.side_effect = Exception("WriteError")

        with self.assertRaises(Exception):
            self.dao.create(non_compliant_data)  # Verify exception is raised

        self.dao.collection.insert_one.assert_called_once_with(non_compliant_data)

    @patch('builtins.open', new_callable=mock_open, read_data='{"example": "validator"}')
    def test_getValidator_loads_validator_from_json(self, mock_open):
        collection_name = "example_collection"
        validator = getValidator(collection_name)
        mock_open.assert_called_once_with(f'./src/static/validators/{collection_name}.json', 'r')
        self.assertEqual(validator, {"example": "validator"})

if __name__ == '__main__':
    unittest.main()
