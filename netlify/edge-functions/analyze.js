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
    // 1. 요청 데이터 검증
    const body = await request.json();
    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // 2. API 요청 설정
    const apiRequestBody = {
      model: "gpt-4o-mini",
      messages: body.messages,
      temperature: 0.3,
      max_tokens: 3500
    };

    // 3. API 키 확인
    const apiKey = Netlify.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // 4. OpenAI API 호출
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(apiRequestBody)
      });

      // 5. API 응답 처리
      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.text();
        throw new Error(`OpenAI API error: ${errorData}`);
      }

      const data = await openaiResponse.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: corsHeaders
      });

    } catch (fetchError) {
      return new Response(JSON.stringify({
        error: 'OpenAI API request failed',
        details: fetchError.message
      }), {
        status: 502,
        headers: corsHeaders
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Request processing failed',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
