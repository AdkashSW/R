const DEFAULT_BASE_URL = "https://api.numes.ai/api/v1";
const DEFAULT_API_KEY = "sk-numes-v1-6442e5ccb4c71f706b94908a1c2559070e45ae41facc8c7c35b3d10256e313a1";
const DEFAULT_MODEL = "deepseek/deepseek-v4.1-flash:free";

exports.handler = async function (event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const baseUrl = (process.env.AI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
    const apiKey = process.env.AI_API_KEY || DEFAULT_API_KEY;
    const model = body.model || process.env.AI_MODEL || DEFAULT_MODEL;

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
    return {
      statusCode: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: err.message || "Proxy error" })
    };
  }
};
