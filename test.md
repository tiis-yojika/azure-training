# 目次
[開発環境の構築](#make_env)<br>
[個人開発の準備](#prepare)<br>
[バックエンド開発](#back)<br>
[フロントエンド開発](#front)<br>
[developへのマージ](#merge)<br>

<a id="make_env"></a>
# 開発環境の構築
※ローカルフォルダにクローン済の場合は[次の章](#prepare)へ
1. エクスプローラーでローカル作業用のフォルダを作成する
2. VSCodeで作成したフォルダを開く
3. ターミナル上でローカル環境にリポジトリをクローンする
   ```bash
   git clone https://github.com/x-garage/x-garage-0x0-product ./
   ```

<a id="prepare"></a>
# 個人開発の準備
1. ローカルdevelopブランチに切り替える
   ```bash
   git checkout develop
   ```
2. リモートのdevelopブランチの内容を反映させる
   ```bash
   git pull origin develop
   ```
3. ローカル環境に各featureブランチを作成して切り替え（既存のブランチに移動する場合は-bオプションは不要）
   ```bash
   git checkout -b feature/[作業名]
   ```

<a id="back"></a>
# バックエンド開発
## Azure Functionsの作成
1. Azureのページで「関数アプリ」のサービスに移動し、新規作成する
2. 「フレックス従量課金」を選択して次へ
3. 以下の設定で作成する<br>
   **基本**
   - サブスクリプション：X-Garage-2
   - リソースグループ：X-Garage-Team-2025NE01
   - 関数アプリ名：0x0-[機能名]
   - 安全な一意の限定のホスト名：オフ
   - リージョン：(Asia Pacific) Japan East
   - ランタイムスタック：Python
   - バージョン：3.11
   - インスタンスサイズ：2048MB
   
   **Storage**
   - 変更なし

   **Azure OpenAI**
   - 変更なし
  
   **ネットワーク**
   - 変更なし
  
   **監視**
   - Application Insightsを有効：いいえ
  
   **デプロイ**
   - 変更なし
  
   **認証**
   - 変更なし

   **タグ**
   - 名前：プロジェクト名称
   - 値：新入社員研修
4. 作成したAzure Functionsのリソース画面から設定 -> 環境変数 -> 追加を選択
5. 以下の情報を入力し、「適用」を2回クリック
   - 名前：CONNECTION_STRING
   - 値：接続文字列
## ローカル環境でのコード生成とデバッグ
==========初回のみ実施==========
- back/local.settings.jsonのValuesにCONNECTION_STRINGを追加（[確認方法](https://github.com/x-garage/x-garage-0x0-product/blob/main/DB%E4%BD%9C%E6%88%90%E5%82%99%E5%BF%98%E9%8C%B2.md#%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9%E6%83%85%E5%A0%B1%E3%81%AE%E7%A2%BA%E8%AA%8D)）
- back/requirements.txtにpyodbcを追加
  
===============================
1. backディレクトリに移動して、直下にFunction毎のフォルダを新規作成する
   ```bash
   cd back
   mkdir ./function-[機能名]
   ```
2. `ctrl`+`shift`+`A`でAzureのメニューを開き、WORKSPACEの稲妻マークから「Create New Project」を選択
3. Browseからコードの保存場所を選択する：1.で作成したフォルダを選ぶ
4. 言語はPython→環境はPython3.11を選択する
5. Functionsの種類を選択（大抵はHTTP triggerでOK）
6. 適当に機能名を付ける
7. 承認レベルを選択<br>
   **Anonymous**：公開API向け、誰でもアクセス可能<br>
   **Function**：内部システム間や限定公開API向け、URLに?code=...が必要<br>
   **Admin**：管理者用エンドポイント向け、管理者用のcodeが必要<br>
8. .vscode/tasks.jsonの12行目と29行目あたりにあるcwdの値を次のように変更
   ```json
   "cwd": "${workspaceFolder}/back\\function-[機能名]"
   ```
9. コードを記述（Copilotに依頼、必要に応じて微修正）<a id="back_coding"></a><br>
   `xxx`は機能名（例：http_trigger）<br>
   以降の内容は[テンプレート](https://github.com/x-garage/x-garage-0x0-product/blob/main/Python_template.py)を参考にしてください
```python
@app.route(route="xxx")
def xxx(req: func.HttpRequest) -> func.HttpResponse:
  # HTTPリクエストを受け取った際の処理
```
10. ターミナルでF5キーを押してデバッグ
   - F5キーが反応しなかったら次を実行
     ```bash
     cd function-[機能名]
     func host start
     ```
   - `Port 7071 is unavailable`のエラーが出た際は次のように解決
     ```bash
     netstat -ano | findstr 7071
     taskkill /f /pid [出てきたpid]
     ```
   - ブラウザでhttp://localhost:7071/api/[機能名] を開く
   - GETリクエストの結果を見たい場合は、URLの末尾に`?[パラメータ名1]=[値1]&[パラメータ名2]=[値2]&...`を追加する
11. 結果を確認し、`ctrl`+`C`で実行を停止する
12. 期待する結果が表示されたら次へ、そうでなければ[9.](#back_coding)に戻る

## Azure Functionsへのデプロイ
13. VSCodeで`ctrl`+`shift`+`A`からAzureエクステンションを開き、WORKSPACEの稲妻マークから「Deploy to Azure」を選択
14. サブスクリプションは「X-Garage-2」、リソースはfunction_app.pyがあるフォルダを選択
15. 上書きの警告が表示されたら「Deploy」で承認
<a id="copy_func_id"></a>
17. AzureエクステンションのRESOURCESからX-Garage-2 -> Function App -> 3.で作成した関数アプリ名（0x0-[機能名]） -> Functions -> [機能名]を右クリックして、「Copy Function Url」を選択（何も出てこなければ、少し待ってFunctionsを右クリック -> Refresh）
18. コピーしたURLをブラウザに貼り付けてアクセス
19. ローカル環境と同じ表示か確認
    - GETリクエストの結果を見たい場合は、URLの末尾に`&[パラメータ名1]=[値1]&[パラメータ名2]=[値2]&...`を追加する

## リモートfeatureブランチに反映
19. 次のコマンドを実行
    ```bash
    git add .
    git commit -m "メッセージ"
    git push -u origin feature/[作業名]
    ```

<a id="front"></a>
# フロントエンド開発
## ローカル環境でのコード生成とデバッグ
1. ターミナルから作業ディレクトリをfrontに移動する<br>
   ルートから移動する場合
   ```bash
   cd ./front
   ```
   backから移動する場合
   ```bash
   cd ../front
   ```
2. フロントエンド用のローカルサーバを起動する
   ```bash
   npm run dev
   ```
3. 機能に応じてコードやソースを追加していく
   - pages：ページ情報
   - public/img：画像リソース
   - styles：アプリ全体に適用したいスタイル情報など
4. fetchメソッドを呼び出している場合、第1引数はAzure FunctionsのURL（[ここ](#copy_func_id)で取得したやつ）に置き換える
5. ブラウザの表示やページ遷移が正常であればターミナルで`ctrl`+`C`を押してサーバを停止する

## リモートfeatureブランチに反映
??. 次のコマンドを実行
    ```bash
    git add .
    git commit -m "メッセージ"
    git push -u origin feature/[作業名]

<a id="merge"></a>

# developへのマージ
## Pull requestの作成
1. 作業したfeatureブランチの更新GitHubに反映されているかを確認する
2. Pull requestsのページに移動すると、そのfeatureブランチに対して「Compare & pull request」のボタンが出現しているので選択する（なければNewで新規作成）
3. base: develop、compare:feature/[作業名]になっているのを確認する
4. Reviewers（レビューする人）やAssignees（作成責任者）を適切に設定してプルリクを送る
## レビュー
5. レビュー依頼のメールが来ているか確認
6. 全て正常ならばApprove、問題があればコメント記入後Request changesを選択してSubmit review
## マージ
7. 作成責任者はPull requestのページからレビュー結果を確認
   - approvedならば次へ
   - 修正内容があればローカル環境で修正し、再度レビュー依頼をする
8. Merge pull request -> Confirm mergeでdevelopブランチにマージ
9. 成功したらDelete branchでリモートfeatureブランチは削除しておく
10. VSCodeのターミナルからローカルのfeatureブランチも削除
    ```bash
    git checkout develop
    git branch -d feature/[作業名]
    ```
