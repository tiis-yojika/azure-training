export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const event_id = req.query.event_id;
    try {
      // Azure Functions のエンドポイントにDELETEリクエストを転送
      const response = await fetch(
        `http://localhost:7071/api/favorites/${event_id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        res.status(200).json({ message: "削除成功" });
      } else {
        res.status(500).json({ message: "削除失敗" });
      }
    } catch (e) {
      res.status(500).json({ message: "サーバーエラー" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}