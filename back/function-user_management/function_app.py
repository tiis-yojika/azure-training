import azure.functions as func
import os
import json
import pyodbc
import os.path

from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

if os.environ.get("IS_MAIN_PRODUCT") == "true":
    CONNECTION_STRING = os.environ.get("CONNECTION_STRING_PRODUCT")
    AZURE_STORAGE_CONNECTION_STRING = os.environ.get("AZURE_STORAGE_CONNECTION_STRING_PRODUCT")
else:
    CONNECTION_STRING = os.environ.get("CONNECTION_STRING_TEST")
    AZURE_STORAGE_CONNECTION_STRING = os.environ.get("AZURE_STORAGE_CONNECTION_STRING_TEST")

CONTAINER_NAME = "profile-images"

def get_blob_sas_url(user_id, ext):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    blob_name = f"{user_id}{ext}"
    # credentialがAccountKey型でない場合のバグ修正
    account_key = None
    if hasattr(blob_service_client.credential, 'account_key'):
        account_key = blob_service_client.credential.account_key
    elif isinstance(blob_service_client.credential, str):
        account_key = blob_service_client.credential
    else:
        raise Exception("Blob Storageのアカウントキーが取得できません")
    sas_token = generate_blob_sas(
        account_name=blob_service_client.account_name,
        container_name=CONTAINER_NAME,
        blob_name=blob_name,
        account_key=account_key,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(hours=1)
    )
    url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{CONTAINER_NAME}/{blob_name}?{sas_token}"
    return url

def upload_to_blob_storage(file, user_id):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(CONTAINER_NAME)
    ext = os.path.splitext(file.filename)[1]
    blob_name = f"{user_id}{ext}"
    container_client.upload_blob(name=blob_name, data=file.stream, overwrite=True)
    url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{CONTAINER_NAME}/{blob_name}"
    return url

def error_response(message, status=400):
    return func.HttpResponse(
        body=json.dumps({"error": message}),
        status_code=status,
        mimetype="application/json"
    )

def success_response(data=None, message=None, status=200):
    body = data if data is not None else {}
    if message:
        body["message"] = message
    return func.HttpResponse(
        body=json.dumps(body),
        status_code=status,
        mimetype="application/json"
    )

@app.route(route="get_user", methods=["POST"])
def get_user(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        user_id = data.get("id")
        if not user_id:
            return error_response("idがありません")
        if not CONNECTION_STRING:
            return error_response("DB接続情報がありません", 500)
        with pyodbc.connect(CONNECTION_STRING) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT l_name, profile_img FROM users WHERE id=?", (user_id,))
            result = cursor.fetchone()
            if result:
                l_name, profile_img = result
                img_url = get_blob_sas_url(user_id, os.path.splitext(profile_img)[1]) if profile_img else None
                return success_response({"l_name": l_name, "profile_img": img_url})
            else:
                return error_response("ユーザーが見つかりません", 404)
    except Exception as e:
        return error_response(f"取得失敗: {str(e)}", 500)

@app.route(route="update_user", methods=["POST"])
def update_user(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        user_id = data.get("id")
        l_name = data.get("l_name")
        profile_img = data.get("profile_img")
        if not user_id:
            return error_response("idがありません")
        if not l_name:
            return error_response("l_nameがありません")
        if not CONNECTION_STRING:
            return error_response("DB接続情報がありません", 500)
        with pyodbc.connect(CONNECTION_STRING) as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET l_name=?, profile_img=? WHERE id=?", (l_name, profile_img, user_id))
            conn.commit()
            if cursor.rowcount == 0:
                return error_response("ユーザーが見つかりません", 404)
        return success_response(message="更新しました")
    except Exception as e:
        return error_response(f"更新失敗: {str(e)}", 500)
    

@app.route(route="upload_profile_img", methods=["POST"])
def upload_profile_img(req: func.HttpRequest) -> func.HttpResponse:
    try:
        user_id = req.form.get("id")
        file = req.files.get("profile_img")
        if not user_id or not file:
            return func.HttpResponse("idまたは画像ファイルがありません", status_code=400)
        url = upload_to_blob_storage(file, user_id)
        return func.HttpResponse(
            body=f'{{"url": "{url}"}}',
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(f"アップロード失敗: {str(e)}", status_code=500)