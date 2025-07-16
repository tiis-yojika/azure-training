import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getValidId } from "../../utils/getValidId";

const API_URL_GET_EVENT_DETAIL = process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL;
const API_URL_PARTICIPATE = process.env.NEXT_PUBLIC_API_URL_PARTICIPATE;

export default function EventConfirm() {
  const router = useRouter()
  const { event_id } = router.query
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!event_id) return
    setLoading(true)
    fetch(`${API_URL_GET_EVENT_DETAIL}&event_id=${event_id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setEvent(data)
        setLoading(false)
      })
      .catch(() => {
        setError('データ取得エラー')
        setLoading(false)
      })
  }, [event_id])

  const handleJoin = async () => {
    setJoining(true)
    const userId = getValidId();
    const res = await fetch(API_URL_PARTICIPATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: event_id, id: userId })
    })
    let data = {}
    try {
      // レスポンスが空の場合はエラーを投げる
      const text = await res.text()
      if (!text) throw new Error("空のレスポンス")
      data = JSON.parse(text)
    } catch (e) {
      setJoining(false)
      router.push(`/event/confirmed?event_id=${event_id}&status=fail`)
      return
    }
    if (res.ok && data.result === "ok") {
      router.push(`/event/confirmed?event_id=${event_id}&status=success`)
    } else {
      router.push(`/event/confirmed?event_id=${event_id}&status=fail`)
    }
    setJoining(false)
  }

  if (loading) return <div>読み込み中...</div>
  if (error) return <div>エラー: {error}</div>
  if (!event) return null

  return (
    <div>
      <h1>イベント参加確認</h1>
      <p>「{event.event_title}」に参加しますか？</p>
      <button onClick={handleJoin} disabled={joining || !event_id}>確定</button>
      <button onClick={() => router.back()}>戻る</button>
    </div>
  )
}