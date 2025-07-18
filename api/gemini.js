export default async function handler(req, res) {
    const { character } = req.query;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "APIキーが設定されていません。" });
    }

    if (!character) {
        return res.status(400).json({ error: "キャラクター名を指定してください。" });
    }

    const prompt = `あなたは『名探偵コナン』の専門家であり、黒の組織のボスの正体について独自の理論を構築しています。以下のキャラクターがもし「あの方」だったとしたら、その肯定的な理由と否定的な理由をそれぞれ3点ずつ箇条書きで述べてください。

キャラクター名：${character}

---
肯定的な理由:
*
*
*
否定的な理由:
*
*
*
---`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            return res.status(500).json({ error: "Gemini API エラー", details: err });
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        res.status(200).json({ text: text || "応答がありませんでした。" });
    } catch (err) {
        res.status(500).json({ error: "エラーが発生しました", details: err.message });
    }
}
