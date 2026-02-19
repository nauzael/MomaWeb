
import { PrismaClient } from '@prisma/client';
import { getSetting } from './settings';

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


    constructor() {
        // We now initialize these lazily or check DB in methods
    }

    /**
     * Helper to get config value from DB or Env
     */
    private async getConfig(key: string, envVar: string): Promise<string | null> {
        try {
            const dbValue = await getSetting(key);
            if (dbValue) return dbValue;
        } catch (e) {
            console.warn(`Failed to fetch setting ${key} from DB`, e);
        }
        return process.env[envVar] || null;
    }

    /**
     * Initialize or refresh the page access token if needed.
     */
    async getPageAccessToken(): Promise<string> {
        const token = await this.getConfig('fb_page_access_token', 'FACEBOOK_PAGE_ACCESS_TOKEN');
        if (token) return token;

        throw new Error("Facebook Page Access Token not configured. Please visit Settings.");
    }

    async getAppId(): Promise<string> {
        return (await this.getConfig('fb_app_id', 'NEXT_PUBLIC_FACEBOOK_APP_ID')) || '';
    }

    async getAppSecret(): Promise<string> {
        return (await this.getConfig('fb_app_secret', 'FACEBOOK_APP_SECRET')) || '';
    }

    async getPageId(): Promise<string> {
        return (await this.getConfig('fb_page_id', 'FACEBOOK_PAGE_ID')) || '';
    }

    async getInstagramId(): Promise<string> {
        return (await this.getConfig('instagram_account_id', 'INSTAGRAM_ACCOUNT_ID')) || '';
    }

    async exchangeForLongLivedToken(shortLivedToken: string): Promise<any> {
        const appId = await this.getAppId();
        const appSecret = await this.getAppSecret();

        const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;

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
        const pageId = await this.getPageId();

        if (!pageId) throw new Error("FACEBOOK_PAGE_ID not configured.");

        const url = `https://graph.facebook.com/v19.0/${pageId}/feed`;
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
                endpoint = `https://graph.facebook.com/v19.0/${pageId}/photos`;
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
        const instagramAccountId = await this.getInstagramId();

        if (!instagramAccountId) throw new Error("INSTAGRAM_ACCOUNT_ID not configured.");

        // Step 1: Create a media container
        const createMediaUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}/media`;

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
            const publishUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}/media_publish`;
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
