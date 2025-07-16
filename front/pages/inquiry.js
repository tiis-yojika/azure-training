import { useState, useEffect } from "react";
import { useRouter } from "next/router";

async function fetchEventInfo(event_id) {
  try {
    console.log('Fetching event info for ID:', event_id);
    
    // Next.jsのAPIルートを使用（推奨）
    const res = await fetch(`/api/eventinfo?event_id=${event_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      let errorDetail = '';
      try {
        const err = await res.json();
        errorDetail = err.error ? `: ${err.error}` : '';
        if (err.details) errorDetail += `\n${err.details}`;
      } catch {
        errorDetail = '';
      }
      const msg = `HTTP error! status: ${res.status}${errorDetail}`;
      console.error(msg);
      throw new Error(msg);
    }
    const data = await res.json();
    console.log('Event data received:', data);
    return data;
    
  } catch (error) {
    console.error('fetchEventInfo error:', error);
    return null;
  }
}

async function sendInquiry(event_id, subject, message, sender_id, recipient_id, reply_to_inquiry_id) {
  try {
    console.log('Sending inquiry...');
    const res = await fetch('/api/inquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id,
        subject,
        message,
        sender_id,
        recipient_id,
        reply_to_inquiry_id
      })
    });
    console.log('Inquiry response status:', res.status);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const text = await res.text();
    console.log('Inquiry response:', text);
    return text;
  } catch (error) {
    console.error('sendInquiry error:', error);
    throw error;
  }
}

export default function InquiryPage() {
  const router = useRouter();
  // URLクエリパラメータからeventIdを取得
  const eventId = router.query.event_id || "2";
  const userId = "0606"; // 仮の送信者ID
  const [recipientId, setRecipientId] = useState(""); // 受信者ID
  const replyToInquiryId = null; // 返信先があればセット

  const [eventTitle, setEventTitle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // routerが準備できてからAPI呼び出し
    if (!router.isReady) return;
    
    const loadEventInfo = async () => {
      setLoading(true);
      try {
        const data = await fetchEventInfo(eventId);
        if (data) {
          setEventTitle(data.event_title || "");
          setCreatorName(data.creator_name || "");
          // 受信者ID（イベント作成者ID）をセット
          if (data.creator_id) setRecipientId(data.creator_id);
        }
      } catch (error) {
        console.error('Error loading event info:', error);
        setError(error.message || "イベント情報の取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };
    loadEventInfo();
  }, [router.isReady, eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      setError("件名と本文は必須です。");
      return;
    }
    
    setError("");
    setSubmitting(true);
    
    try {
      const res = await sendInquiry(eventId, subject.trim(), message.trim(), userId, recipientId, replyToInquiryId);
      
      let result;
      try {
        result = JSON.parse(res);
      } catch {
        setError("サーバーから不正なレスポンスが返されました。");
        return;
      }
      
      if (result.error) {
        setError(result.error);
        return;
      }
      // 成功時は送信完了ページに遷移
      router.push("/m-success");
      
    } catch (error) {
      console.error('Submit error:', error);
      setError("送信中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/detail");
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h1>お問い合わせページ</h1>
      <div style={{ marginBottom: 16 }}>
        <div>イベント名: <b>{eventTitle || "取得中..."}</b></div>
        <div>主催者: <b>{creatorName || "取得中..."}</b></div>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>件名: <br />
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              style={{ width: "100%" }}
              maxLength={200}
              required
              disabled={submitting}
            />
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>本文: <br />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ width: "100%", height: 100 }}
              maxLength={2000}
              required
              disabled={submitting}
            />
          </label>
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <button 
          type="submit" 
          style={{ marginRight: 8 }} 
          disabled={submitting}
        >
          {submitting ? "送信中..." : "送信"}
        </button>
        <button 
          type="button" 
          onClick={handleBack}
          disabled={submitting}
        >
          戻る
        </button>
      </form>
    </div>
  );
}