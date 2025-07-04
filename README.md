# azure-training

ワークフロー作成
1.	Functionsリソースの画面から「設定」->「構成」->「全般設定」->「SCM基本認証の発行資格情報」をオン
2.	「概要」->「発行プロファイルの取得」からプロファイルをダウンロード
3.	リポジトリのSettingタブを選択
4.	「Secrets＆variables」->「Actions」->「New repository secret」
5.	nameに「AZURE_FUNCTIONAPP_PUBLISH_PROFILE」、Secretに2で取得したプロファイルの中身を貼り付け
6.	Add secretで追加
7.	リポジトリのActionsタブを選択
8.	「Deploy Python app to Azure Functions App」のConfigureを選択
9.	.github/workflowsにymlファイルが生成されるのでCommit changes
10.	ymlファイルの編集ボタンを押して、次のように変更した後Commit changes
i.	env:
AZURE_FUNCTIONAPP_NAME: 'Functionsのリソース名'
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.'
  PYTHON_VERSION: '3.11'
ii.	フレックス従量課金のFunctions環境にデプロイする際
with:
app-name: ${{ env.AZURE_FUNCTIONAPP_NAME }}
package: ${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}
publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}
sku: flexconsumption
remote-build: true
11.	Actions画面のジョブ名に緑のチェックが付けばデプロイ成功
単体テストの自動実行
1.	ターミナルでテスト対象のファイルがあるディレクトリに移動し、以下を実行
$ pip install pytest
2.	このディレクトリにテスト用のフォルダ（例：test）を作成し、__init__.pyとテスト用プログラム（例：test_func.py）を入れる
3.	テスト用プログラムに単体テストのコードを実装する
4.	ymlファイルの「- name: 'Run Azure Functions Action'」の前に以下を追加
- name: Install dependencies
run: |
python -m pip install --upgrade pip
pip install pytest
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi

- name: Install Microsoft ODBC
run: sudo ACCEPT_EULA=Y apt-get install msodbcsql18 -y

- name: Run tests
env:
CONNECTION_STRING: ${{ secrets.CONNECTION_STRING }}
run: pytest
5.	Functionsリソースの画面から「設定」->「環境変数」->「CONNECTION_STRING」の値をコピー
6.	リポジトリのSettingタブを選択
7.	「Secrets＆variables」->「Actions」->「New repository secret」
8.	nameに「CONNECTION_STRING」、Secretに5でコピーした接続文字列を貼り付け
9.	Add secretで追加
10.	
