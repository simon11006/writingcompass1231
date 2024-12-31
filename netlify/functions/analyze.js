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

  // POST 외엔 405
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
     messages: [{
       role: 'user',
       content: `아래 제시된 제목과 내용을 초등학교 5학년 학생의 수준에서 자세하게 분석해. 학생이 제안 내용을 보고 쉽게 고칠 수 있도록 제시해주세요. 구체적인 예시를 들어가며 설명해.:

       제목: "${title}"
       내용: "${numberedParagraphs}"

       참고로, 위 내용에서 [n문단]으로 표시된 부분이 학생이 나눈 문단입니다. 이 문단 구분을 그대로 사용하여 분석하고, 문단 구분을 임의로 변경하거나 재해석하지 마세요.


       평가 시 참고사항:
       - 문단 구분이 없는 경우, 구조성 점수는 D 이하 완성도점수는 C이하로 부여할 것
       - 글이 수정본인 경우, 이전 제안사항이 잘 반영되었다면 점수를 높게 책정

                                 #전체평가
                                 총평: [쉽고 자세한 설명으로 300자 이내 평가]

                                  #평가항목
                                  논리성, 구조성, 표현성, 완성도를 다음 항목에 맞게 자세하게 평가할 것:

                                  [논리성]
                                  등급: [A+~F]
                                  평가: [종합적 평가 내용을 자세하고 쉽게 설명]
                                  잘된 점: [구체적 예시와 함께 설명]
                                  개선점: [어떻게 하면 더 좋아질수 있는지 구체적으로 설명]

                                  [구조성]
                                  등급: [A+~F]
                                  평가: [종합적 평가 내용을 자세하고 쉽게 설명]
                                  잘된 점: [구체적 예시와 함께 설명]
                                  개선점: [어떻게 하면 더 좋아질수 있는지 구체적으로 설명]

                                  [표현성]
                                  등급: [A+~F]
                                  평가: [종합적 평가 내용을 자세하고 쉽게 설명]
                                  잘된 점: [구체적 예시와 함께 설명]
                                  개선점: [어떻게 하면 더 좋아질수 있는지 구체적으로 설명]

                                  [완성도]
                                  등급: [A+~F]
                                  평가: [종합적 평가 내용을 자세하고 쉽게 설명]
                                  잘된 점: [구체적 예시와 함께 설명]
                                  개선점: [어떻게 하면 더 좋아질수 있는지 구체적으로 설명]

                                  평가 기준:
                             [논리성 평가 기준]
                             - 주장의 명확성
                             - 근거의 적절성
                             - 예시의 구체성
                             - 내용의 일관성
                             - 논리적 흐름
                             [구조성 평가 기준]
                             - 문단 구분의 적절성
                             - 문단의 길이
                             - 문단 간 연결
                             - 전체 구조
                             - 내용 배열
                             [표현성 평가 기준]
                             - 올바른 어휘 사용
                             - 맞춤법
                             - 문장의 완성도
                             - 문장의 다양성
                             - 문장의 자연스러움

                             [완성도 평가 기준]
                             - 전체적 통일성
                             - 글의 완결성
                             - 분량의 적절성
                             - 독자 고려

                                #제목 분석
                                현재 제목: "${title}"
                                등급: [A+~F]  
                                분석: 제목에 대해 제목과 내용의 연관성 및 명확성을 고려하여 분석할 것.
                                제안: 제목이 부족한 경우에만 위 분석을 바탕으로 2-3개의 대안 제목을 제시할 것.
                                [제목 평가 기준]
                                - 주제 반영
                                - 내용 연관성
                                - 길이와 표현

                             #문단분석
                             사용자가 작성한 각 문단을 하나씩 분석해주세요. 분석, 잘된 점, 개선점을 아주 자세하고 구체적으로 제시해주세요. 각 문단의 분석은 다음 형식을 따릅니다:

                             [1문단]
                             원문: [여기에 반드시 원문 전체 포함]
                             분석:
                             잘된 점:
                             개선점:
                             표현 개선 제안: 문단 내용에서 고쳐야 할 부분과 함께 그에 대한 구체적인 수정 제안을 하고 이유를 알려줄 것. 제안마다 줄을 바꿔서 2가지 이상 제안할 것. 맞춤법은 제안하지 않음.
                             맞춤법 교정: 각 맞춤법 오류를 "[틀린 표현] -> [올바른 표현], [틀린 표현]은 잘못된 표현으로, [올바른 표현]이 맞는 표현입니다." 형식으로 제시할 것. 여러 개의 맞춤법 오류가 있다면 줄바꿈으로 구분하여 제시.

                             [2문단]
                             원문: [여기에 반드시 원문 전체 포함]
                             분석:
                             잘된 점:
                             개선점:
                             표현 개선 제안: 문단 내용에서 고쳐야 할 부분과 함께 그에 대한 구체적인 수정 제안을 하고 이유를 알려줄 것. 제안마다 줄을 바꿔서 2가지 이상 제안할 것. 맞춤법은 제안하지 않음.
                             맞춤법 교정: 각 맞춤법 오류를 "[틀린 표현] -> [올바른 표현], [틀린 표현]은 잘못된 표현으로, [올바른 표현]이 맞는 표현입니다." 형식으로 제시할 것. 여러 개의 맞춤법 오류가 있다면 줄바꿈으로 구분하여 제시.

                             [이후 작성된 글의 끝까지 모든 문단에 대해 동일한 형식으로 분석 계속]

                                  #문단 구성 제안
                                  현재 문단 구조:
                                  - 학생의 글에서 어떤 내용들을 쓰고 있는지 친절하게 설명해주세요
                                  - 비슷한 내용끼리 어떻게 묶을 수 있는지 구체적으로 알려주세요
                                  - 각각의 내용이 글의 어느 부분에 있는지 실제 문장을 예시로 들어주세요

                                  #문단 구성 제안
                                  현재 문단 구조:
                                  - 이 글에서 다루고 있는 주요 내용을 정리해주세요
                                  - 비슷한 내용끼리 어떻게 묶여있는지 설명해주세요
                                  - 현재 문단구조에 대해 평가해주세요.

                                  문단 구성 개선안:
                                  글의 내용과 길이를 고려했을 때, 총 [3~5]개의 문단으로 나누면 좋을 것 같아요.

                                  1. 시작하는 문단에서는:
                                  - 글의 주제를 소개하는 내용: [구체적인 방법 및 내용 제안]
                                  - 왜 이 주제를 선택했는지 설명: [구체적인 방법 및 내용 제안]
                                  - 실제 글에서 사용할 문장: "[학생의 글에서 발췌한 문장]"

                                  2. 중간 문단(들)에서는:
                                  - [몇 개의 중간 문단이 필요한지, 왜 그렇게 나누면 좋은지 설명]
                                  - 각 문단별로 다룰 내용: [구체적인 방법 및 내용 제안]
                                  - 실제 글에서 사용할 문장들: "[학생의 글에서 발췌한 문장들]"

                                  3. 마무리 문단에서는:
                                  - 전체 내용 요약 방법: [구체적인 방법 및 내용 제안]
                                  - 글을 어떻게 마무리하면 좋을지: [구체적인 방법 및 내용 제안]
                                                                     - 실제 글에서 사용할 문장: "[학생의 글에서 발췌한 문장]"

                                                                     구체적 실행 방안:
                                                                     * 글을 크게 [숫자]개의 문단으로 나누어 보세요. 그 이유는: [이유 설명]
                                                                     * 각 문단은 이렇게 연결하면 좋아요: [구체적인 연결 방법]
                                                                     * 새로운 문단을 시작할 때는 한 줄을 띄우고, '그리고', '하지만'과 같은 연결하는 말로 자연스럽게 이어보세요
                                                                     * 한 문단에는 너무 많은 내용을 넣지 말고, 비슷한 내용끼리 모아서 써보세요
                                                                     #통계
                                                                     - 총 글자 수: ${content.replace(/\n/g, '').length}자
                                                                     - 총 문장 수: [숫자]개
                                                                     - 총 문단 수: [숫자]개
                                                                     - 평균 문장 길이: [숫자]자`
                                        }],
                                        temperature: 0.25,
                                        max_tokens: 4000
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
                                  
