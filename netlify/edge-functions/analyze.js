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
    const { messages } = await request.json();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Netlify.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.3,
        max_tokens: 3500
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: '분석 중 오류가 발생했습니다. 다시 시도해주세요.' }), 
      { status: 500, headers: corsHeaders }
    );
  }
};
