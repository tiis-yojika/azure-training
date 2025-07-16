import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function EventDeleteConfirm() {
    const router = useRouter();
    const [eventId, setEventId] = useState("");
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!router.isReady) return;
        const { id } = router.query;
        setEventId(id);
        if (id) {
            // バグ修正: 取得APIのURL末尾に`/${id}`が重複していたので削除
            fetch(`https://0x0-event-management.azurewebsites.net/api/events/${id}?code=B6FHqDqDwJVTfMUFAC6ZptbH_KME7rndWP2yayBkPrHcAzFuKEsPFw%3D%3D`)
                .then(res => res.json())
                .then(data => setEventData(data))
                .catch(() => setEventData(null));
        }
    }, [router.isReady, router.query]);

    const handleDelete = async () => {
        setLoading(true);
        setError("");
        try {
            // バグ修正: 削除APIのURLでidが未定義になる場合があるのでeventIdを使う
            const res = await fetch(`https://0x0-event-management.azurewebsites.net/api/events/${eventId}?code=Epb_sHIPMHqmDwwPK2AuEPhhB_tDFbLy5GlK0thCRkg8AzFuS0i5bA%3D%3D`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "creator": id }),
            });
            if (res.ok) {
                router.push("/event-delete-done");
            } else {
                let err;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    err = await res.json();
                } else {
                    err = { error: await res.text() };
                }
                setError("削除失敗: " + (err.error || res.status));
            }
        } catch (err) {
            setError("通信エラー: " + err);
        }
        setLoading(false);
    };

    if (!eventData) {
        return <div>読み込み中...</div>;
    }

    return (
        <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
            <h1>イベント削除内容確認</h1>
            <div style={{ margin: "1rem 0", fontWeight: "bold", color: "#d32f2f" }}>このイベントを本当に削除しますか？</div>
            <div className="row"><b>タイトル:</b> {eventData.event_title}</div>
            <div className="row"><b>日付:</b> {eventData.event_datetime}</div>
            <div className="row"><b>場所:</b> {eventData.location}</div>
            <div className="row"><b>カテゴリ:</b> {eventData.event_category}</div>
            <div className="row"><b>概要:</b> {eventData.description}</div>
            <div className="row"><b>詳細:</b> {eventData.content}</div>
            <div className="row"><b>最大人数:</b> {eventData.max_participants}</div>
            <div className="row"><b>締切日:</b> {eventData.deadline}</div>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button onClick={handleDelete} disabled={loading} style={{ background: "#d32f2f", color: "#fff", marginTop: 16 }}>
                {loading ? "削除中..." : "この内容で削除"}
            </button>
            <button
                type="button"
                style={{ marginLeft: 8 }}
                onClick={() => router.back()}
            >戻る</button>
        </div>
    );
}
