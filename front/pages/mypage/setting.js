import { useState, useEffect } from "react";
import { useRouter } from "next/router";

function getValidId() {
  const id = localStorage.getItem("id");
  const expire = localStorage.getItem("id_expire");
  if (!id || !expire || Date.now() > Number(expire)) {
    localStorage.removeItem("id");
    localStorage.removeItem("id_expire");
    return null;
  }
  return id;
}

export default function Setting() {
  const [lName, setLName] = useState("");
  const [profileImg, setProfileImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const id = getValidId();
    if (!id) {
      router.push("/login");
      return;
    }
    
    fetch("https://0x0-login.azurewebsites.net/api/mypage?code=EzjjwAEIjnxywfEksi9uz-ixU-8Qet_ZjJCegzf8abomAzFu6xZbzw%3D%3D", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(res => res.json())
      .then(data => {
        setLName(data.l_name ?? "");
        setProfileImg(data.profile_img ?? null);
        setPreview(data.profile_img ?? null); // 画像URLをプレビューにセット
        setLoading(false);
      })
      .catch(() => {
        setError("ユーザ情報取得エラー");
        setLoading(false);
      });
  }, []);

  // プロフィール画像プレビュー
  function handleImgChange(e) {
    const file = e.target.files[0];
    setProfileImg(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  // ユーザ情報更新
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const id = localStorage.getItem("id");
    if (!id) {
      setError("ログイン情報がありません");
      return;
    }

    let imgUrl = preview; // 既存画像URLを初期値に
    if (profileImg && profileImg instanceof File) {
      // 画像アップロードAPI呼び出し例
      const formData = new FormData();
      formData.append("id", id);
      formData.append("profile_img", profileImg);
      const res = await fetch("https://0x0-mypage.azurewebsites.net/api/upload_profile_img?code=cviITIhg8eHig53MaBOTRv7-nw8B9V9H6eMhYD-ho46VAzFu8QllRw%3D%3D", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        setError("画像アップロード失敗");
        return;
      }
      const data = await res.json();
      imgUrl = data.url;
    }

    // ユーザ情報更新API呼び出し例
    const res = await fetch("https://0x0-mypage.azurewebsites.net/api/update_user?code=zLvDKpdGpctGkH6ysOU4978S5vx31ofMN6fNwxo7vJ0UAzFuN8Sz_Q%3D%3D", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, l_name: lName, profile_img: imgUrl }),
    });
    if (res.ok) {
      setSuccess("更新しました");
      if (imgUrl) setPreview(imgUrl);
    } else {
      const errText = await res.text();
      setError("更新に失敗しました: " + errText);
    }
  }

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px #0001", padding: 36 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>ユーザ情報設定</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>表示名</label>
          <input
            type="text"
            value={lName}
            onChange={e => setLName(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>プロフィール画像</label>
          <input type="file" accept="image/*" onChange={handleImgChange} />
          {preview && (
            <div style={{ marginTop: 8 }}>
              <img src={preview} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%" }} />
            </div>
          )}
        </div>
        <button type="submit" style={{ width: "100%", padding: 10, background: "#00c2a0", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 }}>
          保存
        </button>
        {success && <div style={{ color: "green", marginTop: 12 }}>{success}</div>}
        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      </form>
      <button
        type="button"
        style={{ width: "100%", marginTop: 16, padding: 10, background: "#eee", color: "#333", border: "none", borderRadius: 6 }}
        onClick={() => router.push("/mypage")}
      >
        マイページに戻る
      </button>
    </div>
  );
}