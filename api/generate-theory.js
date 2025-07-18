// Vercel Functionのエントリーポイント
export default async function handler(request, response) {
  // POSTリクエストのみを許可
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Vercelの環境変数からAPIキーを安全に取得
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'API Key not configured' });
  }

  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const { characterName } = request.body; // クライアントからのリクエストボディを解析

    if (!characterName) {
      return response.status(400).json({ error: 'Character name is required.' });
    }

    // Gemini APIへのプロンプト
    const prompt = `あなたは『名探偵コナン』の専門家であり、黒の組織のボスの正体について独自の理論を構築しています。以下のキャラクターがもし「あの方」だったとしたら、その肯定的な理由と否定的な理由をそれぞれ箇条書きで3点ずつ簡潔に記述してください。もし入力された名前が『名探偵コナン』に登場しないキャラクターや一般的な単語の場合でも、その言葉から連想される仮説を立てて考察してください。

    キャラクター名：${characterName}

    ---
    肯定的な理由:
    *
    *
    *
    否定的な理由:
    *
    *
    *
    ---
    `;

    const payload = {
      contents: [{
        role: 'user',
        parts: [{
          text: prompt
        }]
      }]
    };

    // Gemini APIにリクエストを送信
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API Error:', errorData);
      return response.status(geminiResponse.status).json({ error: 'Failed to get response from Gemini API', details: errorData });
    }

    const geminiResult = await geminiResponse.json();
    
    // Gemini APIからの応答をクライアントに返す
    return response.status(200).json(geminiResult);

  } catch (error) {
    console.error('Vercel Function Error:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
