import { useEffect, useState } from "react";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://0x0-favorites-list.azurewebsites.net/api/favorites?code=zzyPmL0sN_rUEbSrao2nHRMb4xME2aDHTidr9DtDXsjRAzFu7br4HA%3D%3D")
      .then(res => res.json())
      .then(data => {
        setFavorites(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleBack = () => {
    window.location.href = "/mypage";
  };

  // お気に入り解除処理
  const handleRemoveFavorite = async (event_id) => {
    // カスタムデザインのポップアップ
    const confirmed = await new Promise((resolve) => {
      // ポップアップ用の要素を作成
      const popup = document.createElement("div");
      popup.style.position = "fixed";
      popup.style.left = 0;
      popup.style.top = 0;
      popup.style.width = "100vw";
      popup.style.height = "100vh";
      popup.style.background = "rgba(0,0,0,0.25)";
      popup.style.zIndex = 9999;
      popup.style.display = "flex";
      popup.style.alignItems = "center";
      popup.style.justifyContent = "center";

      popup.innerHTML = `
        <div style="
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 24px #0002;
          padding: 32px 36px 24px 36px;
          min-width: 320px;
          text-align: center;
          font-size: 1.08rem;
        ">
          <div style="color:#222; margin-bottom: 24px;">
            このイベントをお気に入りから解除しますか？
          </div>
          <button id="popup-ok" style="
            background: #ff6666;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 8px 32px;
            font-weight: 700;
            font-size: 1rem;
            margin-right: 16px;
            cursor: pointer;
          ">解除</button>
          <button id="popup-cancel" style="
            background: #e0e0e0;
            color: #333;
            border: none;
            border-radius: 6px;
            padding: 8px 32px;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
          ">キャンセル</button>
        </div>
      `;

      document.body.appendChild(popup);

      popup.querySelector("#popup-ok").onclick = () => {
        document.body.removeChild(popup);
        resolve(true);
      };
      popup.querySelector("#popup-cancel").onclick = () => {
        document.body.removeChild(popup);
        resolve(false);
      };
    });

    if (!confirmed) return;

    const res = await fetch(
      `https://0x0-favorites-list.azurewebsites.net/api/favorites/${event_id}?code=RWHWy8MdJ3Eep-1GcX-eQgsHVLIc6rB5CZ2OX2O4bNmuAzFuJr3suA%3D%3D`,
      {
        method: "DELETE",
      }
    );
    if (res.ok) {
      setFavorites(favorites.filter(item => item.event_id !== event_id));
    } else {
      alert("解除に失敗しました");
    }
  };

  // 詳細画面への遷移（例: reservation-detail 画面へ）
  const handleDetail = (item) => {
    // 必要なクエリ情報を渡す
    const params = new URLSearchParams({
      event_id: item.event_id,
      event_title: item.event_title ?? "",
      event_datetime: item.event_datetime ?? "",
      location: item.location ?? "",
      description: item.description ?? "",
      content: item.content ?? ""
    }).toString();
    window.location.href = `/reservation-detail?${params}`;
  };

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px #0001", padding: 36, position: "relative" }}>
      <h2 style={{ textAlign: "center", color: "#00c2a0", fontWeight: 700, marginBottom: 32 }}>お気に入りイベント一覧</h2>
      {loading ? (
        <div style={{ textAlign: "center", color: "#00c2a0" }}>読み込み中...</div>
      ) : favorites.length === 0 ? (
        <div style={{ textAlign: "center", color: "#888" }}>お気に入りはありません。</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>イベント名</th>
              <th style={thStyle}>日時</th>
              <th style={thStyle}>場所</th>
              <th style={thStyle}>説明</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                <td style={tdStyle}>{item.event_title}</td>
                <td style={tdStyle}>{item.event_datetime ? new Date(item.event_datetime).toLocaleString() : ""}</td>
                <td style={tdStyle}>{item.location}</td>
                <td style={tdStyle}>{item.description}</td>
                <td style={tdStyle}>
                  <button
                    style={{
                      background: "#ff6666",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 0",
                      fontWeight: 600,
                      cursor: "pointer",
                      marginRight: 8,
                      fontSize: "0.97rem",
                      minWidth: 120, // 幅を詳細ボタンと揃える
                      boxSizing: "border-box",
                      display: "inline-block",
                    }}
                    onClick={() => handleRemoveFavorite(item.event_id)}
                  >
                    お気に入り解除
                  </button>
                  <button
                    style={{
                      background: "#00c2a0",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 0",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.97rem",
                      minWidth: 120, // 幅をお気に入り解除ボタンと揃える
                      boxSizing: "border-box",
                      display: "inline-block",
                    }}
                    onClick={() => handleDetail(item)}
                  >
                    詳細
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button
        style={{
          position: "fixed",
          right: 40,
          bottom: 40,
          padding: "12px 32px",
          background: "#00c2a0",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: 700,
          cursor: "pointer",
          fontSize: "1.08rem",
          boxShadow: "0 2px 8px #0002",
          zIndex: 1000,
        }}
        onClick={handleBack}
      >
        戻る
      </button>
    </div>
  );
}

const thStyle = {
  padding: "12px 8px",
  fontWeight: 700,
  fontSize: "1rem",
  borderBottom: "2px solid #e0e0e0",
  textAlign: "center",
  color: "#222"
};

const tdStyle = {
  padding: "10px 8px",
  textAlign: "center",
  fontSize: "0.98rem",
  color: "#222"
};