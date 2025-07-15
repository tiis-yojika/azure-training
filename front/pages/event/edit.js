import { useState, useEffect } from "react";
import EventForm from "../../components/EventForm";
import { useRouter } from "next/router";

// イベント編集ページ
export default function EventEdit() {
    const router = useRouter();
    const [form, setForm] = useState({
        event_id: "",
        title: "",
        date: "",
        location: "",
        category: "",
        keywords: [],
        summary: "",
        detail: "",
        deadline: "",
        image: null,
        max_participants: ""
    });
    const [errors, setErrors] = useState({});
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // カテゴリ・キーワード取得
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [keywordOptions, setKeywordOptions] = useState([]);
    useEffect(() => {
        fetch(`https://0x0-event-management.azurewebsites.net/api/get_categories_keywords/categories?code=fAanZK6Io30u2CZlxXnipF3G88zykyIaL6TZkIjz3IW7AzFuGesvgA%3D%3D`)
            .then(res => res.json())
            .then(json => setCategoryOptions(json.map(c => ({ value: String(c.category_id), label: c.category_name }))));
        fetch(`https://0x0-event-management.azurewebsites.net/api/get_categories_keywords/keywords?code=fAanZK6Io30u2CZlxXnipF3G88zykyIaL6TZkIjz3IW7AzFuGesvgA%3D%3D`)
            .then(res => res.json())
            .then(json => setKeywordOptions(json.map(k => ({ value: String(k.keyword_id), label: k.keyword_name }))));
    }, []);

    // イベント詳細取得（event_idはクエリやpropsで渡す想定）
    useEffect(() => {
        // バグ修正: クエリからevent_idを取得
        const eventId = router.query.event_id || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("event_id") : "");
        if (!eventId) return;
        setLoading(true);
        fetch(`https://0x0-event-management.azurewebsites.net/api/events/${eventId}?code=B6FHqDqDwJVTfMUFAC6ZptbH_KME7rndWP2yayBkPrHcAzFuKEsPFw%3D%3D`)
            .then(async res => {
                if (!res.ok) {
                    // 404や500の場合
                    const contentType = res.headers.get("content-type");
                    let err;
                    if (contentType && contentType.includes("application/json")) {
                        err = await res.json();
                    } else {
                        err = { error: await res.text() };
                    }
                    setErrors({ fetch: err.error || `取得失敗: ${res.status}` });
                    setForm(prev => ({ ...prev, event_id: eventId }));
                    setPreview(null);
                    return null;
                }
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    try {
                        if (res.headers.get('content-length') === '0') {
                            setErrors({ fetch: "データが空です" });
                            return null;
                        }
                        return await res.json();
                    } catch {
                        setErrors({ fetch: "データ取得時にJSON解析エラー" });
                        return null;
                    }
                } else {
                    setErrors({ fetch: "データ取得時に不正なレスポンス" });
                    return null;
                }
            })
            .then(data => {
                if (!data) return;
                setForm({
                    event_id: data.event_id,
                    title: data.event_title,
                    date: data.event_datetime,
                    location: data.location,
                    category: String(data.event_category),
                    keywords: data.keywords ? data.keywords.map(String) : [],
                    summary: data.description,
                    detail: data.content,
                    deadline: data.deadline,
                    image: null,
                    max_participants: data.max_participants ? String(data.max_participants) : ""
                });
                setPreview(data.image ? `/images/${data.image}` : null);
            })
            .finally(() => setLoading(false));
    }, [router.query.id]);

    // 入力変更
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (name === "keywords") {
            setForm((prev) => {
                const newKeywords = checked
                    ? [...prev.keywords, value]
                    : prev.keywords.filter((k) => k !== value);
                return { ...prev, keywords: newKeywords };
            });
        } else if (name === "image") {
            const file = files[0];
            setForm((prev) => ({ ...prev, image: file }));
            if (file) {
                setPreview(URL.createObjectURL(file));
            } else {
                setPreview(null);
            }
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    // バリデーション（省略可）
    const validate = (data) => {
        const newErrors = {};
        if (!data.title || data.title.length > 255) newErrors.title = "255文字以内で入力してください";
        if (!data.location || data.location.length > 255) newErrors.location = "255文字以内で入力してください";
        if (!data.summary || data.summary.length > 200) newErrors.summary = "200文字以内で入力してください";
        if (!data.detail || data.detail.length > 200) newErrors.detail = "200文字以内で入力してください";
        if (!data.category || !categoryOptions.some(c => c.value === data.category)) newErrors.category = "カテゴリを選択してください";
        if (!data.keywords.length) newErrors.keywords = "1つ以上選択してください";
        return newErrors;
    };

    // 編集内容確認ページへ遷移
    const handleConfirmPage = (e) => {
        e.preventDefault();
        const v = validate(form);
        setErrors(v);
        if (Object.keys(v).length > 0) return;
        // クエリパラメータで編集内容を渡して遷移
        const params = new URLSearchParams({
            event_id: form.event_id,
            title: form.title,
            date: form.date,
            location: form.location,
            category: form.category,
            keywords: form.keywords.join(","),
            summary: form.summary,
            detail: form.detail,
            deadline: form.deadline,
            max_participants: form.max_participants
        }).toString();
        router.push(`/event-edit-confirm?${params}`);
    };

    // isFormComplete判定
    const isFormComplete = () => {
        return (
            form.title &&
            form.date &&
            form.location &&
            form.category &&
            form.keywords.length > 0 &&
            form.summary &&
            form.detail &&
            form.deadline
        );
    };

    // 削除確認ページへ遷移
    const handleDeleteConfirmPage = () => {
        router.push(`/event-delete-confirm?id=${form.event_id}`);
    };

    // 下書き保存（編集画面では非表示）
    const handleDraft = () => { };

    return (
        <EventForm
            form={form}
            errors={errors}
            preview={preview}
            eventData={form}
            categoryOptions={categoryOptions}
            keywordOptions={keywordOptions}
            isEdit={true}
            onChange={handleChange}
            onSubmit={handleConfirmPage}
            onDraft={handleDraft}
            onDelete={handleDeleteConfirmPage}
            isFormComplete={isFormComplete}
            submitLabel={"確認"}
            draftLabel={"下書き保存"}
            deleteLabel={"イベント取り消し"}
        />
    );
}
