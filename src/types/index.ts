export type Role = 'user' | 'assistant';
export type ModelSelectedUser = "llama" | "phi" | "gemma" | "hermes" | "tiny" | "smol" | "gemma_2" | 'smol';

export interface MessagesInterface {
    role: Role,
    content: string,
    tool_call_id?: string
}
export interface User {
    email: string,
    name: string,
    image: string
}
export enum ModelsIA {
    smol = "SmolLM-135M-Instruct-q4f32_1-MLC",
    llama = "Llama-3.1-8B-Instruct-q4f32_1-MLC-1k",
    hermes = "Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC",
    phi = "phi-2-q4f16_1-MLC",
    gemma = "gemma-2b-it-q4f32_1-MLC",
    gemma_2 = "gemma-2b-it-q4f16_1-MLC",
    tiny = "TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
};
// export type MessagesToSave = MessagesInterface[][];
// const model: ModelSelectedUser = 'phi';
// const as = ModelsIA.fn;
// console.log(as)
