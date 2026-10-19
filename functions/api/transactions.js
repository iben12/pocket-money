const INCOME = new Set(['chore', 'pocket_money']);

export async function onRequestGet({ request, env }) {
  try {
    const kidId = new URL(request.url).searchParams.get('kid_id');
    if (!kidId) return Response.json({ error: 'kid_id required' }, { status: 400 });
    const { results } = await env.DB.prepare(
      'SELECT * FROM transactions WHERE kid_id = ? ORDER BY date DESC, id DESC'
    ).bind(kidId).all();
    return Response.json(results);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const { kid_id, date, memo, category, amount } = await request.json();
    if (!kid_id || !date || !category || amount == null) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const signedAmount = INCOME.has(category) ? Math.abs(amount) : -Math.abs(amount);
    const result = await env.DB.prepare(
      'INSERT INTO transactions (kid_id, date, memo, category, amount) VALUES (?, ?, ?, ?, ?)'
    ).bind(kid_id, date, memo || '', category, signedAmount).run();
    return Response.json({ id: result.meta.last_row_id }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
