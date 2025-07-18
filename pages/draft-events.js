import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../utils/getValidId";
import EventList from "../components/EventList";

const API_URL_GET_DRAFT = process.env.NEXT_PUBLIC_API_URL_GET_DRAFT;

export default function DraftEventsContainer() {
    const [events, setEvents] = useState([]);
    const router = useRouter();
    const userId = getValidId();

    useEffect(() => {
        fetch(API_URL_GET_DRAFT + `?id=${userId}`, {
            method: "GET"})
            .then((res) => res.json())
            .then(setEvents);
    }, [userId]);

    const handleEdit = (eventId) => {
        router.push(`/event_edit/${eventId}`);
    };

    return <EventList events={events} onEdit={handleEdit} title="下書きイベント一覧" />;
}