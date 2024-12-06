export type Role = 'user' | 'assistant';
export type ModelSelectedUser = "tiny" | "gemma" | "stable";

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
    tiny = "TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
    gemma = "gemma-2b-it-q4f32_1-MLC",
    stable = "stablelm-2-zephyr-1_6b-q4f32_1-MLC",
};
// export type MessagesToSave = MessagesInterface[][];
// const model: ModelSelectedUser = 'phi';
// const as = ModelsIA.fn;
// console.log(as)
