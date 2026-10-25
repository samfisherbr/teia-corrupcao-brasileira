export async function onRequest(context) {
  const { env } = context;

  try {
    // Consulta os nós e conexões no Cloudflare D1 Database
    const { results: nodes } = await env.DB.prepare("SELECT * FROM nodes").all();
    const { results: links } = await env.DB.prepare("SELECT * FROM links").all();

    return new Response(JSON.stringify({ nodes, links }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
