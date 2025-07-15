import { useRouter } from "next/router";
import { useState, useEffect } from "react";

function EventCreateConfirm() {
    const router = useRouter();
    const [formValues, setFormValues] = useState(null);
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState(null);
    const [categoryName, setCategoryName] = useState("");
    const [keywordNames, setKeywordNames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!router.isReady) return;
        // router.queryから値取得
        const {
            title = "",
            date = "",
            location = "",
            category = "",
            keywords: rawKeywords = [],
            summary = "",
            detail = "",
            deadline = "",
            max_participants = "",
            is_draft = 0
        } = router.query;
        const keywords = typeof rawKeywords === "string" ? rawKeywords.split(",") : rawKeywords;
        setFormValues({ title, date, location, category, keywords, summary, detail, deadline, max_participants, is_draft });

        // 画像
        try {
            const imageData = typeof window !== "undefined" ? localStorage.getItem("eventCreateImage") : null;
            const imageNameData = typeof window !== "undefined" ? localStorage.getItem("eventCreateImageName") : null;
            if (imageData) {
                const arr = imageData.split(",");
                if (arr[0].includes("base64")) {
                    const mime = arr[0].match(/:(.*?);/)[1];
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    setImage(new Blob([u8arr], { type: mime }));
                    setImageName(imageNameData || "upload.png");
                }
            }
        } catch { }
        // カテゴリ・キーワード
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

    const isDraft = String(formValues.is_draft) === "1";
    const confirmText = isDraft
        ? "この内容で下書き保存します。よろしいですか？"
        : "この内容でイベントを登録します。よろしいですか？";
    const buttonText = isDraft ? "下書き保存を確定" : "イベント登録を確定";

    // 確定ボタンでAPI POST
    const handleConfirm = async () => {
        setLoading(true);
        setError("");
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
        if (image) formData.append("image", image, imageName);
        formData.append("is_draft", isDraft ? 1 : 0);
        // creatorは省略（API側で処理）
        try {
            const res = await fetch(`https://0x0-event-management.azurewebsites.net/api/events?code=K5myTaihTLRS_ET12lo8kreI7HEeKqkyDYYIEMgaxXTDAzFu7tLFng%3D%3D`, {
                method: "POST",
                body: formData
            });
            if (res.ok) {
                router.push(`/event-create-done?is_draft=${isDraft ? 1 : 0}`);
            } else {
                let err;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    err = await res.json();
                } else {
                    err = { error: await res.text() };
                }
                setError("登録失敗: " + (err.error || res.status) + (err.trace ? "\n" + err.trace : ""));
            }

        } catch (err) {
            setError("通信エラー: " + err);
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
            <h1>イベント作成{isDraft ? "（下書き保存）" : "（本登録）"}確認</h1>
            <div style={{ margin: "1rem 0", fontWeight: "bold", color: "#1976d2" }}>{confirmText}</div>
            <div className="row"><b>タイトル:</b> {formValues.title}</div>
            <div className="row"><b>日付:</b> {formValues.date}</div>
            <div className="row"><b>場所:</b> {formValues.location}</div>
            <div className="row"><b>カテゴリ:</b> {categoryName || ""}</div>
            <div className="row"><b>キーワード:</b> {Array.isArray(keywordNames) ? keywordNames.join(", ") : (keywordNames || "")}</div>
            <div className="row"><b>概要:</b> {formValues.summary}</div>
            <div className="row"><b>詳細:</b> {formValues.detail}</div>
            <div className="row"><b>最大人数:</b> {formValues.max_participants}</div>
            <div className="row"><b>締切日:</b> {formValues.deadline}</div>
            <div className="row"><b>画像:</b> {
                image instanceof Blob ? (
                    <img
                        src={URL.createObjectURL(image)}
                        alt={imageName || "画像"}
                        style={{ maxWidth: "200px", maxHeight: "200px", border: "1px solid #ccc", marginTop: "8px" }}
                    />
                ) : (
                    "未設定"
                )
            }</div>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button onClick={handleConfirm} disabled={loading} style={{ background: "#1976d2", color: "#fff", marginTop: 16 }}>
                {loading ? "登録中..." : buttonText}
            </button>
            <button
                type="button"
                style={{ marginLeft: 8 }}
                onClick={() => {
                    // 入力内容をlocalStorageに保存
                    const saveData = {
                        title: formValues.title,
                        date: formValues.date,
                        location: formValues.location,
                        category: formValues.category,
                        keywords: formValues.keywords,
                        summary: formValues.summary,
                        detail: formValues.detail,
                        deadline: formValues.deadline,
                        max_participants: formValues.max_participants
                    };
                    localStorage.setItem("eventCreateDraft", JSON.stringify(saveData));
                    router.back();
                }}
            >戻る</button>
        </div>
    );
}

export default EventCreateConfirm;
