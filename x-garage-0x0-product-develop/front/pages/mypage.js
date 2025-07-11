import { useEffect, useState } from "react";

export default function MyPage() {
  const [lName, setLName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 仮にidをlocalStorageやクエリパラメータから取得する場合
    const id = localStorage.getItem("id"); // 必要に応じて取得方法を変更
    if (!id) {
      setError("IDが見つかりません");
      setLoading(false);
      return;
    }

    fetch("", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(res => {
        if (!res.ok) throw new Error("取得失敗");
        return res.json();
      })
      .then(data => {
        setLName(data.l_name);
        setLoading(false);
      })
      .catch(() => {
        setError("データ取得エラー");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{color:"red"}}>{error}</div>;

  return <div>{lName}さんのページ</div>;
}