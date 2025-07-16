import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../../utils/getValidId";

export default function MyPage() {
  const [lName, setLName] = useState("");
  const [profileImg, setProfileImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      setError("クライアントでのみ利用可能です");
      setLoading(false);
      return;
    }

    const id = getValidId();
    if (!id) {
      router.push("/login");
      return;
    }

    fetch("https://0x0-usermanagement-test.azurewebsites.net/api/get_user?code=WWA9EuuKLWhCNVqQ70YYMs0kKDJq8oAMgyZbzsahrfg0AzFuZuhknw%3D%3D", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(res => {
        if (!res.ok) throw new Error("取得失敗");
        return res.json();
      })
      .then(data => {
        setLName(data.l_name ?? "");
        setProfileImg(data.profile_img ?? null);
        setLoading(false);
      })
      .catch(() => {
        setError("データ取得エラー");
        setLoading(false);
      });
  }, [router]);

  // ログアウト処理
  function handleLogout() {
    localStorage.removeItem("id");
    localStorage.removeItem("id_expire");
    router.push("/");
  }

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{color:"red"}}>{error}</div>;
  console.log("Profile Image:", profileImg);

  return (
    <div>
      {profileImg && (
        <div style={{ marginBottom: 16 }}>
          <img
            src={profileImg}
            alt="プロフィール画像"
            style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%" }}
          />
        </div>
      )}
      {lName}さんのページ
      <br />
      <button onClick={handleLogout}>ログアウト</button>
      <button
        style={{ marginLeft: 12, padding: "8px 16px", background: "#00c2a0", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 }}
        onClick={() => router.push("/mypage/setting")}
      >
        設定へ
      </button>
    </div>
  );
}