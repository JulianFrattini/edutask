import pytest
from unittest.mock import Mock
from src.controllers.usercontroller import UserController


class TestUserController:
    @pytest.fixture
    def mock(self):
        return Mock()

    def test_get_user_by_email_valid(self, mock):
        mock.find.return_value = [{'email': 'smith@gmail.com', 'name': 'Smith'}]
        user_controller = UserController(mock)
        user = user_controller.get_user_by_email('smith@gmail.com')
        assert user == {'email': 'smith@gmail.com', 'name': 'Smith'}

    def test_get_user_by_email_invalid(self, mock):
        user_controller = UserController(mock)
        with pytest.raises(ValueError) as e:
            user_controller.get_user_by_email('abcd123')
        assert str(e.value) == 'Error: invalid email address'

    def test_get_user_by_email_nonexistent(self, mock):
        mock.find.return_value = []
        user_controller = UserController(mock)
        user = user_controller.get_user_by_email('nonexistent@example.com')
        assert user is None, "The user does not exist"


    """ def test_get_user_by_email_multiple_users_nonexistent(self, mock):
        mock.find.return_value = []
        user_controller = UserController(mock)
        user = user_controller.get_user_by_email('nonexistent@example.com')
        assert user is None, "The user does not exist" """

    def test_get_user_by_email_multiple_users(self, mock):
        mock.find.return_value = [{'email': 'smith@gmail.com', 'name': 'Smith'}, {'email': 'smith@gmail.com', 'name': 'John'}]
        user_controller = UserController(mock)
        user = user_controller.get_user_by_email('smith@gmail.com')
        assert user == {'email': 'smith@gmail.com', 'name': 'Smith'}

    def test_get_user_by_email_long_input(self, mock):
        # Generate a long string input
        long_email = 'a' * 1000000 + '@example.com'
        mock.find.return_value = [{'email': long_email, 'name': 'Test User'}]
        user_controller = UserController(mock)
        user = user_controller.get_user_by_email(long_email)
        assert user == {'email': long_email, 'name': 'Test User'}

    def test_get_user_by_email_exception_propagation(self, mock):
        mock.find.side_effect = Exception("Database error")
        user_controller = UserController(mock)
        with pytest.raises(Exception) as exc_info:
            user_controller.get_user_by_email('test@example.com')
        assert str(exc_info.value) == "Database error"

    def test_get_user_by_email_database_connection_failure(self, mock):
        mock.find.side_effect = ConnectionError("Database connection failed")
        user_controller = UserController(mock)
        with pytest.raises(ConnectionError) as exc_info:
            user_controller.get_user_by_email('test@example.com')
        assert str(exc_info.value) == "Database connection failed"
