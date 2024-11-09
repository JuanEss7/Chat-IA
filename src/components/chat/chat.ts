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
const modal = document.getElementById('myModal') as HTMLDivElement;
const info_load_engine = modal.querySelector('.content-load-engine') as HTMLSpanElement;
const form_select_model = document.querySelector(
    ".form_model_select",
) as HTMLFormElement;
const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: 'module' })
let engine: WebWorkerMLCEngine | null;
let selectedModel: ModelsIA;
let model_selected: ModelSelectedUser;
let userInfo: User;
//Array que contendra los mensajes que se crean al momento de usar un modelo
//Cada vez que se cambie de modelo se limpiara con el fin de no afectar el siguiente modelo
let messages: MessagesInterface[] = [];
//Array que contiene todos los mensajes generados con todos los modelos de IA
let conversation: MessagesInterface[] = [];

worker.addEventListener('error', (msg) => {
    console.log('Ocurri un error en el worker', msg)
})

//Funcion que obtiene el modelo IA seleccionado por el usuario y ejecuta la funcion createEngine
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
    selectedModel = ModelsIA[model_selected] ?? ModelsIA['tiny'];
    const newEngine = await CreateEngine(selectedModel);
    if (newEngine) {
        engine = newEngine;
        //Cada vez que se escoja un nuevo modelo se limpiara con el fin de no afectar la conversacion con el nuevo modelo.
        messages = [];
    } else {
        alert('Ocurrio un error al cargar el modelo, por favor intentalo mas tarde.');
        info_load_engine.textContent = 'Completado.';
        modal.style.display = 'none';
        button.removeAttribute("disabled");
        gpu_info.textContent = '';
    }
}
//Funcion que se ejecuta al momento de que carga la pagina, obtiene el usuario, el modelo de IA
//Y la conversacion guardada en el localStorge
async function DOMloaded() {
    const resp = await fetch('/api/getUser');
    if (!resp.ok) return
    userInfo = await resp.json();
    const infoStorage = getMessage(userInfo.email);
    if (!infoStorage) return
    const { conversationLocal = [], model = 'tiny', messagesLocal = [] } = infoStorage;
    const value_selected = document.getElementById('model_selector') as HTMLSelectElement;
    messages = messagesLocal
    conversationLocal.map(message => {
        conversation.push(message);
        CreateMessage(message.role, message.content)
    });
    value_selected.value = model;
    model_selected = model;
}
//Funcion que crea la estructura html de un mensaje
function CreateMessage(role: Role, message: string) {
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
    const image_user = userInfo.image ? userInfo.image : "/public/user.png";
    const image_bot = "/public/bot.png";
    const user_name = userInfo.name ?? 'Tú';

    message_container.classList.add(role);
    sender_image.setAttribute('src', role === 'user' ? image_user : image_bot);
    span_role.textContent = role === 'user' ? user_name : 'Bot';
    text.textContent = message;

    container_messages?.appendChild(message_container);
    container_messages.scrollTop = container_messages.scrollHeight;
    return text;
}
//Funcion que obtiene el la respuesta generada por la IA y la retorna
async function GenerateMessageBot(engine: WebWorkerMLCEngine) {
    let reply = "";
    if (!engine) return
    const response = await engine.chat.completions.create({
        messages,
        temperature: 1,
        stream: true,
    });
    const textParagraph = CreateMessage("assistant", "");
    for await (const chunk of response) {
        const [choice] = chunk.choices;
        //choice?.delta? ---->  {role:'assistand', content:''}
        const content = choice?.delta?.content ?? "";
        reply += content;
        textParagraph.textContent = reply;
    }
    const botMessage: MessagesInterface = {
        role: "assistant",
        content: reply,
    };
    // SIN APLICAR EL STREAM, me devuelve el contenido una vez se haya completado la 
    // repuesta de la IA y se haria de la siguiente forma
    //response.choices[0].message ----> {role:'assistand', content:''}
    // const botMessage = response.choices[0].message;
    if (!botMessage.content) {
        return { role: botMessage.role, content: 'Lo siento mucho, no puedo ayudarte en este momento' };
    }
    return botMessage
}
//Funcion que crea y retorna el modelo de IA basandose en el modelo que selecciono el usuario
//Retorna null en caso de no poder crearse el modelo
async function CreateEngine(selectedModel: string) {
    if (!selectedModel) {
        alert('Por favor selecciona modelo antes enviar un mensaje.')
        return
    }
    let newEngine;
    try {
        newEngine = await CreateWebWorkerMLCEngine(
            worker,
            selectedModel,
            {
                initProgressCallback: (info) => {
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
        return newEngine
    } catch (error) {
        console.log(error)
        return null
    }

}
//Funcion que agraga los mensajes obtenidos del usurio y el bot al DOM. Agrega los mjs al localStorage
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
    messages.push(userMessage)
    input.value = "";
    button.setAttribute('disabled', 'true');

    const botMessage = await GenerateMessageBot(engine!) as MessagesInterface;
    messages.push({ role: botMessage.role, content: botMessage.content });

    conversation.push(userMessage, { role: botMessage.role, content: botMessage.content })
    button.removeAttribute("disabled");
    container_messages.scrollTop = container_messages.scrollHeight;
    const infoToSave = {
        messages,
        conversation,
        model: model_selected,
        email: userInfo.email,
        name: userInfo.name
    }
    saveMessage(infoToSave)
}
document.addEventListener('DOMContentLoaded', DOMloaded)
form_select_model.addEventListener("submit", SelectModelEngine);
form?.addEventListener("submit", AddMessagesToChat);