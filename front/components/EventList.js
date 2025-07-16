// 表示コンポーネント
import { useRouter } from "next/router";

export default function EventList({ events, onEdit, title }) {
    const router = useRouter();
    const handleCancel = (eventId) => {
        // 取り消し確認画面URLは仮で /event_cancel/[event_id]
        router.push(`/event_cancel/${eventId}`);
    };
    return (
        <div>
            <h2>{title}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2em", alignItems: "center" }}>
                {events.map((event) => (
                    <div key={event.event_id} style={{
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "1em",
                        background: "#fafafa",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "1em",
                        maxWidth: "700px",
                        width: "100%"
                    }}>
                        <div style={{ color: "#555", minWidth: "120px", textAlign: "left" }}>
                            {event.event_datetime ? event.event_datetime.slice(0, 10) : ""}
                        </div>
                        <div
                            style={{ flex: 1, fontWeight: "bold", fontSize: "1.1em", textAlign: "center", cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => onEdit(event.event_id)}
                        >
                            {event.event_title}
                        </div>
                        <button onClick={() => onEdit(event.event_id)} style={{ padding: "0.4em 1em", borderRadius: "4px", border: "none", background: "#1976d2", color: "#fff", cursor: "pointer", marginRight: "0.5em" }}>
                            編集
                        </button>
                        <button onClick={() => handleCancel(event.event_id)} style={{ padding: "0.4em 1em", borderRadius: "4px", border: "none", background: "#d32f2f", color: "#fff", cursor: "pointer" }}>
                            取り消し
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
