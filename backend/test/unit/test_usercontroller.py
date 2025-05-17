import pytest
from unittest.mock import MagicMock
from src.controllers.usercontroller import UserController

@pytest.fixture
def usercontroller_return_user():
    dao = MagicMock()
    dao.find.return_value = [{ "_id": "1", "email": "ahmad@asili.com", "firstName": "Ahmad", "lastName": "Asili" }]
    usercontroller = UserController(dao=dao)
    return usercontroller

@pytest.fixture
def usercontroller_return_multiple_users():
    dao = MagicMock()
    dao.find.return_value = [{ "_id": "1", "email": "ahmad@asili.com", "firstName": "Ahmad", "lastName": "Asili" }, { "_id": "2", "email": "ahmad@asili.com", "firstName": "Ahmad", "lastName": "Asili" }]
    usercontroller = UserController(dao=dao)
    return usercontroller

@pytest.fixture
def usercontroller_return_exception():
    dao = MagicMock()
    dao.find.return_value = Exception()
    usercontroller = UserController(dao=dao)
    return usercontroller

@pytest.fixture
def usercontroller_return_none():
    dao = MagicMock()
    dao.find.return_value = []
    usercontroller = UserController(dao=dao)
    return usercontroller


def test_get_user_by_email(usercontroller_return_user):
    user = usercontroller_return_user.get_user_by_email('ahmad@asili.com')

    assert user == { "_id": "1", "email": "ahmad@asili.com", "firstName": "Ahmad", "lastName": "Asili" }

def test_get_user_by_invalid_email_missing_domain(usercontroller_return_user):
    with pytest.raises(ValueError):
        usercontroller_return_user.get_user_by_email('not_excist')

def test_get_user_by_invalid_email_missing_tld(usercontroller_return_user):
    with pytest.raises(ValueError):
        usercontroller_return_user.get_user_by_email('not_excist@gmail')

def test_get_user_by_invalid_email_invalid_tld(usercontroller_return_user):
    with pytest.raises(ValueError):
        usercontroller_return_user.get_user_by_email('not_excist@gmail.')

def test_get_user_by_invalid_email_missing_username(usercontroller_return_user):
    with pytest.raises(ValueError):
        usercontroller_return_user.get_user_by_email('@gmail.com')


def test_get_user_dublicated(usercontroller_return_multiple_users):
    user = usercontroller_return_multiple_users.get_user_by_email("ahmad@asili.com")
    assert user == { "_id": "1", "email": "ahmad@asili.com", "firstName": "Ahmad", "lastName": "Asili" }

def test_get_user_not_found(usercontroller_return_none):
    user = usercontroller_return_none.get_user_by_email("notffffound@asili.com")
    assert user is None

def test_get_user_exeption(usercontroller_return_exception):
    with pytest.raises(Exception):
        usercontroller_return_exception.get_user_by_email("notfound@asili.com")
