const outputDiv = document.getElementById('output');

const text = 'The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, ' +
  'and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. ' +
  'During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest ' +
  'man-made structure in the world, a title it held for 41 years until the Chrysler Building in New ' +
  'York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to ' +
  'the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the ' +
  'Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second ' +
  'tallest free-standing structure in France after the Millau Viaduct.';


async function generate(relaxed = False) {

  let pipeline, env;
  if (relaxed) {
    ({ pipeline, env } = await import("./transformers-relaxed-dev.js"));
  } else {
    ({ pipeline, env } = await import("./transformers-dev.js"));
  }

  env.allowLocalModels = false;
  env.backends.onnx.wasm.wasmPaths = "http://localhost:8000/";
  env.backends.onnx.debug = true;
  env.backends.onnx.logLevel = 'verbose';

  if (relaxed) {
    env.backends.onnx.wasm.relaxedSimd = true;
  }

  let generator = null;

  outputDiv.textContent = "Creating a new pipeline";
  try {
    generator = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
  } catch (e) {
    outputDiv.textContent = e;
  }
  outputDiv.textContent = "Done";

  outputDiv.textContent = "Running";
  const startTime = Date.now();

  const output = await generator(text, {
    max_new_tokens: 100,
  });
  const endTime = Date.now();
  const timeSpent = (endTime - startTime);

  outputDiv.textContent = `
    Summary: ${output[0]?.summary_text || "No summary generated."}
    Time spent: ${timeSpent} ms
  `;

}

const runButton = document.getElementById('run');
runButton.addEventListener('click', () => generate(false));

const relaxedRunButton = document.getElementById('relaxedRun');
relaxedRunButton.addEventListener('click', () => generate(true));
