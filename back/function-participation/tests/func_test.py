import unittest
import json
from function_app import main

# 変更したよ♡

class TestParticipationFunction(unittest.TestCase):
    def setUp(self):
        self.valid_event_id = 2
        self.valid_user_id = "0738"
        self.invalid_event_id = 9999
        self.invalid_user_id = "xxxx"

    def test_valid_participation(self):
        req = type('obj', (object,), {
            'get_json': lambda self: {
                "event_id": self.valid_event_id,
                "user_id": self.valid_user_id
            }
        })()
        resp = main(req)
        self.assertEqual(resp.status_code, 200)
        self.assertIn("success", resp.get_body().decode())

    def test_missing_event_id(self):
        req = type('obj', (object,), {
            'get_json': lambda self: {
                "user_id": self.valid_user_id
            }
        })()
        resp = main(req)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("event_id", resp.get_body().decode())

    def test_missing_user_id(self):
        req = type('obj', (object,), {
            'get_json': lambda self: {
                "event_id": self.valid_event_id
            }
        })()
        resp = main(req)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("user_id", resp.get_body().decode())

    def test_invalid_event_id(self):
        req = type('obj', (object,), {
            'get_json': lambda self: {
                "event_id": self.invalid_event_id,
                "user_id": self.valid_user_id
            }
        })()
        resp = main(req)
        self.assertEqual(resp.status_code, 404)

    def test_invalid_user_id(self):
        req = type('obj', (object,), {
            'get_json': lambda self: {
                "event_id": self.valid_event_id,
                "user_id": self.invalid_user_id
            }
        })()
        resp = main(req)
        self.assertEqual(resp.status_code, 404)

if __name__ == "__main__":
    unittest.main()