export default async (request) => {
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

  // POST 요청이 아닌 경우 처리
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // 요청 데이터 파싱
    const requestData = await request.json();
    if (!requestData.messages) {
      throw new Error('Messages are required');
    }

    console.log('Received messages:', requestData.messages); // 디버깅용 로그

    // OpenAI API 호출
    const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Netlify.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: requestData.messages,
        temperature: 0.3,
        max_tokens: 3500
      })
    });

    // API 응답이 실패인 경우
    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      console.error('OpenAI API Error:', errorData); // 디버깅용 로그
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const data = await apiResponse.json();
    console.log('OpenAI Response:', data); // 디버깅용 로그

    return new Response(JSON.stringify(data), { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Detailed error:', error); // 디버깅용 로그

    return new Response(JSON.stringify({
      error: true,
      message: error.message || 'Internal server error',
      details: error.toString()
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
