// Vercel Functionのエントリーポイント (中国語版)
export default async function handler(request, response) {
  // POSTリクエストのみを許可
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Vercelの環境変数からAPIキーを安全に取得
  // Vercelのダッシュボードで環境変数 GEMINI_API_KEY を設定してください
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'API Key not configured in Vercel Environment Variables.' });
  }

  // Gemini APIのエンドポイント
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const { characterName } = request.body; // クライアントからのリクエストボディを解析

    if (!characterName) {
      return response.status(400).json({ error: 'Character name is required.' });
    }

    // Gemini APIへのプロンプト (中国語)
    const prompt = `你是一名《名侦探柯南》专家，正在构建关于黑衣组织首领身份的独特理论。如果以下角色名或通用词汇是“那位大人”，请分别用3个项目简洁地列出肯定理由和否定理由，要求逻辑清晰且不矛盾。即使输入的名称未在《名侦探柯南》中出现，也请基于该词汇的联想特征或角色，提出富有创造性和说服力的假设进行考察。

    角色名：${characterName}

    ---
    肯定理由:
    *
    *
    *
    否定理由:
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
