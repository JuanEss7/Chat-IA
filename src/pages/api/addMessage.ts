// import type { APIRoute } from "astro";
// import { db, Messages } from "astro:db";
// import { getSession } from "auth-astro/server";


// export const POST: APIRoute = async ({ request }) => {
//     const session = await getSession(request);
//     if (!session?.user) {
//         return new Response('No hay un usuario', { status: 400 })
//     }
//     const body = await request.json();
//     if (!body.messages) {
//         return new Response('No se ha encontrado ningun mensaje', { status: 400 });
//     }
//     const { messages, selectedModel } = body;
//     const userMessage = messages.at(-1).find(user => user.role === 'user');
//     const botMessage = messages.at(-1).find(user => user.role === 'assistant');
//     //Insterar el mensaje en la base de datos
//     // try {
//     //     const newMessage = await db.insert(Messages).values({
//     //         messageBot: botMessage.content,
//     //         messageUser: userMessage.content,
//     //         modeloIA: selectedModel,
//     //         sendedAt: new Date(),
//     //         userId: session.user.email
//     //     })
//     // } catch (error) {

//     // }
//     return new Response(JSON.stringify({ succes: true }))
// }
