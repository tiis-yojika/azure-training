import azure.functions as func
import logging
import pyodbc
import os
import json

# 承認レベルによって書き換える
app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# 11,12行目のxxxは機能ごとに適当に命名してください
@app.route(route="xxx", methods=["GET", "POST"])
def xxx(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "GET":
        # GETリクエスト時の処理
        # クエリパラメータidの値をuser_idに格納したり…
        user_id = req.params.get("id")
        # クエリパラメータが渡されていないときの処理を書いたり
        if not user_id:

            return func.HttpResponse("idが指定されていません", status_code=400)
        
    elif req.method == "POST":
        # POSTリクエスト時の処理
        # リクエストボディをJSONとしてパースして値を取得
        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse("リクエストボディが不正です", status_code=400)
        user_id = req_body.get("id")
        # 同様にエラー処理も書いておく
        if not user_id:
            return func.HttpResponse("idが指定されていません", status_code=400)
    else:
        return func.HttpResponse("許可されていないメソッドです", status_code=405)

    # 取得したidからデータベース操作
    return get_name(user_id)


# 例：入力idがマッチしたときに対応する氏名を取得する関数
def get_name(id):
    try:
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            logging.error("CONNECTION_STRINGが環境変数に設定されていません")
            return func.HttpResponse("DB接続情報がありません", status_code=500)
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        # SQL文を記述して実行
        sql = "SELECT l_name, f_name FROM users WHERE id = ?"
        cursor.execute(sql, (id,))
        row = cursor.fetchone()
        conn.close()
    except Exception as e:
        logging.error(f"DBエラー: {e}")
        return func.HttpResponse("DB接続エラー", status_code=500)
    
    if row:
        # 結果を返す
        result = {"l_name": row[0], "f_name": row[1]}
        return func.HttpResponse(json.dumps(result), mimetype="application/json")
    else:
        return func.HttpResponse("該当するデータがありません", status_code=404)
