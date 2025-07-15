import { useRouter } from 'next/router';

export default function CancelComplete() {
  const router = useRouter();

  return (
    <div style={{
      maxWidth: 400,
      margin: "80px auto",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 24px #0001",
      padding: 48,
      color: "#222",
      fontFamily: "'Noto Sans JP', 'Helvetica Neue', Arial, 'メイリオ', sans-serif",
      border: "1.5px solid #e0e0e0",
      textAlign: "center"
    }}>
      <h2 style={{ color: "#00c2a0", fontWeight: 700, marginBottom: 24 }}>キャンセル確定しました</h2>
      <button
        style={{
          background: "#00c2a0",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "10px 28px",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: "1.08rem",
          marginTop: 24
        }}
        onClick={() => router.push("/history")}
      >
        履歴に戻る
      </button>
    </div>
  );
}