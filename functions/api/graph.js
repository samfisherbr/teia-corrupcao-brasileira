// /functions/api/graph.js
export async function onRequest(context) {
  try {
    // Busca todos os nós e conexões do banco D1
    const { results: nodes } = await context.env.DB.prepare("SELECT * FROM nodes").all();
    const { results: links } = await context.env.DB.prepare("SELECT * FROM links").all();

    return new Response(JSON.stringify({ nodes, links }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
