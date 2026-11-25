const DEFAULT_BASE_URL = "https://api.numes.ai/api/v1";
const DEFAULT_API_KEY = "sk-numes-v1-6442e5ccb4c71f706b94908a1c2559070e45ae41facc8c7c35b3d10256e313a1";
const DEFAULT_MODEL = "deepseek/deepseek-v4.1-flash:free";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const env = context.env || {};
    const baseUrl = (env.AI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
    const apiKey = env.AI_API_KEY || DEFAULT_API_KEY;
    const model = body.model || env.AI_MODEL || DEFAULT_MODEL;

    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: body.messages || [],
        temperature: typeof body.temperature === "number" ? body.temperature : 0.2
      })
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Proxy error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
