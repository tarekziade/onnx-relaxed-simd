


const handlePipeline = async (pipeline, self, modelType, modelName, input, outputKey, baseline) => {
  self.postMessage({ type: 'status', payload: `Loading ${modelName}... baseline: ${baseline}` });
  let startTime = Date.now();
  const generator = await pipeline(modelType, modelName);
  let endTime = Date.now();
  let loadTime = endTime - startTime;
  self.postMessage({ type: 'status', payload: `Running...(loading took ${loadTime} ms) baseline ${baseline}` });

  startTime = Date.now();
  const output = await generator(input, {
    max_new_tokens: 195,
    min_new_tokens: 200,
    do_sample: false,
    return_full_text: false,
  });
  endTime = Date.now();
  let timeSpent = endTime - startTime;

  self.postMessage({
    type: 'result',
    payload: {
      summary: JSON.stringify(output, null, 2) || output[0],
      timeSpent,
    },
  });
};

self.onmessage = async (event) => {
  const { action, qwen, baseline, input } = event.data;

  const article = input.replace(/\s+/g, ' ').trim();

  if (action === 'generate') {
    self.postMessage({ type: 'status', payload: 'Creating a new pipeline...' });

    try {

      let imp;
      if (baseline) {
        imp = await import('./transformers-dev-baseline.js');
      } else {
        imp = await import('./transformers-dev.js');
      }

      const pipeline = imp.pipeline;
      const env = imp.env;

      // Configure environment
      env.allowLocalModels = true;
      env.allowRemoteModels = false;
      env.localModelPath = "/models/";
      env.backends.onnx.wasm.wasmPaths = "http://localhost:8000/";
      env.backends.onnx.debug = true;
      env.backends.onnx.logLevel = 'verbose';
      env.backends.onnx.numThreads = 4;


      // Process based on "qwen" flag
      if (qwen) {
        const chatInput = [
          {
            role: "system",
            content:
              "Your role is to summarize the provided content as succinctly as possible while retaining the most important information",
          },
          {
            role: "user",
            content: article,
          },
        ];
        await handlePipeline(pipeline, self, 'text-generation', 'Qwen2.5-0.5B-Instruct', chatInput, 'generated_text[2]["content"]', baseline);
      } else {
        await handlePipeline(pipeline, self, 'summarization', 'Xenova/distilbart-cnn-6-6', article, 'summary_text', baseline);
      }
    } catch (error) {
      self.postMessage({ type: 'status', payload: `Error: ${error.message}` });
    }
  }
};
