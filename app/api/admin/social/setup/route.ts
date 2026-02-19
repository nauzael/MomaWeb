
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { setSetting, getSetting } from "@/lib/settings";
import { FacebookService } from "@/lib/social";

const fbService = new FacebookService();

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // strict role check
        if (!session || (session.user as any).role?.toLowerCase() !== 'admin') {
            // Allow superadmin too if needed, but for now strict admin
            const role = (session?.user as any)?.role?.toLowerCase();
            if (role !== 'admin' && role !== 'superadmin' &&
                session?.user?.email !== 'admin@momaturismo.com' &&
                session?.user?.email !== 'admin@moma.com') {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        const body = await req.json();
        const { action, appId, appSecret, shortLivedToken, pageId, instagramId } = body;

        // ACTION: SAVE_CREDENTIALS
        // Just saving the App ID and Secret
        if (action === 'save_credentials') {
            if (!appId || !appSecret) {
                return NextResponse.json({ error: "App ID and Secret are required" }, { status: 400 });
            }
            await setSetting('fb_app_id', appId, 'Facebook App ID');
            await setSetting('fb_app_secret', appSecret, 'Facebook App Secret');
            return NextResponse.json({ success: true });
        }

        // ACTION: EXCHANGE_TOKEN
        // Client sends a short-lived token from "Login with Facebook" button
        // We exchange it for a long-lived one and save it.
        if (action === 'exchange_token') {
            if (!shortLivedToken) {
                return NextResponse.json({ error: "Short lived token required" }, { status: 400 });
            }

            try {
                // 1. Get User Long-Lived Token
                const data = await fbService.exchangeForLongLivedToken(shortLivedToken);
                const userLongLivedToken = data.access_token;

                // 2. Get Page Access Token (We need the Page ID to get the specific page token)
                // If we don't know the page ID yet, we might need to list pages first?
                // For simplicity, let's assume we want to just store the user token first OR list pages.
                // BETTER FLOW: 
                // 1. Exchange user token.
                // 2. Return the user token to client? Or use it to list pages.

                // Let's Fetch Pages with this token to let user select
                const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userLongLivedToken}`);
                const pagesData = await pagesRes.json();

                if (pagesData.error) throw new Error(pagesData.error.message);

                return NextResponse.json({
                    success: true,
                    pages: pagesData.data, // list of {id, name, access_token, instagram_business_account}
                    userAccessToken: userLongLivedToken
                });

            } catch (e: any) {
                console.error("Token Exchange Error", e);
                return NextResponse.json({ error: e.message || "Failed to exchange token" }, { status: 500 });
            }
        }

        // ACTION: SAVE_PAGE_CONFIG
        // User selected a page. We save the Page ID, Instagram ID, and THAT PAGE'S specific access token.
        if (action === 'save_page_config') {
            if (!pageId || !body.pageToken) {
                return NextResponse.json({ error: "Page ID and Token required" }, { status: 400 });
            }

            await setSetting('fb_page_id', pageId, 'Facebook Page ID');
            await setSetting('fb_page_access_token', body.pageToken, 'Facebook Page Access Token (Long Lived)');

            if (instagramId) {
                await setSetting('instagram_account_id', instagramId, 'Instagram Business Account ID');
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("Settings API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    // Return current config status (masked)
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const appId = await getSetting('fb_app_id');
        const pageId = await getSetting('fb_page_id');
        const igId = await getSetting('instagram_account_id');
        const hasSecret = !!(await getSetting('fb_app_secret'));
        const hasToken = !!(await getSetting('fb_page_access_token'));

        return NextResponse.json({
            appId,
            pageId,
            instagramId: igId,
            isConfigured: !!(appId && hasSecret && pageId && hasToken)
        });
    } catch (e) {
        return NextResponse.json({ error: "Error fetching settings" }, { status: 500 });
    }
}
