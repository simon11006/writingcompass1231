const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const handler = async (event) => {
  // CORS 헤더
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS 사전 확인
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  // POST 외엔 40
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: 'Method Not Allowed'
    };
  }

  try {
   const { title, content, grade, class: classNum, number, name } = JSON.parse(event.body);

   // 문단 번호 매기기
   const paragraphs = content.split(/\n+/).filter(p => p.trim());
   const numberedParagraphs = paragraphs.map((p, index) => `[${index + 1}문단]\n${p}`).join('\n\n');

   const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.25,
      max_tokens: 5000
    });

   return {
      statusCode: 200,
      body: JSON.stringify({
        choices: [
          {
            message: {
              content: completion.choices[0].message.content
            }
          }
        ]
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
                                  
