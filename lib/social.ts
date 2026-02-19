
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SocialPostContent {
    message?: string;
    imageUrl?: string; // URL of the image to post
    link?: string;     // URL to include in the post
}

interface MetaTokens {
    accessToken: string;
    pageId: string;
    instagramAccountId?: string;
}

export class FacebookService {
    private appId: string;
    private appSecret: string;
    private pageAccessToken: string | null = null;
    private pageId: string | null = null;
    private instagramAccountId: string | null = null;

    constructor() {
        this.appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';
        this.appSecret = process.env.FACEBOOK_APP_SECRET || '';
        this.pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null;
        this.pageId = process.env.FACEBOOK_PAGE_ID || null;
        this.instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID || null;
    }

    /**
     * Initialize or refresh the page access token if needed.
     *Ideally, you should store the long-lived token in the database.
     */
    async getPageAccessToken(): Promise<string> {
        if (this.pageAccessToken) return this.pageAccessToken;

        // Fallback: If no env var, try to fetch from DB or prompt user to auth (not implemented here entirely without DB schema for settings)
        throw new Error("FACEBOOK_PAGE_ACCESS_TOKEN not configured in environment variables.");
    }

    /**
     * Exchange a short-lived user access token for a long-lived one.
     */
    async exchangeForLongLivedToken(shortLivedToken: string): Promise<any> {
        const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${this.appSecret}&fb_exchange_token=${shortLivedToken}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data; // Contains access_token and expires_in
        } catch (error) {
            console.error("Error exchanging token:", error);
            throw error;
        }
    }

    /**
     * Publish a post to Facebook Page.
     */
    async publishToFacebook(content: SocialPostContent): Promise<any> {
        const token = await this.getPageAccessToken();
        if (!this.pageId) throw new Error("FACEBOOK_PAGE_ID not configured.");

        const url = `https://graph.facebook.com/v19.0/${this.pageId}/feed`;
        const body: any = {
            access_token: token,
            message: content.message,
        };

        if (content.link) body.link = content.link;
        // Note: If uploading an image file directly, use form-data. If URL, use 'url' param or 'link'. 
        // For photo explicitly: /{page-id}/photos with 'url' param.

        try {
            let endpoint = url;
            if (content.imageUrl) {
                endpoint = `https://graph.facebook.com/v19.0/${this.pageId}/photos`;
                body.url = content.imageUrl;
                body.caption = content.message; // Facebook photos use 'caption', not 'message' usually for the text
                delete body.message;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (data.error) throw new Error(`Facebook API Error: ${data.error.message}`);
            return data;
        } catch (error) {
            console.error("Error publishing to Facebook:", error);
            throw error;
        }
    }

    /**
     * Publish a photo to Instagram (Content Publishing API).
     * Note: Instagram Graph API primarily supports publishing media (images/videos), not text-only posts.
     */
    async publishToInstagram(imageUrl: string, caption: string): Promise<any> {
        const token = await this.getPageAccessToken(); // Usually the same page token if accounts are linked, or a dedicated one
        if (!this.instagramAccountId) throw new Error("INSTAGRAM_ACCOUNT_ID not configured.");

        // Step 1: Create a media container
        const createMediaUrl = `https://graph.facebook.com/v19.0/${this.instagramAccountId}/media`;

        try {
            const containerResponse = await fetch(createMediaUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_url: imageUrl,
                    caption: caption,
                    access_token: token
                }),
            });

            const containerData = await containerResponse.json();
            if (containerData.error) throw new Error(`IG Container Error: ${containerData.error.message}`);

            const creationId = containerData.id;

            // Step 2: Publish the media container
            const publishUrl = `https://graph.facebook.com/v19.0/${this.instagramAccountId}/media_publish`;
            const publishResponse = await fetch(publishUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creation_id: creationId,
                    access_token: token
                }),
            });

            const publishData = await publishResponse.json();
            if (publishData.error) throw new Error(`IG Publish Error: ${publishData.error.message}`);

            return publishData;
        } catch (error) {
            console.error("Error publishing to Instagram:", error);
            throw error;
        }
    }
}
