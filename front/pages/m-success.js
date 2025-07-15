import { useRouter } from "next/router";

export default function MessageSuccess() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/event-detail");
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h1>送信完了</h1>
      <p style={{ marginBottom: 16 }}>メッセージの送信が成功しました。</p>
      <button type="button" onClick={handleBack}>
        戻る
      </button>
    </div>
  );
}
