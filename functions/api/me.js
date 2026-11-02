export async function onRequestGet({ request, env }) {
  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();
  if (!email) return Response.json({ error: "email required" }, { status: 400 });
  try {
    const admin = await env.DB.prepare("SELECT 1 FROM admin_users WHERE email = ?")
      .bind(email)
      .first();
    return Response.json({ isAdmin: Boolean(admin) });
  } catch (error) {
    console.error("Failed to determine user role", error);
    return Response.json({ error: "Unable to verify user role" }, { status: 500 });
  }
}
