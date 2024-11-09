import type { MessagesInterface, ModelSelectedUser } from "../../types";
interface Values {
    messages: MessagesInterface[],
    conversation: MessagesInterface[],
    model: ModelSelectedUser,
    email: string,
    name: string
}
export function saveMessage(content: Values) {
    const { email, messages, model, conversation } = content;
    const infoToSave = {
        email,
        model,
        messages,
        conversation
    }
    return window.localStorage.setItem(email, JSON.stringify(infoToSave))
}
//Estructura del mensaje
//{
//     messages: [
//       [
//         { role: 'assistant', content: 'hola' },
//         { role: 'user', content: 'Hola' }
//       ],
//       [
//         { role: 'assistant', content: 'hola' },
//         { role: 'user', content: 'asdasdas' }
//       ],
//       [
//         { role: 'assistant', content: 'hola' },
//         { role: 'user', content: 'asdasd' }
//       ]
//     ],
//     selectedModel: 'TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC',
//     email: 'user@gmail.com'
//   }