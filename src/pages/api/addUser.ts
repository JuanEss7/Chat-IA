import type { APIRoute } from "astro";
import { db, User } from "astro:db";
import { getSession } from "auth-astro/server";

export const GET: APIRoute = async ({ request }) => {
    const session = await getSession(request);
    if (!session) {
        return new Response(JSON.stringify({ ok: false }), { status: 401 })
    }
    if (!session?.user) {
        return new Response(JSON.stringify({ ok: false }), { status: 401 })
    }
    const { name, email } = session?.user;
    try {
        const users = await db.select().from(User);
        const existUser = users.some(user => user.email === email);
        if (!existUser) {
            await db.insert(User).values({
                name: name as string,
                email: email as string
            })
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 })
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ ok: false, message: 'Erro del servidor, revisar logs' }), { status: 500 })
    }
}