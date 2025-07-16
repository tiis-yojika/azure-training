import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const API_URL_GET_EVENT_DETAIL = NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL;

export default function EventDetail() {
  const router = useRouter()
  const { event_id } = router.query
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!event_id) return
    fetch(`${API_URL_GET_EVENT_DETAIL}&event_id=${event_id}`)
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(err => setError('データ取得エラー: ' + err.message))
  }, [event_id])

  if (error) return <div style={{ color: "red" }}>{error}</div>
  if (!event) return <div>読み込み中...</div>

  return (
    <div style={{ padding: "2rem" }}>
      <h1>イベント詳細</h1>
      <table border="1" cellPadding="8">
        <tbody>
          <tr><th>タイトル</th><td>{event.event_title}</td></tr>
          <tr><th>日時</th><td>{event.event_datetime}</td></tr>
          <tr><th>締切</th><td>{event.deadline}</td></tr>
          <tr><th>場所</th><td>{event.location}</td></tr>
          <tr><th>内容</th><td>{event.content}</td></tr>
          <tr><th>説明</th><td>{event.description}</td></tr>
        </tbody>
      </table>
      {event.image && (
        <div>
          <img src={event.image} alt="イベント画像" style={{ maxWidth: "100%" }} />
        </div>
      )}
      <button onClick={() => router.back()}>戻る</button>
      <button
        style={{ marginLeft: '1rem', background: '#1976d2', color: 'white', padding: '0.5rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={() => router.push(`/event/confirm?event_id=${event_id}`)}
      >参加</button>
    </div>
  )
}
