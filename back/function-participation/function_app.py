import azure.functions as func
import json
import pyodbc
import os

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

if os.environ.get("IS_MAIN_PRODUCT") == "true":
    CONNECTION_STRING = os.environ.get("CONNECTION_STRING_PRODUCT")
else:
    CONNECTION_STRING = os.environ.get("CONNECTION_STRING_TEST")


# イベント参加登録API
@app.route(route="participate", methods=["GET", "POST"])
def participate(req: func.HttpRequest) -> func.HttpResponse:
    try:
        if req.method == "POST":
            try:
                data = req.get_json()
            except Exception:
                return func.HttpResponse(
                    json.dumps({"error": "リクエストボディが不正です"}),
                    status_code=400,
                    mimetype="application/json"
                )
            event_id = data.get("event_id")
            id = data.get("id")
        else:
            event_id = req.params.get("event_id")
            id = req.params.get("id")

        if not event_id or not id:
            return func.HttpResponse(
                json.dumps({"error": "event_idとidは必須です"}),
                status_code=400,
                mimetype="application/json"
            )
        try:
            event_id = int(event_id)
        except ValueError:
            return func.HttpResponse(
                json.dumps({"error": "event_idは整数で指定してください"}),
                status_code=400,
                mimetype="application/json"
            )

        if not CONNECTION_STRING:
            return func.HttpResponse(
                json.dumps({"error": "DB接続情報(CONNECTION_STRING)が設定されていません"}),
                status_code=500,
                mimetype="application/json"
            )

        with pyodbc.connect(CONNECTION_STRING) as conn:
            cursor = conn.cursor()
            # すでに参加済みかチェック
            cursor.execute(
                "SELECT COUNT(*) FROM EVENTS_PARTICIPANTS WHERE event_id=? AND id=?",
                (event_id, id)
            )
            if cursor.fetchone()[0] > 0:
                return func.HttpResponse(
                    json.dumps({"error": "すでに参加登録済みです"}),
                    status_code=409,
                    mimetype="application/json"
                )
            # 定員チェック
            cursor.execute(
                "SELECT max_participants, current_participants FROM EVENTS WHERE event_id=?",
                (event_id,)
            )
            row = cursor.fetchone()
            if not row:
                return func.HttpResponse(
                    json.dumps({"error": "イベントが見つかりません"}),
                    status_code=404,
                    mimetype="application/json"
                )
            max_participants, current_participants = row
            if current_participants >= max_participants:
                return func.HttpResponse(
                    json.dumps({"error": "上限に達しているため、参加登録できません"}),
                    status_code=409,
                    mimetype="application/json"
                )
            # 参加登録
            cursor.execute(
                "INSERT INTO EVENTS_PARTICIPANTS (event_id, id) VALUES (?, ?)",
                (event_id, id)
            )
            # current_participantsをインクリメント
            cursor.execute(
                "UPDATE EVENTS SET current_participants = current_participants + 1 WHERE event_id=?",
                (event_id,)
            )
            conn.commit()
        return func.HttpResponse(
            json.dumps({"result": "ok"}),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=400,
            mimetype="application/json"
        )


@app.route(route="get_mylist")
def get_mylist(req: func.HttpRequest) -> func.HttpResponse:

    user_id = "0738"  # 固定

    # local.settings.json の CONNECTION_STRING を利用
    if not CONNECTION_STRING:
        return func.HttpResponse("DB connection string not found.", status_code=500)

    try:
        with pyodbc.connect(CONNECTION_STRING) as conn:
            cursor = conn.cursor()
            sql = """
            SELECT
              ep.event_id,  -- これを追加
              e.event_title,
              c.category_name,
              e.event_datetime,
              ISNULL(e.location, '') AS location,
              ISNULL(e.description, '') AS description,
              ISNULL(e.content, '') AS content
            FROM
              EVENTS_PARTICIPANTS ep
              JOIN EVENTS e ON ep.event_id = e.event_id
              JOIN CATEGORYS c ON e.event_category = c.category_id
            WHERE
              ep.id = ?
            ORDER BY
              ep.registered_at DESC
            """
            cursor.execute(sql, (user_id,))
            columns = [column[0] for column in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        return func.HttpResponse("DB error", status_code=500)

    return func.HttpResponse(
        json.dumps(rows, ensure_ascii=False, default=str),
        mimetype="application/json",
        status_code=200
    )


@app.route(route="cancel_participation", methods=["POST"])
def cancel_participation(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        event_id = req_body.get("event_id")
        if not event_id:
            return func.HttpResponse("event_idが空です", status_code=400)
        user_id = "0738"
        if not CONNECTION_STRING:
            return func.HttpResponse("DB connection string not found.", status_code=500)
        with pyodbc.connect(CONNECTION_STRING) as conn:
            cursor = conn.cursor()
            try:
                event_id_int = int(event_id)
            except Exception as e:
                return func.HttpResponse("event_id型エラー", status_code=400)
            # 削除前に該当レコードが存在するか確認
            cursor.execute(
                "SELECT COUNT(*) FROM EVENTS_PARTICIPANTS WHERE event_id = ? AND id = ?",
                (event_id_int, user_id)
            )
            count = cursor.fetchone()[0]
            if count == 0:
                return func.HttpResponse("Not found", status_code=404)
            # 削除処理
            cursor.execute(
                "DELETE FROM EVENTS_PARTICIPANTS WHERE event_id = ? AND id = ?",
                (event_id_int, user_id)
            )
            deleted = cursor.rowcount
            conn.commit()
        return func.HttpResponse("OK", status_code=200)
    except Exception as e:
        return func.HttpResponse("DB error", status_code=500)