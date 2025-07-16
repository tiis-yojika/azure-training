export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { event_id } = req.body;
  console.log("event_id:", event_id); // デバッグ用
  try {
    const response = await fetch(
      "https://0x0-event-registration-history-cxhcdpauc4b5a9e7.japaneast-01.azurewebsites.net/api/cancel-reservation?code=Y4yCbZ2DqMl32AOs12cfmukhFFujjsAsxZwSni-gqKD0AzFupm2arA%3D%3D",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id })
      }
    );
    if (response.ok) {
      res.status(200).end();
    } else {
      const text = await response.text();
      console.error("Azure error:", text);
      res.status(500).json({ error: "Azure error", detail: text });
    }
  } catch (e) {
    console.error("fetch failed:", e);
    res.status(500).json({ error: "fetch failed", detail: e.message });
  }
}