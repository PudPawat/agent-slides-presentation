import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { retrieveSlides } from '@/lib/slides'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  if (!query?.trim()) return NextResponse.json({ error: 'No query provided' }, { status: 400 })

  const relevant = retrieveSlides(query)
  const context = relevant.map(s => `[Slide ${s.id}: ${s.title}]\n${s.summary}`).join('\n\n')

  const userMsg = relevant.length
    ? `Slide context:\n${context}\n\nQuestion: ${query}`
    : `Question: ${query}\n(No specific slide matched — answer from the overall LINEGO dispatch framework knowledge if possible.)`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: `You are a concise slide assistant for the LINEGO Taxi Dispatch Optimization poster presentation.
The project proposes an adaptive two-step dispatch framework with tunable modes (Balanced, Supply, Fairness).
Answer in 2-4 sentences using the slide context provided. Be specific and technical when needed.
Write plain sentences only — no markdown, bullets, or special characters — suitable for text-to-speech.`,
    messages: [{ role: 'user', content: userMsg }]
  })

  const answer = (message.content[0] as { text: string }).text
  return NextResponse.json({ answer, slides: relevant })
}
