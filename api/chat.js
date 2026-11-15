export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, mode, grade, studentName } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ reply: '⚠️ Ключ GROQ_API_KEY пока не добавлен в настройки Vercel!' });
  }

  let systemPrompt = '';
  if (mode === 'kid_help') {
    systemPrompt = `Ты добрый, весёлый робот-помощник Умник для ученика ${grade} класса (имя: ${studentName}). Отвечай коротко (3-5 предложений), понятно, дружелюбно, с эмодзи. Никогда не давай готовый ответ на пример сразу — объясни правило на простом примере и подскажи шаг решения.`;
  } else if (mode === 'kid_tale') {
    systemPrompt = `Ты детский писатель-фантаст. Сочиняй короткую (5-7 предложений), добрую и увлекательную сказку для ученика ${grade} класса по имени ${studentName} и его одноклассников. Используй эмодзи.`;
  } else if (mode === 'parent_help') {
    systemPrompt = `Ты опытный методист российской школы (ФГОС). Помоги родителю ученика ${grade} класса. Покажи краткую запись, схему и пошаговое решение задачи строго по программе ${grade} класса (не используй уравнения или темы старших классов, если это начальная школа).`;
  }

  try {
    const response = await fetch('https://groq.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 650,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const firstChoice = Array.isArray(data.choices) ? data.choices : null;
    const reply = firstChoice && firstChoice.message
      ? firstChoice.message.content
      : 'Робот немного задумался, попробуй спросить ещё раз! 🤖';

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ reply: 'Нет связи с космосом 🚀 Попробуй через 5 секунд.' });
  }
}
