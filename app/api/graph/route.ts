import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext();
    const DB = (env as any).DB;

    if (!DB) {
      return Response.json(
        { error: 'D1 database binding "DB" not found.' },
        { status: 500 }
      );
    }

    const { results: nodes } = await DB.prepare("SELECT * FROM nodes").all();
    const { results: links } = await DB.prepare("SELECT * FROM links").all();

    return Response.json({ nodes, links });
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'D1 Database Query Error' },
      { status: 500 }
    );
  }
}