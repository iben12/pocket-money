export async function onRequestDelete({ params, env }) {
  try {
    await env.DB.prepare('DELETE FROM transactions WHERE id = ?').bind(params.id).run();
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
