export default async (request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }), 
        { status: 400, headers: corsHeaders }
      );
    }

    // 타임아웃 컨트롤러 추가
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000); // 50초 타임아웃

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Netlify.env.get('OPENAI_API_KEY')}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.25,
          max_tokens: 7000
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);  // 요청 완료 시 타이머 제거
      
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
      // 타임아웃 에러 처리
      if (error.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: '분석 시간이 너무 오래 걸립니다. 다시 시도해주세요.' }), 
          { status: 408, headers: corsHeaders }
        );
      }
      throw error;  // 다른 에러는 아래의 일반 에러 처리로 전달
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: corsHeaders }
    );
  }
};
