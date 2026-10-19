export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(`
      SELECT k.id, k.name, k.color, k.avatar,
             COALESCE(SUM(t.amount), 0) AS balance
      FROM kids k
      LEFT JOIN transactions t ON t.kid_id = k.id
      GROUP BY k.id
      ORDER BY k.name
    `).all();
    return Response.json(results);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const { name, color, avatar } = await request.json();
    if (!name?.trim()) return Response.json({ error: 'Name required' }, { status: 400 });
    const result = await env.DB.prepare(
      'INSERT INTO kids (name, color, avatar) VALUES (?, ?, ?)'
    ).bind(name.trim(), color || '#6366f1', avatar || '😊').run();
    return Response.json({ id: result.meta.last_row_id }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
