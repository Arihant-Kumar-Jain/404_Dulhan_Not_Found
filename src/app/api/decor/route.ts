import { NextResponse } from 'next/server';
import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 5,
        });
    }
    return pool;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');   // function_type
    const style = searchParams.get('style');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    try {
        const db = getPool();
        let query = `SELECT source_id, source, function_type, style, original_url, width, height, tags, author, complexity_tier, cost_estimate FROM decor_library WHERE 1=1`;
        const params: (string | number)[] = [];
        let idx = 1;

        if (search) {
            // "Semantic" search — searches tags, function_type, style
            query += ` AND (tags ILIKE $${idx} OR function_type ILIKE $${idx} OR style ILIKE $${idx})`;
            params.push(`%${search}%`);
            idx++;
        }

        if (category && category !== 'All') {
            query += ` AND function_type = $${idx++}`;
            params.push(category);
        }
        if (style && style !== 'All Styles') {
            query += ` AND style = $${idx++}`;
            params.push(style);
        }

        query += ` ORDER BY RANDOM() LIMIT $${idx++} OFFSET $${idx++}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        const images = result.rows.map((row: Record<string, unknown>) => ({
            id: row.source_id as string,
            url: row.original_url as string,
            thumb: row.original_url as string,
            category: row.function_type as string,
            style: row.style as string,
            complexity: (row.complexity_tier as number) || Math.floor(Math.random() * 5) + 1,
            estimatedCost: (row.cost_estimate as string) || '₹5–15L',
            photographer: row.author as string || row.source as string || 'Unknown',
            width: row.width as number || 0,
            height: row.height as number || 0,
        }));

        return NextResponse.json({ images, total: images.length });
    } catch (error) {
        console.error('Decor API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch images', details: String(error) },
            { status: 500 }
        );
    }
}
