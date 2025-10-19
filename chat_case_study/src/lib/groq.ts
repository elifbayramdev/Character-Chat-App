export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      console.error("AI API error:", res.status, await res.text());
      return ""; // return empty string instead of void
    }

    const data = await res.json();
    return data.text ?? ""; // fallback to empty string
  } catch (err) {
    console.error("getAIResponse failed:", err);
    return ""; // fallback
  }
}