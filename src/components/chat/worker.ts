import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg: MessageEvent<String>) => {
    handler.onmessage(msg);
};
self.addEventListener('error', (e) => [
    console.log(e)
])