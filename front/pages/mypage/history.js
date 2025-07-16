import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ReservationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState({
    event_id: "",
    event_title: "",
    event_datetime: "",
    location: "",
    description: "",
    content: ""
  });
  const router = useRouter();

  useEffect(() => {
    fetch("https://0x0-event-registration-history-cxhcdpauc4b5a9e7.japaneast-01.azurewebsites.net/api/reservation-detail?code=3zMxVWqQvkOGwSYU9lUIemow2Tf52EWlB5kJm6gMO1u0AzFuRjFgfg%3D%3D")
      .then(res => {
        if (!res.ok) throw new Error("データ取得に失敗しました");
        return res.json();
      })
      .then(data => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (router.isReady) {
      setDetail({
        event_id: router.query.event_id ?? "", // ←ここで受け取る
        event_title: router.query.event_title ?? "",
        event_datetime: router.query.event_datetime ?? "",
        location: router.query.location ?? "",
        description: router.query.description ?? "",
        content: router.query.content ?? ""
      });
    }
  }, [router.isReady, router.query]);

  const handleCancel = async () => {
    if (!detail.event_id) {
      alert("イベントIDが取得できません。");
      return;
    }
    const res = await fetch("/api/cancel-reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: detail.event_id })
    });
    if (res.ok) {
      alert("予約をキャンセルしました。");
      // キャンセル後の処理（例：履歴を再取得）
      setHistory(history.filter(item => item.event_id !== detail.event_id));
      setDetail({
        event_id: "",
        event_title: "",
        event_datetime: "",
        location: "",
        description: "",
        content: ""
      });
    } else {
      const errorData = await res.json();
      alert(`キャンセルに失敗しました: ${errorData.message}`);
    }
  };

  if (loading) return <div style={{textAlign: "center", marginTop: "3rem", color: "#00c2a0", fontFamily: "monospace", fontSize: "1.5rem"}}>🌀 ローディング中...</div>;
  if (error) return <div style={{ color: "#ff0055", textAlign: "center", marginTop: "3rem", fontFamily: "monospace", fontSize: "1.2rem" }}>{error}</div>;

  return (
    <div style={{
      maxWidth: 900,
      margin: "40px auto",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 24px #0001",
      padding: 36,
      color: "#222",
      fontFamily: "'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
      border: "1.5px solid #e0e0e0",
      position: "relative",
      overflow: "auto"
    }}>
      <style>{`
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #e0e0e0;
          border-radius: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #fafafa;
        }
        .connpass-row:hover {
          background: #e6f7f7 !important;
          transition: background 0.2s;
        }
        .connpass-th {
          background: #f5f5f5;
        }
        .event-title {
          font-weight: 700;
          color: #00c2a0;
          font-size: 1.08rem;
        }
        .category-badge {
          display: inline-block;
          background: #e0f7f4;
          color: #00c2a0;
          border-radius: 8px;
          padding: 2px 10px;
          font-size: 0.95rem;
          font-weight: 600;
        }
        @media (max-width: 700px) {
          .responsive-table thead {
            display: none;
          }
          .responsive-table, .responsive-table tbody, .responsive-table tr, .responsive-table td {
            display: block;
            width: 100%;
          }
          .responsive-table tr {
            margin-bottom: 18px;
            border-radius: 8px;
            box-shadow: 0 2px 8px #0001;
            background: #fafafa;
          }
          .responsive-table td {
            text-align: left;
            padding-left: 40%;
            position: relative;
            border-bottom: none;
            font-size: 1rem;
          }
          .responsive-table td:before {
            position: absolute;
            left: 16px;
            top: 12px;
            width: 35%;
            white-space: nowrap;
            font-weight: 700;
            color: #00c2a0;
            font-size: 0.98rem;
          }
          .responsive-table td:nth-child(1):before { content: "イベント名"; }
          .responsive-table td:nth-child(2):before { content: "カテゴリ"; }
          .responsive-table td:nth-child(3):before { content: "日時"; }
          .responsive-table td:nth-child(4):before { content: "説明"; }
        }
      `}</style>
      <h2 style={{
        textAlign: "center",
        fontSize: "2.1rem",
        letterSpacing: "0.08em",
        marginBottom: 32,
        color: "#222",
        fontWeight: 700,
        fontFamily: "'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
        borderBottom: "2px solid #00c2a0",
        paddingBottom: 10
      }}>
        <span>イベント参加履歴</span>
      </h2>
      {history.length === 0 ? (
        <div style={{
          textAlign: "center",
          fontSize: "1.1rem",
          color: "#00c2a0",
          margin: "32px 0"
        }}>履歴がありません。</div>
      ) : (
        <table className="responsive-table" style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          background: "#fff",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 2px 12px #0001",
          border: "1px solid #e0e0e0"
        }}>
          <thead>
            <tr>
              <th className="connpass-th" style={thStyle}>イベント名</th>
              <th className="connpass-th" style={thStyle}>日時</th>
              <th className="connpass-th" style={thStyle}>説明</th>
              <th className="connpass-th" style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {history
              // registration_status列が存在する場合のみ1のものだけ表示
              .filter(item => (item.registration_status === undefined || item.registration_status === 1 || item.registration_status === "1"))
              .map((item, idx) => (
                <tr key={idx} className="connpass-row" style={{
                  background: idx % 2 === 0 ? "#f9f9f9" : "#fff"
                }}>
                  <td style={tdStyle}>
                    <span className="event-title">{item.event_title ?? ""}</span>
                  </td>
                  <td style={tdStyle}>{item.event_datetime ? new Date(item.event_datetime).toLocaleString() : ""}</td>
                  <td style={tdStyle}>{item.description ?? ""}</td>
                  <td style={tdStyle}>
                    <button
                      style={{
                        background: "#00c2a0",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 16px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "0.97rem",
                        transition: "background 0.2s",
                      }}
                      onClick={() => {
                        // event_idをクエリに必ず含める
                        router.push({
                          pathname: "/reservation-detail",
                          query: {
                            event_id: item.event_id,
                            event_title: item.event_title ?? "",
                            event_datetime: item.event_datetime ?? "",
                            location: item.location ?? "",
                            description: item.description ?? "",
                            content: item.content ?? ""
                          }
                        });
                      }}
                    >
                      予約詳細
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  padding: "14px 10px",
  fontWeight: 700,
  fontSize: "1rem",
  borderBottom: "2px solid #e0e0e0",
  textAlign: "center",
  letterSpacing: "0.04em",
  color: "#222"
};

const tdStyle = {
  padding: "12px 8px",
  textAlign: "center",
  fontSize: "0.98rem",
  borderBottom: "1px solid #f0f0f0",
  color: "#222"
};