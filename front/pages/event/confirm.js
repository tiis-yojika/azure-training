import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EventConfirmPage() {
  const router = useRouter();
  const { event_id } = router.query;
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!event_id) return;
    fetch(`https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/showevent?code=KjUCLx4igb6FiJ3ZtQKowVUUk9MgUtPSuBhPrMam2RwxAzFuTt1T_w%3D%3D&event_id=${event_id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
      })
      .catch((err) => {
        setError("データ取得エラー: " + err.message);
      });
  }, [event_id]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!event) return <div>読み込み中...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>イベント参加確認</h1>
      <p>以下のイベントに参加しますか？</p>
      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <th>タイトル</th>
            <td>{event.event_title}</td>
          </tr>
          <tr>
            <th>日時</th>
            <td>{event.event_datetime}</td>
          </tr>
          <tr>
            <th>場所</th>
            <td>{event.location}</td>
          </tr>
        </tbody>
      </table>
      // 仮の参加メッセージ
      // 実際に本番で動かすときは正しい行き先を指定して下さい
      <button style={{ marginTop: "1rem", background: "#43a047", color: "white", padding: "0.5rem 1.5rem", border: "none", borderRadius: "4px", cursor: "pointer" }}
        onClick={() => alert("参加が確定しました！（仮）")}
      >参加を確定</button>
      <button style={{ marginLeft: "1rem" }} onClick={() => router.back()}>戻る</button>
    </div>
  );
}
