export async function onRequestDelete({ params, env }) {
  try {
    await env.DB.prepare('DELETE FROM kids WHERE id = ?').bind(params.id).run();
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function onRequestPut({ params, request, env }) {
  try {
    const { name, color, avatar } = await request.json();
    if (!name?.trim()) return Response.json({ error: 'Name required' }, { status: 400 });
    await env.DB.prepare(
      'UPDATE kids SET name = ?, color = ?, avatar = ? WHERE id = ?'
    ).bind(name.trim(), color, avatar, params.id).run();
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
