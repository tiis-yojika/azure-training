import { useRouter } from 'next/router'

export default function EventConfirmed() {
  const router = useRouter()
  const { event_id, status } = router.query

  let message = ""
  if (status === "success") {
    message = "参加申し込み確定しました"
  } else if (status === "fail") {
    message = "参加申し込み失敗しました"
  }

  const handleBackToDetail = () => {
    router.push(`/event`)
  }

  return (
    <div>
      <h1>{message}</h1>
      <button onClick={handleBackToDetail}>イベント一覧へ戻る</button>
    </div>
  )
}