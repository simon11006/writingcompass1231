// netlify/edge-functions/analyze.js
export default async (request) => {
  // CORS 헤더 설정
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // OPTIONS 요청 처리
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }), 
        { 
          status: 400,
          headers: corsHeaders 
        }
      );
    }

    // OpenAI API 직접 호출
    const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 50000); // 50초 타임아웃

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Netlify.env.get('OPENAI_API_KEY')}`
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",  // 기존 모델명 유지
    messages: [{ role: "user", content: prompt }],
    temperature: 0.25,
    max_tokens: 7000
  }),
  signal: controller.signal  // 타임아웃 컨트롤러 추가
});

clearTimeout(timeoutId);  // 요청이 완료되면 타이머 제거

    const completion = await response.json();

    return new Response(
      JSON.stringify({
        choices: [{
          message: {
            content: completion.choices[0].message.content
          }
        }]
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: corsHeaders 
      }
    );
  }
};
