import { NextRequest, NextResponse } from 'next/server';
import { fetchApi } from '@/lib/api-client';

interface SocialPost {
  id: string;
  blog_post_id: string;
  platform: string;
  account_id: string;
  status: string;
  content_original: string;
  content_adapted: string;
  media_urls: string;
  external_post_id: string;
  published_at: string;
  scheduled_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  reach_count: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');

    const allPosts: { posts?: { id: string; title: string; cover_image?: string }[] } = await fetchApi('blog/list.php');
    const blogPosts = allPosts.posts || [];

    let socialPosts: SocialPost[] = blogPosts.slice(0, 10).map((post: { id: string; title: string; cover_image?: string }, index: number) => ({
      id: crypto.randomUUID(),
      blog_post_id: post.id,
      platform: ['facebook', 'instagram'][index % 2],
      account_id: 'demo-account',
      status: index < 3 ? 'published' : index < 6 ? 'scheduled' : 'draft',
      content_original: post.title,
      content_adapted: post.title,
      media_urls: JSON.stringify([post.cover_image || '/images/hero-bg.jpg']),
      external_post_id: index < 3 ? `fb_${crypto.randomUUID()}` : '',
      published_at: index < 3 ? new Date(Date.now() - index * 86400000).toISOString() : '',
      scheduled_at: index >= 3 && index < 6 ? new Date(Date.now() + (6 - index) * 86400000).toISOString() : '',
      likes_count: Math.floor(Math.random() * 100),
      comments_count: Math.floor(Math.random() * 20),
      shares_count: Math.floor(Math.random() * 10),
      reach_count: Math.floor(Math.random() * 500),
      created_at: new Date(Date.now() - index * 86400000).toISOString()
    }));

    if (platform) {
      socialPosts = socialPosts.filter(p => p.platform === platform);
    }
    if (status) {
      socialPosts = socialPosts.filter(p => p.status === status);
    }

    const total = socialPosts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedPosts = socialPosts.slice(startIndex, startIndex + limit);

    const formattedPosts = paginatedPosts.map(post => ({
      id: post.id,
      blogPostId: post.blog_post_id,
      blogPostTitle: blogPosts.find((b: { id: string }) => b.id === post.blog_post_id)?.title || 'Blog Post',
      platform: post.platform,
      accountName: 'Moma Excursiones',
      status: post.status,
      contentAdapted: post.content_adapted,
      mediaUrls: JSON.parse(post.media_urls || '[]'),
      externalPostId: post.external_post_id,
      publishedAt: post.published_at,
      scheduledAt: post.scheduled_at,
      metrics: {
        likes: post.likes_count,
        comments: post.comments_count,
        shares: post.shares_count,
        reach: post.reach_count
      },
      thumbnail: JSON.parse(post.media_urls || '[]')[0],
      createdAt: post.created_at
    }));

    return NextResponse.json({
      success: true,
      history: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blogPostId, platform, content, mediaUrls, scheduledAt, publishNow } = body;

    if (!blogPostId || !platform || !content) {
      return NextResponse.json(
        { success: false, error: 'blogPostId, platform and content are required' },
        { status: 400 }
      );
    }

    const newPost = {
      id: crypto.randomUUID(),
      blog_post_id: blogPostId,
      platform,
      account_id: 'demo-account',
      status: publishNow ? 'published' : scheduledAt ? 'scheduled' : 'draft',
      content_original: JSON.stringify(content),
      content_adapted: typeof content === 'string' ? content : JSON.stringify(content),
      media_urls: JSON.stringify(mediaUrls || []),
      external_post_id: publishNow ? `ext_${crypto.randomUUID()}` : '',
      published_at: publishNow ? new Date().toISOString() : '',
      scheduled_at: scheduledAt || '',
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      reach_count: 0,
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      post: newPost,
      message: publishNow ? 'Post published successfully' : scheduledAt ? 'Post scheduled successfully' : 'Draft saved successfully'
    });
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save post' },
      { status: 500 }
    );
  }
}
