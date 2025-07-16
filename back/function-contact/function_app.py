import azure.functions as func
import logging
import os
import pyodbc
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

if os.environ.get("IS_MAIN_PRODUCT") == "true":
    CONNECTION_STRING = os.environ.get("CONNECTION_STRING_PRODUCT")
else:
    CONNECTION_STRING = os.environ.get("CONNECTION_STRING_TEST")


@app.route(route="create_inquiry", methods=["POST"])
def create_inquiry(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    # POSTリクエストのボディから取得
    import json
    try:
        body = req.get_json()
    except Exception:
        body = {}
    event_id = body.get('event_id')
    subject = body.get('subject')
    message = body.get('message')
    sender_id = body.get('sender_id')
    recipient_id = body.get('recipient_id')
    reply_to_inquiry_id = body.get('reply_to_inquiry_id')
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000"
    }
    try:
        event_id = str(int(event_id)) if event_id is not None else None
        reply_to_inquiry_id = str(int(reply_to_inquiry_id)) if reply_to_inquiry_id is not None else None
    except ValueError:
        return func.HttpResponse(json.dumps({"error": "event_id, reply_to_inquiry_idは数値で指定してください。"}), status_code=400, headers=headers)
    if not event_id or not subject or not message:
        return func.HttpResponse(json.dumps({"error": "event_id, subject, messageは必須です。"}), status_code=400, headers=headers)
    try:
        conn = pyodbc.connect(os.environ.get("CONNECTION_STRING"))
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO INQUIRIES (event_id, subject, message, sender_id, recipient_id) VALUES (?, ?, ?, ?, ?)",
                (
                    #event_idはint
                    
                    str(event_id) if event_id is not None else None,
                    str(subject) if subject is not None else None,
                    str(message) if message is not None else None,
                    str(sender_id) if sender_id is not None else None,
                    str(recipient_id) if recipient_id is not None else None,
                    #str(reply_to_inquiry_id) if reply_to_inquiry_id is not None else None
                )
            )
            conn.commit()
    except Exception as e:
        return func.HttpResponse(json.dumps({"error": f"問い合わせ保存エラー: {str(e)}"}), status_code=500, headers=headers)
    finally:
        if 'conn' in locals():
            conn.close()
    return func.HttpResponse(
        json.dumps({
            "message": "お問い合わせを受け付けました。"
        }),
        status_code=200,
        headers=headers
    )


@app.route(route="receive_inquiries", methods=["POST"])
def receive_inquiries(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except Exception:
        return func.HttpResponse(json.dumps({"error": "リクエストボディが不正です。"}), status_code=400, headers=headers)

    sender_id = body.get('id')
    if not sender_id:
        return func.HttpResponse(json.dumps({"error": "idは必須です。"}), status_code=400, headers=headers)

    try:
        with pyodbc.connect(CONNECTION_STRING) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT inquiry_id, event_id, subject, message, created_at, sender_id, recipient_id, reply_to_inquiry_id FROM INQUIRIES WHERE sender_id = ?",
                (sender_id,)
            )
            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()
            result = [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        return func.HttpResponse(json.dumps({"error": f"取得エラー: {str(e)}"}), status_code=500, headers=headers)

    return func.HttpResponse(
        json.dumps(result, ensure_ascii=False, default=str),
        status_code=200,
    )


