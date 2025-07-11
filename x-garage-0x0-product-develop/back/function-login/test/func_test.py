import pytest
from unittest.mock import patch, MagicMock
import json
import function_app

# filepath: c:\Users\D0738\Documents\0x0_work\back\function-login\test\func_test.py



def make_req(json_body):
    req = MagicMock()
    req.get_json.return_value = json_body
    return req

@patch("function_app.os.environ", {"CONNECTION_STRING": "dummy"})
@patch("function_app.pyodbc.connect")
def test_login_success(mock_connect):
    # 正しいusernameとpassword
    req = make_req({"username": "0738", "password": "shikashika7"})
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = [1]
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_connect.return_value.__enter__.return_value = mock_conn

    resp = function_app.login(req)
    assert resp.status_code == 200
    body = json.loads(resp.get_body())
    assert body["result"] == "ok"

@patch("function_app.os.environ", {"CONNECTION_STRING": "dummy"})
@patch("function_app.pyodbc.connect")
def test_login_invalid_credentials(mock_connect):
    # 間違ったパスワード
    req = make_req({"username": "0738", "password": "wrong"})
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = [0]
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_connect.return_value.__enter__.return_value = mock_conn

    resp = function_app.login(req)
    assert resp.status_code == 401
    body = json.loads(resp.get_body())
    assert body["error"] == "Invalid credentials"

def test_login_missing_fields():
    # usernameがない
    req = make_req({"password": "shikashika7"})
    resp = function_app.login(req)
    assert resp.status_code == 400
    body = json.loads(resp.get_body())
    assert "Missing username or password" in body["error"]

    # passwordがない
    req = make_req({"username": "0738"})
    resp = function_app.login(req)
    assert resp.status_code == 400
    body = json.loads(resp.get_body())
    assert "Missing username or password" in body["error"]

def test_login_invalid_json():
    req = MagicMock()
    req.get_json.side_effect = ValueError("Invalid JSON")
    resp = function_app.login(req)
    assert resp.status_code == 400
    body = json.loads(resp.get_body())
    assert "Invalid JSON" in body["error"]

@patch("function_app.os.environ", {})
def test_login_no_connection_string():
    req = make_req({"username": "0738", "password": "shikashika7"})
    resp = function_app.login(req)
    assert resp.status_code == 500
    body = json.loads(resp.get_body())
    assert "DB接続情報が設定されていません" in body["error"]

@patch("function_app.os.environ", {"CONNECTION_STRING": "dummy"})
@patch("function_app.pyodbc.connect", side_effect=Exception("unexpected error"))
def test_login_db_exception(mock_connect):
    req = make_req({"username": "0738", "password": "shikashika7"})
    resp = function_app.login(req)
    assert resp.status_code == 400 or resp.status_code == 500
    body = json.loads(resp.get_body())
    assert "unexpected error" in body["error"] or "Database error" in body["error"]