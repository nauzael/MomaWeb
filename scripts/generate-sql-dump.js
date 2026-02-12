
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually since we are running this as a standalone script
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateDump() {
    console.log('Fetching data from Supabase...');

    const { data: experiences, error } = await supabase
        .from('experiences')
        .select('*');

    if (error) {
        console.error('Error fetching experiences:', error);
        return;
    }

    console.log(`Found ${experiences.length} experiences.`);

    let sql = `-- Moma Web Data Dump\n-- Generated on ${new Date().toISOString()}\n\n`;
    sql += `USE momaexcu_web;\n\n`;

    // EXPERIENCES
    if (experiences.length > 0) {
        sql += `-- Table: experiences\n`;
        sql += `INSERT INTO experiences (id, title, slug, description, image, gallery, price_cop, price_usd, location_name, location_lat, location_lng, includes, excludes, recommendations, max_capacity, created_at) VALUES\n`;

        const values = experiences.map(exp => {
            const escape = (str) => {
                if (str === null) return 'NULL';
                if (typeof str === 'object') return `'${JSON.stringify(str).replace(/'/g, "\\'")}'`; // JSON columns
                return `'${String(str).replace(/'/g, "\\'")}'`;
            };

            const date = exp.created_at ? `'${new Date(exp.created_at).toISOString().slice(0, 19).replace('T', ' ')}'` : 'NOW()';

            return `(${escape(exp.id)}, ${escape(exp.title)}, ${escape(exp.slug)}, ${escape(exp.description)}, ${escape(exp.image)}, ${escape(exp.gallery)}, ${exp.price_cop || 'NULL'}, ${exp.price_usd || 'NULL'}, ${escape(exp.location_name)}, ${exp.location_lat || 'NULL'}, ${exp.location_lng || 'NULL'}, ${escape(exp.includes)}, ${escape(exp.excludes)}, ${escape(exp.recommendations)}, ${exp.max_capacity || 'NULL'}, ${date})`;
        });

        sql += values.join(',\n') + ';\n\n';
    }

    // BOOKINGS (Optional, maybe skip for now if structure changed, but good to have)
    const { data: bookings } = await supabase.from('bookings').select('*').limit(50);
    if (bookings && bookings.length > 0) {
        console.log(`Found ${bookings.length} bookings.`);
        // We might skip bookings migration for now to avoid FK issues if users table is empty, 
        // OR we fetch users too. 
        // For now, let's focus on CONTENT (Experiences).
    }

    const outputPath = path.join(__dirname, '../deploy/data_dump.sql');
    fs.writeFileSync(outputPath, sql);
    console.log(`SQL dump saved to ${outputPath}`);
}

generateDump();
