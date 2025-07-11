import azure.functions as func
import json
import pyodbc
import os

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.route(route="login", methods=["POST"])
def login(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        username = data.get("username")
        password = data.get("password")

        # 必須フィールドチェック
        if not username or not password:
            return func.HttpResponse(
                json.dumps({"error": "Missing username or password"}),
                status_code=400,
                mimetype="application/json"
            )

        # local.settings.json の Values から接続文字列を取得
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            return func.HttpResponse(
                json.dumps({"error": "DB接続情報が設定されていません"}),
                status_code=500,
                mimetype="application/json"
            )

        try:
            with pyodbc.connect(conn_str) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT COUNT(*) FROM users WHERE id=? AND password=?",
                    (username, password)
                )
                result = cursor.fetchone()
                if result and result[0] == 1:
                    return func.HttpResponse(
                        json.dumps({"result": "ok"}),
                        status_code=200,
                        mimetype="application/json"
                    )
                else:
                    return func.HttpResponse(
                        json.dumps({"error": "Invalid credentials"}),
                        status_code=401,
                        mimetype="application/json"
                    )
        except pyodbc.Error as db_err:
            return func.HttpResponse(
                json.dumps({"error": "Database error: " + str(db_err)}),
                status_code=500,
                mimetype="application/json"
            )
    except ValueError:
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON"}),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=400,
            mimetype="application/json"
        )