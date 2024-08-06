import type { APIRoute } from 'astro';
import { getSession } from 'auth-astro/server';
export const GET: APIRoute = async ({ request }) => {
    const session = await getSession(request);
    if (!session || !session.user) {
        return new Response('No hay session de usuario', { status: 404 });
    }
    const user = {
        name: session.user.name?.split(' ')[0],
        email: session.user.email,
        image: session.user.image,
        id: session.user.id
    }
    return new Response(JSON.stringify(user))
}