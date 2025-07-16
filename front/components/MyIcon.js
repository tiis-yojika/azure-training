import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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

export default function MyIcon({ size = 40 }) {
  const [profileImg, setProfileImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const id = getValidId();
    if (!id) return;

    // Azure Functions からプロフィール画像URLを取得
    fetch("https://0x0-mypage.azurewebsites.net/api/mypage?code=rzWYX4Wg009BE4aqcvISI2-bYJ3FDJleE8xzJD7ogYF2AzFuf0Xu9A%3D%3D", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(res => {
        if (!res.ok) throw new Error("取得失敗");
        return res.json();
      })
      .then(data => {
        setProfileImg(data.profile_img ?? null);
        setLoading(false);
      })
      .catch(() => {
        setError("データ取得エラー");
        setLoading(false);
      });
  }, [router]);

  const handleClick = () => {
    router.push("/mypage/setting");
  };

  return (
    <img
      src={profileImg}
      alt="プロフィール画像"
      onClick={handleClick}
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        zIndex: 1100,
      }}
    />
  );
}