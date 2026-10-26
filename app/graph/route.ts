import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    // Access D1 database binding via Cloudflare context
    const { env } = getRequestContext();
    const DB = (env as any).DB;

    if (!DB) {
      return Response.json(
        { error: 'D1 database binding "DB" was not found in Cloudflare context.' },
        { status: 500 }
      );
    }

    // Execute SQLite queries on Cloudflare D1
    const { results: nodes } = await DB.prepare("SELECT * FROM nodes").all();
    const { results: links } = await DB.prepare("SELECT * FROM links").all();

    return Response.json({ nodes, links });
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Error executing query on D1 database' },
      { status: 500 }
    );
  }
}