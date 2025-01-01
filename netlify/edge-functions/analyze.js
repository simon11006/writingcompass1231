// netlify/edge-functions/analyze.js
import { Config } from '@netlify/edge-functions';
import OpenAI from 'openai';

export default async (request: Request, context: Context) => {
 const openai = new OpenAI({
   apiKey: context.env.OPENAI_API_KEY
 });

 // CORS 처리
 if (request.method === 'OPTIONS') {
   return new Response(null, {
     headers: {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Methods': 'POST, OPTIONS',
       'Access-Control-Allow-Headers': 'Content-Type'
     }
   });
 }

 try {
   const { prompt } = await request.json();

   const completion = await openai.chat.completions.create({
     model: "gpt-4o-mini",
     messages: [{ 
       role: "user", 
       content: prompt 
     }],
     temperature: 0.25, // 일관된 응답을 위해 낮은 temperature 사용
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
     {
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '*',
         'Cache-Control': 'no-cache'
       }
     }
   );

 } catch (error) {
   console.error('Error:', error);
   
   return new Response(
     JSON.stringify({ 
       error: error.message,
       details: error.stack 
     }), 
     { 
       status: 500,
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '*',
         'Cache-Control': 'no-cache'
       }
     }
   );
 }
};
