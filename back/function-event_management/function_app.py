import os
import pyodbc
import json
import logging
import azure.functions as func
from requests_toolbelt.multipart import decoder
import uuid
from datetime import datetime

app = func.FunctionApp()

CONNECTION_STRING = os.environ.get("CONNECTION_STRING_PRODUCT") if os.environ.get("IS_MAIN_PRODUCT") == "true" else os.environ.get("CONNECTION_STRING_TEST")

def get_db_connection():
    if not CONNECTION_STRING:
        raise Exception("DB接続情報(CONNECTION_STRING)が設定されていません")
    return pyodbc.connect(CONNECTION_STRING)

def error_response(msg, status=400, trace=None):
    body = {"error": msg}
    if trace:
        body["trace"] = trace
    return func.HttpResponse(json.dumps(body, ensure_ascii=False), status_code=status, mimetype="application/json")

def to_db_date(val):
    if not val or (isinstance(val, str) and val.strip() == ""):
        return None
    if isinstance(val, str) and 'T' in val:
        try:
            date_part, time_part = val.split('T')
            if len(time_part) == 5:
                time_part += ':00'
            return f"{date_part} {time_part}"
        except Exception:
            return val
    return val

def parse_multipart(req):
    content_type = req.headers.get("Content-Type", "")
    data, image_path = {}, None
    if content_type.startswith("multipart/form-data"):
        body = req.get_body()
        multipart_data = decoder.MultipartDecoder(body, content_type)
        for part in multipart_data.parts:
            cd = part.headers.get(b'Content-Disposition', b'').decode()
            if 'filename=' in cd:
                filename = cd.split('filename="')[1].split('"')[0]
                ext = os.path.splitext(filename)[1]
                user_id = str(data.get("creator", "unknown"))
                unique_id = uuid.uuid4().hex[:8]
                save_name = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{user_id}_{unique_id}{ext}"
                save_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'front', 'public', 'images'))
                os.makedirs(save_dir, exist_ok=True)
                save_path = os.path.join(save_dir, save_name)
                with open(save_path, "wb") as f:
                    f.write(part.content)
                image_path = f"images/{save_name}"
                data["image"] = image_path
            else:
                name = cd.split('name="')[1].split('"')[0]
                value = part.text
                if name == "keywords":
                    data.setdefault("keywords", []).append(value)
                else:
                    data[name] = value
        if "image" not in data:
            data["image"] = None
    else:
        data = req.get_json()
        image_path = data.get("image")
    return data, image_path

def fetch_events(user_id, is_draft):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = '''
            SELECT event_id, event_title, event_category, event_datetime, deadline, location, max_participants, current_participants, description, content, image
            FROM EVENTS
            WHERE creator = ? AND is_draft = ? AND event_datetime > GETDATE()
            ORDER BY event_datetime DESC
        '''
        cursor.execute(query, (user_id, is_draft))
        columns = [column[0] for column in cursor.description]
        events = []
        for row in cursor.fetchall():
            event = dict(zip(columns, row))
            for k, v in event.items():
                if hasattr(v, 'isoformat'):
                    event[k] = v.isoformat()
            events.append(event)
        events.reverse()
        return events

@app.route(route="create_event", methods=["POST"])
def create_event(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data, _ = parse_multipart(req)
        data["category"] = data.get("category") or None
        data["max_participants"] = data.get("max_participants") or None
        is_draft = int(data.get("is_draft", 1))
        data["is_draft"] = is_draft
        required_fields = ["title", "date", "location", "category", "keywords", "summary", "detail", "deadline"]
        if is_draft:
            data.setdefault("title", "（未入力）")
            data.setdefault("creator", "0738")
            data.setdefault("is_draft", 1)
        else:
            for f in required_fields:
                if not data.get(f):
                    return error_response(f"{f}は必須です")
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                INSERT INTO EVENTS (event_title, event_category, event_datetime, deadline, location, max_participants, creator, description, content, image, is_draft)
                OUTPUT INSERTED.event_id
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                data.get("title"),
                int(data.get("category")) if data.get("category") else None,
                to_db_date(data.get("date")),
                to_db_date(data.get("deadline")),
                data.get("location"),
                int(data.get("max_participants")) if data.get("max_participants") else None,
                str(data.get("creator", "0738")),
                data.get("summary"),
                data.get("detail"),
                data.get("image"),
                is_draft
            )
            event_id = cursor.fetchone()[0]
            if data.get("keywords"):
                for kw in data["keywords"]:
                    if kw:
                        cursor.execute("INSERT INTO EVENTS_KEYWORDS (event_id, keyword_id) VALUES (?, ?)", event_id, int(kw))
            conn.commit()
        return func.HttpResponse(json.dumps({"message": "イベント登録完了", "event_id": event_id}), mimetype="application/json", status_code=200)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logging.error(tb)
        return error_response(str(e), 500, tb)

@app.route(route="get_self_created_events")
def get_self_created_events(req: func.HttpRequest) -> func.HttpResponse:
    user_id = req.params.get('user_id')
    if not user_id:
        try:
            user_id = req.get_json().get('user_id')
        except Exception:
            return error_response("user_id is required")
    try:
        events = fetch_events(user_id, 0)
        return func.HttpResponse(json.dumps(events, ensure_ascii=False), mimetype="application/json")
    except Exception as e:
        logging.error(str(e))
        return error_response("DB error", 500)

@app.route(route="get_draft")
def get_draft(req: func.HttpRequest) -> func.HttpResponse:
    user_id = req.params.get('user_id')
    if not user_id:
        try:
            user_id = req.get_json().get('user_id')
        except Exception:
            return error_response("user_id is required")
    try:
        events = fetch_events(user_id, 1)
        return func.HttpResponse(json.dumps(events, ensure_ascii=False), mimetype="application/json")
    except Exception as e:
        logging.error(str(e))
        return error_response("DB error", 500)

@app.route(route="update_event", methods=["PUT"])
def update_event(req: func.HttpRequest) -> func.HttpResponse:
    event_id = req.route_params.get('event_id')
    try:
        data, _ = parse_multipart(req)
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT creator FROM EVENTS WHERE event_id=?", event_id)
            row = cursor.fetchone()
            if not row:
                return error_response("イベントが存在しません", 404)
            event_creator = row.creator if hasattr(row, "creator") else row[0]
            request_creator = str(data.get("creator", ""))
            if not request_creator or request_creator != str(event_creator):
                return error_response("イベント作成者のみ編集可能です", 403)
            cursor.execute(
                '''
                UPDATE EVENTS SET event_title=?, event_category=?, event_datetime=?, deadline=?, location=?, max_participants=?, description=?, content=?, image=? WHERE event_id=?
                ''',
                data.get("title"),
                int(data.get("category")) if data.get("category") else None,
                to_db_date(data.get("date")),
                to_db_date(data.get("deadline")),
                data.get("location"),
                int(data.get("max_participants")) if data.get("max_participants") else None,
                data.get("summary"),
                data.get("detail"),
                data.get("image"),
                event_id
            )
            cursor.execute("DELETE FROM EVENTS_KEYWORDS WHERE event_id=?", event_id)
            if data.get("keywords"):
                for kw in data["keywords"]:
                    cursor.execute("INSERT INTO EVENTS_KEYWORDS (event_id, keyword_id) VALUES (?, ?)", event_id, int(kw))
            conn.commit()
        return func.HttpResponse(json.dumps({"message": "イベント更新完了", "event_id": event_id}), mimetype="application/json", status_code=200)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logging.error(tb)
        return error_response(str(e), 500, tb)

@app.route(route="delete_event", methods=["DELETE"])
def delete_event(req: func.HttpRequest) -> func.HttpResponse:
    event_id = req.route_params.get('event_id')
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT creator FROM EVENTS WHERE event_id=?", event_id)
            row = cursor.fetchone()
            if not row:
                return error_response("イベントが存在しません", 404)
            event_creator = row.creator if hasattr(row, "creator") else row[0]
            try:
                data = req.get_json()
            except Exception:
                data = {}
            request_creator = str(data.get("creator", ""))
            if not request_creator or request_creator != str(event_creator):
                return error_response("イベント作成者のみ削除可能です", 403)
            cursor.execute("DELETE FROM EVENTS_KEYWORDS WHERE event_id=?", event_id)
            cursor.execute("DELETE FROM EVENTS_PARTICIPANTS WHERE event_id=?", event_id)
            cursor.execute("DELETE FROM EVENTS WHERE event_id=?", event_id)
            conn.commit()
        return func.HttpResponse(json.dumps({"message": "イベント削除完了", "event_id": event_id}), mimetype="application/json", status_code=200)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logging.error(tb)
        return error_response(str(e), 500, tb)

@app.route(route="get_categories", methods=["GET"])
def get_categories(req: func.HttpRequest) -> func.HttpResponse:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT category_id, category_name FROM CATEGORYS")
            rows = cursor.fetchall()
            result = [{"category_id": row.category_id, "category_name": row.category_name} for row in rows]
        return func.HttpResponse(json.dumps(result), mimetype="application/json")
    except Exception as e:
        logging.error(str(e))
        return error_response(f"Error: {str(e)}", 500)

@app.route(route="get_keywords", methods=["GET"])
def get_keywords(req: func.HttpRequest) -> func.HttpResponse:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT keyword_id, keyword_name FROM KEYWORDS")
            rows = cursor.fetchall()
            result = [{"keyword_id": row.keyword_id, "keyword_name": row.keyword_name} for row in rows]
        return func.HttpResponse(json.dumps(result), mimetype="application/json")
    except Exception as e:
        logging.error(str(e))
        return error_response(f"Error: {str(e)}", 500)

@app.route(route="search_events", methods=["GET", "POST"])
def search_events(req: func.HttpRequest) -> func.HttpResponse:
    try:
        if req.method == "GET":
            event_id = req.params.get("event_id")
            with get_db_connection() as conn:
                cursor = conn.cursor()
                if not event_id:
                    sql = '''
                        SELECT e.*, c.category_name
                        FROM events e
                        LEFT JOIN CATEGORYS c ON e.event_category = c.category_id
                    '''
                    cursor.execute(sql)
                    columns = [column[0] for column in cursor.description]
                    rows = cursor.fetchall()
                    result = [dict(zip(columns, row)) for row in rows]
                    return func.HttpResponse(json.dumps(result, default=str), mimetype="application/json")
                else:
                    try:
                        event_id_int = int(event_id)
                    except (ValueError, TypeError):
                        return error_response("event_idの形式が不正です")
                    sql = '''
                        SELECT e.*, c.category_name
                        FROM events e
                        LEFT JOIN CATEGORYS c ON e.event_category = c.category_id
                        WHERE e.event_id = ?
                    '''
                    cursor.execute(sql, (event_id_int,))
                    row = cursor.fetchone()
                    columns = [column[0] for column in cursor.description]
                    if row:
                        result = dict(zip(columns, row))
                        for k, v in result.items():
                            if isinstance(v, (bytes, bytearray)):
                                result[k] = v.decode('utf-8', errors='ignore')
                            elif hasattr(v, 'isoformat'):
                                result[k] = v.isoformat()
                        return func.HttpResponse(json.dumps(result, default=str), mimetype="application/json")
                    else:
                        return error_response("該当するデータがありません", 404)
        elif req.method == "POST":
            req_body = req.get_json()
            event_id = req_body.get("event_id")
            if not event_id:
                return error_response("event_idが指定されていません")
            # 必要ならここにPOST用の処理を追加
            return error_response("未実装", 501)
        else:
            return error_response("許可されていないメソッドです", 405)
    except Exception as e:
        logging.error(f"DBエラー: {e}")
        return error_response(f"DB接続エラー: {e}", 500)

@app.route(route="get_event_detail", methods=["GET"])
def get_event_detail(req: func.HttpRequest) -> func.HttpResponse:
    try:
        event_id = req.params.get("event_id")
        if not event_id:
            return error_response("event_idは必須です")
        try:
            event_id = int(event_id)
        except ValueError:
            return error_response("event_idは整数で指定してください")
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT event_id, event_title, event_category, event_datetime, deadline, location, max_participants, current_participants, creator, description, content, image, is_draft FROM EVENTS WHERE event_id=?",
                (event_id,)
            )
            row = cursor.fetchone()
            if row:
                keys = ["event_id", "event_title", "event_category", "event_datetime", "deadline", "location", "max_participants", "current_participants", "creator", "description", "content", "image", "is_draft"]
                event = dict(zip(keys, row))
                return func.HttpResponse(json.dumps(event, default=str), status_code=200, mimetype="application/json")
            else:
                return error_response("イベントが見つかりません", 404)
    except Exception as e:
        return error_response(str(e), 400)


@app.route(route="get_participants")
def get_participants(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('参加者一覧APIが呼び出されました')
    event_id = req.params.get('event_id')
    if not event_id:
        return func.HttpResponse("event_id is required", status_code=400)

    conn_str = os.environ["CONNECTION_STRING"]
    conn = pyodbc.connect(conn_str)
    try:
        with conn.cursor() as cursor:
            sql = """
                SELECT u.id, u.l_name, u.f_name, u.email
                FROM EVENTS_PARTICIPANTS ep
                JOIN USERS u ON ep.id = u.id
                WHERE ep.event_id = ? AND ep.cancelled_at IS NULL
            """
            cursor.execute(sql, event_id)
            columns = [column[0] for column in cursor.description]
            participants = [dict(zip(columns, row)) for row in cursor.fetchall()]
    finally:
        conn.close()

    return func.HttpResponse(
        json.dumps({"participants": participants}, ensure_ascii=False),
        mimetype="application/json",
        status_code=200
    )