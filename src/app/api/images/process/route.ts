import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// === BACKGROUND PROMPTS ===
const BACKGROUND_PROMPTS: Record<string, string> = {
  'white-marble': 'Replace the background with an elegant white marble surface with subtle natural gray veining. The marble should look luxurious and high-end.',
  'dark-wood': 'Replace the background with a rich, dark walnut wood surface with visible natural grain patterns. The wood should look warm and inviting.',
  'concrete': 'Replace the background with a smooth gray concrete surface with subtle texture. Modern industrial look.',
  'black-slate': 'Replace the background with a dramatic black slate surface with subtle natural texture. Luxurious and moody.',
  'natural-linen': 'Replace the background with a natural beige linen fabric texture. Homey and rustic feeling.',
}

// === ANGLE PROMPTS ===
const ANGLE_PROMPTS: Record<string, string> = {
  'top-down': 'Adjust the perspective to a perfect top-down view (90 degrees from above), looking straight down at the dish.',
  '45-degree': 'Adjust the perspective to a 45-degree angle view, the classic food photography angle.',
  'eye-level': 'Adjust the perspective to eye-level view, looking straight at the dish from the side.',
}

// === LIGHTING PROMPTS ===
const LIGHTING_PROMPTS: Record<string, string> = {
  'soft-studio': 'Apply soft, diffused studio lighting from above. Even illumination with very soft shadows. Professional restaurant menu style.',
  'natural': 'Apply natural window light from the side. Warm, inviting daylight feeling with gentle shadows.',
  'dramatic': 'Apply dramatic directional lighting with deeper shadows and highlights. Moody and artistic.',
}

// === FORMAT SETTINGS ===
const FORMAT_SETTINGS: Record<string, { ratio: string; composition: string }> = {
  'website': {
    ratio: '1:1',
    composition: 'Center the plate in a square frame. The plate should fill approximately 85% of the image.'
  },
  'wolt': {
    ratio: '16:9',
    composition: 'Center the plate in a wide horizontal frame (16:9). Leave some space on the sides for a delivery app layout.'
  },
  'instagram': {
    ratio: '4:5',
    composition: 'Center the plate in a portrait frame (4:5). Perfect for Instagram feed.'
  }
}

const CREDITS_PER_IMAGE = 5

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get restaurant and check credits
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id, credits')
      .eq('owner_id', user.id)
      .single()

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    if (restaurant.credits < CREDITS_PER_IMAGE) {
      return NextResponse.json({ error: 'אין מספיק קרדיטים' }, { status: 402 })
    }

    // Get form data
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const format = formData.get('format') as string || 'website'
    const background = formData.get('background') as string || 'white-marble'
    const angle = formData.get('angle') as string || '45-degree'
    const lighting = formData.get('lighting') as string || 'soft-studio'
    const feedback = formData.get('feedback') as string || ''

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(bytes).toString('base64')
    const mimeType = imageFile.type

    // Call Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    // Build dynamic prompt
    const backgroundPrompt = BACKGROUND_PROMPTS[background] || BACKGROUND_PROMPTS['white-marble']
    const anglePrompt = ANGLE_PROMPTS[angle] || ANGLE_PROMPTS['45-degree']
    const lightingPrompt = LIGHTING_PROMPTS[lighting] || LIGHTING_PROMPTS['soft-studio']
    const formatSettings = FORMAT_SETTINGS[format] || FORMAT_SETTINGS['website']

    let prompt = `Edit this food photograph to create a professional restaurant-quality image.

CRITICAL RULES - DO NOT CHANGE THE FOOD:
- DO NOT modify the plate itself - keep the exact same plate
- DO NOT rearrange or modify the food placement on the plate
- DO NOT change any garnishes, sauces, or decorations
- Keep every detail of the dish exactly as it appears

BACKGROUND:
${backgroundPrompt}

CAMERA ANGLE:
${anglePrompt}

LIGHTING:
${lightingPrompt}

COMPOSITION:
${formatSettings.composition}

Make it look like a high-end professional food photography shot.
Output only the edited image, no text.`

    // Add user feedback if provided
    if (feedback) {
      prompt += `

ADDITIONAL USER FEEDBACK - PLEASE ADDRESS THESE ISSUES:
${feedback}

Please fix these issues while maintaining all the other rules above.`
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          }
        })
      }
    )

    const geminiResult = await geminiResponse.json()

    if (geminiResult.error) {
      console.error('Gemini API Error:', geminiResult.error)
      return NextResponse.json({ error: geminiResult.error.message }, { status: 500 })
    }

    // Extract the generated image
    const candidates = geminiResult.candidates
    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ error: 'No response from Gemini' }, { status: 500 })
    }

    const parts = candidates[0].content.parts
    let editedImageBase64 = null

    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
        editedImageBase64 = part.inlineData.data
        break
      }
    }

    if (!editedImageBase64) {
      return NextResponse.json({ error: 'No image in Gemini response' }, { status: 500 })
    }

    // Deduct credits
    const { error: creditError } = await supabase.rpc('deduct_credits', {
      p_restaurant_id: restaurant.id,
      p_amount: CREDITS_PER_IMAGE,
      p_type: 'image_edit',
      p_description: `עריכת תמונה - ${format}, רקע: ${background}`
    })

    if (creditError) {
      console.error('Credit deduction error:', creditError)
    }

    // Return the edited image
    return NextResponse.json({
      success: true,
      editedImageBase64: editedImageBase64,
      creditsUsed: CREDITS_PER_IMAGE,
      creditsRemaining: restaurant.credits - CREDITS_PER_IMAGE
    })

  } catch (error) {
    console.error('Process image error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
