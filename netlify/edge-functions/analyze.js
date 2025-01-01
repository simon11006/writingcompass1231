// netlify/edge-functions/analyze.js
import { OpenAI } from 'openai';

export default async (request, context) => {
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
   const openai = new OpenAI({
     apiKey: context.env.OPENAI_API_KEY
   });

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

   const completion = await openai.chat.completions.create({
     model: "gpt-4o-mini",
     messages: [
       {
         role: "user",
         content: prompt
       }
     ],
     temperature: 0.25,
     max_tokens: 5000
   });

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
     JSON.stringify({ 
       error: error.message,
       details: process.env.NODE_ENV === 'development' ? error.stack : undefined 
     }), 
     { 
       status: 500,
       headers: corsHeaders 
     }
   );
 }
};
