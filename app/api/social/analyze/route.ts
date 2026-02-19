import { NextRequest, NextResponse } from 'next/server';
import { contentAnalyzer } from '@/lib/services/content-analyzer';
import { fetchApi } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blogPostId, title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const analysis = await contentAnalyzer.analyzeBlogContent(content, title);

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        blogPostId
      }
    });
  } catch (error) {
    console.error('Content analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const blogPosts: { posts?: { id: string; title: string; content: string; cover_image?: string }[] } = await fetchApi('blog/list.php');
    
    const posts = blogPosts.posts || [];
    
    const simplifiedPosts = posts.map((post: { id: string; title: string; content: string; cover_image?: string }) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      coverImage: post.cover_image
    }));

    return NextResponse.json({
      success: true,
      posts: simplifiedPosts
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
