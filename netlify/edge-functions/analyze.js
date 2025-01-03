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
    // 클라이언트로부터 메시지 받기
    const requestData = await request.json();
    const { messages } = requestData;

    // OpenAI API 호출
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Netlify.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    // OpenAI 응답 처리
    const openaiData = await openaiResponse.json();

    // 성공 응답 반환
    return new Response(JSON.stringify(openaiData), { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Error details:', error);
    
    // 에러 응답 반환
    return new Response(JSON.stringify({
      error: true,
      message: error.message || '서버 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
