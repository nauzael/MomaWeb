import { Metadata } from 'next';
import { fetchApi, getImageUrl } from '@/lib/api-client';
import BlogPostClient from '../components/BlogPostClient';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const data = await fetchApi<any>(`blog/get.php?slug=${slug}`);
        const post = data.post;

        if (!post) return { title: 'Entrada no encontrada | Moma Excursiones' };

        const title = `${post.title} | Blog Moma Excursiones`;
        const description = post.excerpt || 'Descubre más sobre nuestras expediciones y aventuras en Moma Excursiones.';

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: post.cover_image ? [getImageUrl(post.cover_image)] : [],
                type: 'article',
                publishedTime: post.created_at,
                authors: [post.author_name || 'Moma Excursiones'],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: post.cover_image ? [getImageUrl(post.cover_image)] : [],
            }
        };
    } catch (error) {
        return { title: 'Blog | Moma Excursiones' };
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    let post = null;
    let relatedPosts = [];

    try {
        const data = await fetchApi<any>(`blog/get.php?slug=${slug}`);
        post = data.post;

        // Fetch related posts
        const listData = await fetchApi<any>('blog/list.php?status=published&limit=3');
        relatedPosts = (listData.posts || []).filter((p: any) => p.slug !== slug);
    } catch (error) {
        console.error('Error loading blog post:', error);
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 text-center px-6">
                <h1 className="text-4xl font-black italic mb-4">Esta historia aún no ha sido escrita...</h1>
                <a href="/blog" className="flex items-center gap-2 text-stone-900 dark:text-white font-black uppercase text-xs tracking-widest hover:gap-4 transition-all">
                    Volver al Blog
                </a>
            </div>
        );
    }

    // JSON-LD for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.cover_image ? getImageUrl(post.cover_image) : undefined,
        datePublished: post.created_at,
        dateModified: post.updated_at || post.created_at,
        author: {
            '@type': 'Person',
            name: post.author_name || 'Moma Excursiones',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Moma Excursiones',
            logo: {
                '@type': 'ImageObject',
                url: 'https://momaexcursiones.co/logo.png', // Fallback URL
            },
        },
        description: post.excerpt,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogPostClient post={post} relatedPosts={relatedPosts} />
        </>
    );
}
