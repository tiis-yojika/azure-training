import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("https://0x0-login.azurewebsites.net/api/login?code=9L4lUJuBIQvolKJrqK4EUFKUpvZFevZKRN8DLkhkr-5qAzFucYp7_Q%3D%3D", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("id", data.id); // ← idを保存
        router.push("/mypage");
      } else {
        setError("ログイン失敗");
      }
    } catch (err) {
      setError("通信エラー");
    }
  }

  function handleUsernameChange(e) {
    setUsername(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>ユーザー名</label>
        <input value={username} onChange={handleUsernameChange} />
      </div>
      <div>
        <label>パスワード</label>
        <input type="password" value={password} onChange={handlePasswordChange} />
      </div>
      <button type="submit">ログイン</button>
      {error && <div style={{color:"red"}}>{error}</div>}
    </form>
  );
}