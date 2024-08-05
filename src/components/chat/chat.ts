import { CreateWebWorkerMLCEngine, WebWorkerMLCEngine, type ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import validateMessage from "../../utils/validateMessage.ts";
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
const modelsIA = {
    smol: "SmolLM-135M-Instruct-q4f32_1-MLC",
    llama: "Llama-3.1-8B-Instruct-q4f32_1-MLC-1k",
    hermes: "Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC",
    phi: "phi-2-q4f16_1-MLC",
    gemma: "gemma-2b-it-q4f32_1-MLC",
    gemma_2: "gemma-2b-it-q4f16_1-MLC",
    tiny: "TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
};
const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: 'module' })
let engine: WebWorkerMLCEngine;
worker.addEventListener('error', (msg) => {
    console.log(msg)
})
let selectedModel: string;
let userInfo: any;
document.addEventListener('DOMContentLoaded', async () => {
    const resp = await fetch('/api/getUser');
    userInfo = await resp.json();
})
form_select_model.addEventListener("submit", async (e) => {
    e.preventDefault();
    const model_selected = new FormData(form_select_model).get(
        "model_selector",
    ) as "llama" | "phi" | "gemma" | "hermes" | "tiny" | "smol";
    if (!modelsIA[model_selected]) {
        alert("El modelo que estas seleccionando no existe");
        return;
    }
    selectedModel = modelsIA[model_selected] ?? modelsIA["smol"];
    const newEngine = await createEngine(selectedModel);
    engine = newEngine!;
    console.log({ engine, selectedModel })
});
interface MessagesInterface {
    role: 'user' | 'assistant',
    content: string,
    tool_call_id?: string
}
let messages: MessagesInterface[][] = [];




form?.addEventListener("submit", async (e) => {
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
    addMessage("user", message);
    input.value = "";
    button.setAttribute('disabled', 'true')
    //Agregando mensaje de IA
    console.log(engine)
    let reply = "";
    // const response = await engine.chat.completions.create({
    //     messages,
    //     temperature: 1,
    //     stream: true,
    // });

    // const textParagraph = addMessage("assistant", "");
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
    //SIN APLICAR EL STREAM, es decir, me devuelve el contenido una vez se haya completado la repuesta de la IA
    // //response.choices[0].message ----> {role:'assistand', content:''}
    // const botMessage = response.choices[0].message;
    // if (!botMessage.content) {
    // 	return;
    // }
    //addMessage(botMessage.role,botMessage.content);
    // messages.push(botMessage);
    messages.push([{ role: 'assistant', content: 'hola' }, userMessage]);
    button.removeAttribute("disabled");
    container_messages.scrollTop = container_messages.scrollHeight;
    // await addMessageToDb(messages, selectedModel);
    // if(!res.ok){
    //     const
    // }
});

//TODO:EL PARAM SEA UN OBJ, TIPARLO
async function addMessage(role: "assistant" | "user", message: string) {
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
async function createEngine(selectedModel: string) {
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

async function addMessageToDb(messages: MessagesInterface[][], selectedModel: string) {
    console.log(selectedModel)
    try {
        const resp = await fetch('/api/addMessage', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ messages, selectedModel })
        })
    } catch (error) {
        console.log(error)
    }
}