import Head from 'next/head';
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [username, setUsername] = useState(""); // usernameという箱に入力値を保存するよ。変更はsetUsername関数で行うよ。
  const [error, setError] = useState(""); // エラーメッセージの格納場所はerrorだよ。
  const router = useRouter(); // ルーティング（ページ遷移）を行うためのオブジェクト

  // 例：AzureFunctionに入力値をPOST送信する
  async function handleSubmit(e) {
    e.preventDefault(); // 画面がリロードされるのを防ぐ
    setError(""); // エラーメッセージのリセット
    try {
      const res = await fetch("ここにデプロイしたAzure FunctionsのURLを貼り付け", {
        method: "POST", // GETかPOSTか
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }), // オブジェクトをJSON形式に変換
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("id", data.id); // ← idを保存
        router.push("/nextpage"); // nextpageというページに遷移したいとき
      } else {
        setError("ログイン失敗");
      }
    } catch (err) {
      setError("通信エラー");
    }
  }

  function handleUsernameChange(e) {
    setUsername(e.target.value);
  }

  return (
    {/* ページに表示するHTMLを記述 */}
    {/* ヘッダー */}
    <Head>
      <title>タイトル</title>
      <meta name="description" content="ページの説明文をここに書く" />
      <link rel="icon" href="アイコンファイル（.ico）があればここに記載（public以下のパスでOK）" />
    </Head>
  
    {/* ボディ：入力フォームの例 */}
    <div>
      <main>
        {/* フォーム送信時にhandleSubmit関数が動く /*}
        <form onSubmit={handleSubmit}>
          <div>
            <label>ユーザ名</label>
            {/* 入力値を入れたり消したりする度にhandleUsernameChange関数が呼び出される */}
            <input value={username} onChange={handleUsernameChange} />
          </div>
          <button type="submit">送信</button>
          {/* 変数errorに格納されているエラーメッセージを赤字で表示したいとき */}
          {error && <div style={{color:"red"}}>{error}</div>}
        </form>
      </main>
    </div>
  );
}
