export function validateMessage(message: string) {
    if (message === "") {
        return {
            error: true,
            message: "*Por favor ingresa lo que deseas preguntar"
        }
    }
    if (message.length < 4) {
        return {
            error: true,
            message: "*El mensaje debe ser de mas de 4 caracteres"
        }
    }

    return {
        error: false
    }
}