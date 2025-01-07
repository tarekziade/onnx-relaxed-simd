
var ortWasmThreaded = (() => {
  var _scriptName = import.meta.url;
  
  return (
async function(moduleArg = {}) {
  var moduleRtn;

// Support for growable heap + pthreads, where the buffer may change, so JS views
// must be updated.
function GROWABLE_HEAP_I8() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAP8;
}
function GROWABLE_HEAP_U8() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPU8;
}
function GROWABLE_HEAP_I16() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAP16;
}
function GROWABLE_HEAP_U16() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPU16;
}
function GROWABLE_HEAP_I32() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAP32;
}
function GROWABLE_HEAP_U32() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPU32;
}
function GROWABLE_HEAP_F32() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPF32;
}
function GROWABLE_HEAP_F64() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPF64;
}

var Module = Object.assign({}, moduleArg);

var readyPromiseResolve, readyPromiseReject;

var readyPromise = new Promise((resolve, reject) => {
 readyPromiseResolve = resolve;
 readyPromiseReject = reject;
});

var ENVIRONMENT_IS_WEB = typeof window == "object";

var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";

var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";

var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

var ENVIRONMENT_IS_PTHREAD = ENVIRONMENT_IS_WORKER && self.name == "em-pthread";

if (ENVIRONMENT_IS_NODE) {
 const {createRequire: createRequire} = await import("module");
 /** @suppress{duplicate} */ var require = createRequire(import.meta.url);
 var worker_threads = require("worker_threads");
 global.Worker = worker_threads.Worker;
 ENVIRONMENT_IS_WORKER = !worker_threads.isMainThread;
 ENVIRONMENT_IS_PTHREAD = ENVIRONMENT_IS_WORKER && worker_threads["workerData"] == "em-pthread";
}

"use strict";

/**
 * Mount external data files of a model to an internal map, which will be used during session initialization.
 *
 * @param {string} externalDataFilesPath
 * @param {Uint8Array} externalDataFilesData
 */ Module["mountExternalData"] = (externalDataFilePath, externalDataFileData) => {
 if (externalDataFilePath.startsWith("./")) {
  externalDataFilePath = externalDataFilePath.substring(2);
 }
 const files = Module.MountedFiles || (Module.MountedFiles = new Map);
 files.set(externalDataFilePath, externalDataFileData);
};

/**
 * Unmount external data files of a model.
 */ Module["unmountExternalData"] = () => {
 delete Module.MountedFiles;
};

/**
 * A workaround for SharedArrayBuffer when it is not available in the current context.
 *
 * We need this workaround because Emscripten generates code that assumes `SharedArrayBuffer` is always available and
 * uses SharedArrayBuffer in this way:
 * ```js
 * buffer instanceof SharedArrayBuffer
 * ```
 *
 * This code will throw an error when SharedArrayBuffer is not available. Fortunately, we can use `WebAssembly.Memory`
 * to create an instance of SharedArrayBuffer even when SharedArrayBuffer is not available in `globalThis`.
 *
 * While this workaround allows the WebAssembly module to be loaded, it does not provide multi-threading features when
 * SharedArrayBuffer is not available in `globalThis`. The WebAssembly module will run well in a single thread, when:
 * - Module['numThreads'] is set to 1, and
 * - _OrtInit() is called with numThreads = 1.
 *
 * @suppress {checkVars}
 */ var SharedArrayBuffer = globalThis.SharedArrayBuffer ?? new WebAssembly.Memory({
 "initial": 0,
 "maximum": 0,
 "shared": true
}).buffer.constructor;

/**
* Custom call to instantiate WebAssembly module. so we can use custom imports 
*/ Module["instantiateWasm"] = async (info, receiveInstance) => {
 const wasmBinaryFile = findWasmBinary();
 const bytes = await getBinaryPromise(wasmBinaryFile);
 const module = await WebAssembly.compile(bytes);
 let imports = getWasmImports();
 const OPTIMIZED_GEMM = "mozIntGemm";
 const optimizedGemmModule = WebAssembly[OPTIMIZED_GEMM];
 const optimizedGemmModuleExports = new WebAssembly.Instance(optimizedGemmModule(), {
  "": {
   memory: wasmMemory
  }
 }).exports;
 imports.wasm_gemm = optimizedGemmModuleExports;
 try {
  var instance = new WebAssembly.Instance(module, imports);
  receiveInstance(instance);
 } catch (error) {
  console.error("Error creating WebAssembly instance:", error);
  throw error;
 }
};

"use strict";

/**
 * initialize JSEP for asyncify support.
 */ let jsepInitAsync = () => {
 const jsepWrapAsync = (func, getFunc, setFunc) => (...args) => {
  const previousAsync = Asyncify.currData;
  const previousFunc = getFunc?.();
  const ret = func(...args);
  const newFunc = getFunc?.();
  if (previousFunc !== newFunc) {
   func = newFunc;
   setFunc(previousFunc);
   setFunc = null;
   getFunc = null;
  }
  if (Asyncify.currData != previousAsync) {
   return Asyncify.whenDone();
  }
  return ret;
 };
 const runAsync = runAsyncFunc => async (...args) => {
  try {
   if (Module.jsepSessionState) {
    throw new Error("Session already started");
   }
   const state = Module.jsepSessionState = {
    sessionHandle: args[0],
    errors: []
   };
   const ret = await runAsyncFunc(...args);
   if (Module.jsepSessionState !== state) {
    throw new Error("Session mismatch");
   }
   Module.jsepBackend?.["flush"]();
   const errorPromises = state.errors;
   if (errorPromises.length > 0) {
    let errors = await Promise.all(errorPromises);
    errors = errors.filter(e => e);
    if (errors.length > 0) {
     throw new Error(errors.join("\n"));
    }
   }
   return ret;
  } finally {
   Module.jsepSessionState = null;
  }
 };
 Module["_OrtCreateSession"] = jsepWrapAsync(Module["_OrtCreateSession"], () => Module["_OrtCreateSession"], v => Module["_OrtCreateSession"] = v);
 Module["_OrtRun"] = runAsync(jsepWrapAsync(Module["_OrtRun"], () => Module["_OrtRun"], v => Module["_OrtRun"] = v));
 Module["_OrtRunWithBinding"] = runAsync(jsepWrapAsync(Module["_OrtRunWithBinding"], () => Module["_OrtRunWithBinding"], v => Module["_OrtRunWithBinding"] = v));
 Module["_OrtBindInput"] = jsepWrapAsync(Module["_OrtBindInput"], () => Module["_OrtBindInput"], v => Module["_OrtBindInput"] = v);
 jsepInitAsync = undefined;
};

/**
 * initialize JSEP for WebGPU.
 */ Module["jsepInit"] = (name, params) => {
 jsepInitAsync?.();
 if (name === "webgpu") {
  [Module.jsepBackend, Module.jsepAlloc, Module.jsepFree, Module.jsepCopy, Module.jsepCopyAsync, Module.jsepCreateKernel, Module.jsepReleaseKernel, Module.jsepRunKernel, Module.jsepCaptureBegin, Module.jsepCaptureEnd, Module.jsepReplay] = params;
  const backend = Module.jsepBackend;
  Module["jsepRegisterBuffer"] = (sessionId, index, buffer, size) => backend["registerBuffer"](sessionId, index, buffer, size);
  Module["jsepGetBuffer"] = dataId => backend["getBuffer"](dataId);
  Module["jsepCreateDownloader"] = (gpuBuffer, size, type) => backend["createDownloader"](gpuBuffer, size, type);
  Module["jsepOnCreateSession"] = sessionId => {
   backend["onCreateSession"](sessionId);
  };
  Module["jsepOnReleaseSession"] = sessionId => {
   backend["onReleaseSession"](sessionId);
  };
  Module["jsepOnRunStart"] = sessionId => backend["onRunStart"](sessionId);
  Module.jsepUploadExternalBuffer = (dataId, buffer) => {
   backend["upload"](dataId, buffer);
  };
 } else if (name === "webnn") {
  [Module.jsepBackend, Module.jsepReserveTensorId, Module.jsepReleaseTensorId, Module["jsepEnsureTensor"], Module.jsepUploadTensor, Module["jsepDownloadTensor"]] = params;
  Module["jsepReleaseTensorId"] = Module.jsepReleaseTensorId;
  const backend = Module.jsepBackend;
  Module["jsepOnRunStart"] = sessionId => backend["onRunStart"](sessionId);
  Module["jsepRegisterMLContext"] = (sessionId, mlContext) => {
   backend["registerMLContext"](sessionId, mlContext);
  };
  Module["jsepOnReleaseSession"] = sessionId => {
   backend["onReleaseSession"](sessionId);
  };
  Module["jsepCreateMLTensorDownloader"] = (tensorId, type) => backend["createMLTensorDownloader"](tensorId, type);
  Module["jsepRegisterMLTensor"] = (tensor, dataType, shape) => backend["registerMLTensor"](tensor, dataType, shape);
  Module["jsepCreateMLContext"] = optionsOrGpuDevice => backend["createMLContext"](optionsOrGpuDevice);
  Module["jsepRegisterMLConstant"] = (externalFilePath, dataOffset, dataLength, builder, desc) => backend["registerMLConstant"](externalFilePath, dataOffset, dataLength, builder, desc, Module.MountedFiles);
 }
};

var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = (status, toThrow) => {
 throw toThrow;
};

var scriptDirectory = "";

function locateFile(path) {
 if (Module["locateFile"]) {
  return Module["locateFile"](path, scriptDirectory);
 }
 return scriptDirectory + path;
}

var read_, readAsync, readBinary;

if (ENVIRONMENT_IS_NODE) {
 var fs = require("fs");
 var nodePath = require("path");
 scriptDirectory = require("url").fileURLToPath(new URL("./", import.meta.url));
 read_ = (filename, binary) => {
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  return fs.readFileSync(filename, binary ? undefined : "utf8");
 };
 readBinary = filename => {
  var ret = read_(filename, true);
  if (!ret.buffer) {
   ret = new Uint8Array(ret);
  }
  return ret;
 };
 readAsync = (filename, onload, onerror, binary = true) => {
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  fs.readFile(filename, binary ? undefined : "utf8", (err, data) => {
   if (err) onerror(err); else onload(binary ? data.buffer : data);
  });
 };
 if (!Module["thisProgram"] && process.argv.length > 1) {
  thisProgram = process.argv[1].replace(/\\/g, "/");
 }
 arguments_ = process.argv.slice(2);
 quit_ = (status, toThrow) => {
  process.exitCode = status;
  throw toThrow;
 };
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = self.location.href;
 } else if (typeof document != "undefined" && document.currentScript) {
  scriptDirectory = document.currentScript.src;
 }
 if (_scriptName) {
  scriptDirectory = _scriptName;
 }
 if (scriptDirectory.startsWith("blob:")) {
  scriptDirectory = "";
 } else {
  scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
 }
 if (!ENVIRONMENT_IS_NODE) {
  read_ = url => {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", url, false);
   xhr.send(null);
   return xhr.responseText;
  };
  if (ENVIRONMENT_IS_WORKER) {
   readBinary = url => {
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url, false);
    xhr.responseType = "arraybuffer";
    xhr.send(null);
    return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
   };
  }
  readAsync = (url, onload, onerror) => {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", url, true);
   xhr.responseType = "arraybuffer";
   xhr.onload = () => {
    if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
     onload(xhr.response);
     return;
    }
    onerror();
   };
   xhr.onerror = onerror;
   xhr.send(null);
  };
 }
} else {}

if (ENVIRONMENT_IS_NODE) {
 if (typeof performance == "undefined") {
  global.performance = require("perf_hooks").performance;
 }
}

var defaultPrint = console.log.bind(console);

var defaultPrintErr = console.error.bind(console);

if (ENVIRONMENT_IS_NODE) {
 defaultPrint = (...args) => fs.writeSync(1, args.join(" ") + "\n");
 defaultPrintErr = (...args) => fs.writeSync(2, args.join(" ") + "\n");
}

var out = defaultPrint;

var err = defaultPrintErr;

Object.assign(Module, moduleOverrides);

moduleOverrides = null;

if (ENVIRONMENT_IS_PTHREAD) {
 var wasmPromiseResolve;
 var wasmPromiseReject;
 var receivedWasmModule;
 if (ENVIRONMENT_IS_NODE) {
  var parentPort = worker_threads["parentPort"];
  parentPort.on("message", data => onmessage({
   data: data
  }));
  Object.assign(globalThis, {
   self: global,
   importScripts: () => {},
   postMessage: msg => parentPort.postMessage(msg),
   performance: global.performance || {
    now: Date.now
   }
  });
 }
 var initializedJS = false;
 function threadPrintErr(...args) {
  var text = args.join(" ");
  if (ENVIRONMENT_IS_NODE) {
   fs.writeSync(2, text + "\n");
   return;
  }
  console.error(text);
 }
 err = threadPrintErr;
 function threadAlert(...args) {
  var text = args.join(" ");
  postMessage({
   cmd: "alert",
   text: text,
   threadId: _pthread_self()
  });
 }
 self.alert = threadAlert;
 Module["instantiateWasm"] = (info, receiveInstance) => new Promise((resolve, reject) => {
  wasmPromiseResolve = module => {
   var instance = new WebAssembly.Instance(module, getWasmImports());
   receiveInstance(instance);
   resolve();
  };
  wasmPromiseReject = reject;
 });
 self.onunhandledrejection = e => {
  throw e.reason || e;
 };
 function handleMessage(e) {
  try {
   var msgData = e["data"];
   var cmd = msgData["cmd"];
   if (cmd === "load") {
    let messageQueue = [];
    self.onmessage = e => messageQueue.push(e);
    self.startWorker = instance => {
     postMessage({
      "cmd": "loaded"
     });
     for (let msg of messageQueue) {
      handleMessage(msg);
     }
     self.onmessage = handleMessage;
    };
    for (const handler of msgData["handlers"]) {
     if (!Module[handler] || Module[handler].proxy) {
      Module[handler] = (...args) => {
       postMessage({
        cmd: "callHandler",
        handler: handler,
        args: args
       });
      };
      if (handler == "print") out = Module[handler];
      if (handler == "printErr") err = Module[handler];
     }
    }
    wasmMemory = msgData["wasmMemory"];
    updateMemoryViews();
    wasmPromiseResolve(msgData["wasmModule"]);
   } else if (cmd === "run") {
    __emscripten_thread_init(msgData["pthread_ptr"], /*is_main=*/ 0, /*is_runtime=*/ 0, /*can_block=*/ 1, 0, 0);
    __emscripten_thread_mailbox_await(msgData["pthread_ptr"]);
    establishStackSpace();
    PThread.receiveObjectTransfer(msgData);
    PThread.threadInitTLS();
    if (!initializedJS) {
     initializedJS = true;
    }
    try {
     invokeEntryPoint(msgData["start_routine"], msgData["arg"]);
    } catch (ex) {
     if (ex != "unwind") {
      throw ex;
     }
    }
   } else if (cmd === "cancel") {
    if (_pthread_self()) {
     __emscripten_thread_exit(-1);
    }
   } else if (msgData.target === "setimmediate") {} else if (cmd === "checkMailbox") {
    if (initializedJS) {
     checkMailbox();
    }
   } else if (cmd) {
    err(`worker: received unknown command ${cmd}`);
    err(msgData);
   }
  } catch (ex) {
   __emscripten_thread_crashed();
   throw ex;
  }
 }
 self.onmessage = handleMessage;
}

var wasmBinary;

if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];

var wasmMemory;

var wasmModule;

var ABORT = false;

var EXITSTATUS;

/** @type {function(*, string=)} */ function assert(condition, text) {
 if (!condition) {
  abort(text);
 }
}

var HEAP, /** @type {!Int8Array} */ HEAP8, /** @type {!Uint8Array} */ HEAPU8, /** @type {!Int16Array} */ HEAP16, /** @type {!Uint16Array} */ HEAPU16, /** @type {!Int32Array} */ HEAP32, /** @type {!Uint32Array} */ HEAPU32, /** @type {!Float32Array} */ HEAPF32, /* BigInt64Array type is not correctly defined in closure
/** not-@type {!BigInt64Array} */ HEAP64, /* BigUInt64Array type is not correctly defined in closure
/** not-t@type {!BigUint64Array} */ HEAPU64, /** @type {!Float64Array} */ HEAPF64;

function updateMemoryViews() {
 var b = wasmMemory.buffer;
 Module["HEAP8"] = HEAP8 = new Int8Array(b);
 Module["HEAP16"] = HEAP16 = new Int16Array(b);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
 Module["HEAP32"] = HEAP32 = new Int32Array(b);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
 Module["HEAP64"] = HEAP64 = new BigInt64Array(b);
 Module["HEAPU64"] = HEAPU64 = new BigUint64Array(b);
}

if (!ENVIRONMENT_IS_PTHREAD) {
 {
  var INITIAL_MEMORY = 16777216;
  wasmMemory = new WebAssembly.Memory({
   "initial": INITIAL_MEMORY / 65536,
   "maximum": 4294967296 / 65536,
   "shared": true
  });
  if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
   err("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag");
   if (ENVIRONMENT_IS_NODE) {
    err("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)");
   }
   throw Error("bad memory");
  }
 }
 updateMemoryViews();
}

var __ATPRERUN__ = [];

var __ATINIT__ = [];

var __ATEXIT__ = [];

var __ATPOSTRUN__ = [];

var runtimeInitialized = false;

function preRun() {
 callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
 runtimeInitialized = true;
 if (ENVIRONMENT_IS_PTHREAD) return;
 callRuntimeCallbacks(__ATINIT__);
}

function postRun() {
 if (ENVIRONMENT_IS_PTHREAD) return;
 callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}

function addOnExit(cb) {}

function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}

var runDependencies = 0;

var runDependencyWatcher = null;

var dependenciesFulfilled = null;

function getUniqueRunDependency(id) {
 return id;
}

function addRunDependency(id) {
 runDependencies++;
}

function removeRunDependency(id) {
 runDependencies--;
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}

/** @param {string|number=} what */ function abort(what) {
 what = "Aborted(" + what + ")";
 err(what);
 ABORT = true;
 EXITSTATUS = 1;
 what += ". Build with -sASSERTIONS for more info.";
 /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
 readyPromiseReject(e);
 throw e;
}

var dataURIPrefix = "data:application/octet-stream;base64,";

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */ var isDataURI = filename => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */ var isFileURI = filename => filename.startsWith("file://");

function findWasmBinary() {
 if (Module["locateFile"]) {
  var f = "ort-wasm-simd-threaded-baseline.jsep.wasm";
  if (!isDataURI(f)) {
   return locateFile(f);
  }
  return f;
 }
 return new URL("ort-wasm-simd-threaded-baseline.jsep.wasm", import.meta.url).href;
}

var wasmBinaryFile;

function getBinarySync(file) {
 if (file == wasmBinaryFile && wasmBinary) {
  return new Uint8Array(wasmBinary);
 }
 if (readBinary) {
  return readBinary(file);
 }
 throw "both async and sync fetching of the wasm failed";
}

function getBinaryPromise(binaryFile) {
 if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
  if (typeof fetch == "function" && !isFileURI(binaryFile)) {
   return fetch(binaryFile, {
    credentials: "same-origin"
   }).then(response => {
    if (!response["ok"]) {
     throw `failed to load wasm binary file at '${binaryFile}'`;
    }
    return response["arrayBuffer"]();
   }).catch(() => getBinarySync(binaryFile));
  } else if (readAsync) {
   return new Promise((resolve, reject) => {
    readAsync(binaryFile, response => resolve(new Uint8Array(/** @type{!ArrayBuffer} */ (response))), reject);
   });
  }
 }
 return Promise.resolve().then(() => getBinarySync(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
 return getBinaryPromise(binaryFile).then(binary => WebAssembly.instantiate(binary, imports)).then(receiver, reason => {
  err(`failed to asynchronously prepare wasm: ${reason}`);
  abort(reason);
 });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
 if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
  return fetch(binaryFile, {
   credentials: "same-origin"
  }).then(response => {
   /** @suppress {checkTypes} */ var result = WebAssembly.instantiateStreaming(response, imports);
   return result.then(callback, function(reason) {
    err(`wasm streaming compile failed: ${reason}`);
    err("falling back to ArrayBuffer instantiation");
    return instantiateArrayBuffer(binaryFile, imports, callback);
   });
  });
 }
 return instantiateArrayBuffer(binaryFile, imports, callback);
}

function getWasmImports() {
 assignWasmImports();
 return {
  "env": wasmImports,
  "wasi_snapshot_preview1": wasmImports
 };
}

function createWasm() {
 var info = getWasmImports();
 /** @param {WebAssembly.Module=} module*/ function receiveInstance(instance, module) {
  wasmExports = instance.exports;
  wasmExports = Asyncify.instrumentWasmExports(wasmExports);
  wasmExports = applySignatureConversions(wasmExports);
  registerTLSInit(wasmExports["_emscripten_tls_init"]);
  addOnInit(wasmExports["__wasm_call_ctors"]);
  wasmModule = module;
  removeRunDependency("wasm-instantiate");
  return wasmExports;
 }
 addRunDependency("wasm-instantiate");
 function receiveInstantiationResult(result) {
  receiveInstance(result["instance"], result["module"]);
 }
 if (Module["instantiateWasm"]) {
  try {
   return Module["instantiateWasm"](info, receiveInstance);
  } catch (e) {
   err(`Module.instantiateWasm callback failed with error: ${e}`);
   readyPromiseReject(e);
  }
 }
 if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();
 instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
 return {};
}

var ASM_CONSTS = {
 805004: ($0, $1, $2, $3, $4) => {
  if (typeof Module == "undefined" || !Module.MountedFiles) {
   return 1;
  }
  let fileName = UTF8ToString(Number($0 >>> 0));
  if (fileName.startsWith("./")) {
   fileName = fileName.substring(2);
  }
  const fileData = Module.MountedFiles.get(fileName);
  if (!fileData) {
   return 2;
  }
  const offset = Number($1 >>> 0);
  const length = Number($2 >>> 0);
  const dataIdOrBuffer = Number($3 >>> 0);
  const loadType = $4;
  if (offset + length > fileData.byteLength) {
   return 3;
  }
  try {
   const data = fileData.subarray(offset, offset + length);
   switch (loadType) {
   case 0:
    GROWABLE_HEAP_U8().set(data, dataIdOrBuffer >>> 0);
    break;

   case 1:
    Module.jsepUploadExternalBuffer(dataIdOrBuffer, data);
    break;

   default:
    return 4;
   }
   return 0;
  } catch {
   return 4;
  }
 },
 805719: () => {
  Module.jsepCaptureBegin();
 },
 805750: () => {
  Module.jsepCaptureEnd();
 },
 805779: () => {
  Module.jsepReplay();
 },
 805804: $0 => Module.jsepAlloc($0),
 805837: $0 => Module.jsepFree($0),
 805869: ($0, $1, $2) => {
  Module.jsepCopy(Number($0), Number($1), Number($2), true);
 },
 805932: ($0, $1, $2) => {
  Module.jsepCopy(Number($0), Number($1), Number($2));
 },
 805989: () => (typeof wasmOffsetConverter !== "undefined"),
 806046: $0 => {
  Module.jsepCreateKernel("Abs", $0, undefined);
 },
 806097: $0 => {
  Module.jsepCreateKernel("Neg", $0, undefined);
 },
 806148: $0 => {
  Module.jsepCreateKernel("Floor", $0, undefined);
 },
 806201: $0 => {
  Module.jsepCreateKernel("Ceil", $0, undefined);
 },
 806253: $0 => {
  Module.jsepCreateKernel("Reciprocal", $0, undefined);
 },
 806311: $0 => {
  Module.jsepCreateKernel("Sqrt", $0, undefined);
 },
 806363: $0 => {
  Module.jsepCreateKernel("Exp", $0, undefined);
 },
 806414: $0 => {
  Module.jsepCreateKernel("Erf", $0, undefined);
 },
 806465: $0 => {
  Module.jsepCreateKernel("Sigmoid", $0, undefined);
 },
 806520: ($0, $1, $2) => {
  Module.jsepCreateKernel("HardSigmoid", $0, ({
   "alpha": $1,
   "beta": $2
  }));
 },
 806599: $0 => {
  Module.jsepCreateKernel("Log", $0, undefined);
 },
 806650: $0 => {
  Module.jsepCreateKernel("Sin", $0, undefined);
 },
 806701: $0 => {
  Module.jsepCreateKernel("Cos", $0, undefined);
 },
 806752: $0 => {
  Module.jsepCreateKernel("Tan", $0, undefined);
 },
 806803: $0 => {
  Module.jsepCreateKernel("Asin", $0, undefined);
 },
 806855: $0 => {
  Module.jsepCreateKernel("Acos", $0, undefined);
 },
 806907: $0 => {
  Module.jsepCreateKernel("Atan", $0, undefined);
 },
 806959: $0 => {
  Module.jsepCreateKernel("Sinh", $0, undefined);
 },
 807011: $0 => {
  Module.jsepCreateKernel("Cosh", $0, undefined);
 },
 807063: $0 => {
  Module.jsepCreateKernel("Asinh", $0, undefined);
 },
 807116: $0 => {
  Module.jsepCreateKernel("Acosh", $0, undefined);
 },
 807169: $0 => {
  Module.jsepCreateKernel("Atanh", $0, undefined);
 },
 807222: $0 => {
  Module.jsepCreateKernel("Tanh", $0, undefined);
 },
 807274: $0 => {
  Module.jsepCreateKernel("Not", $0, undefined);
 },
 807325: ($0, $1, $2) => {
  Module.jsepCreateKernel("Clip", $0, ({
   "min": $1,
   "max": $2
  }));
 },
 807394: $0 => {
  Module.jsepCreateKernel("Clip", $0, undefined);
 },
 807446: ($0, $1) => {
  Module.jsepCreateKernel("Elu", $0, ({
   "alpha": $1
  }));
 },
 807504: $0 => {
  Module.jsepCreateKernel("Gelu", $0, undefined);
 },
 807556: $0 => {
  Module.jsepCreateKernel("Relu", $0, undefined);
 },
 807608: ($0, $1) => {
  Module.jsepCreateKernel("LeakyRelu", $0, ({
   "alpha": $1
  }));
 },
 807672: ($0, $1) => {
  Module.jsepCreateKernel("ThresholdedRelu", $0, ({
   "alpha": $1
  }));
 },
 807742: ($0, $1) => {
  Module.jsepCreateKernel("Cast", $0, ({
   "to": $1
  }));
 },
 807800: $0 => {
  Module.jsepCreateKernel("Add", $0, undefined);
 },
 807851: $0 => {
  Module.jsepCreateKernel("Sub", $0, undefined);
 },
 807902: $0 => {
  Module.jsepCreateKernel("Mul", $0, undefined);
 },
 807953: $0 => {
  Module.jsepCreateKernel("Div", $0, undefined);
 },
 808004: $0 => {
  Module.jsepCreateKernel("Pow", $0, undefined);
 },
 808055: $0 => {
  Module.jsepCreateKernel("Equal", $0, undefined);
 },
 808108: $0 => {
  Module.jsepCreateKernel("Greater", $0, undefined);
 },
 808163: $0 => {
  Module.jsepCreateKernel("GreaterOrEqual", $0, undefined);
 },
 808225: $0 => {
  Module.jsepCreateKernel("Less", $0, undefined);
 },
 808277: $0 => {
  Module.jsepCreateKernel("LessOrEqual", $0, undefined);
 },
 808336: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceMean", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 808511: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceMax", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 808685: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceMin", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 808859: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceProd", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 809034: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceSum", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 809208: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceL1", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 809381: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceL2", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 809554: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceLogSum", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 809731: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceSumSquare", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 809911: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceLogSumExp", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 810091: $0 => {
  Module.jsepCreateKernel("Where", $0, undefined);
 },
 810144: ($0, $1, $2) => {
  Module.jsepCreateKernel("Transpose", $0, ({
   "perm": $1 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($1) >>> 0, Number($2) >>> 0)) : []
  }));
 },
 810268: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("DepthToSpace", $0, ({
   "blocksize": $1,
   "mode": UTF8ToString($2),
   "format": $3 ? "NHWC" : "NCHW"
  }));
 },
 810401: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("DepthToSpace", $0, ({
   "blocksize": $1,
   "mode": UTF8ToString($2),
   "format": $3 ? "NHWC" : "NCHW"
  }));
 },
 810534: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) => {
  Module.jsepCreateKernel("ConvTranspose", $0, ({
   "format": $8 ? "NHWC" : "NCHW",
   "autoPad": $1,
   "dilations": [ $2 ],
   "group": $3,
   "kernelShape": [ $4 ],
   "pads": [ $5, $6 ],
   "strides": [ $7 ],
   "wIsConst": () => (!!GROWABLE_HEAP_I8()[$9 >>> 0]),
   "outputPadding": $10 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($10) >>> 0, Number($11) >>> 0)) : [],
   "outputShape": $12 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($12) >>> 0, Number($13) >>> 0)) : [],
   "activation": UTF8ToString($14)
  }));
 },
 810967: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
  Module.jsepCreateKernel("ConvTranspose", $0, ({
   "format": $7 ? "NHWC" : "NCHW",
   "autoPad": $1,
   "dilations": Array.from(GROWABLE_HEAP_I32().subarray(Number($2) >>> 0, (Number($2) >>> 0) + 2 >>> 0)),
   "group": $3,
   "kernelShape": Array.from(GROWABLE_HEAP_I32().subarray(Number($4) >>> 0, (Number($4) >>> 0) + 2 >>> 0)),
   "pads": Array.from(GROWABLE_HEAP_I32().subarray(Number($5) >>> 0, (Number($5) >>> 0) + 4 >>> 0)),
   "strides": Array.from(GROWABLE_HEAP_I32().subarray(Number($6) >>> 0, (Number($6) >>> 0) + 2 >>> 0)),
   "wIsConst": () => (!!GROWABLE_HEAP_I8()[$8 >>> 0]),
   "outputPadding": $9 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($9) >>> 0, Number($10) >>> 0)) : [],
   "outputShape": $11 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($11) >>> 0, Number($12) >>> 0)) : [],
   "activation": UTF8ToString($13)
  }));
 },
 811628: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) => {
  Module.jsepCreateKernel("ConvTranspose", $0, ({
   "format": $8 ? "NHWC" : "NCHW",
   "autoPad": $1,
   "dilations": [ $2 ],
   "group": $3,
   "kernelShape": [ $4 ],
   "pads": [ $5, $6 ],
   "strides": [ $7 ],
   "wIsConst": () => (!!GROWABLE_HEAP_I8()[$9 >>> 0]),
   "outputPadding": $10 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($10) >>> 0, Number($11) >>> 0)) : [],
   "outputShape": $12 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($12) >>> 0, Number($13) >>> 0)) : [],
   "activation": UTF8ToString($14)
  }));
 },
 812061: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
  Module.jsepCreateKernel("ConvTranspose", $0, ({
   "format": $7 ? "NHWC" : "NCHW",
   "autoPad": $1,
   "dilations": Array.from(GROWABLE_HEAP_I32().subarray(Number($2) >>> 0, (Number($2) >>> 0) + 2 >>> 0)),
   "group": $3,
   "kernelShape": Array.from(GROWABLE_HEAP_I32().subarray(Number($4) >>> 0, (Number($4) >>> 0) + 2 >>> 0)),
   "pads": Array.from(GROWABLE_HEAP_I32().subarray(Number($5) >>> 0, (Number($5) >>> 0) + 4 >>> 0)),
   "strides": Array.from(GROWABLE_HEAP_I32().subarray(Number($6) >>> 0, (Number($6) >>> 0) + 2 >>> 0)),
   "wIsConst": () => (!!GROWABLE_HEAP_I8()[$8 >>> 0]),
   "outputPadding": $9 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($9) >>> 0, Number($10) >>> 0)) : [],
   "outputShape": $11 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($11) >>> 0, Number($12) >>> 0)) : [],
   "activation": UTF8ToString($13)
  }));
 },
 812722: ($0, $1) => {
  Module.jsepCreateKernel("GlobalAveragePool", $0, ({
   "format": $1 ? "NHWC" : "NCHW"
  }));
 },
 812813: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
  Module.jsepCreateKernel("AveragePool", $0, ({
   "format": $13 ? "NHWC" : "NCHW",
   "auto_pad": $1,
   "ceil_mode": $2,
   "count_include_pad": $3,
   "storage_order": $4,
   "dilations": $5 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($5) >>> 0, Number($6) >>> 0)) : [],
   "kernel_shape": $7 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($7) >>> 0, Number($8) >>> 0)) : [],
   "pads": $9 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($9) >>> 0, Number($10) >>> 0)) : [],
   "strides": $11 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($11) >>> 0, Number($12) >>> 0)) : []
  }));
 },
 813292: ($0, $1) => {
  Module.jsepCreateKernel("GlobalAveragePool", $0, ({
   "format": $1 ? "NHWC" : "NCHW"
  }));
 },
 813383: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
  Module.jsepCreateKernel("AveragePool", $0, ({
   "format": $13 ? "NHWC" : "NCHW",
   "auto_pad": $1,
   "ceil_mode": $2,
   "count_include_pad": $3,
   "storage_order": $4,
   "dilations": $5 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($5) >>> 0, Number($6) >>> 0)) : [],
   "kernel_shape": $7 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($7) >>> 0, Number($8) >>> 0)) : [],
   "pads": $9 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($9) >>> 0, Number($10) >>> 0)) : [],
   "strides": $11 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($11) >>> 0, Number($12) >>> 0)) : []
  }));
 },
 813862: ($0, $1) => {
  Module.jsepCreateKernel("GlobalMaxPool", $0, ({
   "format": $1 ? "NHWC" : "NCHW"
  }));
 },
 813949: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
  Module.jsepCreateKernel("MaxPool", $0, ({
   "format": $13 ? "NHWC" : "NCHW",
   "auto_pad": $1,
   "ceil_mode": $2,
   "count_include_pad": $3,
   "storage_order": $4,
   "dilations": $5 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($5) >>> 0, Number($6) >>> 0)) : [],
   "kernel_shape": $7 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($7) >>> 0, Number($8) >>> 0)) : [],
   "pads": $9 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($9) >>> 0, Number($10) >>> 0)) : [],
   "strides": $11 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($11) >>> 0, Number($12) >>> 0)) : []
  }));
 },
 814424: ($0, $1) => {
  Module.jsepCreateKernel("GlobalMaxPool", $0, ({
   "format": $1 ? "NHWC" : "NCHW"
  }));
 },
 814511: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
  Module.jsepCreateKernel("MaxPool", $0, ({
   "format": $13 ? "NHWC" : "NCHW",
   "auto_pad": $1,
   "ceil_mode": $2,
   "count_include_pad": $3,
   "storage_order": $4,
   "dilations": $5 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($5) >>> 0, Number($6) >>> 0)) : [],
   "kernel_shape": $7 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($7) >>> 0, Number($8) >>> 0)) : [],
   "pads": $9 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($9) >>> 0, Number($10) >>> 0)) : [],
   "strides": $11 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($11) >>> 0, Number($12) >>> 0)) : []
  }));
 },
 814986: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("Gemm", $0, ({
   "alpha": $1,
   "beta": $2,
   "transA": $3,
   "transB": $4
  }));
 },
 815090: $0 => {
  Module.jsepCreateKernel("MatMul", $0, undefined);
 },
 815144: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("ArgMax", $0, ({
   "keepDims": !!$1,
   "selectLastIndex": !!$2,
   "axis": $3
  }));
 },
 815252: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("ArgMin", $0, ({
   "keepDims": !!$1,
   "selectLastIndex": !!$2,
   "axis": $3
  }));
 },
 815360: ($0, $1) => {
  Module.jsepCreateKernel("Softmax", $0, ({
   "axis": $1
  }));
 },
 815423: ($0, $1) => {
  Module.jsepCreateKernel("Concat", $0, ({
   "axis": $1
  }));
 },
 815483: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("Split", $0, ({
   "axis": $1,
   "numOutputs": $2,
   "splitSizes": $3 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0)) : []
  }));
 },
 815639: $0 => {
  Module.jsepCreateKernel("Expand", $0, undefined);
 },
 815693: ($0, $1) => {
  Module.jsepCreateKernel("Gather", $0, ({
   "axis": Number($1)
  }));
 },
 815764: ($0, $1) => {
  Module.jsepCreateKernel("GatherElements", $0, ({
   "axis": Number($1)
  }));
 },
 815843: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) => {
  Module.jsepCreateKernel("Resize", $0, ({
   "antialias": $1,
   "axes": $2 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($2) >>> 0, Number($3) >>> 0)) : [],
   "coordinateTransformMode": UTF8ToString($4),
   "cubicCoeffA": $5,
   "excludeOutside": $6,
   "extrapolationValue": $7,
   "keepAspectRatioPolicy": UTF8ToString($8),
   "mode": UTF8ToString($9),
   "nearestMode": UTF8ToString($10)
  }));
 },
 816205: ($0, $1, $2, $3, $4, $5, $6) => {
  Module.jsepCreateKernel("Slice", $0, ({
   "starts": $1 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($1) >>> 0, Number($2) >>> 0)) : [],
   "ends": $3 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0)) : [],
   "axes": $5 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($5) >>> 0, Number($6) >>> 0)) : []
  }));
 },
 816469: $0 => {
  Module.jsepCreateKernel("Tile", $0, undefined);
 },
 816521: ($0, $1, $2) => {
  Module.jsepCreateKernel("InstanceNormalization", $0, ({
   "epsilon": $1,
   "format": $2 ? "NHWC" : "NCHW"
  }));
 },
 816635: ($0, $1, $2) => {
  Module.jsepCreateKernel("InstanceNormalization", $0, ({
   "epsilon": $1,
   "format": $2 ? "NHWC" : "NCHW"
  }));
 },
 816749: $0 => {
  Module.jsepCreateKernel("Range", $0, undefined);
 },
 816802: ($0, $1) => {
  Module.jsepCreateKernel("Einsum", $0, ({
   "equation": UTF8ToString($1)
  }));
 },
 816883: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("Pad", $0, ({
   "mode": $1,
   "value": $2,
   "pads": $3 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0)) : []
  }));
 },
 817026: ($0, $1, $2, $3, $4, $5) => {
  Module.jsepCreateKernel("BatchNormalization", $0, ({
   "epsilon": $1,
   "momentum": $2,
   "spatial": !!$4,
   "trainingMode": !!$3,
   "format": $5 ? "NHWC" : "NCHW"
  }));
 },
 817195: ($0, $1, $2, $3, $4, $5) => {
  Module.jsepCreateKernel("BatchNormalization", $0, ({
   "epsilon": $1,
   "momentum": $2,
   "spatial": !!$4,
   "trainingMode": !!$3,
   "format": $5 ? "NHWC" : "NCHW"
  }));
 },
 817364: ($0, $1, $2) => {
  Module.jsepCreateKernel("CumSum", $0, ({
   "exclusive": Number($1),
   "reverse": Number($2)
  }));
 },
 817461: ($0, $1, $2) => {
  Module.jsepCreateKernel("DequantizeLinear", $0, ({
   "axis": $1,
   "blockSize": $2
  }));
 },
 817551: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("GridSample", $0, ({
   "align_corners": $1,
   "mode": UTF8ToString($2),
   "padding_mode": UTF8ToString($3),
   "format": $4 ? "NHWC" : "NCHW"
  }));
 },
 817721: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("GridSample", $0, ({
   "align_corners": $1,
   "mode": UTF8ToString($2),
   "padding_mode": UTF8ToString($3),
   "format": $4 ? "NHWC" : "NCHW"
  }));
 },
 817891: ($0, $1) => {
  Module.jsepCreateKernel("ScatterND", $0, ({
   "reduction": UTF8ToString($1)
  }));
 },
 817976: ($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
  Module.jsepCreateKernel("Attention", $0, ({
   "numHeads": $1,
   "isUnidirectional": $2,
   "maskFilterValue": $3,
   "scale": $4,
   "doRotary": $5,
   "qkvHiddenSizes": $6 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($7) >>> 0, Number($7) + $6 >>> 0))) : [],
   "pastPresentShareBuffer": !!$8
  }));
 },
 818248: $0 => {
  Module.jsepCreateKernel("BiasAdd", $0, undefined);
 },
 818303: $0 => {
  Module.jsepCreateKernel("BiasSplitGelu", $0, undefined);
 },
 818364: $0 => {
  Module.jsepCreateKernel("FastGelu", $0, undefined);
 },
 818420: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) => {
  Module.jsepCreateKernel("Conv", $0, ({
   "format": $11 ? "NHWC" : "NCHW",
   "auto_pad": $1,
   "dilations": $2 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($2) >>> 0, Number($3) >>> 0)) : [],
   "group": $4,
   "kernel_shape": $5 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($5) >>> 0, Number($6) >>> 0)) : [],
   "pads": $7 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($7) >>> 0, Number($8) >>> 0)) : [],
   "strides": $9 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($9) >>> 0, Number($10) >>> 0)) : [],
   "w_is_const": () => (!!GROWABLE_HEAP_I8()[Number($12) >>> 0]),
   "activation": UTF8ToString($13),
   "activation_params": $14 ? Array.from(GROWABLE_HEAP_F32().subarray(Number($14) >>> 0, Number($15) >>> 0)) : []
  }));
 },
 819004: $0 => {
  Module.jsepCreateKernel("Gelu", $0, undefined);
 },
 819056: ($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
  Module.jsepCreateKernel("GroupQueryAttention", $0, ({
   "numHeads": $1,
   "kvNumHeads": $2,
   "scale": $3,
   "softcap": $4,
   "doRotary": $5,
   "rotaryInterleaved": $6,
   "smoothSoftmax": $7,
   "localWindowSize": $8
  }));
 },
 819273: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("LayerNormalization", $0, ({
   "axis": $1,
   "epsilon": $2,
   "simplified": !!$3
  }));
 },
 819384: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("LayerNormalization", $0, ({
   "axis": $1,
   "epsilon": $2,
   "simplified": !!$3
  }));
 },
 819495: ($0, $1, $2, $3, $4, $5) => {
  Module.jsepCreateKernel("MatMulNBits", $0, ({
   "k": $1,
   "n": $2,
   "accuracyLevel": $3,
   "bits": $4,
   "blockSize": $5
  }));
 },
 819622: ($0, $1, $2, $3, $4, $5) => {
  Module.jsepCreateKernel("MultiHeadAttention", $0, ({
   "numHeads": $1,
   "isUnidirectional": $2,
   "maskFilterValue": $3,
   "scale": $4,
   "doRotary": $5
  }));
 },
 819781: ($0, $1) => {
  Module.jsepCreateKernel("QuickGelu", $0, ({
   "alpha": $1
  }));
 },
 819845: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("RotaryEmbedding", $0, ({
   "interleaved": !!$1,
   "numHeads": $2,
   "rotaryEmbeddingDim": $3,
   "scale": $4
  }));
 },
 819984: ($0, $1, $2) => {
  Module.jsepCreateKernel("SkipLayerNormalization", $0, ({
   "epsilon": $1,
   "simplified": !!$2
  }));
 },
 820086: ($0, $1, $2) => {
  Module.jsepCreateKernel("SkipLayerNormalization", $0, ({
   "epsilon": $1,
   "simplified": !!$2
  }));
 },
 820188: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("GatherBlockQuantized", $0, ({
   "gatherAxis": $1,
   "quantizeAxis": $2,
   "blockSize": $3
  }));
 },
 820309: $0 => {
  Module.jsepReleaseKernel($0);
 },
 820343: ($0, $1) => Module.jsepRunKernel(Number($0), Number($1), Module.jsepSessionState.sessionHandle, Module.jsepSessionState.errors)
};

function __asyncjs__jsepDownload(src_data, dst_data, bytes) {
 return Asyncify.handleAsync(async () => {
  await Module.jsepCopyAsync(Number(src_data), Number(dst_data), Number(bytes));
 });
}

function HaveOffsetConverter() {
 return typeof wasmOffsetConverter !== "undefined";
}

/** @constructor */ function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = `Program terminated with exit(${status})`;
 this.status = status;
}

var terminateWorker = worker => {
 worker.terminate();
 worker.onmessage = e => {};
};

var killThread = pthread_ptr => {
 var worker = PThread.pthreads[pthread_ptr];
 delete PThread.pthreads[pthread_ptr];
 terminateWorker(worker);
 __emscripten_thread_free_data(pthread_ptr);
 PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
 worker.pthread_ptr = 0;
};

var cancelThread = pthread_ptr => {
 var worker = PThread.pthreads[pthread_ptr];
 worker.postMessage({
  "cmd": "cancel"
 });
};

var cleanupThread = pthread_ptr => {
 var worker = PThread.pthreads[pthread_ptr];
 PThread.returnWorkerToPool(worker);
};

var zeroMemory = (address, size) => {
 GROWABLE_HEAP_U8().fill(0, address, address + size);
 return address;
};

var spawnThread = threadParams => {
 var worker = PThread.getNewWorker();
 if (!worker) {
  return 6;
 }
 PThread.runningWorkers.push(worker);
 PThread.pthreads[threadParams.pthread_ptr] = worker;
 worker.pthread_ptr = threadParams.pthread_ptr;
 var msg = {
  "cmd": "run",
  "start_routine": threadParams.startRoutine,
  "arg": threadParams.arg,
  "pthread_ptr": threadParams.pthread_ptr
 };
 if (ENVIRONMENT_IS_NODE) {
  worker.unref();
 }
 worker.postMessage(msg, threadParams.transferList);
 return 0;
};

var runtimeKeepaliveCounter = 0;

var keepRuntimeAlive = () => runtimeKeepaliveCounter > 0;

var stackSave = () => _emscripten_stack_get_current();

var stackRestore = val => __emscripten_stack_restore(val);

var stackAlloc = sz => __emscripten_stack_alloc(sz);

var MAX_INT53 = 9007199254740992;

var MIN_INT53 = -9007199254740992;

var bigintToI53Checked = num => (num < MIN_INT53 || num > MAX_INT53) ? NaN : Number(num);

/** @type{function(number, (number|boolean), ...number)} */ var proxyToMainThread = (funcIndex, emAsmAddr, sync, ...callArgs) => {
 var serializedNumCallArgs = callArgs.length * 2;
 var sp = stackSave();
 var args = stackAlloc(serializedNumCallArgs * 8);
 var b = ((args) >>> 3);
 for (var i = 0; i < callArgs.length; i++) {
  var arg = callArgs[i];
  if (typeof arg == "bigint") {
   HEAP64[b + 2 * i] = 1n;
   HEAP64[b + 2 * i + 1] = arg;
  } else {
   HEAP64[b + 2 * i] = 0n;
   GROWABLE_HEAP_F64()[b + 2 * i + 1 >>> 0] = arg;
  }
 }
 var rtn = __emscripten_run_on_main_thread_js(funcIndex, emAsmAddr, serializedNumCallArgs, args, sync);
 stackRestore(sp);
 return rtn;
};

function _proc_exit(code) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(0, 0, 1, code);
 EXITSTATUS = code;
 if (!keepRuntimeAlive()) {
  PThread.terminateAllThreads();
  ABORT = true;
 }
 quit_(code, new ExitStatus(code));
}

var handleException = e => {
 if (e instanceof ExitStatus || e == "unwind") {
  return EXITSTATUS;
 }
 quit_(1, e);
};

function exitOnMainThread(returnCode) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(1, 0, 0, returnCode);
 _exit(returnCode);
}

/** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
 EXITSTATUS = status;
 if (ENVIRONMENT_IS_PTHREAD) {
  exitOnMainThread(status);
  throw "unwind";
 }
 _proc_exit(status);
};

var _exit = exitJS;

var PThread = {
 unusedWorkers: [],
 runningWorkers: [],
 tlsInitFunctions: [],
 pthreads: {},
 init() {
  if (ENVIRONMENT_IS_PTHREAD) {
   PThread.initWorker();
  } else {
   PThread.initMainThread();
  }
 },
 initMainThread() {
  var pthreadPoolSize = Module["numThreads"] - 1;
  while (pthreadPoolSize--) {
   PThread.allocateUnusedWorker();
  }
  addOnPreRun(() => {
   addRunDependency("loading-workers");
   PThread.loadWasmModuleToAllWorkers(() => removeRunDependency("loading-workers"));
  });
 },
 initWorker() {},
 setExitStatus: status => EXITSTATUS = status,
 terminateAllThreads__deps: [ "$terminateWorker" ],
 terminateAllThreads: () => {
  for (var worker of PThread.runningWorkers) {
   terminateWorker(worker);
  }
  for (var worker of PThread.unusedWorkers) {
   terminateWorker(worker);
  }
  PThread.unusedWorkers = [];
  PThread.runningWorkers = [];
  PThread.pthreads = [];
 },
 returnWorkerToPool: worker => {
  var pthread_ptr = worker.pthread_ptr;
  delete PThread.pthreads[pthread_ptr];
  PThread.unusedWorkers.push(worker);
  PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
  worker.pthread_ptr = 0;
  __emscripten_thread_free_data(pthread_ptr);
 },
 receiveObjectTransfer(data) {},
 threadInitTLS() {
  PThread.tlsInitFunctions.forEach(f => f());
 },
 loadWasmModuleToWorker: worker => new Promise(onFinishedLoading => {
  worker.onmessage = e => {
   var d = e["data"];
   var cmd = d["cmd"];
   if (d["targetThread"] && d["targetThread"] != _pthread_self()) {
    var targetWorker = PThread.pthreads[d["targetThread"]];
    if (targetWorker) {
     targetWorker.postMessage(d, d["transferList"]);
    } else {
     err(`Internal error! Worker sent a message "${cmd}" to target pthread ${d["targetThread"]}, but that thread no longer exists!`);
    }
    return;
   }
   if (cmd === "checkMailbox") {
    checkMailbox();
   } else if (cmd === "spawnThread") {
    spawnThread(d);
   } else if (cmd === "cleanupThread") {
    cleanupThread(d["thread"]);
   } else if (cmd === "killThread") {
    killThread(d["thread"]);
   } else if (cmd === "cancelThread") {
    cancelThread(d["thread"]);
   } else if (cmd === "loaded") {
    worker.loaded = true;
    if (ENVIRONMENT_IS_NODE && !worker.pthread_ptr) {
     worker.unref();
    }
    onFinishedLoading(worker);
   } else if (cmd === "alert") {
    alert(`Thread ${d["threadId"]}: ${d["text"]}`);
   } else if (d.target === "setimmediate") {
    worker.postMessage(d);
   } else if (cmd === "callHandler") {
    Module[d["handler"]](...d["args"]);
   } else if (cmd) {
    err(`worker sent an unknown command ${cmd}`);
   }
  };
  worker.onerror = e => {
   var message = "worker sent an error!";
   err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
   throw e;
  };
  if (ENVIRONMENT_IS_NODE) {
   worker.on("message", data => worker.onmessage({
    data: data
   }));
   worker.on("error", e => worker.onerror(e));
  }
  var handlers = [];
  var knownHandlers = [];
  for (var handler of knownHandlers) {
   if (Module.hasOwnProperty(handler)) {
    handlers.push(handler);
   }
  }
  worker.postMessage({
   "cmd": "load",
   "handlers": handlers,
   "wasmMemory": wasmMemory,
   "wasmModule": wasmModule
  });
 }),
 loadWasmModuleToAllWorkers(onMaybeReady) {
  if (ENVIRONMENT_IS_PTHREAD) {
   return onMaybeReady();
  }
  let pthreadPoolReady = Promise.all(PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker));
  pthreadPoolReady.then(onMaybeReady);
 },
 allocateUnusedWorker() {
  var worker;
  var workerOptions = {
   "type": "module",
   "workerData": "em-pthread",
   "name": "em-pthread"
  };
  worker = new Worker(new URL(import.meta.url), workerOptions);
  PThread.unusedWorkers.push(worker);
 },
 getNewWorker() {
  if (PThread.unusedWorkers.length == 0) {
   PThread.allocateUnusedWorker();
   PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
  }
  return PThread.unusedWorkers.pop();
 }
};

var callRuntimeCallbacks = callbacks => {
 while (callbacks.length > 0) {
  callbacks.shift()(Module);
 }
};

var establishStackSpace = () => {
 var pthread_ptr = _pthread_self();
 var stackHigh = GROWABLE_HEAP_U32()[(((pthread_ptr) + (52)) >>> 2) >>> 0];
 var stackSize = GROWABLE_HEAP_U32()[(((pthread_ptr) + (56)) >>> 2) >>> 0];
 var stackLow = stackHigh - stackSize;
 _emscripten_stack_set_limits(stackHigh, stackLow);
 stackRestore(stackHigh);
};

/**
     * @param {number} ptr
     * @param {string} type
     */ function getValue(ptr, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  return GROWABLE_HEAP_I8()[ptr >>> 0];

 case "i8":
  return GROWABLE_HEAP_I8()[ptr >>> 0];

 case "i16":
  return GROWABLE_HEAP_I16()[((ptr) >>> 1) >>> 0];

 case "i32":
  return GROWABLE_HEAP_I32()[((ptr) >>> 2) >>> 0];

 case "i64":
  return HEAP64[((ptr) >>> 3)];

 case "float":
  return GROWABLE_HEAP_F32()[((ptr) >>> 2) >>> 0];

 case "double":
  return GROWABLE_HEAP_F64()[((ptr) >>> 3) >>> 0];

 case "*":
  return GROWABLE_HEAP_U32()[((ptr) >>> 2) >>> 0];

 default:
  abort(`invalid type for getValue: ${type}`);
 }
}

var invokeEntryPoint = (ptr, arg) => {
 runtimeKeepaliveCounter = 0;
 var result = (a1 => dynCall_ii(ptr, a1))(arg);
 function finish(result) {
  if (keepRuntimeAlive()) {
   PThread.setExitStatus(result);
  } else {
   __emscripten_thread_exit(result);
  }
 }
 finish(result);
};

var registerTLSInit = tlsInitFunc => PThread.tlsInitFunctions.push(tlsInitFunc);

/**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */ function setValue(ptr, value, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  GROWABLE_HEAP_I8()[ptr >>> 0] = value;
  break;

 case "i8":
  GROWABLE_HEAP_I8()[ptr >>> 0] = value;
  break;

 case "i16":
  GROWABLE_HEAP_I16()[((ptr) >>> 1) >>> 0] = value;
  break;

 case "i32":
  GROWABLE_HEAP_I32()[((ptr) >>> 2) >>> 0] = value;
  break;

 case "i64":
  HEAP64[((ptr) >>> 3)] = BigInt(value);
  break;

 case "float":
  GROWABLE_HEAP_F32()[((ptr) >>> 2) >>> 0] = value;
  break;

 case "double":
  GROWABLE_HEAP_F64()[((ptr) >>> 3) >>> 0] = value;
  break;

 case "*":
  GROWABLE_HEAP_U32()[((ptr) >>> 2) >>> 0] = value;
  break;

 default:
  abort(`invalid type for setValue: ${type}`);
 }
}

class ExceptionInfo {
 constructor(excPtr) {
  this.excPtr = excPtr;
  this.ptr = excPtr - 24;
 }
 set_type(type) {
  GROWABLE_HEAP_U32()[(((this.ptr) + (4)) >>> 2) >>> 0] = type;
 }
 get_type() {
  return GROWABLE_HEAP_U32()[(((this.ptr) + (4)) >>> 2) >>> 0];
 }
 set_destructor(destructor) {
  GROWABLE_HEAP_U32()[(((this.ptr) + (8)) >>> 2) >>> 0] = destructor;
 }
 get_destructor() {
  return GROWABLE_HEAP_U32()[(((this.ptr) + (8)) >>> 2) >>> 0];
 }
 set_caught(caught) {
  caught = caught ? 1 : 0;
  GROWABLE_HEAP_I8()[(this.ptr) + (12) >>> 0] = caught;
 }
 get_caught() {
  return GROWABLE_HEAP_I8()[(this.ptr) + (12) >>> 0] != 0;
 }
 set_rethrown(rethrown) {
  rethrown = rethrown ? 1 : 0;
  GROWABLE_HEAP_I8()[(this.ptr) + (13) >>> 0] = rethrown;
 }
 get_rethrown() {
  return GROWABLE_HEAP_I8()[(this.ptr) + (13) >>> 0] != 0;
 }
 init(type, destructor) {
  this.set_adjusted_ptr(0);
  this.set_type(type);
  this.set_destructor(destructor);
 }
 set_adjusted_ptr(adjustedPtr) {
  GROWABLE_HEAP_U32()[(((this.ptr) + (16)) >>> 2) >>> 0] = adjustedPtr;
 }
 get_adjusted_ptr() {
  return GROWABLE_HEAP_U32()[(((this.ptr) + (16)) >>> 2) >>> 0];
 }
 get_exception_ptr() {
  var isPointer = ___cxa_is_pointer_type(this.get_type());
  if (isPointer) {
   return GROWABLE_HEAP_U32()[((this.excPtr) >>> 2) >>> 0];
  }
  var adjusted = this.get_adjusted_ptr();
  if (adjusted !== 0) return adjusted;
  return this.excPtr;
 }
}

var exceptionLast = 0;

var uncaughtExceptionCount = 0;

function ___cxa_throw(ptr, type, destructor) {
 ptr >>>= 0;
 type >>>= 0;
 destructor >>>= 0;
 var info = new ExceptionInfo(ptr);
 info.init(type, destructor);
 exceptionLast = ptr;
 uncaughtExceptionCount++;
 throw exceptionLast;
}

function pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(2, 0, 1, pthread_ptr, attr, startRoutine, arg);
 return ___pthread_create_js(pthread_ptr, attr, startRoutine, arg);
}

function ___pthread_create_js(pthread_ptr, attr, startRoutine, arg) {
 pthread_ptr >>>= 0;
 attr >>>= 0;
 startRoutine >>>= 0;
 arg >>>= 0;
 if (typeof SharedArrayBuffer == "undefined") {
  err("Current environment does not support SharedArrayBuffer, pthreads are not available!");
  return 6;
 }
 var transferList = [];
 var error = 0;
 if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
  return pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg);
 }
 if (error) return error;
 var threadParams = {
  startRoutine: startRoutine,
  pthread_ptr: pthread_ptr,
  arg: arg,
  transferList: transferList
 };
 if (ENVIRONMENT_IS_PTHREAD) {
  threadParams.cmd = "spawnThread";
  postMessage(threadParams, transferList);
  return 0;
 }
 return spawnThread(threadParams);
}

var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;

/**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */ var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
 idx >>>= 0;
 var endIdx = idx + maxBytesToRead;
 var endPtr = idx;
 while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
 if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
  return UTF8Decoder.decode(heapOrArray.buffer instanceof SharedArrayBuffer ? heapOrArray.slice(idx, endPtr) : heapOrArray.subarray(idx, endPtr));
 }
 var str = "";
 while (idx < endPtr) {
  var u0 = heapOrArray[idx++];
  if (!(u0 & 128)) {
   str += String.fromCharCode(u0);
   continue;
  }
  var u1 = heapOrArray[idx++] & 63;
  if ((u0 & 224) == 192) {
   str += String.fromCharCode(((u0 & 31) << 6) | u1);
   continue;
  }
  var u2 = heapOrArray[idx++] & 63;
  if ((u0 & 240) == 224) {
   u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
  } else {
   u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
  }
  if (u0 < 65536) {
   str += String.fromCharCode(u0);
  } else {
   var ch = u0 - 65536;
   str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
  }
 }
 return str;
};

/**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */ var UTF8ToString = (ptr, maxBytesToRead) => {
 ptr >>>= 0;
 return ptr ? UTF8ArrayToString(GROWABLE_HEAP_U8(), ptr, maxBytesToRead) : "";
};

var SYSCALLS = {
 varargs: undefined,
 getStr(ptr) {
  var ret = UTF8ToString(ptr);
  return ret;
 }
};

function ___syscall_fcntl64(fd, cmd, varargs) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(3, 0, 1, fd, cmd, varargs);
 varargs >>>= 0;
 SYSCALLS.varargs = varargs;
 return 0;
}

function ___syscall_fstat64(fd, buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(4, 0, 1, fd, buf);
 buf >>>= 0;
}

var lengthBytesUTF8 = str => {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var c = str.charCodeAt(i);
  if (c <= 127) {
   len++;
  } else if (c <= 2047) {
   len += 2;
  } else if (c >= 55296 && c <= 57343) {
   len += 4;
   ++i;
  } else {
   len += 3;
  }
 }
 return len;
};

var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
 outIdx >>>= 0;
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) {
   var u1 = str.charCodeAt(++i);
   u = 65536 + ((u & 1023) << 10) | (u1 & 1023);
  }
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   heap[outIdx++ >>> 0] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   heap[outIdx++ >>> 0] = 192 | (u >> 6);
   heap[outIdx++ >>> 0] = 128 | (u & 63);
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   heap[outIdx++ >>> 0] = 224 | (u >> 12);
   heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63);
   heap[outIdx++ >>> 0] = 128 | (u & 63);
  } else {
   if (outIdx + 3 >= endIdx) break;
   heap[outIdx++ >>> 0] = 240 | (u >> 18);
   heap[outIdx++ >>> 0] = 128 | ((u >> 12) & 63);
   heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63);
   heap[outIdx++ >>> 0] = 128 | (u & 63);
  }
 }
 heap[outIdx >>> 0] = 0;
 return outIdx - startIdx;
};

var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, GROWABLE_HEAP_U8(), outPtr, maxBytesToWrite);

function ___syscall_getcwd(buf, size) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(5, 0, 1, buf, size);
 buf >>>= 0;
 size >>>= 0;
}

function ___syscall_getdents64(fd, dirp, count) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(6, 0, 1, fd, dirp, count);
 dirp >>>= 0;
 count >>>= 0;
}

function ___syscall_ioctl(fd, op, varargs) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(7, 0, 1, fd, op, varargs);
 varargs >>>= 0;
 SYSCALLS.varargs = varargs;
 return 0;
}

function ___syscall_lstat64(path, buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(8, 0, 1, path, buf);
 path >>>= 0;
 buf >>>= 0;
}

function ___syscall_mkdirat(dirfd, path, mode) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(9, 0, 1, dirfd, path, mode);
 path >>>= 0;
}

function ___syscall_newfstatat(dirfd, path, buf, flags) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(10, 0, 1, dirfd, path, buf, flags);
 path >>>= 0;
 buf >>>= 0;
}

function syscallGetVarargI() {
 var ret = GROWABLE_HEAP_I32()[((+SYSCALLS.varargs) >>> 2) >>> 0];
 SYSCALLS.varargs += 4;
 return ret;
}

function ___syscall_openat(dirfd, path, flags, varargs) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(11, 0, 1, dirfd, path, flags, varargs);
 path >>>= 0;
 varargs >>>= 0;
 SYSCALLS.varargs = varargs;
}

function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(12, 0, 1, dirfd, path, buf, bufsize);
 path >>>= 0;
 buf >>>= 0;
 bufsize >>>= 0;
}

function ___syscall_rmdir(path) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(13, 0, 1, path);
 path >>>= 0;
}

function ___syscall_stat64(path, buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(14, 0, 1, path, buf);
 path >>>= 0;
 buf >>>= 0;
}

function ___syscall_unlinkat(dirfd, path, flags) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(15, 0, 1, dirfd, path, flags);
 path >>>= 0;
}

var __abort_js = () => {
 abort("");
};

var nowIsMonotonic = 1;

var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;

function __emscripten_init_main_thread_js(tb) {
 tb >>>= 0;
 __emscripten_thread_init(tb, /*is_main=*/ !ENVIRONMENT_IS_WORKER, /*is_runtime=*/ 1, /*can_block=*/ !ENVIRONMENT_IS_WEB, /*default_stacksize=*/ 131072, /*start_profiling=*/ false);
 PThread.threadInitTLS();
}

var maybeExit = () => {
 if (!keepRuntimeAlive()) {
  try {
   if (ENVIRONMENT_IS_PTHREAD) __emscripten_thread_exit(EXITSTATUS); else _exit(EXITSTATUS);
  } catch (e) {
   handleException(e);
  }
 }
};

var callUserCallback = func => {
 if (ABORT) {
  return;
 }
 try {
  func();
  maybeExit();
 } catch (e) {
  handleException(e);
 }
};

function __emscripten_thread_mailbox_await(pthread_ptr) {
 pthread_ptr >>>= 0;
 if (typeof Atomics.waitAsync === "function") {
  var wait = Atomics.waitAsync(GROWABLE_HEAP_I32(), ((pthread_ptr) >>> 2), pthread_ptr);
  wait.value.then(checkMailbox);
  var waitingAsync = pthread_ptr + 128;
  Atomics.store(GROWABLE_HEAP_I32(), ((waitingAsync) >>> 2), 1);
 }
}

var checkMailbox = () => {
 var pthread_ptr = _pthread_self();
 if (pthread_ptr) {
  __emscripten_thread_mailbox_await(pthread_ptr);
  callUserCallback(__emscripten_check_mailbox);
 }
};

function __emscripten_notify_mailbox_postmessage(targetThreadId, currThreadId, mainThreadId) {
 targetThreadId >>>= 0;
 currThreadId >>>= 0;
 mainThreadId >>>= 0;
 if (targetThreadId == currThreadId) {
  setTimeout(checkMailbox);
 } else if (ENVIRONMENT_IS_PTHREAD) {
  postMessage({
   "targetThread": targetThreadId,
   "cmd": "checkMailbox"
  });
 } else {
  var worker = PThread.pthreads[targetThreadId];
  if (!worker) {
   return;
  }
  worker.postMessage({
   "cmd": "checkMailbox"
  });
 }
}

var proxiedJSCallArgs = [];

function __emscripten_receive_on_main_thread_js(funcIndex, emAsmAddr, callingThread, numCallArgs, args) {
 emAsmAddr >>>= 0;
 callingThread >>>= 0;
 args >>>= 0;
 numCallArgs /= 2;
 proxiedJSCallArgs.length = numCallArgs;
 var b = ((args) >>> 3);
 for (var i = 0; i < numCallArgs; i++) {
  if (HEAP64[b + 2 * i]) {
   proxiedJSCallArgs[i] = HEAP64[b + 2 * i + 1];
  } else {
   proxiedJSCallArgs[i] = GROWABLE_HEAP_F64()[b + 2 * i + 1 >>> 0];
  }
 }
 var func = emAsmAddr ? ASM_CONSTS[emAsmAddr] : proxiedFunctionTable[funcIndex];
 PThread.currentProxiedOperationCallerThread = callingThread;
 var rtn = func(...proxiedJSCallArgs);
 PThread.currentProxiedOperationCallerThread = 0;
 return rtn;
}

function __emscripten_thread_cleanup(thread) {
 thread >>>= 0;
 if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread); else postMessage({
  "cmd": "cleanupThread",
  "thread": thread
 });
}

function __emscripten_thread_set_strongref(thread) {
 thread >>>= 0;
 if (ENVIRONMENT_IS_NODE) {
  PThread.pthreads[thread].ref();
 }
}

function __gmtime_js(time, tmPtr) {
 time = bigintToI53Checked(time);
 tmPtr >>>= 0;
 var date = new Date(time * 1e3);
 GROWABLE_HEAP_I32()[((tmPtr) >>> 2) >>> 0] = date.getUTCSeconds();
 GROWABLE_HEAP_I32()[(((tmPtr) + (4)) >>> 2) >>> 0] = date.getUTCMinutes();
 GROWABLE_HEAP_I32()[(((tmPtr) + (8)) >>> 2) >>> 0] = date.getUTCHours();
 GROWABLE_HEAP_I32()[(((tmPtr) + (12)) >>> 2) >>> 0] = date.getUTCDate();
 GROWABLE_HEAP_I32()[(((tmPtr) + (16)) >>> 2) >>> 0] = date.getUTCMonth();
 GROWABLE_HEAP_I32()[(((tmPtr) + (20)) >>> 2) >>> 0] = date.getUTCFullYear() - 1900;
 GROWABLE_HEAP_I32()[(((tmPtr) + (24)) >>> 2) >>> 0] = date.getUTCDay();
 var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
 var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
 GROWABLE_HEAP_I32()[(((tmPtr) + (28)) >>> 2) >>> 0] = yday;
}

var isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

var MONTH_DAYS_LEAP_CUMULATIVE = [ 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335 ];

var MONTH_DAYS_REGULAR_CUMULATIVE = [ 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334 ];

var ydayFromDate = date => {
 var leap = isLeapYear(date.getFullYear());
 var monthDaysCumulative = (leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE);
 var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
 return yday;
};

function __localtime_js(time, tmPtr) {
 time = bigintToI53Checked(time);
 tmPtr >>>= 0;
 var date = new Date(time * 1e3);
 GROWABLE_HEAP_I32()[((tmPtr) >>> 2) >>> 0] = date.getSeconds();
 GROWABLE_HEAP_I32()[(((tmPtr) + (4)) >>> 2) >>> 0] = date.getMinutes();
 GROWABLE_HEAP_I32()[(((tmPtr) + (8)) >>> 2) >>> 0] = date.getHours();
 GROWABLE_HEAP_I32()[(((tmPtr) + (12)) >>> 2) >>> 0] = date.getDate();
 GROWABLE_HEAP_I32()[(((tmPtr) + (16)) >>> 2) >>> 0] = date.getMonth();
 GROWABLE_HEAP_I32()[(((tmPtr) + (20)) >>> 2) >>> 0] = date.getFullYear() - 1900;
 GROWABLE_HEAP_I32()[(((tmPtr) + (24)) >>> 2) >>> 0] = date.getDay();
 var yday = ydayFromDate(date) | 0;
 GROWABLE_HEAP_I32()[(((tmPtr) + (28)) >>> 2) >>> 0] = yday;
 GROWABLE_HEAP_I32()[(((tmPtr) + (36)) >>> 2) >>> 0] = -(date.getTimezoneOffset() * 60);
 var start = new Date(date.getFullYear(), 0, 1);
 var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
 var winterOffset = start.getTimezoneOffset();
 var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
 GROWABLE_HEAP_I32()[(((tmPtr) + (32)) >>> 2) >>> 0] = dst;
}

var __mktime_js = function(tmPtr) {
 tmPtr >>>= 0;
 var ret = (() => {
  var date = new Date(GROWABLE_HEAP_I32()[(((tmPtr) + (20)) >>> 2) >>> 0] + 1900, GROWABLE_HEAP_I32()[(((tmPtr) + (16)) >>> 2) >>> 0], GROWABLE_HEAP_I32()[(((tmPtr) + (12)) >>> 2) >>> 0], GROWABLE_HEAP_I32()[(((tmPtr) + (8)) >>> 2) >>> 0], GROWABLE_HEAP_I32()[(((tmPtr) + (4)) >>> 2) >>> 0], GROWABLE_HEAP_I32()[((tmPtr) >>> 2) >>> 0], 0);
  var dst = GROWABLE_HEAP_I32()[(((tmPtr) + (32)) >>> 2) >>> 0];
  var guessedOffset = date.getTimezoneOffset();
  var start = new Date(date.getFullYear(), 0, 1);
  var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  var winterOffset = start.getTimezoneOffset();
  var dstOffset = Math.min(winterOffset, summerOffset);
  if (dst < 0) {
   GROWABLE_HEAP_I32()[(((tmPtr) + (32)) >>> 2) >>> 0] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
  } else if ((dst > 0) != (dstOffset == guessedOffset)) {
   var nonDstOffset = Math.max(winterOffset, summerOffset);
   var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
   date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
  }
  GROWABLE_HEAP_I32()[(((tmPtr) + (24)) >>> 2) >>> 0] = date.getDay();
  var yday = ydayFromDate(date) | 0;
  GROWABLE_HEAP_I32()[(((tmPtr) + (28)) >>> 2) >>> 0] = yday;
  GROWABLE_HEAP_I32()[((tmPtr) >>> 2) >>> 0] = date.getSeconds();
  GROWABLE_HEAP_I32()[(((tmPtr) + (4)) >>> 2) >>> 0] = date.getMinutes();
  GROWABLE_HEAP_I32()[(((tmPtr) + (8)) >>> 2) >>> 0] = date.getHours();
  GROWABLE_HEAP_I32()[(((tmPtr) + (12)) >>> 2) >>> 0] = date.getDate();
  GROWABLE_HEAP_I32()[(((tmPtr) + (16)) >>> 2) >>> 0] = date.getMonth();
  GROWABLE_HEAP_I32()[(((tmPtr) + (20)) >>> 2) >>> 0] = date.getYear();
  var timeMs = date.getTime();
  if (isNaN(timeMs)) {
   return -1;
  }
  return timeMs / 1e3;
 })();
 return BigInt(ret);
};

function __mmap_js(len, prot, flags, fd, offset, allocated, addr) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(16, 0, 1, len, prot, flags, fd, offset, allocated, addr);
 len >>>= 0;
 offset = bigintToI53Checked(offset);
 allocated >>>= 0;
 addr >>>= 0;
 return -52;
}

function __munmap_js(addr, len, prot, flags, fd, offset) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(17, 0, 1, addr, len, prot, flags, fd, offset);
 addr >>>= 0;
 len >>>= 0;
 offset = bigintToI53Checked(offset);
}

var __tzset_js = function(timezone, daylight, std_name, dst_name) {
 timezone >>>= 0;
 daylight >>>= 0;
 std_name >>>= 0;
 dst_name >>>= 0;
 var currentYear = (new Date).getFullYear();
 var winter = new Date(currentYear, 0, 1);
 var summer = new Date(currentYear, 6, 1);
 var winterOffset = winter.getTimezoneOffset();
 var summerOffset = summer.getTimezoneOffset();
 var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
 GROWABLE_HEAP_U32()[((timezone) >>> 2) >>> 0] = stdTimezoneOffset * 60;
 GROWABLE_HEAP_I32()[((daylight) >>> 2) >>> 0] = Number(winterOffset != summerOffset);
 var extractZone = date => date.toLocaleTimeString(undefined, {
  hour12: false,
  timeZoneName: "short"
 }).split(" ")[1];
 var winterName = extractZone(winter);
 var summerName = extractZone(summer);
 if (summerOffset < winterOffset) {
  stringToUTF8(winterName, std_name, 17);
  stringToUTF8(summerName, dst_name, 17);
 } else {
  stringToUTF8(winterName, dst_name, 17);
  stringToUTF8(summerName, std_name, 17);
 }
};

var readEmAsmArgsArray = [];

var readEmAsmArgs = (sigPtr, buf) => {
 readEmAsmArgsArray.length = 0;
 var ch;
 while (ch = GROWABLE_HEAP_U8()[sigPtr++ >>> 0]) {
  var wide = (ch != 105);
  wide &= (ch != 112);
  buf += wide && (buf % 8) ? 4 : 0;
  readEmAsmArgsArray.push(ch == 112 ? GROWABLE_HEAP_U32()[((buf) >>> 2) >>> 0] : ch == 106 ? HEAP64[((buf) >>> 3)] : ch == 105 ? GROWABLE_HEAP_I32()[((buf) >>> 2) >>> 0] : GROWABLE_HEAP_F64()[((buf) >>> 3) >>> 0]);
  buf += wide ? 8 : 4;
 }
 return readEmAsmArgsArray;
};

var runEmAsmFunction = (code, sigPtr, argbuf) => {
 var args = readEmAsmArgs(sigPtr, argbuf);
 return ASM_CONSTS[code](...args);
};

function _emscripten_asm_const_int(code, sigPtr, argbuf) {
 code >>>= 0;
 sigPtr >>>= 0;
 argbuf >>>= 0;
 return runEmAsmFunction(code, sigPtr, argbuf);
}

function _emscripten_asm_const_ptr(code, sigPtr, argbuf) {
 code >>>= 0;
 sigPtr >>>= 0;
 argbuf >>>= 0;
 return runEmAsmFunction(code, sigPtr, argbuf);
}

var warnOnce = text => {
 warnOnce.shown ||= {};
 if (!warnOnce.shown[text]) {
  warnOnce.shown[text] = 1;
  if (ENVIRONMENT_IS_NODE) text = "warning: " + text;
  err(text);
 }
};

var _emscripten_check_blocking_allowed = () => {};

var _emscripten_date_now = () => Date.now();

function _emscripten_errn(str, len) {
 str >>>= 0;
 len >>>= 0;
 return err(UTF8ToString(str, len));
}

var runtimeKeepalivePush = () => {
 runtimeKeepaliveCounter += 1;
};

var _emscripten_exit_with_live_runtime = () => {
 runtimeKeepalivePush();
 throw "unwind";
};

var getHeapMax = () => 4294901760;

function _emscripten_get_heap_max() {
 return getHeapMax();
}

var _emscripten_get_now;

_emscripten_get_now = () => performance.timeOrigin + performance.now();

var _emscripten_num_logical_cores = () => ENVIRONMENT_IS_NODE ? require("os").cpus().length : navigator["hardwareConcurrency"];

function _emscripten_pc_get_function(pc) {
 pc >>>= 0;
 abort("Cannot use emscripten_pc_get_function without -sUSE_OFFSET_CONVERTER");
 return 0;
}

var growMemory = size => {
 var b = wasmMemory.buffer;
 var pages = (size - b.byteLength + 65535) / 65536;
 try {
  wasmMemory.grow(pages);
  updateMemoryViews();
  return 1;
 } /*success*/ catch (e) {}
};

function _emscripten_resize_heap(requestedSize) {
 requestedSize >>>= 0;
 var oldSize = GROWABLE_HEAP_U8().length;
 if (requestedSize <= oldSize) {
  return false;
 }
 var maxHeapSize = getHeapMax();
 if (requestedSize > maxHeapSize) {
  return false;
 }
 var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
 for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
  var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
  overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
  var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
  var replacement = growMemory(newSize);
  if (replacement) {
   return true;
  }
 }
 return false;
}

/** @returns {number} */ var convertFrameToPC = frame => {
 abort("Cannot use convertFrameToPC (needed by __builtin_return_address) without -sUSE_OFFSET_CONVERTER");
 return 0;
};

var UNWIND_CACHE = {};

var saveInUnwindCache = callstack => {
 callstack.forEach(frame => {
  var pc = convertFrameToPC(frame);
  if (pc) {
   UNWIND_CACHE[pc] = frame;
  }
 });
};

function jsStackTrace() {
 return (new Error).stack.toString();
}

function _emscripten_stack_snapshot() {
 var callstack = jsStackTrace().split("\n");
 if (callstack[0] == "Error") {
  callstack.shift();
 }
 saveInUnwindCache(callstack);
 UNWIND_CACHE.last_addr = convertFrameToPC(callstack[3]);
 UNWIND_CACHE.last_stack = callstack;
 return UNWIND_CACHE.last_addr;
}

function _emscripten_stack_unwind_buffer(addr, buffer, count) {
 addr >>>= 0;
 buffer >>>= 0;
 var stack;
 if (UNWIND_CACHE.last_addr == addr) {
  stack = UNWIND_CACHE.last_stack;
 } else {
  stack = jsStackTrace().split("\n");
  if (stack[0] == "Error") {
   stack.shift();
  }
  saveInUnwindCache(stack);
 }
 var offset = 3;
 while (stack[offset] && convertFrameToPC(stack[offset]) != addr) {
  ++offset;
 }
 for (var i = 0; i < count && stack[i + offset]; ++i) {
  GROWABLE_HEAP_I32()[(((buffer) + (i * 4)) >>> 2) >>> 0] = convertFrameToPC(stack[i + offset]);
 }
 return i;
}

var ENV = {};

var getExecutableName = () => thisProgram || "./this.program";

var getEnvStrings = () => {
 if (!getEnvStrings.strings) {
  var lang = ((typeof navigator == "object" && navigator.languages && navigator.languages[0]) || "C").replace("-", "_") + ".UTF-8";
  var env = {
   "USER": "web_user",
   "LOGNAME": "web_user",
   "PATH": "/",
   "PWD": "/",
   "HOME": "/home/web_user",
   "LANG": lang,
   "_": getExecutableName()
  };
  for (var x in ENV) {
   if (ENV[x] === undefined) delete env[x]; else env[x] = ENV[x];
  }
  var strings = [];
  for (var x in env) {
   strings.push(`${x}=${env[x]}`);
  }
  getEnvStrings.strings = strings;
 }
 return getEnvStrings.strings;
};

var stringToAscii = (str, buffer) => {
 for (var i = 0; i < str.length; ++i) {
  GROWABLE_HEAP_I8()[buffer++ >>> 0] = str.charCodeAt(i);
 }
 GROWABLE_HEAP_I8()[buffer >>> 0] = 0;
};

var _environ_get = function(__environ, environ_buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(18, 0, 1, __environ, environ_buf);
 __environ >>>= 0;
 environ_buf >>>= 0;
 var bufSize = 0;
 getEnvStrings().forEach((string, i) => {
  var ptr = environ_buf + bufSize;
  GROWABLE_HEAP_U32()[(((__environ) + (i * 4)) >>> 2) >>> 0] = ptr;
  stringToAscii(string, ptr);
  bufSize += string.length + 1;
 });
 return 0;
};

var _environ_sizes_get = function(penviron_count, penviron_buf_size) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(19, 0, 1, penviron_count, penviron_buf_size);
 penviron_count >>>= 0;
 penviron_buf_size >>>= 0;
 var strings = getEnvStrings();
 GROWABLE_HEAP_U32()[((penviron_count) >>> 2) >>> 0] = strings.length;
 var bufSize = 0;
 strings.forEach(string => bufSize += string.length + 1);
 GROWABLE_HEAP_U32()[((penviron_buf_size) >>> 2) >>> 0] = bufSize;
 return 0;
};

function _fd_close(fd) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(20, 0, 1, fd);
 return 52;
}

function _fd_read(fd, iov, iovcnt, pnum) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(21, 0, 1, fd, iov, iovcnt, pnum);
 iov >>>= 0;
 iovcnt >>>= 0;
 pnum >>>= 0;
 return 52;
}

function _fd_seek(fd, offset, whence, newOffset) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(22, 0, 1, fd, offset, whence, newOffset);
 offset = bigintToI53Checked(offset);
 newOffset >>>= 0;
 return 70;
}

var printCharBuffers = [ null, [], [] ];

var printChar = (stream, curr) => {
 var buffer = printCharBuffers[stream];
 if (curr === 0 || curr === 10) {
  (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
  buffer.length = 0;
 } else {
  buffer.push(curr);
 }
};

var flush_NO_FILESYSTEM = () => {
 if (printCharBuffers[1].length) printChar(1, 10);
 if (printCharBuffers[2].length) printChar(2, 10);
};

function _fd_write(fd, iov, iovcnt, pnum) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(23, 0, 1, fd, iov, iovcnt, pnum);
 iov >>>= 0;
 iovcnt >>>= 0;
 pnum >>>= 0;
 var num = 0;
 for (var i = 0; i < iovcnt; i++) {
  var ptr = GROWABLE_HEAP_U32()[((iov) >>> 2) >>> 0];
  var len = GROWABLE_HEAP_U32()[(((iov) + (4)) >>> 2) >>> 0];
  iov += 8;
  for (var j = 0; j < len; j++) {
   printChar(fd, GROWABLE_HEAP_U8()[ptr + j >>> 0]);
  }
  num += len;
 }
 GROWABLE_HEAP_U32()[((pnum) >>> 2) >>> 0] = num;
 return 0;
}

/** @type {function(...*):?} */ function _int8_multiply() {
 abort("missing function: int8_multiply");
}

_int8_multiply.stub = true;

var arraySum = (array, index) => {
 var sum = 0;
 for (var i = 0; i <= index; sum += array[i++]) {}
 return sum;
};

var MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var addDays = (date, days) => {
 var newDate = new Date(date.getTime());
 while (days > 0) {
  var leap = isLeapYear(newDate.getFullYear());
  var currentMonth = newDate.getMonth();
  var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
  if (days > daysInCurrentMonth - newDate.getDate()) {
   days -= (daysInCurrentMonth - newDate.getDate() + 1);
   newDate.setDate(1);
   if (currentMonth < 11) {
    newDate.setMonth(currentMonth + 1);
   } else {
    newDate.setMonth(0);
    newDate.setFullYear(newDate.getFullYear() + 1);
   }
  } else {
   newDate.setDate(newDate.getDate() + days);
   return newDate;
  }
 }
 return newDate;
};

/** @type {function(string, boolean=, number=)} */ function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}

var writeArrayToMemory = (array, buffer) => {
 GROWABLE_HEAP_I8().set(array, buffer >>> 0);
};

function _strftime(s, maxsize, format, tm) {
 s >>>= 0;
 maxsize >>>= 0;
 format >>>= 0;
 tm >>>= 0;
 var tm_zone = GROWABLE_HEAP_U32()[(((tm) + (40)) >>> 2) >>> 0];
 var date = {
  tm_sec: GROWABLE_HEAP_I32()[((tm) >>> 2) >>> 0],
  tm_min: GROWABLE_HEAP_I32()[(((tm) + (4)) >>> 2) >>> 0],
  tm_hour: GROWABLE_HEAP_I32()[(((tm) + (8)) >>> 2) >>> 0],
  tm_mday: GROWABLE_HEAP_I32()[(((tm) + (12)) >>> 2) >>> 0],
  tm_mon: GROWABLE_HEAP_I32()[(((tm) + (16)) >>> 2) >>> 0],
  tm_year: GROWABLE_HEAP_I32()[(((tm) + (20)) >>> 2) >>> 0],
  tm_wday: GROWABLE_HEAP_I32()[(((tm) + (24)) >>> 2) >>> 0],
  tm_yday: GROWABLE_HEAP_I32()[(((tm) + (28)) >>> 2) >>> 0],
  tm_isdst: GROWABLE_HEAP_I32()[(((tm) + (32)) >>> 2) >>> 0],
  tm_gmtoff: GROWABLE_HEAP_I32()[(((tm) + (36)) >>> 2) >>> 0],
  tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
 };
 var pattern = UTF8ToString(format);
 var EXPANSION_RULES_1 = {
  "%c": "%a %b %d %H:%M:%S %Y",
  "%D": "%m/%d/%y",
  "%F": "%Y-%m-%d",
  "%h": "%b",
  "%r": "%I:%M:%S %p",
  "%R": "%H:%M",
  "%T": "%H:%M:%S",
  "%x": "%m/%d/%y",
  "%X": "%H:%M:%S",
  "%Ec": "%c",
  "%EC": "%C",
  "%Ex": "%m/%d/%y",
  "%EX": "%H:%M:%S",
  "%Ey": "%y",
  "%EY": "%Y",
  "%Od": "%d",
  "%Oe": "%e",
  "%OH": "%H",
  "%OI": "%I",
  "%Om": "%m",
  "%OM": "%M",
  "%OS": "%S",
  "%Ou": "%u",
  "%OU": "%U",
  "%OV": "%V",
  "%Ow": "%w",
  "%OW": "%W",
  "%Oy": "%y"
 };
 for (var rule in EXPANSION_RULES_1) {
  pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
 }
 var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
 var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
 function leadingSomething(value, digits, character) {
  var str = typeof value == "number" ? value.toString() : (value || "");
  while (str.length < digits) {
   str = character[0] + str;
  }
  return str;
 }
 function leadingNulls(value, digits) {
  return leadingSomething(value, digits, "0");
 }
 function compareByDay(date1, date2) {
  function sgn(value) {
   return value < 0 ? -1 : (value > 0 ? 1 : 0);
  }
  var compare;
  if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
   if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
    compare = sgn(date1.getDate() - date2.getDate());
   }
  }
  return compare;
 }
 function getFirstWeekStartDate(janFourth) {
  switch (janFourth.getDay()) {
  case 0:
   return new Date(janFourth.getFullYear() - 1, 11, 29);

  case 1:
   return janFourth;

  case 2:
   return new Date(janFourth.getFullYear(), 0, 3);

  case 3:
   return new Date(janFourth.getFullYear(), 0, 2);

  case 4:
   return new Date(janFourth.getFullYear(), 0, 1);

  case 5:
   return new Date(janFourth.getFullYear() - 1, 11, 31);

  case 6:
   return new Date(janFourth.getFullYear() - 1, 11, 30);
  }
 }
 function getWeekBasedYear(date) {
  var thisDate = addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
  var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
  var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
  var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
  var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
   if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
    return thisDate.getFullYear() + 1;
   }
   return thisDate.getFullYear();
  }
  return thisDate.getFullYear() - 1;
 }
 var EXPANSION_RULES_2 = {
  "%a": date => WEEKDAYS[date.tm_wday].substring(0, 3),
  "%A": date => WEEKDAYS[date.tm_wday],
  "%b": date => MONTHS[date.tm_mon].substring(0, 3),
  "%B": date => MONTHS[date.tm_mon],
  "%C": date => {
   var year = date.tm_year + 1900;
   return leadingNulls((year / 100) | 0, 2);
  },
  "%d": date => leadingNulls(date.tm_mday, 2),
  "%e": date => leadingSomething(date.tm_mday, 2, " "),
  "%g": date => getWeekBasedYear(date).toString().substring(2),
  "%G": getWeekBasedYear,
  "%H": date => leadingNulls(date.tm_hour, 2),
  "%I": date => {
   var twelveHour = date.tm_hour;
   if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
   return leadingNulls(twelveHour, 2);
  },
  "%j": date => leadingNulls(date.tm_mday + arraySum(isLeapYear(date.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, date.tm_mon - 1), 3),
  "%m": date => leadingNulls(date.tm_mon + 1, 2),
  "%M": date => leadingNulls(date.tm_min, 2),
  "%n": () => "\n",
  "%p": date => {
   if (date.tm_hour >= 0 && date.tm_hour < 12) {
    return "AM";
   }
   return "PM";
  },
  "%S": date => leadingNulls(date.tm_sec, 2),
  "%t": () => "\t",
  "%u": date => date.tm_wday || 7,
  "%U": date => {
   var days = date.tm_yday + 7 - date.tm_wday;
   return leadingNulls(Math.floor(days / 7), 2);
  },
  "%V": date => {
   var val = Math.floor((date.tm_yday + 7 - (date.tm_wday + 6) % 7) / 7);
   if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
    val++;
   }
   if (!val) {
    val = 52;
    var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
    if (dec31 == 4 || (dec31 == 5 && isLeapYear(date.tm_year % 400 - 1))) {
     val++;
    }
   } else if (val == 53) {
    var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
    if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1;
   }
   return leadingNulls(val, 2);
  },
  "%w": date => date.tm_wday,
  "%W": date => {
   var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
   return leadingNulls(Math.floor(days / 7), 2);
  },
  "%y": date => (date.tm_year + 1900).toString().substring(2),
  "%Y": date => date.tm_year + 1900,
  "%z": date => {
   var off = date.tm_gmtoff;
   var ahead = off >= 0;
   off = Math.abs(off) / 60;
   off = (off / 60) * 100 + (off % 60);
   return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
  },
  "%Z": date => date.tm_zone,
  "%%": () => "%"
 };
 pattern = pattern.replace(/%%/g, "\0\0");
 for (var rule in EXPANSION_RULES_2) {
  if (pattern.includes(rule)) {
   pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
  }
 }
 pattern = pattern.replace(/\0\0/g, "%");
 var bytes = intArrayFromString(pattern, false);
 if (bytes.length > maxsize) {
  return 0;
 }
 writeArrayToMemory(bytes, s);
 return bytes.length - 1;
}

function _strftime_l(s, maxsize, format, tm, loc) {
 s >>>= 0;
 maxsize >>>= 0;
 format >>>= 0;
 tm >>>= 0;
 loc >>>= 0;
 return _strftime(s, maxsize, format, tm);
}

var runAndAbortIfError = func => {
 try {
  return func();
 } catch (e) {
  abort(e);
 }
};

var sigToWasmTypes = sig => {
 var typeNames = {
  "i": "i32",
  "j": "i64",
  "f": "f32",
  "d": "f64",
  "e": "externref",
  "p": "i32"
 };
 var type = {
  parameters: [],
  results: sig[0] == "v" ? [] : [ typeNames[sig[0]] ]
 };
 for (var i = 1; i < sig.length; ++i) {
  type.parameters.push(typeNames[sig[i]]);
 }
 return type;
};

var runtimeKeepalivePop = () => {
 runtimeKeepaliveCounter -= 1;
};

var Asyncify = {
 instrumentWasmImports(imports) {
  var importPattern = /^(jsepCopy|jsepCopyAsync|jsepDownload|invoke_.*|__asyncjs__.*)$/;
  for (let [x, original] of Object.entries(imports)) {
   if (typeof original == "function") {
    let isAsyncifyImport = original.isAsync || importPattern.test(x);
   }
  }
 },
 instrumentWasmExports(exports) {
  var ret = {};
  for (let [x, original] of Object.entries(exports)) {
   if (typeof original == "function") {
    ret[x] = (...args) => {
     Asyncify.exportCallStack.push(x);
     try {
      return original(...args);
     } finally {
      if (!ABORT) {
       var y = Asyncify.exportCallStack.pop();
       Asyncify.maybeStopUnwind();
      }
     }
    };
   } else {
    ret[x] = original;
   }
  }
  return ret;
 },
 State: {
  Normal: 0,
  Unwinding: 1,
  Rewinding: 2,
  Disabled: 3
 },
 state: 0,
 StackSize: 65536,
 currData: null,
 handleSleepReturnValue: 0,
 exportCallStack: [],
 callStackNameToId: {},
 callStackIdToName: {},
 callStackId: 0,
 asyncPromiseHandlers: null,
 sleepCallbacks: [],
 getCallStackId(funcName) {
  var id = Asyncify.callStackNameToId[funcName];
  if (id === undefined) {
   id = Asyncify.callStackId++;
   Asyncify.callStackNameToId[funcName] = id;
   Asyncify.callStackIdToName[id] = funcName;
  }
  return id;
 },
 maybeStopUnwind() {
  if (Asyncify.currData && Asyncify.state === Asyncify.State.Unwinding && Asyncify.exportCallStack.length === 0) {
   Asyncify.state = Asyncify.State.Normal;
   runtimeKeepalivePush();
   runAndAbortIfError(_asyncify_stop_unwind);
   if (typeof Fibers != "undefined") {
    Fibers.trampoline();
   }
  }
 },
 whenDone() {
  return new Promise((resolve, reject) => {
   Asyncify.asyncPromiseHandlers = {
    resolve: resolve,
    reject: reject
   };
  });
 },
 allocateData() {
  var ptr = _malloc(12 + Asyncify.StackSize);
  Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
  Asyncify.setDataRewindFunc(ptr);
  return ptr;
 },
 setDataHeader(ptr, stack, stackSize) {
  GROWABLE_HEAP_U32()[((ptr) >>> 2) >>> 0] = stack;
  GROWABLE_HEAP_U32()[(((ptr) + (4)) >>> 2) >>> 0] = stack + stackSize;
 },
 setDataRewindFunc(ptr) {
  var bottomOfCallStack = Asyncify.exportCallStack[0];
  var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
  GROWABLE_HEAP_I32()[(((ptr) + (8)) >>> 2) >>> 0] = rewindId;
 },
 getDataRewindFunc(ptr) {
  var id = GROWABLE_HEAP_I32()[(((ptr) + (8)) >>> 2) >>> 0];
  var name = Asyncify.callStackIdToName[id];
  var func = wasmExports[name];
  return func;
 },
 doRewind(ptr) {
  var start = Asyncify.getDataRewindFunc(ptr);
  runtimeKeepalivePop();
  return start();
 },
 handleSleep(startAsync) {
  if (ABORT) return;
  if (Asyncify.state === Asyncify.State.Normal) {
   var reachedCallback = false;
   var reachedAfterCallback = false;
   startAsync((handleSleepReturnValue = 0) => {
    if (ABORT) return;
    Asyncify.handleSleepReturnValue = handleSleepReturnValue;
    reachedCallback = true;
    if (!reachedAfterCallback) {
     return;
    }
    Asyncify.state = Asyncify.State.Rewinding;
    runAndAbortIfError(() => _asyncify_start_rewind(Asyncify.currData));
    if (typeof Browser != "undefined" && Browser.mainLoop.func) {
     Browser.mainLoop.resume();
    }
    var asyncWasmReturnValue, isError = false;
    try {
     asyncWasmReturnValue = Asyncify.doRewind(Asyncify.currData);
    } catch (err) {
     asyncWasmReturnValue = err;
     isError = true;
    }
    var handled = false;
    if (!Asyncify.currData) {
     var asyncPromiseHandlers = Asyncify.asyncPromiseHandlers;
     if (asyncPromiseHandlers) {
      Asyncify.asyncPromiseHandlers = null;
      (isError ? asyncPromiseHandlers.reject : asyncPromiseHandlers.resolve)(asyncWasmReturnValue);
      handled = true;
     }
    }
    if (isError && !handled) {
     throw asyncWasmReturnValue;
    }
   });
   reachedAfterCallback = true;
   if (!reachedCallback) {
    Asyncify.state = Asyncify.State.Unwinding;
    Asyncify.currData = Asyncify.allocateData();
    if (typeof Browser != "undefined" && Browser.mainLoop.func) {
     Browser.mainLoop.pause();
    }
    runAndAbortIfError(() => _asyncify_start_unwind(Asyncify.currData));
   }
  } else if (Asyncify.state === Asyncify.State.Rewinding) {
   Asyncify.state = Asyncify.State.Normal;
   runAndAbortIfError(_asyncify_stop_rewind);
   _free(Asyncify.currData);
   Asyncify.currData = null;
   Asyncify.sleepCallbacks.forEach(callUserCallback);
  } else {
   abort(`invalid state: ${Asyncify.state}`);
  }
  return Asyncify.handleSleepReturnValue;
 },
 handleAsync(startAsync) {
  return Asyncify.handleSleep(wakeUp => {
   startAsync().then(wakeUp);
  });
 }
};

PThread.init();

var proxiedFunctionTable = [ _proc_exit, exitOnMainThread, pthreadCreateProxied, ___syscall_fcntl64, ___syscall_fstat64, ___syscall_getcwd, ___syscall_getdents64, ___syscall_ioctl, ___syscall_lstat64, ___syscall_mkdirat, ___syscall_newfstatat, ___syscall_openat, ___syscall_readlinkat, ___syscall_rmdir, ___syscall_stat64, ___syscall_unlinkat, __mmap_js, __munmap_js, _environ_get, _environ_sizes_get, _fd_close, _fd_read, _fd_seek, _fd_write ];

var wasmImports;

function assignWasmImports() {
 wasmImports = {
  /** @export */ HaveOffsetConverter: HaveOffsetConverter,
  /** @export */ __asyncjs__jsepDownload: __asyncjs__jsepDownload,
  /** @export */ __cxa_throw: ___cxa_throw,
  /** @export */ __pthread_create_js: ___pthread_create_js,
  /** @export */ __syscall_fcntl64: ___syscall_fcntl64,
  /** @export */ __syscall_fstat64: ___syscall_fstat64,
  /** @export */ __syscall_getcwd: ___syscall_getcwd,
  /** @export */ __syscall_getdents64: ___syscall_getdents64,
  /** @export */ __syscall_ioctl: ___syscall_ioctl,
  /** @export */ __syscall_lstat64: ___syscall_lstat64,
  /** @export */ __syscall_mkdirat: ___syscall_mkdirat,
  /** @export */ __syscall_newfstatat: ___syscall_newfstatat,
  /** @export */ __syscall_openat: ___syscall_openat,
  /** @export */ __syscall_readlinkat: ___syscall_readlinkat,
  /** @export */ __syscall_rmdir: ___syscall_rmdir,
  /** @export */ __syscall_stat64: ___syscall_stat64,
  /** @export */ __syscall_unlinkat: ___syscall_unlinkat,
  /** @export */ _abort_js: __abort_js,
  /** @export */ _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
  /** @export */ _emscripten_init_main_thread_js: __emscripten_init_main_thread_js,
  /** @export */ _emscripten_notify_mailbox_postmessage: __emscripten_notify_mailbox_postmessage,
  /** @export */ _emscripten_receive_on_main_thread_js: __emscripten_receive_on_main_thread_js,
  /** @export */ _emscripten_thread_cleanup: __emscripten_thread_cleanup,
  /** @export */ _emscripten_thread_mailbox_await: __emscripten_thread_mailbox_await,
  /** @export */ _emscripten_thread_set_strongref: __emscripten_thread_set_strongref,
  /** @export */ _gmtime_js: __gmtime_js,
  /** @export */ _localtime_js: __localtime_js,
  /** @export */ _mktime_js: __mktime_js,
  /** @export */ _mmap_js: __mmap_js,
  /** @export */ _munmap_js: __munmap_js,
  /** @export */ _tzset_js: __tzset_js,
  /** @export */ emscripten_asm_const_int: _emscripten_asm_const_int,
  /** @export */ emscripten_asm_const_ptr: _emscripten_asm_const_ptr,
  /** @export */ emscripten_check_blocking_allowed: _emscripten_check_blocking_allowed,
  /** @export */ emscripten_date_now: _emscripten_date_now,
  /** @export */ emscripten_errn: _emscripten_errn,
  /** @export */ emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime,
  /** @export */ emscripten_get_heap_max: _emscripten_get_heap_max,
  /** @export */ emscripten_get_now: _emscripten_get_now,
  /** @export */ emscripten_num_logical_cores: _emscripten_num_logical_cores,
  /** @export */ emscripten_pc_get_function: _emscripten_pc_get_function,
  /** @export */ emscripten_resize_heap: _emscripten_resize_heap,
  /** @export */ emscripten_stack_snapshot: _emscripten_stack_snapshot,
  /** @export */ emscripten_stack_unwind_buffer: _emscripten_stack_unwind_buffer,
  /** @export */ environ_get: _environ_get,
  /** @export */ environ_sizes_get: _environ_sizes_get,
  /** @export */ exit: _exit,
  /** @export */ fd_close: _fd_close,
  /** @export */ fd_read: _fd_read,
  /** @export */ fd_seek: _fd_seek,
  /** @export */ fd_write: _fd_write,
  /** @export */ int8_multiply: _int8_multiply,
  /** @export */ memory: wasmMemory,
  /** @export */ proc_exit: _proc_exit,
  /** @export */ strftime: _strftime,
  /** @export */ strftime_l: _strftime_l
 };
}

var wasmExports = createWasm();

var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["__wasm_call_ctors"])();

var _OrtInit = Module["_OrtInit"] = (a0, a1) => (_OrtInit = Module["_OrtInit"] = wasmExports["OrtInit"])(a0, a1);

var _OrtGetLastError = Module["_OrtGetLastError"] = (a0, a1) => (_OrtGetLastError = Module["_OrtGetLastError"] = wasmExports["OrtGetLastError"])(a0, a1);

var _OrtCreateSessionOptions = Module["_OrtCreateSessionOptions"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_OrtCreateSessionOptions = Module["_OrtCreateSessionOptions"] = wasmExports["OrtCreateSessionOptions"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);

var _OrtAppendExecutionProvider = Module["_OrtAppendExecutionProvider"] = (a0, a1) => (_OrtAppendExecutionProvider = Module["_OrtAppendExecutionProvider"] = wasmExports["OrtAppendExecutionProvider"])(a0, a1);

var _OrtAddFreeDimensionOverride = Module["_OrtAddFreeDimensionOverride"] = (a0, a1, a2) => (_OrtAddFreeDimensionOverride = Module["_OrtAddFreeDimensionOverride"] = wasmExports["OrtAddFreeDimensionOverride"])(a0, a1, a2);

var _OrtAddSessionConfigEntry = Module["_OrtAddSessionConfigEntry"] = (a0, a1, a2) => (_OrtAddSessionConfigEntry = Module["_OrtAddSessionConfigEntry"] = wasmExports["OrtAddSessionConfigEntry"])(a0, a1, a2);

var _OrtReleaseSessionOptions = Module["_OrtReleaseSessionOptions"] = a0 => (_OrtReleaseSessionOptions = Module["_OrtReleaseSessionOptions"] = wasmExports["OrtReleaseSessionOptions"])(a0);

var _OrtCreateSession = Module["_OrtCreateSession"] = (a0, a1, a2) => (_OrtCreateSession = Module["_OrtCreateSession"] = wasmExports["OrtCreateSession"])(a0, a1, a2);

var _OrtReleaseSession = Module["_OrtReleaseSession"] = a0 => (_OrtReleaseSession = Module["_OrtReleaseSession"] = wasmExports["OrtReleaseSession"])(a0);

var _OrtGetInputOutputCount = Module["_OrtGetInputOutputCount"] = (a0, a1, a2) => (_OrtGetInputOutputCount = Module["_OrtGetInputOutputCount"] = wasmExports["OrtGetInputOutputCount"])(a0, a1, a2);

var _OrtGetInputName = Module["_OrtGetInputName"] = (a0, a1) => (_OrtGetInputName = Module["_OrtGetInputName"] = wasmExports["OrtGetInputName"])(a0, a1);

var _OrtGetOutputName = Module["_OrtGetOutputName"] = (a0, a1) => (_OrtGetOutputName = Module["_OrtGetOutputName"] = wasmExports["OrtGetOutputName"])(a0, a1);

var _OrtFree = Module["_OrtFree"] = a0 => (_OrtFree = Module["_OrtFree"] = wasmExports["OrtFree"])(a0);

var _OrtCreateTensor = Module["_OrtCreateTensor"] = (a0, a1, a2, a3, a4, a5) => (_OrtCreateTensor = Module["_OrtCreateTensor"] = wasmExports["OrtCreateTensor"])(a0, a1, a2, a3, a4, a5);

var _OrtGetTensorData = Module["_OrtGetTensorData"] = (a0, a1, a2, a3, a4) => (_OrtGetTensorData = Module["_OrtGetTensorData"] = wasmExports["OrtGetTensorData"])(a0, a1, a2, a3, a4);

var _OrtReleaseTensor = Module["_OrtReleaseTensor"] = a0 => (_OrtReleaseTensor = Module["_OrtReleaseTensor"] = wasmExports["OrtReleaseTensor"])(a0);

var _OrtCreateRunOptions = Module["_OrtCreateRunOptions"] = (a0, a1, a2, a3) => (_OrtCreateRunOptions = Module["_OrtCreateRunOptions"] = wasmExports["OrtCreateRunOptions"])(a0, a1, a2, a3);

var _OrtAddRunConfigEntry = Module["_OrtAddRunConfigEntry"] = (a0, a1, a2) => (_OrtAddRunConfigEntry = Module["_OrtAddRunConfigEntry"] = wasmExports["OrtAddRunConfigEntry"])(a0, a1, a2);

var _OrtReleaseRunOptions = Module["_OrtReleaseRunOptions"] = a0 => (_OrtReleaseRunOptions = Module["_OrtReleaseRunOptions"] = wasmExports["OrtReleaseRunOptions"])(a0);

var _OrtCreateBinding = Module["_OrtCreateBinding"] = a0 => (_OrtCreateBinding = Module["_OrtCreateBinding"] = wasmExports["OrtCreateBinding"])(a0);

var _OrtBindInput = Module["_OrtBindInput"] = (a0, a1, a2) => (_OrtBindInput = Module["_OrtBindInput"] = wasmExports["OrtBindInput"])(a0, a1, a2);

var _OrtBindOutput = Module["_OrtBindOutput"] = (a0, a1, a2, a3) => (_OrtBindOutput = Module["_OrtBindOutput"] = wasmExports["OrtBindOutput"])(a0, a1, a2, a3);

var _OrtClearBoundOutputs = Module["_OrtClearBoundOutputs"] = a0 => (_OrtClearBoundOutputs = Module["_OrtClearBoundOutputs"] = wasmExports["OrtClearBoundOutputs"])(a0);

var _OrtReleaseBinding = Module["_OrtReleaseBinding"] = a0 => (_OrtReleaseBinding = Module["_OrtReleaseBinding"] = wasmExports["OrtReleaseBinding"])(a0);

var _OrtRunWithBinding = Module["_OrtRunWithBinding"] = (a0, a1, a2, a3, a4) => (_OrtRunWithBinding = Module["_OrtRunWithBinding"] = wasmExports["OrtRunWithBinding"])(a0, a1, a2, a3, a4);

var _OrtRun = Module["_OrtRun"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_OrtRun = Module["_OrtRun"] = wasmExports["OrtRun"])(a0, a1, a2, a3, a4, a5, a6, a7);

var _OrtEndProfiling = Module["_OrtEndProfiling"] = a0 => (_OrtEndProfiling = Module["_OrtEndProfiling"] = wasmExports["OrtEndProfiling"])(a0);

var _JsepOutput = Module["_JsepOutput"] = (a0, a1, a2) => (_JsepOutput = Module["_JsepOutput"] = wasmExports["JsepOutput"])(a0, a1, a2);

var _JsepGetNodeName = Module["_JsepGetNodeName"] = a0 => (_JsepGetNodeName = Module["_JsepGetNodeName"] = wasmExports["JsepGetNodeName"])(a0);

var _pthread_self = () => (_pthread_self = wasmExports["pthread_self"])();

var _free = Module["_free"] = a0 => (_free = Module["_free"] = wasmExports["free"])(a0);

var _malloc = Module["_malloc"] = a0 => (_malloc = Module["_malloc"] = wasmExports["malloc"])(a0);

var __emscripten_tls_init = () => (__emscripten_tls_init = wasmExports["_emscripten_tls_init"])();

var __emscripten_thread_init = (a0, a1, a2, a3, a4, a5) => (__emscripten_thread_init = wasmExports["_emscripten_thread_init"])(a0, a1, a2, a3, a4, a5);

var __emscripten_thread_crashed = () => (__emscripten_thread_crashed = wasmExports["_emscripten_thread_crashed"])();

var _emscripten_main_thread_process_queued_calls = () => (_emscripten_main_thread_process_queued_calls = wasmExports["emscripten_main_thread_process_queued_calls"])();

var _emscripten_main_runtime_thread_id = () => (_emscripten_main_runtime_thread_id = wasmExports["emscripten_main_runtime_thread_id"])();

var __emscripten_run_on_main_thread_js = (a0, a1, a2, a3, a4) => (__emscripten_run_on_main_thread_js = wasmExports["_emscripten_run_on_main_thread_js"])(a0, a1, a2, a3, a4);

var __emscripten_thread_free_data = a0 => (__emscripten_thread_free_data = wasmExports["_emscripten_thread_free_data"])(a0);

var __emscripten_thread_exit = a0 => (__emscripten_thread_exit = wasmExports["_emscripten_thread_exit"])(a0);

var __emscripten_check_mailbox = () => (__emscripten_check_mailbox = wasmExports["_emscripten_check_mailbox"])();

var _emscripten_stack_set_limits = (a0, a1) => (_emscripten_stack_set_limits = wasmExports["emscripten_stack_set_limits"])(a0, a1);

var __emscripten_stack_restore = a0 => (__emscripten_stack_restore = wasmExports["_emscripten_stack_restore"])(a0);

var __emscripten_stack_alloc = a0 => (__emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"])(a0);

var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"])();

var ___cxa_increment_exception_refcount = a0 => (___cxa_increment_exception_refcount = wasmExports["__cxa_increment_exception_refcount"])(a0);

var ___cxa_is_pointer_type = a0 => (___cxa_is_pointer_type = wasmExports["__cxa_is_pointer_type"])(a0);

var dynCall_ii = Module["dynCall_ii"] = (a0, a1) => (dynCall_ii = Module["dynCall_ii"] = wasmExports["dynCall_ii"])(a0, a1);

var dynCall_vi = Module["dynCall_vi"] = (a0, a1) => (dynCall_vi = Module["dynCall_vi"] = wasmExports["dynCall_vi"])(a0, a1);

var dynCall_iiii = Module["dynCall_iiii"] = (a0, a1, a2, a3) => (dynCall_iiii = Module["dynCall_iiii"] = wasmExports["dynCall_iiii"])(a0, a1, a2, a3);

var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = wasmExports["dynCall_viiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);

var dynCall_i = Module["dynCall_i"] = a0 => (dynCall_i = Module["dynCall_i"] = wasmExports["dynCall_i"])(a0);

var dynCall_viiiiii = Module["dynCall_viiiiii"] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_viiiiii = Module["dynCall_viiiiii"] = wasmExports["dynCall_viiiiii"])(a0, a1, a2, a3, a4, a5, a6);

var dynCall_viijj = Module["dynCall_viijj"] = (a0, a1, a2, a3, a4) => (dynCall_viijj = Module["dynCall_viijj"] = wasmExports["dynCall_viijj"])(a0, a1, a2, a3, a4);

var dynCall_vii = Module["dynCall_vii"] = (a0, a1, a2) => (dynCall_vii = Module["dynCall_vii"] = wasmExports["dynCall_vii"])(a0, a1, a2);

var dynCall_iii = Module["dynCall_iii"] = (a0, a1, a2) => (dynCall_iii = Module["dynCall_iii"] = wasmExports["dynCall_iii"])(a0, a1, a2);

var dynCall_viiii = Module["dynCall_viiii"] = (a0, a1, a2, a3, a4) => (dynCall_viiii = Module["dynCall_viiii"] = wasmExports["dynCall_viiii"])(a0, a1, a2, a3, a4);

var dynCall_vfiii = Module["dynCall_vfiii"] = (a0, a1, a2, a3, a4) => (dynCall_vfiii = Module["dynCall_vfiii"] = wasmExports["dynCall_vfiii"])(a0, a1, a2, a3, a4);

var dynCall_viiiiff = Module["dynCall_viiiiff"] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_viiiiff = Module["dynCall_viiiiff"] = wasmExports["dynCall_viiiiff"])(a0, a1, a2, a3, a4, a5, a6);

var dynCall_viiiiiff = Module["dynCall_viiiiiff"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_viiiiiff = Module["dynCall_viiiiiff"] = wasmExports["dynCall_viiiiiff"])(a0, a1, a2, a3, a4, a5, a6, a7);

var dynCall_ffff = Module["dynCall_ffff"] = (a0, a1, a2, a3) => (dynCall_ffff = Module["dynCall_ffff"] = wasmExports["dynCall_ffff"])(a0, a1, a2, a3);

var dynCall_viiff = Module["dynCall_viiff"] = (a0, a1, a2, a3, a4) => (dynCall_viiff = Module["dynCall_viiff"] = wasmExports["dynCall_viiff"])(a0, a1, a2, a3, a4);

var dynCall_fffffff = Module["dynCall_fffffff"] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_fffffff = Module["dynCall_fffffff"] = wasmExports["dynCall_fffffff"])(a0, a1, a2, a3, a4, a5, a6);

var dynCall_viiiii = Module["dynCall_viiiii"] = (a0, a1, a2, a3, a4, a5) => (dynCall_viiiii = Module["dynCall_viiiii"] = wasmExports["dynCall_viiiii"])(a0, a1, a2, a3, a4, a5);

var dynCall_jjjjjjj = Module["dynCall_jjjjjjj"] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_jjjjjjj = Module["dynCall_jjjjjjj"] = wasmExports["dynCall_jjjjjjj"])(a0, a1, a2, a3, a4, a5, a6);

var dynCall_jjjjjj = Module["dynCall_jjjjjj"] = (a0, a1, a2, a3, a4, a5) => (dynCall_jjjjjj = Module["dynCall_jjjjjj"] = wasmExports["dynCall_jjjjjj"])(a0, a1, a2, a3, a4, a5);

var dynCall_iijjii = Module["dynCall_iijjii"] = (a0, a1, a2, a3, a4, a5) => (dynCall_iijjii = Module["dynCall_iijjii"] = wasmExports["dynCall_iijjii"])(a0, a1, a2, a3, a4, a5);

var dynCall_viiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) => (dynCall_viiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiii"] = wasmExports["dynCall_viiiiiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);

var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = wasmExports["dynCall_iiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7);

var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) => (dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = wasmExports["dynCall_viiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);

var dynCall_viiiiiiiiiii = Module["dynCall_viiiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) => (dynCall_viiiiiiiiiii = Module["dynCall_viiiiiiiiiii"] = wasmExports["dynCall_viiiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);

var dynCall_viiiiiiiiiiii = Module["dynCall_viiiiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) => (dynCall_viiiiiiiiiiii = Module["dynCall_viiiiiiiiiiii"] = wasmExports["dynCall_viiiiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);

var dynCall_viiiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18) => (dynCall_viiiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiiiii"] = wasmExports["dynCall_viiiiiiiiiiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18);

var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = wasmExports["dynCall_viiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);

var dynCall_viiiiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) => (dynCall_viiiiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiiiiii"] = wasmExports["dynCall_viiiiiiiiiiiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19);

var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_viiiiiii = Module["dynCall_viiiiiii"] = wasmExports["dynCall_viiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7);

var dynCall_viiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) => (dynCall_viiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiii"] = wasmExports["dynCall_viiiiiiiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);

var dynCall_viii = Module["dynCall_viii"] = (a0, a1, a2, a3) => (dynCall_viii = Module["dynCall_viii"] = wasmExports["dynCall_viii"])(a0, a1, a2, a3);

var dynCall_iiiii = Module["dynCall_iiiii"] = (a0, a1, a2, a3, a4) => (dynCall_iiiii = Module["dynCall_iiiii"] = wasmExports["dynCall_iiiii"])(a0, a1, a2, a3, a4);

var dynCall_jiji = Module["dynCall_jiji"] = (a0, a1, a2, a3) => (dynCall_jiji = Module["dynCall_jiji"] = wasmExports["dynCall_jiji"])(a0, a1, a2, a3);

var dynCall_v = Module["dynCall_v"] = a0 => (dynCall_v = Module["dynCall_v"] = wasmExports["dynCall_v"])(a0);

var dynCall_iidiiii = Module["dynCall_iidiiii"] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_iidiiii = Module["dynCall_iidiiii"] = wasmExports["dynCall_iidiiii"])(a0, a1, a2, a3, a4, a5, a6);

var dynCall_iiiiii = Module["dynCall_iiiiii"] = (a0, a1, a2, a3, a4, a5) => (dynCall_iiiiii = Module["dynCall_iiiiii"] = wasmExports["dynCall_iiiiii"])(a0, a1, a2, a3, a4, a5);

var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = wasmExports["dynCall_iiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);

var dynCall_iiij = Module["dynCall_iiij"] = (a0, a1, a2, a3) => (dynCall_iiij = Module["dynCall_iiij"] = wasmExports["dynCall_iiij"])(a0, a1, a2, a3);

var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_iiiiiii = Module["dynCall_iiiiiii"] = wasmExports["dynCall_iiiiiii"])(a0, a1, a2, a3, a4, a5, a6);

var dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = wasmExports["dynCall_iiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);

var dynCall_iiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) => (dynCall_iiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiii"] = wasmExports["dynCall_iiiiiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);

var dynCall_iiiiiiiiiii = Module["dynCall_iiiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) => (dynCall_iiiiiiiiiii = Module["dynCall_iiiiiiiiiii"] = wasmExports["dynCall_iiiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);

var dynCall_ji = Module["dynCall_ji"] = (a0, a1) => (dynCall_ji = Module["dynCall_ji"] = wasmExports["dynCall_ji"])(a0, a1);

var dynCall_vij = Module["dynCall_vij"] = (a0, a1, a2) => (dynCall_vij = Module["dynCall_vij"] = wasmExports["dynCall_vij"])(a0, a1, a2);

var dynCall_viiijii = Module["dynCall_viiijii"] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_viiijii = Module["dynCall_viiijii"] = wasmExports["dynCall_viiijii"])(a0, a1, a2, a3, a4, a5, a6);

var dynCall_viijiiiiiiiiii = Module["dynCall_viijiiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) => (dynCall_viijiiiiiiiiii = Module["dynCall_viijiiiiiiiiii"] = wasmExports["dynCall_viijiiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);

var dynCall_viiij = Module["dynCall_viiij"] = (a0, a1, a2, a3, a4) => (dynCall_viiij = Module["dynCall_viiij"] = wasmExports["dynCall_viiij"])(a0, a1, a2, a3, a4);

var dynCall_fi = Module["dynCall_fi"] = (a0, a1) => (dynCall_fi = Module["dynCall_fi"] = wasmExports["dynCall_fi"])(a0, a1);

var dynCall_fii = Module["dynCall_fii"] = (a0, a1, a2) => (dynCall_fii = Module["dynCall_fii"] = wasmExports["dynCall_fii"])(a0, a1, a2);

var dynCall_jii = Module["dynCall_jii"] = (a0, a1, a2) => (dynCall_jii = Module["dynCall_jii"] = wasmExports["dynCall_jii"])(a0, a1, a2);

var dynCall_dii = Module["dynCall_dii"] = (a0, a1, a2) => (dynCall_dii = Module["dynCall_dii"] = wasmExports["dynCall_dii"])(a0, a1, a2);

var dynCall_fiiii = Module["dynCall_fiiii"] = (a0, a1, a2, a3, a4) => (dynCall_fiiii = Module["dynCall_fiiii"] = wasmExports["dynCall_fiiii"])(a0, a1, a2, a3, a4);

var dynCall_fif = Module["dynCall_fif"] = (a0, a1, a2) => (dynCall_fif = Module["dynCall_fif"] = wasmExports["dynCall_fif"])(a0, a1, a2);

var dynCall_jfi = Module["dynCall_jfi"] = (a0, a1, a2) => (dynCall_jfi = Module["dynCall_jfi"] = wasmExports["dynCall_jfi"])(a0, a1, a2);

var dynCall_viiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) => (dynCall_viiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiii"] = wasmExports["dynCall_viiiiiiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);

var dynCall_viiiiiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20) => (dynCall_viiiiiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiiiiiii"] = wasmExports["dynCall_viiiiiiiiiiiiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20);

var dynCall_viiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) => (dynCall_viiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiii"] = wasmExports["dynCall_viiiiiiiiiiiiiiii"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);

var dynCall_viij = Module["dynCall_viij"] = (a0, a1, a2, a3) => (dynCall_viij = Module["dynCall_viij"] = wasmExports["dynCall_viij"])(a0, a1, a2, a3);

var dynCall_jiij = Module["dynCall_jiij"] = (a0, a1, a2, a3) => (dynCall_jiij = Module["dynCall_jiij"] = wasmExports["dynCall_jiij"])(a0, a1, a2, a3);

var dynCall_fiii = Module["dynCall_fiii"] = (a0, a1, a2, a3) => (dynCall_fiii = Module["dynCall_fiii"] = wasmExports["dynCall_fiii"])(a0, a1, a2, a3);

var dynCall_iif = Module["dynCall_iif"] = (a0, a1, a2) => (dynCall_iif = Module["dynCall_iif"] = wasmExports["dynCall_iif"])(a0, a1, a2);

var dynCall_jiiii = Module["dynCall_jiiii"] = (a0, a1, a2, a3, a4) => (dynCall_jiiii = Module["dynCall_jiiii"] = wasmExports["dynCall_jiiii"])(a0, a1, a2, a3, a4);

var dynCall_jiii = Module["dynCall_jiii"] = (a0, a1, a2, a3) => (dynCall_jiii = Module["dynCall_jiii"] = wasmExports["dynCall_jiii"])(a0, a1, a2, a3);

var dynCall_viif = Module["dynCall_viif"] = (a0, a1, a2, a3) => (dynCall_viif = Module["dynCall_viif"] = wasmExports["dynCall_viif"])(a0, a1, a2, a3);

var dynCall_viiiijii = Module["dynCall_viiiijii"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_viiiijii = Module["dynCall_viiiijii"] = wasmExports["dynCall_viiiijii"])(a0, a1, a2, a3, a4, a5, a6, a7);

var dynCall_viijii = Module["dynCall_viijii"] = (a0, a1, a2, a3, a4, a5) => (dynCall_viijii = Module["dynCall_viijii"] = wasmExports["dynCall_viijii"])(a0, a1, a2, a3, a4, a5);

var dynCall_iiiiij = Module["dynCall_iiiiij"] = (a0, a1, a2, a3, a4, a5) => (dynCall_iiiiij = Module["dynCall_iiiiij"] = wasmExports["dynCall_iiiiij"])(a0, a1, a2, a3, a4, a5);

var dynCall_iiiiid = Module["dynCall_iiiiid"] = (a0, a1, a2, a3, a4, a5) => (dynCall_iiiiid = Module["dynCall_iiiiid"] = wasmExports["dynCall_iiiiid"])(a0, a1, a2, a3, a4, a5);

var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_iiiiijj = Module["dynCall_iiiiijj"] = wasmExports["dynCall_iiiiijj"])(a0, a1, a2, a3, a4, a5, a6);

var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = wasmExports["dynCall_iiiiiijj"])(a0, a1, a2, a3, a4, a5, a6, a7);

var _asyncify_start_unwind = a0 => (_asyncify_start_unwind = wasmExports["asyncify_start_unwind"])(a0);

var _asyncify_stop_unwind = () => (_asyncify_stop_unwind = wasmExports["asyncify_stop_unwind"])();

var _asyncify_start_rewind = a0 => (_asyncify_start_rewind = wasmExports["asyncify_start_rewind"])(a0);

var _asyncify_stop_rewind = () => (_asyncify_stop_rewind = wasmExports["asyncify_stop_rewind"])();

var ___start_em_js = Module["___start_em_js"] = 820471;

var ___stop_em_js = Module["___stop_em_js"] = 820717;

function applySignatureConversions(wasmExports) {
 wasmExports = Object.assign({}, wasmExports);
 var makeWrapper_p = f => () => f() >>> 0;
 var makeWrapper_pp = f => a0 => f(a0) >>> 0;
 wasmExports["pthread_self"] = makeWrapper_p(wasmExports["pthread_self"]);
 wasmExports["malloc"] = makeWrapper_pp(wasmExports["malloc"]);
 wasmExports["emscripten_main_runtime_thread_id"] = makeWrapper_p(wasmExports["emscripten_main_runtime_thread_id"]);
 wasmExports["_emscripten_stack_alloc"] = makeWrapper_pp(wasmExports["_emscripten_stack_alloc"]);
 wasmExports["emscripten_stack_get_current"] = makeWrapper_p(wasmExports["emscripten_stack_get_current"]);
 return wasmExports;
}

Module["stackSave"] = stackSave;

Module["stackRestore"] = stackRestore;

Module["stackAlloc"] = stackAlloc;

Module["setValue"] = setValue;

Module["getValue"] = getValue;

Module["UTF8ToString"] = UTF8ToString;

Module["stringToUTF8"] = stringToUTF8;

Module["lengthBytesUTF8"] = lengthBytesUTF8;

var calledRun;

dependenciesFulfilled = function runCaller() {
 if (!calledRun) run();
 if (!calledRun) dependenciesFulfilled = runCaller;
};

function run() {
 if (runDependencies > 0) {
  return;
 }
 if (ENVIRONMENT_IS_PTHREAD) {
  readyPromiseResolve(Module);
  initRuntime();
  startWorker(Module);
  return;
 }
 preRun();
 if (runDependencies > 0) {
  return;
 }
 function doRun() {
  if (calledRun) return;
  calledRun = true;
  Module["calledRun"] = true;
  if (ABORT) return;
  initRuntime();
  readyPromiseResolve(Module);
  postRun();
 }
 {
  doRun();
 }
}

run();

"use strict";

Module["PTR_SIZE"] = 4;

moduleRtn = readyPromise;


  return moduleRtn;
}
);
})();
export default ortWasmThreaded;
var isPthread = globalThis.self?.name === 'em-pthread';
var isNode = typeof globalThis.process?.versions?.node == 'string';
if (isNode) isPthread = (await import('worker_threads')).workerData === 'em-pthread';

// When running as a pthread, construct a new instance on startup
isPthread && ortWasmThreaded();
