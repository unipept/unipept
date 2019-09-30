import process from './process';

const ctx: Worker = self as any;

ctx.addEventListener("message", handleEvent);

async function handleEvent(event){
   ctx.postMessage(await process(event.data.peptides, event.data.config));
}
