import requests

BASE_URL = "http://localhost:7071/api"

def test_eventinfo():
    event_id = 2  # テスト用のevent_id
    res = requests.get(f"{BASE_URL}/eventinfo", params={"event_id": event_id})
    print("eventinfo response:", res.status_code, res.text)
    assert res.status_code == 200
    data = res.json()
    assert "event_title" in data
    assert "creator_id" in data

def test_inquiry():
    # 事前にeventinfoで取得したcreator_idを使う
    event_id = 2
    eventinfo_res = requests.get(f"{BASE_URL}/eventinfo", params={"event_id": event_id})
    print("eventinfo response:", eventinfo_res.status_code, eventinfo_res.text)
    assert eventinfo_res.status_code == 200, f"eventinfo API failed: {eventinfo_res.text}"
    eventinfo = eventinfo_res.json()
    creator_id = eventinfo.get("creator_id")
    assert creator_id is not None, "creator_id is None in eventinfo response"
    payload = {
        "event_id": str(event_id),
        "subject": "テスト件名",
        "message": "テスト本文",
        "sender_id": "test_user",
        "recipient_id": str(creator_id),
        "reply_to_inquiry_id": None
    }
    res = requests.post(f"{BASE_URL}/inquiry", json=payload)
    print("inquiry response:", res.status_code, res.text)
    assert res.status_code == 200, f"inquiry API failed: {res.text}"
    data = res.json()
    if "error" in data:
        print("inquiry API error details:", data.get("details"))
    assert "message" in data
