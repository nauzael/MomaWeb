export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
    try {
        console.log('--- STARTING STATIC GENERATION ---');
        // Usar fetch directo para evitar side effects del api-client durante el build
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://momaexcursiones.co/api';
        const res = await fetch(`${apiUrl}/blog/list.php?status=published`);
        const data = await res.json();
        const posts = data.posts || [];

        console.log(`--- GENERATING ${posts.length} BLOG POSTS ---`);

        if (posts.length === 0) {
            return [{ slug: 'bienvenida' }];
        }

        return posts.map((post: any) => ({
            slug: post.slug,
        }));
    } catch (error) {
        console.error('--- BUILD ERROR IN generateStaticParams ---', error);
        return [{ slug: 'bienvenida' }];
    }
}

export default function BlogPostPage({ params }: { params: any }) {
    // Componente mínimo para probar el build
    return (
        <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-4xl font-bold italic">Cargando Historia...</h1>
        </div>
    );
}
