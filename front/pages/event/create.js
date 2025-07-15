import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import EventForm from "../../components/EventForm";

// カテゴリ・キーワードをlocalStorageでキャッシュするカスタムフック
function useCachedFetch(key, url, mapFn) {
    const [data, setData] = useState([]);
    useEffect(() => {
        // キャッシュクリアしてAPIから再取得
        if (key === "categories" || key === "keywords") {
            localStorage.removeItem(key);
        }
        fetch(url)
            .then(res => res.json())
            .then(json => {
                const mapped = mapFn ? json.map(mapFn) : json;
                setData(mapped);
                if (key === "categories" || key === "keywords") {
                    localStorage.setItem(key, JSON.stringify(mapped));
                }
            });
    }, [key, url]); // mapFnは依存配列から除外
    return data;
}


export default function EventCreate() {
    const router = useRouter();
    // event_idをクエリから取得
    const eventId = router.query.event_id;
    const isEdit = !!eventId;
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState({
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
    const [eventData, setEventData] = useState(null);
    useEffect(() => {
        if (isEdit && eventId) {
           
            fetch(`https://0x0-event-management.azurewebsites.net/api/events?code=K5myTaihTLRS_ET12lo8kreI7HEeKqkyDYYIEMgaxXTDAzFu7tLFng%3D%3D/${eventId}`)
                .then(res => res.json())
                .then(data => {
                    setEventData(data);
                    setForm({
                        title: data.title || "",
                        date: data.date || "",
                        location: data.location || "",
                        category: data.category || "",
                        keywords: data.keywords || [],
                        summary: data.summary || "",
                        detail: data.detail || "",
                        deadline: data.deadline || "",
                        image: null,
                        max_participants: data.max_participants || ""
                    });
                    setPreview(null);
                });
        }
    }, [isEdit, eventId]);
    const [errors, setErrors] = useState({});

    // カテゴリ・キーワードをlocalStorageでキャッシュ
    // APIベースURLを環境変数から取得（なければlocalhost）
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7071";
    // APIパスをローカル（localhost/127.0.0.1）は/api/、本番は直下で切り替え
    const isLocal = API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1");
    const API_EVENTS_PATH = isLocal ? "/api/events" : "/events";
    const API_CATEGORIES_PATH = isLocal ? "/api/get_categories_keywords/categories" : "/get_categories_keywords/categories";
    const API_KEYWORDS_PATH = isLocal ? "/api/get_categories_keywords/keywords" : "/get_categories_keywords/keywords";

    const categoryOptions = useCachedFetch(
        "categories",
        `https://0x0-event-management.azurewebsites.net/api/get_categories_keywords/categories?code=fAanZK6Io30u2CZlxXnipF3G88zykyIaL6TZkIjz3IW7AzFuGesvgA%3D%3D`,
        c => ({ value: String(c.category_id), label: c.category_name })
    );
    const keywordOptions = useCachedFetch(
        "keywords",
        `https://0x0-event-management.azurewebsites.net/api/get_categories_keywords/keywords?code=fAanZK6Io30u2CZlxXnipF3G88zykyIaL6TZkIjz3IW7AzFuGesvgA%3D%3D`,
        k => ({ value: String(k.keyword_id), label: k.keyword_name })
    );

    // バリデーション
    const validate = (data) => {
        const newErrors = {};
        const now = new Date();
        const eventDate = data.date ? new Date(data.date) : null;
        const deadlineDate = data.deadline ? new Date(data.deadline) : null;
        if (!data.title || data.title.length > 255) newErrors.title = "255文字以内で入力してください";
        if (!data.location || data.location.length > 255) newErrors.location = "255文字以内で入力してください";
        if (!data.summary || data.summary.length > 200) newErrors.summary = "200文字以内で入力してください";
        if (!data.detail || data.detail.length > 200) newErrors.detail = "200文字以内で入力してください";
        if (!data.category || !categoryOptions.some(c => c.value === data.category)) newErrors.category = "カテゴリを選択してください";
        if (!data.keywords.length) newErrors.keywords = "1つ以上選択してください";
        if (
            data.max_participants &&
            (
                !/^[0-9]+$/.test(data.max_participants) ||
                parseInt(data.max_participants) < 1 ||
                parseInt(data.max_participants) > 1000
            )
        ) {
            newErrors.max_participants = "1以上1000以下の整数で入力してください";
        }
        if (!data.date) {
            newErrors.date = "日付を入力してください";
        } else if (eventDate <= now) {
            newErrors.date = "日付は現在日時より後を指定してください";
        }
        if (!data.deadline) {
            newErrors.deadline = "締切日を入力してください";
        } else if (deadlineDate <= now) {
            newErrors.deadline = "締切日は現在日時より後を指定してください";
        } else if (eventDate && deadlineDate && (deadlineDate >= eventDate)) {
            newErrors.deadline = "締切日はイベント日付より前にしてください";
        }
        if (data.image && data.image.name && data.image.name.length > 200) newErrors.image = "画像ファイル名は200文字以内";
        return newErrors;
    };

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
            if (file) {
                setForm((prev) => ({ ...prev, image: file }));
                setPreview(URL.createObjectURL(file));
            } else {
                setForm((prev) => ({ ...prev, image: null }));
                setPreview(null);
            }
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };


    // 全項目入力済みかどうか判定
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const v = validate(form);
        setErrors(v);
        if (Object.keys(v).length > 0) return;
        // 画像ファイルをDataURL化してlocalStorageに保存
        if (form.image instanceof File) {
            const reader = new FileReader();
            reader.onload = function (ev) {
                localStorage.setItem("eventCreateImage", ev.target.result);
                localStorage.setItem("eventCreateImageName", form.image.name);
                const query = {};
                Object.keys(form).forEach(k => {
                    if (k === "image" && form.image) {
                        query.image = form.image.name;
                    } else {
                        query[k] = form[k];
                    }
                });
                window.location.href = `/event-create-confirm?${new URLSearchParams(query).toString()}`;
            };
            reader.readAsDataURL(form.image);
        } else {
            localStorage.removeItem("eventCreateImage");
            localStorage.removeItem("eventCreateImageName");
            const query = {};
            Object.keys(form).forEach(k => {
                if (k === "image" && form.image) {
                    query.image = form.image.name;
                } else {
                    query[k] = form[k];
                }
            });
            window.location.href = `/event-create-confirm?${new URLSearchParams(query).toString()}`;
        }
    };

    // 下書き保存（バリデーションなし・確認画面へ遷移）
    const handleDraft = (e) => {
        e.preventDefault();
        // 画像ファイルをDataURL化してlocalStorageに保存（下書きも同様）
        if (form.image instanceof File) {
            const reader = new FileReader();
            reader.onload = function (ev) {
                localStorage.setItem("eventCreateImage", ev.target.result);
                localStorage.setItem("eventCreateImageName", form.image.name);
                const query = {};
                Object.keys(form).forEach(k => {
                    if (k === "image") return;
                    query[k] = form[k];
                });
                query.is_draft = 1;
                window.location.href = `/event-create-confirm?${new URLSearchParams(query).toString()}`;
            };
            reader.readAsDataURL(form.image);
        } else {
            localStorage.removeItem("eventCreateImage");
            localStorage.removeItem("eventCreateImageName");
            const query = {};
            Object.keys(form).forEach(k => {
                if (k === "image") return;
                query[k] = form[k];
            });
            query.is_draft = 1;
            window.location.href = `/event-create-confirm?${new URLSearchParams(query).toString()}`;
        }
    };

    // 削除ボタンのハンドラ
    const handleDelete = async () => {
        if (!window.confirm("本当にイベントを削除しますか？")) return;
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7071";
        const isLocal = API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1");
        const API_EVENTS_PATH = isLocal ? "/api/events" : "/events";
        try {
            const res = await fetch(`${API_BASE_URL}${API_EVENTS_PATH}/${eventData.event_id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                alert("イベントを削除しました。");
                window.location.href = "/event-create-done?deleted=1";
            } else {
                let err;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    err = await res.json();
                } else {
                    err = { error: await res.text() };
                }
                alert("削除失敗: " + (err.error || res.status));
            }
        } catch (err) {
            alert("通信エラー: " + err);
        }
    };

    // EventFormへのprops渡し部分を修正
    return (
        <EventForm
            form={form}
            errors={errors}
            preview={preview}
            eventData={eventData}
            categoryOptions={categoryOptions}
            keywordOptions={keywordOptions}
            isEdit={isEdit}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onDraft={handleDraft}
            onDelete={isEdit ? handleDelete : undefined}
            isFormComplete={isFormComplete}
            submitLabel={isEdit ? "更新" : "作成"}
            draftLabel={"下書き保存"}
            deleteLabel={"イベント取り消し"}
            // ↓追加: deadlineTypeを渡す
            deadlineType="datetime-local"
        />
    );
}
