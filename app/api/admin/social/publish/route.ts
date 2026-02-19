
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { FacebookService } from "@/lib/social";

const fbService = new FacebookService();

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // strict role check
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { message, imageUrl, link, platforms } = body;

        // platforms should be an array like ['facebook', 'instagram']
        const results: any = {};
        const errors: any = {};

        if (!platforms || !Array.isArray(platforms)) {
            return NextResponse.json({ error: "Invalid platforms specified" }, { status: 400 });
        }

        // Publish to Facebook
        if (platforms.includes('facebook')) {
            try {
                const res = await fbService.publishToFacebook({ message, imageUrl, link });
                results.facebook = res;
            } catch (err: any) {
                console.error("Facebook Publish Error:", err);
                errors.facebook = err.message || "Unknown error";
            }
        }

        // Publish to Instagram
        if (platforms.includes('instagram')) {
            if (!imageUrl) {
                errors.instagram = "Image URL is required for Instagram.";
            } else {
                try {
                    const res = await fbService.publishToInstagram(imageUrl, message || "");
                    results.instagram = res;
                } catch (err: any) {
                    console.error("Instagram Publish Error:", err);
                    errors.instagram = err.message || "Unknown error";
                }
            }
        }

        return NextResponse.json({
            success: Object.keys(errors).length === 0,
            results,
            errors
        });

    } catch (error: any) {
        console.error("Social Publish API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
