import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// 取得時（例：マイページなどで利用する場合）
function getValidId() {
  const id = localStorage.getItem("id");
  const expire = localStorage.getItem("id_expire");
  if (!id || !expire || Date.now() > Number(expire)) {
    localStorage.removeItem("id");
    localStorage.removeItem("id_expire");
    return null;
  }
  return id;
}

export default function ReservationDetail() {
  const router = useRouter();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (router.isReady) {
      // クエリからイベント情報を取得
      setDetail({
        event_id: router.query.event_id ?? "",
        event_title: router.query.event_title ?? "",
        event_datetime: router.query.event_datetime ?? "",
        location: router.query.location ?? "",
        description: router.query.description ?? "",
        content: router.query.content ?? ""
      });
    }
  }, [router.isReady, router.query]);

  if (!detail) {
    return <div style={{ textAlign: "center", marginTop: 60 }}>読み込み中...</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px #0001", padding: 36 }}>
      <h2 style={{ color: "#00c2a0", fontWeight: 700, marginBottom: 24 }}>イベント詳細</h2>
      <table style={{ width: "100%", fontSize: "1.05rem" }}>
        <tbody>
          <tr>
            <th style={thStyle}>イベント名</th>
            <td style={tdStyle}>{detail.event_title}</td>
          </tr>
          <tr>
            <th style={thStyle}>日時</th>
            <td style={tdStyle}>{detail.event_datetime ? new Date(detail.event_datetime).toLocaleString() : ""}</td>
          </tr>
          <tr>
            <th style={thStyle}>場所</th>
            <td style={tdStyle}>{detail.location}</td>
          </tr>
          <tr>
            <th style={thStyle}>説明</th>
            <td style={tdStyle}>{detail.description}</td>
          </tr>
          <tr>
            <th style={thStyle}>内容</th>
            <td style={tdStyle}>{detail.content}</td>
          </tr>
        </tbody>
      </table>
      <button
        style={{
          marginTop: 32,
          padding: "10px 32px",
          background: "#00c2a0",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: 700,
          cursor: "pointer",
          fontSize: "1.08rem",
        }}
        onClick={() => router.back()}
      >
        戻る
      </button>
    </div>
  );
}

// 詳細画面への遷移
export const handleDetail = (item) => {
  const params = new URLSearchParams({
    event_id: item.event_id,
    event_title: item.event_title ?? "",
    event_datetime: item.event_datetime ?? "",
    location: item.location ?? "",
    description: item.description ?? "",
    content: item.content ?? "" // ←ここを追加
  }).toString();
  window.location.href = `/reservation-detail?${params}`;
};

const thStyle = {
  textAlign: "left",
  padding: "10px 12px",
  background: "#f5f5f5",
  width: 120,
  fontWeight: 700,
  color: "#00c2a0"
};

const tdStyle = {
  padding: "10px 12px",
  color: "#222"
};