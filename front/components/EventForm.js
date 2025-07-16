import React from "react";

export default function EventForm({
    form,
    errors,
    preview,
    eventData,
    categoryOptions,
    keywordOptions,
    isEdit,
    onChange,
    onSubmit,
    onDraft,
    onDelete,
    isFormComplete,
    submitLabel = "作成",
    draftLabel = "下書き保存",
    deleteLabel = "イベント取り消し"
}) {
    // props型例:
    // form: {title, date, ...}, errors: {...}, preview: string, eventData: {...}, categoryOptions: [], keywordOptions: [], isEdit: bool, onChange: fn, onSubmit: fn, onDraft: fn, onDelete: fn, isFormComplete: fn
    return (
        <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
            <h1>{isEdit ? "イベント編集" : "イベント作成"}</h1>
            <form onSubmit={onSubmit}>
                <div className="row">
                    <label>タイトル
                        <input type="text" name="title" value={form.title} onChange={onChange} required maxLength={255} />
                    </label>
                    {errors.title && <div style={{ color: 'red' }}>{errors.title}</div>}
                </div>
                <div className="row">
                    <label>日付
                        <input type="datetime-local" name="date" value={form.date} onChange={onChange} required min={new Date().toISOString().slice(0, 16)} />
                    </label>
                    {errors.date && <div style={{ color: 'red' }}>{errors.date}</div>}
                </div>
                <div className="row">
                    <label>場所
                        <input type="text" name="location" value={form.location} onChange={onChange} required maxLength={255} />
                    </label>
                    {errors.location && <div style={{ color: 'red' }}>{errors.location}</div>}
                </div>
                <div className="row">
                    <label>カテゴリ
                        <select name="category" value={form.category} onChange={onChange} required>
                            <option value="">選択してください</option>
                            {categoryOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </label>
                    {errors.category && <div style={{ color: 'red' }}>{errors.category}</div>}
                </div>
                <div className="row">
                    <label>キーワード</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {keywordOptions.map(opt => (
                            <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.2rem", margin: 0 }}>
                                <input
                                    type="checkbox"
                                    name="keywords"
                                    value={opt.value}
                                    checked={form.keywords.includes(opt.value)}
                                    onChange={onChange}
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                    {errors.keywords && <div style={{ color: 'red' }}>{errors.keywords}</div>}
                </div>
                <div className="row">
                    <label>画像
                        <input type="file" name="image" accept="image/*" onChange={onChange} />
                    </label>
                    {(preview && form.image && typeof form.image !== "string") && (
                        <img src={preview} alt="プレビュー" style={{ maxWidth: "100%", maxHeight: 200, marginTop: "0.5rem" }} />
                    )}
                    {(!preview && eventData && eventData.image_url) && (
                        <img src={eventData.image_url} alt="保存済み画像" style={{ maxWidth: "100%", maxHeight: 200, marginTop: "0.5rem" }} />
                    )}
                    {errors.image && <div style={{ color: 'red' }}>{errors.image}</div>}
                </div>
                <div className="row">
                    <label>イベント概要
                        <textarea name="summary" rows={3} maxLength={200} value={form.summary} onChange={onChange} required />
                    </label>
                    {errors.summary && <div style={{ color: 'red' }}>{errors.summary}</div>}
                </div>
                <div className="row">
                    <label>イベント詳細
                        <textarea name="detail" rows={5} maxLength={200} value={form.detail} onChange={onChange} required />
                    </label>
                    {errors.detail && <div style={{ color: 'red' }}>{errors.detail}</div>}
                </div>
                <div className="row">
                    <label>最大人数
                        <input type="number" name="max_participants" value={form.max_participants} onChange={onChange} min={1} />
                    </label>
                    {errors.max_participants && <div style={{ color: 'red' }}>{errors.max_participants}</div>}
                </div>
                <div className="row">
                    <label>申し込み締め切り日
                        <input type="datetime-local" name="deadline" value={form.deadline} onChange={onChange} required min={new Date().toISOString().slice(0, 16)} max={form.date || undefined} />
                    </label>
                    {errors.deadline && <div style={{ color: 'red' }}>{errors.deadline}</div>}
                </div>
                <button
                    type="submit"
                    disabled={!isFormComplete()}
                    style={{
                        background: isFormComplete() ? "#1976d2" : "#ccc",
                        color: isFormComplete() ? "#fff" : "#888",
                        cursor: isFormComplete() ? "pointer" : "not-allowed",
                        opacity: isFormComplete() ? 1 : 0.6
                    }}
                >
                    {submitLabel}
                </button>
                <button type="button" style={{ marginLeft: 8 }} onClick={onDraft}>{draftLabel}</button>
                {isEdit && (
                    <button
                        type="button"
                        style={{ marginLeft: 8, background: "#d32f2f", color: "#fff" }}
                        onClick={onDelete}
                    >{deleteLabel}</button>
                )}
            </form>
        </div>
    );
}
