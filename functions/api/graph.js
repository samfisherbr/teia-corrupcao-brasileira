export async function onRequest(context) {
  const { env } = context;

  try {
    const { results: nodes } = await env.DB.prepare("SELECT * FROM nodes").all();
    const { results: links } = await env.DB.prepare("SELECT * FROM links").all();

    return Response.json({ nodes, links }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}