import { CreateWebWorkerMLCEngine, WebWorkerMLCEngine } from "@mlc-ai/web-llm";
import type { ModelSelectedUser, Role, User, MessagesInterface } from "../../types/index.ts";
import { ModelsIA } from "../../types/index.ts";
import { getMessage, saveMessage, validateMessage } from "../../utils/index.ts";
const container_messages = document.querySelector(
    ".container_messages",
) as HTMLUListElement;
const template = document.querySelector(
    ".template_message",
) as HTMLTemplateElement;
const form = document.querySelector(".form_chat") as HTMLFormElement;
const input = form?.querySelector("input") as HTMLInputElement;
const button = form?.querySelector("button") as HTMLButtonElement;
const errorMessage = document.querySelector("small") as HTMLSpanElement;
const gpu_info = document.querySelector(".gpu_info") as HTMLSpanElement;
const form_select_model = document.querySelector(
    ".form_model_select",
) as HTMLFormElement;
let engine: WebWorkerMLCEngine;
let selectedModel: ModelsIA;
let model_selected: ModelSelectedUser;
let userInfo: User;
const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: 'module' })
let messages: MessagesInterface[] = [];

worker.addEventListener('error', (msg) => {
    console.log('Ocurri un error en el worker', msg)
})

async function SelectModelEngine(e: SubmitEvent) {
    e.preventDefault();
    const value_selected = new FormData(form_select_model).get(
        "model_selector",
    );
    model_selected = value_selected as ModelSelectedUser;
    if (!ModelsIA[model_selected]) {
        alert("El modelo que estas seleccionando no existe");
        return;
    }
    selectedModel = ModelsIA[model_selected] ?? ModelsIA['smol'];
    const newEngine = await CreateEngine(selectedModel);
    engine = newEngine!;
}
async function DOMloaded() {
    const resp = await fetch('/api/getUser');
    if (!resp.ok) return
    userInfo = await resp.json();
    const infoStorage = getMessage(userInfo.email);
    if (!infoStorage) return
    const { messagesLocal = [], model = 'tiny' } = infoStorage;
    const value_selected = document.getElementById('model_selector') as HTMLSelectElement;
    messagesLocal.map(message => {
        messages.push(message);
        CreateMessage(message.role, message.content)
    });
    value_selected.value = model;
    model_selected = model;
}
async function CreateMessage(role: Role, message: string) {
    const template_message = template.content.cloneNode(
        true,
    ) as HTMLElement;
    const message_container = template_message.querySelector(
        ".message",
    ) as HTMLLIElement;
    const sender_image = message_container.querySelector('.sender_image') as HTMLImageElement;
    const span_role = message_container.querySelector(
        "span",
    ) as HTMLSpanElement;
    const text = message_container.querySelector(
        "p",
    ) as HTMLParagraphElement;
    const image_user = userInfo.image ?? "../../../public/user.png";
    const image_bot = "../../../public/bot.png";
    const user_name = userInfo.name ?? 'Tú';

    message_container.classList.add(role);
    sender_image.setAttribute('src', role === 'user' ? image_user : image_bot);
    span_role.textContent = role === 'user' ? user_name : 'Bot';
    text.textContent = message;

    container_messages?.appendChild(message_container);
    container_messages.scrollTop = container_messages.scrollHeight;
    return text;
}
async function GenerateMessageBot(engine: WebWorkerMLCEngine) {
    let reply = "";
    // const response = await engine.chat.completions.create({
    //     messages,
    //     temperature: 1,
    //     stream: true,
    // });
    // const textParagraph = CreateMessage("assistant", "");
    // for await (const chunk of response) {
    //     const [choice] = chunk.choices;
    //     //choice?.delta? ---->  {role:'assistand', content:''}
    //     const content = choice?.delta?.content ?? "";
    //     reply += content;
    //     textParagraph.textContent = reply;
    // }
    // const botMessage: MessagesInterface = {
    //     role: "assistant",
    //     content: reply,
    // };
    //SIN APLICAR EL STREAM, es decir, me devuelve el contenido una vez se haya completado la 
    //repuesta de la IA
    // //response.choices[0].message ----> {role:'assistand', content:''}
    // const botMessage = response.choices[0].message;
    // if (!botMessage.content) {
    // 	return;
    // }
    //CreateMessage(botMessage.role,botMessage.content);
    //return  botMessage
}
async function CreateEngine(selectedModel: string) {
    const modal = document.getElementById('myModal') as HTMLDivElement;
    const info_load_engine = modal.querySelector('.content-load-engine') as HTMLSpanElement;
    if (!selectedModel) {
        alert('Por favor selecciona modelo antes enviar un mensaje.')
        return
    }
    const newEngine = await CreateWebWorkerMLCEngine(
        worker,
        "SmolLM-135M-Instruct-q4f32_1-MLC",
        {
            initProgressCallback: (info) => {
                console.log(info);
                if (info.progress === 1) {
                    info_load_engine.textContent = 'Completado.';
                    modal.style.display = 'none';
                    button.removeAttribute("disabled");
                    gpu_info.textContent = info.text;
                } else {
                    button.setAttribute("disabled", 'true');
                    modal.style.display = 'block';
                    info_load_engine.textContent = info.text;
                }
            },
        },
    );
    if (!newEngine) {
        alert('Ocurrio un error al cargar el modelo, por favor intentalo mas tarde.')
        return
    }
    return newEngine
}
async function AddMessagesToChat(e: SubmitEvent) {
    e.preventDefault();
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
    if (!selectedModel) {
        alert('Por favor selecciona modelo antes de enviar un mensaje.')
        return
    }
    //Validando mensaje de usuario
    let message = input.value.trim();
    const messageValdated = validateMessage(message);
    if (messageValdated.error) {
        errorMessage.style.display = "block";
        errorMessage.textContent = messageValdated.message!;
        return;
    }

    errorMessage.style.display = "none";
    errorMessage.textContent = "";

    //Agregando mensaje de usuario
    const userMessage: MessagesInterface = {
        role: 'user',
        content: message,
    };
    CreateMessage("user", message);
    input.value = "";
    button.setAttribute('disabled', 'true');

    // const botMessage = await GenerateMessageBot(engine);
    // messages.push(botMessage, userMessage);
    messages.push(userMessage, { role: 'assistant', content: 'hola' });
    button.removeAttribute("disabled");
    container_messages.scrollTop = container_messages.scrollHeight;
    const infoToSave = {
        messages,
        model: model_selected,
        email: userInfo.email,
        name: userInfo.name
    }
    saveMessage(infoToSave)
}
document.addEventListener('DOMContentLoaded', DOMloaded)
form_select_model.addEventListener("submit", SelectModelEngine);
form?.addEventListener("submit", AddMessagesToChat);