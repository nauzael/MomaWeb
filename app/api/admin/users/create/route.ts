import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // 1. Verify Caller is Admin
        const supabaseUser = await createClient();
        const { data: { user } } = await supabaseUser.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await supabaseUser
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
        }

        // 2. Parse Body
        const { email, password, role_id } = await request.json();

        if (!email || !password || !role_id) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 3. Create User in Auth (Admin Context)
        const supabaseAdmin = createAdminClient();
        
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        const newUserId = authData.user.id;

        // 4. Update Profile with Role
        // The trigger creates a default profile, we update it immediately
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ 
                role_id: role_id,
                // Optional: Map role_id to role string for legacy support if needed
                role: 'user' // Default to user, let role_id handle permissions
            })
            .eq('id', newUserId);

        if (profileError) {
            // Rollback auth user if profile fails? 
            // For now just report error
            return NextResponse.json({ error: "User created but profile update failed: " + profileError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, userId: newUserId });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
