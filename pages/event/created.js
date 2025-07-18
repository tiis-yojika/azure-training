import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";
import EventList from "../../components/EventList";

const API_URL_GET_SELF_CREATED_EVENTS = process.env.NEXT_PUBLIC_API_URL_GET_SELF_CREATED_EVENTS;

export default function CreatedEventsContainer() {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState("");
    const router = useRouter();
    const userId = getValidId();

    useEffect(() => {
        if (!userId) return;
        fetch(`${API_URL_GET_SELF_CREATED_EVENTS}&user_id=${userId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`取得失敗: ${res.status}`);
                }
                return res.json();
            })
            .then(setEvents)
            .catch((err) => setError("イベント取得エラー: " + err.message));
    }, [userId]);

    const handleEdit = (eventId) => {
        router.push(`/event/edit?event_id=${eventId}`);
    };

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    return <EventList events={events} onEdit={handleEdit} title="作成済みイベント一覧" />;
}
