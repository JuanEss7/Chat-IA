import type { MessagesInterface, ModelSelectedUser } from "../../types";

export function getMessage(userEmail: string) {
    const infoLocalStorage = window.localStorage.getItem(userEmail);
    if (!infoLocalStorage) return 
    const { messages: messagesLocal, model, email } = JSON.parse(infoLocalStorage);
    return {
        messagesLocal: messagesLocal as MessagesInterface[],
        model: model as ModelSelectedUser,
    }
}