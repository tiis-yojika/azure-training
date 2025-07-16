import pytest
from unittest.mock import patch, MagicMock
import json
import function_app

def make_req(json_body):
    req = MagicMock()
    req.get_json.return_value = json_body
    return req

# --- login tests ---

@patch("function_app.os.environ", {"CONNECTION_STRING": "dummy"})
@patch("function_app.pyodbc.connect")
def test_login_success(mock_connect):
    req = make_req({"id": "user1", "password": "pass1"})
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = [1]
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_connect.return_value.__enter__.return_value = mock_conn

    resp = function_app.login(req)
    assert resp.status_code == 200
    body = json.loads(resp.get_body())
    assert body["result"] == "ok"
    assert body["id"] == "user1"

@patch("function_app.os.environ", {"CONNECTION_STRING": "dummy"})
@patch("function_app.pyodbc.connect")
def test_login_invalid_credentials(mock_connect):
    req = make_req({"id": "user1", "password": "wrong"})
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = [0]
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_connect.return_value.__enter__.return_value = mock_conn

    resp = function_app.login(req)
    assert resp.status_code == 401
    body = json.loads(resp.get_body())
    assert "Invalid credentials" in body["error"]

def test_login_missing_fields():
    req = make_req({"password": "pass1"})
    resp = function_app.login(req)
    assert resp.status_code == 400
    body = json.loads(resp.get_body())
    assert "Missing id or password" in body["error"]

    req = make_req({"id": "user1"})
    resp = function_app.login(req)
    assert resp.status_code == 400
    body = json.loads(resp.get_body())
    assert "Missing id or password" in body["error"]

def test_login_invalid_json():
    req = MagicMock()
    req.get_json.side_effect = ValueError("Invalid JSON")
    resp = function_app.login(req)
    assert resp.status_code == 400
    body = json.loads(resp.get_body())
    assert "Invalid JSON" in body["error"]

@patch("function_app.os.environ", {})
def test_login_no_connection_string():
    req = make_req({"id": "user1", "password": "pass1"})
    resp = function_app.login(req)
    assert resp.status_code == 500
    body = json.loads(resp.get_body())
    assert "DB接続情報が設定されていません" in body["error"]

@patch("function_app.os.environ", {"CONNECTION_STRING": "dummy"})
@patch("function_app.pyodbc.connect", side_effect=Exception("unexpected error"))
def test_login_db_exception(mock_connect):
    req = make_req({"id": "user1", "password": "pass1"})
    resp = function_app.login(req)
    assert resp.status_code in (400, 500)
    body = json.loads(resp.get_body())
    assert "unexpected error" in body["error"] or "Database error" in body["error"]

# --- mypage tests ---

@patch("function_app.os.environ", {"CONNECTION_STRING": "dummy"})
@patch("function_app.pyodbc.connect")
def test_mypage_success(mock_connect):
    req = make_req({"id": "user1"})
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = ["Yamada"]
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_connect.return_value.__enter__.return_value = mock_conn

    resp = function_app.mypage(req)
    assert resp.status_code == 200
    body = json.loads(resp.get_body())
    assert body["l_name"] == "Yamada"

@patch("function_app.os.environ", {"CONNECTION_STRING": "dummy"})
@patch("function_app.pyodbc.connect")
def test_mypage_user_not_found(mock_connect):
    req = make_req({"id": "notfound"})
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = None
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_connect.return_value.__enter__.return_value = mock_conn

    resp = function_app.mypage(req)
    assert resp.status_code == 404
    body = json.loads(resp.get_body())
    assert "ユーザーが見つかりません" in body["error"]

def test_mypage_missing_id():
    req = make_req({})
    resp = function_app.mypage(req)
    assert resp.status_code == 400
    body = json.loads(resp.get_body())
    assert "Missing id" in body["error"]

def test_mypage_invalid_json():
    req = MagicMock()
    req.get_json.side_effect = ValueError("Invalid JSON")
    resp = function_app.mypage(req)
    assert resp.status_code == 400
    body = json.loads(resp.get_body())
    assert "Invalid JSON" in body["error"]

@patch("function_app.os.environ", {})
def test_mypage_no_connection_string():
    req = make_req({"id": "user1"})
    resp = function_app.mypage(req)
    assert resp.status_code == 500
    body = json.loads(resp.get_body())
    assert "DB接続情報が設定されていません" in body["error"]

@patch("function_app.os.environ", {"CONNECTION_STRING": "dummy"})
@patch("function_app.pyodbc.connect", side_effect=Exception("unexpected error"))
def test_mypage_db_exception(mock_connect):
    req = make_req({"id": "user1"})
    resp = function_app.mypage(req)
    assert resp.status_code in (400, 500)
    body = json.loads(resp.get_body())
    assert "unexpected error" in body["error"] or "Database error" in body["error"]