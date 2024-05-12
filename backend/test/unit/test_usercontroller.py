import pytest
from unittest.mock import MagicMock
from src.controllers.usercontroller import UserController
from src.util.dao import DAO

## The class responsible for unit testing
class TestUserController:
    @pytest.mark.unit
    def setup_method(self):
        self.mock_dao = MagicMock()
        self.user_controller = UserController(dao=self.mock_dao)

    ## If the email is invalid get a ValueError
    @pytest.mark.unit
    def test_invalid_email(self):
        with pytest.raises(ValueError):
            self.user_controller.get_user_by_email('invalid-email')

    ## If there is only one user with a valid email.
    @pytest.mark.unit
    def test_get_user_by_email_one_user_found(self):
        self.mock_dao.find.return_value = [{'id': 1, 'email': 'user@example.com'}]
        result = self.user_controller.get_user_by_email('user@example.com')
        assert result == {'id': 1, 'email': 'user@example.com'}

    ## If there is multiple users *
    @pytest.mark.unit
    def test_get_user_by_multiple_users(self, capsys):
        self.mock_dao.find.return_value = [{'id': 1, 'email': 'user@example.com'}, {'id': 2, 'email': 'user@example.com'}]
        self.user_controller.get_user_by_email('user@example.com')

        ## Capture the output
        captured = capsys.readouterr()

        expected_output = 'Error: more than one user found with mail user@example.com'
        assert expected_output in captured.out
       

    ## No user match th email
    @pytest.mark.unit
    def test_get_user_no_match(self):
        self.mock_dao.find.return_value = []
        result = self.user_controller.get_user_by_email('user@example.com')
        assert result is None

    ## Database operation fails
    @pytest.mark.unit
    def test_get_user_database_fails(self):
        self.mock_dao.find.side_effect = Exception('DB Error')
        with pytest.raises(Exception) as exception:
            self.user_controller.get_user_by_email('user@example.com')
        assert str(exception.value) == 'DB Error'
