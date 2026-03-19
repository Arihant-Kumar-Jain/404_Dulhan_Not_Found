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
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    try {
        const db = getPool();

        // Get total count of unlabeled images
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM decor_library WHERE is_tagged = false`
        );
        const total = parseInt(countResult.rows[0].total, 10);

        // Get unlabeled images
        const result = await db.query(
            `SELECT source_id, source, function_type, style, original_url, width, height, tags, author
       FROM decor_library
       WHERE is_tagged = false
       ORDER BY source_id
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const images = result.rows.map((row: Record<string, unknown>) => ({
            id: row.source_id as string,
            url: row.original_url as string,
            thumb: row.original_url as string,
            category: row.function_type as string,
            style: row.style as string,
            tags: row.tags as string,
            author: row.author as string || row.source as string || 'Unknown',
            width: row.width as number || 0,
            height: row.height as number || 0,
        }));

        return NextResponse.json({ images, total });
    } catch (error) {
        console.error('Unlabeled API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch unlabeled images', details: String(error) },
            { status: 500 }
        );
    }
}
