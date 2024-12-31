// netlify/functions/paragraphSuggestions.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { content } = JSON.parse(event.body);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // 원래 모델 사용
      messages: [{
        role: "user",
        content: `학생이 작성한 다음 글을 문단별로 나누어주세요. 각 문단은 배열의 요소로 반환하고, 각 문단을 그렇게 나눈 이유를 간단히 설명해주세요. 설명을 초등학생에게 한다는 것을 잊지 말고 쉬운 단어를 이용해서 설명해주세요. 비슷한 내용을 기준으로 문단을 구성해주세요. 응답은 마크다운이나 추가 설명 없이, 순수한 JSON 형식으로만 해주세요:
        {
          "paragraphs": [
            {
              "text": "첫 번째 문단 내용",
              "reason": "첫 번째 문단을 이렇게 나눈 이유"
            }
          ]
        }
        글:
        ${content}`
      }],
      temperature: 0.4,
      max_tokens: 1500
    });

    return {
          statusCode: 200,
          headers,
          body: completion.choices[0].message.content
        };
      } catch (error) {
        console.error('Error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Internal Server Error' })
        };
      }
    };
