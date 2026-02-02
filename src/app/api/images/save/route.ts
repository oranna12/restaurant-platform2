import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (restaurantError) {
      console.error('Restaurant error:', restaurantError)
      return NextResponse.json({ error: 'Restaurant not found', details: restaurantError.message }, { status: 404 })
    }

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const { editedBase64, format } = await request.json()

    if (!editedBase64) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 })
    }

    // Upload edited image to Supabase Storage
    const editedFileName = `${restaurant.id}/${Date.now()}_edited_${format}.png`
    const editedImageBuffer = Buffer.from(editedBase64, 'base64')
    
    const { error: uploadError } = await supabase.storage
      .from('edited-images')
      .upload(editedFileName, editedImageBuffer, {
        contentType: 'image/png'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image', details: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('edited-images')
      .getPublicUrl(editedFileName)

    console.log('Saving to DB:', {
      restaurant_id: restaurant.id,
      edited_url: urlData.publicUrl,
      format: format
    })

    // Save to database
    const { data: imageRecord, error: dbError } = await supabase
      .from('images')
      .insert({
        restaurant_id: restaurant.id,
        edited_url: urlData.publicUrl,
        format: format,
        status: 'completed',
        credits_used: 5
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Return error instead of silently continuing
      return NextResponse.json({ 
        error: 'Failed to save to database', 
        details: dbError.message,
        imageUrl: urlData.publicUrl // Still return URL so user can download
      }, { status: 500 })
    }

    console.log('Image saved successfully:', imageRecord)

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
      imageId: imageRecord.id
    })

  } catch (error) {
    console.error('Save image error:', error)
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 })
  }
}
