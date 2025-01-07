const outputDiv = document.getElementById('output');
const distilbart = document.getElementById('distilbart');
const qwen = document.getElementById('qwen');
const distilbartB = document.getElementById('distilbart-baseline');
const qwenB = document.getElementById('qwen-baseline');

const input = document.getElementById('input');

// Create the worker
const worker = new Worker('worker.js');

worker.onmessage = (event) => {
  const { type, payload } = event.data;

  if (type === 'status') {
    outputDiv.textContent = payload;
  } else if (type === 'result') {
    const { summary, timeSpent } = payload;
    outputDiv.textContent = `
            Summary: ${summary}
            Time spent: ${timeSpent} ms
        `;
  }
};


worker.onerror = (error) => {
  outputDiv.textContent = `Error: ${error.message}`;
};


distilbartB.addEventListener('click', () => {
  worker.postMessage({ action: 'generate', qwen: false, baseline: true, input: input.value });
});

qwenB.addEventListener('click', () => {
  worker.postMessage({ action: 'generate', qwen: true, baseline: true, input: input.value });
});

distilbart.addEventListener('click', () => {
  worker.postMessage({ action: 'generate', qwen: false, baseline: false, input: input.value });
});

qwen.addEventListener('click', () => {
  worker.postMessage({ action: 'generate', qwen: true, baseline: false, input: input.value });
});
