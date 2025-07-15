import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function EventDetail() {
  const router = useRouter()
  const { event_id } = router.query
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!event_id) return
    setLoading(true)
    fetch(`/api/event/detail?event_id=${event_id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setEvent(data)
        setLoading(false)
      })
      .catch(err => {
        setError('データ取得エラー')
        setLoading(false)
      })
  }, [event_id])

  if (loading) return <div>読み込み中...</div>
  if (error) return <div>エラー: {error}</div>
  if (!event) return null

  return (
    <div>
      <h1>{event.event_title}</h1>
      <img src={event.image} alt={event.event_title} style={{maxWidth: 400}} />
      <p>カテゴリ: {event.event_category}</p>
      <p>日時: {event.event_datetime}</p>
      <p>締切: {event.deadline}</p>
      <p>場所: {event.location}</p>
      <p>最大人数: {event.max_participants}</p>
      <p>現在人数: {event.current_participants}</p>
      <p>作成者: {event.creator}</p>
      <p>概要: {event.description}</p>
      <p>内容: {event.content}</p>
    </div>
  )
}
