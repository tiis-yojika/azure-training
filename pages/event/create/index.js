import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import EventForm from "../../../components/EventForm";

const API_URL_GET_CATEGORIES = process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES;
const API_URL_GET_KEYWORDS = process.env.NEXT_PUBLIC_API_URL_GET_KEYWORDS;
const API_URL_CREATE_EVENT = process.env.NEXT_PUBLIC_API_URL_CREATE_EVENT;
const API_URL_DELETE_EVENT = process.env.NEXT_PUBLIC_API_URL_DELETE_EVENT;

// カスタムフック: カテゴリ・キーワードをlocalStorageでキャッシュ
function useCachedFetch(key, url, mapFn) {
  const [data, setData] = useState([]);
  useEffect(() => {
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
  }, [key, url]);
  return data;
}

export default function EventCreate() {
  const router = useRouter();
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
      fetch(API_URL_CREATE_EVENT)
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

  const categoryOptions = useCachedFetch(
    "categories",
    API_URL_GET_CATEGORIES,
    c => ({ value: String(c.category_id), label: c.category_name })
  );
  const keywordOptions = useCachedFetch(
    "keywords",
    API_URL_GET_KEYWORDS,
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
        router.push({
          pathname: '/event/create/confirm',
          query: query
        });
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
      router.push({
        pathname: '/event/create/confirm',
        query: query
      });
    }
  };

  // 下書き保存（バリデーションなし・確認画面へ遷移）
  const handleDraft = (e) => {
    e.preventDefault();
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
        query.is_draft = 1;
        router.push({
          pathname: '/event/create/confirm',
          query: query
        });
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
      query.is_draft = 1;
      router.push({
        pathname: '/event/create/confirm',
        query: query
      });
    }
  };

  // 削除ボタンのハンドラ
  const handleDelete = async () => {
    if (!window.confirm("本当にイベントを削除しますか？")) return;
    try {
      const res = await fetch(API_URL_DELETE_EVENT.replace("%7Bevent_id%7D", eventId), {
        method: "DELETE"
      });
      if (res.ok) {
        alert("イベントを削除しました。");
        window.location.href = "/event/create/complete?deleted=1";
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

  // EventFormへのprops渡し部分
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
      deadlineType="datetime-local"
    />
  );
}