// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { Groq } from 'npm:groq-sdk'

const systemPrompt = `
  You are a marketing assistant and your job is to promote Linkedin Page to attract potential clients and users.
  The name of the linkedin business page is ATS IT Solutions. This is a company that specializes in building custom software
  solutions for companies.
  Rules:
  - Use this link for the business page: "https://www.linkedin.com/company/ats-it-solutions"
  - You are to create afun, inviting and trendy posts to drive post engagement. 
  - You are to invite people to contact us.
  - You will make the post short and concise.
  - Only return the post paragraph and nothing else
  - Use relevant, popular and targeted hashtags at the end of each post for our business page
  - Use emojis and stickers or anything else to make the post engaging and inviting.
  - At the end of the post make sure to let the users know, that the post was made by an AI bot and they can have one of their own too!!
`

const groq = new Groq({ apiKey: Deno.env.get("GROQ_API_KEY") });


async function postOnLinkedIn(message: string) {
  const token = fetchToken()
  console.log("Making post")
  const response = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+ {Deno.env.get("LINKEDIN_ACCESS_TOKEN")}
    },
    body: JSON.stringify(
      {
        "author": "urn:li:organization:" + Deno.env.get("LINKEDIN_ORGANIZATION_ID"),
        "commentary": message,
        "visibility": "PUBLIC",
        "distribution": {
          "feedDistribution": "MAIN_FEED",
          "targetEntities": [],
          "thirdPartyDistributionChannels": []
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": false
      }
    )
  })
  console.log(response.statusText)
  const { data, errors } = await response.json()
  if (errors) {
    throw errors
  }
  console.log(JSON.stringify(data))
}


async function getGroqChatCompletion() {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: "Create a trendy and iniviting LinkedIn post for my business page.",
      },
    ],
    model: "llama3-8b-8192",
  }).catch(async (err) => {
    if (err instanceof Groq.APIError) {
      console.log(err.status); // 400
      console.log(err.name); // BadRequestError
      console.log(err.headers); // {server: 'nginx', ...}
    } else {
      throw err;
    }
  });
}


async function main(req) {
  console.log(req.body)
  // const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  // const data = chatCompletion.choices[0]?.message?.content || ""
  // console.log(data);
  // await postOnLinkedIn(data)
  return new Response(JSON.stringify({"status": "ok"}), { headers: { 'Content-Type': 'application/json' } })
}

Deno.serve(main)

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/linkedin-ats-bot' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
