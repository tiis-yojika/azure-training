import { useRouter } from "next/router";

export default function EventCreateDone() {
    const router = useRouter();
    const isDraft = String(router.query.is_draft) === "1";
    return (
        <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif", textAlign: "center" }}>
            <h1>イベント{isDraft ? "下書き保存" : "作成完了"}</h1>
            <p>
                {isDraft
                    ? "イベントの下書き保存が完了しました。"
                    : "イベントの登録が完了しました。"}
            </p>
            <a href="/event/create" style={{ color: "#1976d2" }}>別のイベントを作成する</a>
            <a href="/event" style={{ color: "#1976d2" }}>イベント一覧に戻る</a>
        </div>
    );
}
