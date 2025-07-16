import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function EventEditConfirm() {
    const router = useRouter();
    const [formValues, setFormValues] = useState(null);
    const [categoryName, setCategoryName] = useState("");
    const [keywordNames, setKeywordNames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!router.isReady) return;
        // 編集内容はクエリ or localStorageから取得
        const {
            event_id = "",
            title = "",
            date = "",
            location = "",
            category = "",
            keywords: rawKeywords = [],
            summary = "",
            detail = "",
            deadline = "",
            max_participants = ""
        } = router.query;
        const keywords = typeof rawKeywords === "string" ? rawKeywords.split(",") : rawKeywords;
        setFormValues({ event_id, title, date, location, category, keywords, summary, detail, deadline, max_participants });
        // カテゴリ・キーワード名取得
        try {
            const categoriesMaster = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("categories") || "[]") : [];
            const keywordsMaster = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("keywords") || "[]") : [];
            const foundCategory = categoriesMaster.find(c => String(c.value) === String(category));
            if (foundCategory) setCategoryName(foundCategory.label);
            setKeywordNames(keywords.map(k => {
                const found = keywordsMaster.find(kw => String(kw.value) === String(k));
                return found ? found.label : k;
            }));
        } catch { }
    }, [router.isReady, router.query]);

    if (!formValues) {
        return <div>読み込み中...</div>;
    }

    const handleConfirm = async () => {
        setLoading(true);
        setError("");
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7071";
        const isLocal = API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1");
        const API_EVENTS_PATH = isLocal ? "/api/events" : "/events";
        const formData = new FormData();
        formData.append("title", formValues.title);
        formData.append("date", formValues.date);
        formData.append("location", formValues.location);
        formData.append("category", formValues.category);
        formData.append("summary", formValues.summary);
        formData.append("detail", formValues.detail);
        formData.append("deadline", formValues.deadline);
        formData.append("max_participants", formValues.max_participants);
        (formValues.keywords || []).forEach(k => formData.append("keywords", k));
        try {
            const res = await fetch(`${API_BASE_URL}${API_EVENTS_PATH}/${formValues.event_id}`, {
                method: "PUT",
                body: formData
            });
            if (res.ok) {
                router.push("/event-edit-done");
            } else {
                let err;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    err = await res.json();
                } else {
                    err = { error: await res.text() };
                }
                setError("更新失敗: " + (err.error || res.status) + (err.trace ? "\n" + err.trace : ""));
            }
        } catch (err) {
            setError("通信エラー: " + err);
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
            <h1>イベント編集内容確認</h1>
            <div style={{ margin: "1rem 0", fontWeight: "bold", color: "#1976d2" }}>この内容でイベントを更新します。よろしいですか？</div>
            <div className="row"><b>タイトル:</b> {formValues.title}</div>
            <div className="row"><b>日付:</b> {formValues.date}</div>
            <div className="row"><b>場所:</b> {formValues.location}</div>
            <div className="row"><b>カテゴリ:</b> {categoryName || ""}</div>
            <div className="row"><b>キーワード:</b> {Array.isArray(keywordNames) ? keywordNames.join(", ") : (keywordNames || "")}</div>
            <div className="row"><b>概要:</b> {formValues.summary}</div>
            <div className="row"><b>詳細:</b> {formValues.detail}</div>
            <div className="row"><b>最大人数:</b> {formValues.max_participants}</div>
            <div className="row"><b>締切日:</b> {formValues.deadline}</div>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button onClick={handleConfirm} disabled={loading} style={{ background: "#1976d2", color: "#fff", marginTop: 16 }}>
                {loading ? "更新中..." : "この内容で更新"}
            </button>
            <button
                type="button"
                style={{ marginLeft: 8 }}
                onClick={() => router.back()}
            >戻る</button>
        </div>
    );
}
