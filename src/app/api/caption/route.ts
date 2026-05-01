import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mediaId, imageUrl } = await request.json()

    if (!mediaId || !imageUrl) {
      return NextResponse.json({ error: 'Missing mediaId or imageUrl' }, { status: 400 })
    }

    // Call Claude Vision
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'url',
                url: imageUrl,
              },
            },
            {
              type: 'text',
              text: `This is a photo from a live music or nightlife event on the Eastern Shore of Maryland/Delaware.

Generate two things:
1. ALT_TEXT: A concise, factual description for screen readers (max 12 words). Describe what is literally visible.
2. CAPTION: An engaging, atmospheric caption for a photo gallery (max 20 words). Capture the energy and vibe.

Respond in this exact format with nothing else:
ALT_TEXT: [your alt text here]
CAPTION: [your caption here]`,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse the response
    const altTextMatch = text.match(/ALT_TEXT:\s*(.+)/i)
    const captionMatch = text.match(/CAPTION:\s*(.+)/i)

    const altText = altTextMatch?.[1]?.trim() ?? null
    const caption = captionMatch?.[1]?.trim() ?? null

    // Save to database
    const serviceClient = createServiceClient()
    const { error } = await serviceClient
      .from('event_media')
      .update({ alt_text: altText, caption })
      .eq('id', mediaId)

    if (error) {
      console.error('Caption save error:', error)
      return NextResponse.json({ error: 'Failed to save captions' }, { status: 500 })
    }

    return NextResponse.json({ altText, caption })

  } catch (err: any) {
    console.error('Caption API error:', err)
    return NextResponse.json({ error: 'Caption generation failed' }, { status: 500 })
  }
}