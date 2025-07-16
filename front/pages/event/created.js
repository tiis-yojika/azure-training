import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import EventList from "../../components/EventList";

export default function CreatedEventsContainer() {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState("");
    const router = useRouter();
    const userId = "0738";

    useEffect(() => {
        if (!userId) return;
        fetch(`https://0x0-my-created-events-bpc3aghwg9bsb6fh.japaneast-01.azurewebsites.net/api/my_created_events?code=ySei4_1PSXAQo0-wKbHWgNOEC81pkALwA2bgaMN7JkzjAzFu4VKmeQ%3D%3D&user_id=${userId}`)
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
