import sys
import os
import pytest
from unittest.mock import patch, MagicMock

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import function_app

class DummyRequest:
    def __init__(self, event_id=None):
        self.route_params = {'event_id': event_id}
        self.headers = {}
        self.method = 'GET'
        self._body = b''
    def get_body(self):
        return self._body
    def get_json(self):
        return {}

# get_event テスト
@pytest.fixture
def mock_db_found(monkeypatch):
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = {
        "event_id": 2,
        "event_title": "全社懇親会",
        "event_category": 5,
        "event_datetime": "2025-05-23T18:00:00.0000000",
        "deadline": "2025-04-30T17:00:00.0000000",
        "location": "ホテル　ヒルトン",
        "max_participants": 1000,
        "current_participants": 2,
        "creator": "0738",
        "description": "上司の方にお酒を注ぐ会となります",
        "content": "地獄のパーリナイトとなっていますので、くれぐれも注意してください。皆様のご参加お待ちしています。",
        "is_draft": 0
    }
    mock_cursor.fetchall.return_value = [MagicMock(keyword_id=1), MagicMock(keyword_id=2)]
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    monkeypatch.setattr(function_app, "get_db_connection", lambda: mock_conn)
    return mock_conn

def test_get_event_found(mock_db_found):
    req = DummyRequest(event_id=2)
    resp = function_app.get_event(req)
    assert resp.status_code == 200 or resp.status_code is None
    assert b"event_title" in resp.get_body()

def test_get_event_not_found(monkeypatch):
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = None
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    monkeypatch.setattr(function_app, "get_db_connection", lambda: mock_conn)
    req = DummyRequest(event_id=999)
    resp = function_app.get_event(req)
    assert resp.status_code == 404

# delete_event テスト
def test_delete_event_not_found(monkeypatch):
    class MockCursor(MagicMock):
        def __enter__(self):
            return self
        def __exit__(self, exc_type, exc_val, exc_tb):
            return None
        def fetchone(self):
            # イベントが存在しない場合
            return None
        def execute(self, *args, **kwargs):
            return None

    class MockConnection:
        def cursor(self):
            return MockCursor()
        def commit(self):
            pass
        def close(self):
            pass
        def __enter__(self):
            return self
        def __exit__(self, exc_type, exc_val, exc_tb):
            return None

    def mock_get_db_connection():
        return MockConnection()

    monkeypatch.setattr(function_app, "get_db_connection", mock_get_db_connection)

    req = DummyRequest(event_id=999)
    resp = function_app.delete_event(req)

    assert resp.status_code == 404
    import json
    body = resp.get_body().decode("utf-8")
    data = json.loads(body)
    assert "イベントが存在しません" in data.get("error", "")

# update_event テスト（最低限の呼び出し確認）
def test_update_event(monkeypatch):
    mock_cursor = MagicMock()
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    monkeypatch.setattr(function_app, "get_db_connection", lambda: mock_conn)
    req = DummyRequest(event_id=2)
    req.headers = {"Content-Type": "application/json"}
    req.get_json = lambda: {
        "title": "全社懇親会",
        "category": "5",
        "date": "2025-05-23T18:00:00.0000000",
        "deadline": "2025-04-30T17:00:00.0000000",
        "location": "ホテル　ヒルトン",
        "max_participants": "1000",
        "current_participants": "2",
        "creator": "0738",
        "summary": "上司の方にお酒を注ぐ会となります",
        "detail": "地獄のパーリナイトとなっていますので、くれぐれも注意してください。皆様のご参加お待ちしています。",
        "is_draft": "0",
        "keywords": ["1", "2"]
    }
    resp = function_app.update_event(req)
    assert resp.status_code == 200 or resp.status_code is None
    import json
    body = resp.get_body().decode("utf-8")
    data = json.loads(body)
    assert "イベント更新完了" in data.get("message", "")
