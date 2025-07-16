import React, { useEffect, useState } from 'react';

const ParticipantsList = ({ eventId }) => {
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:7071/api/participants-list?event_id=${eventId}`)
            .then(res => res.json())
            .then(data => setParticipants(data.participants || []));
    }, [eventId]);

    return (
        <div>
            <h3>参加者一覧</h3>
            <ul>
                {participants.map(p => (
                    <li key={p.id}>
                        {p.l_name} {p.f_name} ({p.email})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ParticipantsList;
