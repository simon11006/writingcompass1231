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
    const { title, content } = await request.json();
    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }), 
        { status: 400, headers: corsHeaders }
      );
    }

    const paragraphs = content.split('\n').filter(p => p.trim());
    const numberedParagraphs = paragraphs
      .map((p, index) => `[${index + 1}문단]\n${p}`).join('\n\n');

  const ANALYSIS_PROMPT = `아래 제시된 제목과 내용을 초등학교 5학년 학생의 수준에서 자세하게 분석해. 학생이 제안 내용을 보고 쉽게 고칠 수 있도록 제시해주세요. 구체적인 예시를 들어가며 설명해.:

        제목: "${title}"
        내용: "${numberedParagraphs}"

        참고로, 위 내용에서 [n문단]으로 표시된 부분이 학생이 나눈 문단입니다. 이 문단 구분을 그대로 사용하여 분석하고, 문단 구분을 임의로 변경하거나 재해석하지 마세요.


                              평가 시 참고사항:
                              - 문단 구분이 없이 작성된 경우, 구조성 점수는 **반드시 D 이하**로 평가할 것**
                              - 문단 구분이 없는 경우, 완성도 점수도 **최대 C**까지만 부여 가능
                              - 글이 수정본인 경우, 이전 제안사항이 잘 반영되었다면 점수를 높게 책정
                              - 문단 구분이 잘 되어 있고 내용이 통일성을 가진다면 완성도 점수를 상향 조정할 것
                              - 문장이 간결해지고 이해하기 쉬워졌다면 표현성 점수 상향
                              - 문단 간 연결이 자연스러워졌다면 구조성 점수 상향
                              - 논리가 더 탄탄해졌다면 논리성 점수 상향
                              - 전체적인 글의 완성도는 문단 구분 여부(내용에 따라 문단을 구분했는지)를 중요하게 반영할 것

                                                        #전체평가
                                                        총평: [쉽고 자세한 설명으로 300자 이내 평가]

                                                         #평가항목
                                                         논리성, 구조성, 표현성, 완성도를 다음 항목에 맞게 자세하게 평가할 것:

                                                         [논리성] (30%)
                                                         등급: [A+~F]
                                                         평가: [종합적 평가 내용을 자세하고 쉽게 설명]
                                                         잘된 점: [구체적 예시와 함께 설명]
                                                         개선점: [어떻게 하면 더 좋아질수 있는지 구체적으로 설명]

                                                         [구조성] (25%)
                                                         등급: [A+~F]
                                                         평가: [종합적 평가 내용을 자세하고 쉽게 설명]
                                                         잘된 점: [구체적 예시와 함께 설명]
                                                         개선점: [어떻게 하면 더 좋아질수 있는지 구체적으로 설명]

                                                         [표현성] (25%)
                                                         등급: [A+~F]
                                                         평가: [종합적 평가 내용을 자세하고 쉽게 설명]
                                                         잘된 점: [구체적 예시와 함께 설명]
                                                         개선점: [어떻게 하면 더 좋아질수 있는지 구체적으로 설명]

                                                         [완성도] (20%)
                                                         등급: [A+~F]
                                                         평가: [종합적 평가 내용을 자세하고 쉽게 설명]
                                                         잘된 점: [구체적 예시와 함께 설명]
                                                         개선점: [어떻게 하면 더 좋아질수 있는지 구체적으로 설명]

                                                         평가 기준:
                                                    [논리성 평가 기준] - 30%
                                                    - 주장의 명확성: 글의 핵심 주장이 명확한가?
                                                    - 근거의 적절성: 주장을 뒷받침하는 근거가 충분한가?
                                                    - 예시의 구체성: 적절한 예시로 설명하고 있는가?
                                                    - 내용의 일관성: 주장에서 벗어난 내용은 없는가?
                                                    - 논리적 흐름: 문장과 문장이 자연스럽게 이어지는가?
                                                    
                                                    [구조성 평가 기준] - 25%
                                                    - 문단 구분의 적절성: 한 문단에 한 가지 중심 내용을 다루는가?
                                                    - 문단의 길이: 한 문단이 3-5문장으로 구성되어 있는가?
                                                    - 문단 간 연결: 문단과 문단이 자연스럽게 이어지는가?
                                                    - 전체 구조: 시작-중간-끝 구조가 잘 갖춰져 있는가?
                                                    - 내용 배열: 비슷한 내용끼리 잘 묶여 있는가?
                                                    
                                                    [표현성 평가 기준] - 25%
                                                    - 어휘 사용: 초등학생 수준에 맞는 어휘를 사용했는가?
                                                    - 맞춤법: 맞춤법과 띄어쓰기가 정확한가?
                                                    - 문장의 완성도: 주어와 서술어가 잘 갖춰져 있는가?
                                                    - 문장의 다양성: 같은 표현이 반복되지는 않는가?
                                                    - 문장의 자연스러움: 읽기 쉽게 표현되어 있는가?
                                                    
                                                    [완성도 평가 기준] - 20%
                                                    - 전체적 통일성: 글의 처음부터 끝까지 한 주제로 일관되는가?
                                                    - 글의 완결성: 글이 자연스럽게 마무리되는가?
                                                    - 분량의 적절성: 주제를 설명하기에 충분한 분량인가?
                                                    - 독자 고려: 읽는 사람이 이해하기 쉽게 썼는가?,
                                                    
                                                       #제목 분석
                                                       현재 제목: "${title}"
                                                       등급: [A+~F]  
                                                       분석: 제목에 대해 제목과 내용의 연관성 및 명확성을 고려하여 분석할 것.
                                                       제안: 제목이 부족한 경우에만 위 분석을 바탕으로 2-3개의 대안 제목을 제시할 것.
                                                       [제목 평가 기준]
                                                       - 주제 반영: 글의 주제가 제목에 잘 나타나는가?
                                                       - 내용 연관성: 제목과 내용이 잘 어울리는가?
                                                       - 길이와 표현: 제목의 길이와 표현이 적절한가?,

                                                    #문단분석
                                                    사용자가 작성한 각 문단을 하나씩 분석해주세요. 분석, 잘된 점, 개선점을 아주 자세하고 구체적으로 제시해주세요. 각 문단의 분석은 다음 형식을 따릅니다:

                                                      [1문단]
                                                      원문: [여기에 반드시 원문 전체 포함]
                                                      분석:
                                                      잘된 점:
                                                      개선점:
                                                      표현 개선 제안: 다음과 같은 경우만 제안해주세요
                                                      - 문장의 흐름이 자연스럽지 않은 경우
                                                      - 문장 구조가 어색한 경우
                                                      - 더 적절한 표현이 있는 경우
                                                      - 중복되거나 불필요한 표현이 있는 경우
                                                      - 맞춤법 관련 내용은 절대 포함하지 마세요
                                                      
                                                      맞춤법 교정: 순수하게 맞춤법에 관한 내용만 다룹니다
                                                      - 틀린 맞춤법/띄어쓰기를 찾아 교정
                                                      - 각 맞춤법 오류를 "[틀린 표현] -> [올바른 표현], [틀린 표현]은 잘못된 표현으로, [올바른 표현]이 맞는 표현입니다." 형식으로 제시
                                                      - 여러 개의 맞춤법 오류가 있다면 줄바꿈으로 구분하여 제시.
       
                                                    [이후 작성된 글의 끝까지 모든 문단에 대해 동일한 형식으로 분석 계속]

                                                         #문단 구성 제안
                                                         현재 문단 구조:
                                                             - ${paragraphs.length}개의 문단으로 구성되어 있으며, 각 문단의 주요 내용은 다음과 같습니다:
                                                             ${paragraphs.map((p, i) => `  [${i + 1}번째 문단] ${p.substring(0, 30)}...`).join('\n')}
                                                             
                                                             - 이 글에서 다루고 있는 주요 내용을 각 문단별로 정리해주세요
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
                                                         * 한 문단에는 너무 많은 내용을 넣지 말고, 비슷한 내용끼리 모아서 써보세요`;

        const finalPrompt = ANALYSIS_PROMPT
          .replace("${title}", title)
          .replace("${numberedParagraphs}", numberedParagraphs);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 50000);
    
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Netlify.env.get('OPENAI_API_KEY')}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: finalPrompt }],
              temperature: 0.25,
              max_tokens: 7000
            }),
            signal: controller.signal
          });
    
          clearTimeout(timeoutId);
          
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
          if (error.name === 'AbortError') {
            return new Response(
              JSON.stringify({ error: '분석 시간이 너무 오래 걸립니다. 다시 시도해주세요.' }), 
              { status: 408, headers: corsHeaders }
            );
          }
          throw error;
        }
      } catch (error) {
        console.error('Error:', error);
        return new Response(
          JSON.stringify({ error: error.message }), 
          { status: 500, headers: corsHeaders }
        );
      }
    };
