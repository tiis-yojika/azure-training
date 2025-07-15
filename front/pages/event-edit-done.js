import { useRouter } from "next/router";

export default function EventEditDone() {
    const router = useRouter();
    return (
        <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif", textAlign: "center" }}>
            <h1>イベント編集完了</h1>
            <p>イベントの編集が完了しました。</p>
            <a href="/event-edit" style={{ color: "#1976d2" }}>他のイベントを編集する</a>
        </div>
    );
}
