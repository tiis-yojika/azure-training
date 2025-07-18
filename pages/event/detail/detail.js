import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../../utils/getValidId"; // ユーティリティ関数をインポート

const id = getValidId();

export default function EventDetailPage() {
  const router = useRouter();
  const { event_id, id: queryId } = router.query;
  const [id, setId] = useState("");

  useEffect(() => {
    let validId = queryId;
    if (!validId) {
      validId = getValidId();
    }
    // indexへのリダイレクトは行わず、idがなければ空のまま
    setId(validId ?? "");
  }, [queryId, router]);

  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [isParticipated, setIsParticipated] = useState(false);

  useEffect(() => {
    if (!event_id) return;
    fetch(`https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/showevent?code=KjUCLx4igb6FiJ3ZtQKowVUUk9MgUtPSuBhPrMam2RwxAzFuTt1T_w%3D%3D&event_id=${event_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvent(data[0]);
        } else {
          setEvent(data);
        }
      })
      .catch((err) => {
        setError("データ取得エラー: " + err.message);
      });
  }, [event_id]);

  // check_historyで参加履歴を確認
  useEffect(() => {
    if (!event_id || !id) return;
    fetch(`https://0x0-showevent-hbbadxcxh9a4bzhu.japaneast-01.azurewebsites.net/api/check_history?code=0iAKT3swTE1gEjS8rDRJWN44V-z9YG24hfRxGkLC0LmRAzFudLVqtg%3D%3D&event_id=${event_id}&id=${id}`)
      .then(res => res.json())
      .then(data => {
        setIsParticipated(data.is_participated === true);
      })
      .catch(() => {
        setIsParticipated(false);
      });
  }, [event_id, id]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!event) return <div>読み込み中...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>イベント詳細</h1>
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
            <th>締切</th>
            <td>{event.deadline}</td>
          </tr>
          <tr>
            <th>場所</th>
            <td>{event.location}</td>
          </tr>
          <tr>
            <th>内容</th>
            <td>{event.content}</td>
          </tr>
          <tr>
            <th>説明</th>
            <td>{event.description}</td>
          </tr>
        </tbody>
      </table>
      {event.image && (
        <div>
          <img src={event.image} alt="イベント画像" style={{ maxWidth: "100%" }} />
        </div>
      )}
      <button onClick={() => router.back()}>戻る</button>
      {(() => {
        if (isParticipated === true) {
          return (
            <div style={{ color: "#a10000", margin: "1rem 0" }}>
              あなたはすでにこのイベントに参加済みです
            </div>
          );
        } else {
          return (
            <button
              style={{
                marginLeft: '1rem',
                background: '#1976d2',
                color: 'white',
                padding: '0.5rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => router.push(`/event/confirm?event_id=${event_id}`)}
            >
              参加
            </button>
          );
        }
      })()}
    </div>
  );
}