import { NextRequest, NextResponse } from 'next/server';
import { postGenerator } from '@/lib/services/post-generator';
import { fetchApi } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      analysis, 
      platform, 
      blogUrl, 
      options,
      blogPostId 
    } = body;

    if (!analysis || !platform) {
      return NextResponse.json(
        { success: false, error: 'Analysis and platform are required' },
        { status: 400 }
      );
    }

    let result;
    let validation;

    if (platform === 'facebook') {
      const facebookResult = await postGenerator.generateFacebookPost(
        analysis,
        blogUrl || '',
        options
      );
      result = facebookResult.post;
      validation = facebookResult.validation;
    } else if (platform === 'instagram') {
      const instagramResult = await postGenerator.generateInstagramPost(
        analysis,
        options
      );
      result = instagramResult.post;
      validation = instagramResult.validation;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid platform. Use "facebook" or "instagram"' },
        { status: 400 }
      );
    }

    const generatedPost = {
      id: crypto.randomUUID(),
      blogPostId: blogPostId || analysis.blogPostId,
      platform,
      content: result,
      validation,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      post: generatedPost
    });
  } catch (error) {
    console.error('Post generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate post' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');

  try {
    const templates = postGenerator.getAllTemplates(
      platform as 'facebook' | 'instagram' | undefined
    );

    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
