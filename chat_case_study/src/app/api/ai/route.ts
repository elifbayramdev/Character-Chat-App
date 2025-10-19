import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      reasoning_effort: "medium",
      stream: false
    });

    const aiText = completion.choices[0]?.message?.content || "No response";

    return NextResponse.json({ text: aiText });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ text: "Error generating response" }, { status: 500 });
  }
}
