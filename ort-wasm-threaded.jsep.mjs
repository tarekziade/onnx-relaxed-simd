
var ortWasmThreaded = (() => {
  var _scriptName = import.meta.url;
  
  return (
async function(moduleArg = {}) {
  var moduleRtn;

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

[ "_malloc", "_free", "_JsepOutput", "_JsepGetNodeName", "getExceptionMessage", "$incrementExceptionRefcount", "$decrementExceptionRefcount", "_OrtInit", "_OrtGetLastError", "_OrtCreateSessionOptions", "_OrtAppendExecutionProvider", "_OrtAddFreeDimensionOverride", "_OrtAddSessionConfigEntry", "_OrtReleaseSessionOptions", "_OrtCreateSession", "_OrtReleaseSession", "_OrtGetInputOutputCount", "_OrtGetInputName", "_OrtGetOutputName", "_OrtFree", "_OrtCreateTensor", "_OrtGetTensorData", "_OrtReleaseTensor", "_OrtCreateRunOptions", "_OrtAddRunConfigEntry", "_OrtReleaseRunOptions", "_OrtCreateBinding", "_OrtBindInput", "_OrtBindOutput", "_OrtClearBoundOutputs", "_OrtReleaseBinding", "_OrtRunWithBinding", "_OrtRun", "_OrtEndProfiling", "___indirect_function_table", "___asyncjs__jsepDownload", "_HaveOffsetConverter", "___set_stack_limits", "onRuntimeInitialized" ].forEach(prop => {
 if (!Object.getOwnPropertyDescriptor(readyPromise, prop)) {
  Object.defineProperty(readyPromise, prop, {
   get: () => abort("You are getting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"),
   set: () => abort("You are setting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")
  });
 }
});

var ENVIRONMENT_IS_WEB = typeof window == "object";

var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";

var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";

var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module["ENVIRONMENT"]) {
 throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
}

var ENVIRONMENT_IS_PTHREAD = ENVIRONMENT_IS_WORKER && self.name == "em-pthread";

if (ENVIRONMENT_IS_PTHREAD) {
 assert(!globalThis.moduleLoaded, "module should only be loaded once on each pthread worker");
 globalThis.moduleLoaded = true;
}

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
  Module.jsepRegisterMLConstant = (externalFilePath, dataOffset, dataLength, builder, desc) => backend["registerMLConstant"](externalFilePath, dataOffset, dataLength, builder, desc, Module.MountedFiles);
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
 if (typeof process == "undefined" || !process.release || process.release.name !== "node") throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
 var nodeVersion = process.versions.node;
 var numericVersion = nodeVersion.split(".").slice(0, 3);
 numericVersion = (numericVersion[0] * 1e4) + (numericVersion[1] * 100) + (numericVersion[2].split("-")[0] * 1);
 var minVersion = 16e4;
 if (numericVersion < 16e4) {
  throw new Error("This emscripten-generated code requires node v16.0.0 (detected v" + nodeVersion + ")");
 }
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
  assert(ret.buffer);
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
} else if (ENVIRONMENT_IS_SHELL) {
 if ((typeof process == "object" && typeof require === "function") || typeof window == "object" || typeof importScripts == "function") throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
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
 if (!(typeof window == "object" || typeof importScripts == "function")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
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
} else {
 throw new Error("environment detection error");
}

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

checkIncomingModuleAPI();

legacyModuleProp("arguments", "arguments_");

legacyModuleProp("thisProgram", "thisProgram");

legacyModuleProp("quit", "quit_");

assert(typeof Module["memoryInitializerPrefixURL"] == "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["pthreadMainPrefixURL"] == "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["cdInitializerPrefixURL"] == "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["filePackagePrefixURL"] == "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["read"] == "undefined", "Module.read option was removed (modify read_ in JS)");

assert(typeof Module["readAsync"] == "undefined", "Module.readAsync option was removed (modify readAsync in JS)");

assert(typeof Module["readBinary"] == "undefined", "Module.readBinary option was removed (modify readBinary in JS)");

assert(typeof Module["setWindowTitle"] == "undefined", "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");

assert(typeof Module["TOTAL_MEMORY"] == "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");

legacyModuleProp("asm", "wasmExports");

legacyModuleProp("read", "read_");

legacyModuleProp("readAsync", "readAsync");

legacyModuleProp("readBinary", "readBinary");

legacyModuleProp("setWindowTitle", "setWindowTitle");

var IDBFS = "IDBFS is no longer included by default; build with -lidbfs.js";

var PROXYFS = "PROXYFS is no longer included by default; build with -lproxyfs.js";

var WORKERFS = "WORKERFS is no longer included by default; build with -lworkerfs.js";

var FETCHFS = "FETCHFS is no longer included by default; build with -lfetchfs.js";

var ICASEFS = "ICASEFS is no longer included by default; build with -licasefs.js";

var JSFILEFS = "JSFILEFS is no longer included by default; build with -ljsfilefs.js";

var OPFS = "OPFS is no longer included by default; build with -lopfs.js";

var NODEFS = "NODEFS is no longer included by default; build with -lnodefs.js";

assert(ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER || ENVIRONMENT_IS_NODE, "Pthreads do not work in this environment yet (need Web Workers, or an alternative to them)");

assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");

var workerID = 0;

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
   importScripts: () => {
    assert(false, "dummy importScripts called");
   },
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
 dbg = threadPrintErr;
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
    workerID = msgData["workerID"];
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
    assert(msgData["pthread_ptr"]);
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
   err(`worker: onmessage() captured an uncaught exception: ${ex}`);
   if (ex?.stack) err(ex.stack);
   __emscripten_thread_crashed();
   throw ex;
  }
 }
 self.onmessage = handleMessage;
}

var wasmBinary;

if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];

legacyModuleProp("wasmBinary", "wasmBinary");

if (typeof WebAssembly != "object") {
 err("no native wasm support detected");
}

/** @param {number|boolean=} isFloat */ function getSafeHeapType(bytes, isFloat) {
 switch (bytes) {
 case 1:
  return "i8";

 case 2:
  return "i16";

 case 4:
  return isFloat ? "float" : "i32";

 case 8:
  return isFloat ? "double" : "i64";

 default:
  abort(`getSafeHeapType() invalid bytes=${bytes}`);
 }
}

/** @param {number|boolean=} isFloat */ function SAFE_HEAP_STORE(dest, value, bytes, isFloat) {
 dest >>>= 0;
 if (dest <= 0) abort(`segmentation fault storing ${bytes} bytes to address ${dest}`);
 if (dest % bytes !== 0) abort(`alignment error storing to address ${dest}, which was expected to be aligned to a multiple of ${bytes}`);
 if (runtimeInitialized) {
  var brk = _sbrk(0);
  if (dest + bytes > brk) abort(`segmentation fault, exceeded the top of the available dynamic heap when storing ${bytes} bytes to address ${dest}. DYNAMICTOP=${brk}`);
  if (brk < _emscripten_stack_get_base()) abort(`brk >= _emscripten_stack_get_base() (brk=${brk}, _emscripten_stack_get_base()=${_emscripten_stack_get_base()})`);
  if (brk > wasmMemory.buffer.byteLength) abort(`brk <= wasmMemory.buffer.byteLength (brk=${brk}, wasmMemory.buffer.byteLength=${wasmMemory.buffer.byteLength})`);
 }
 setValue_safe(dest, value, getSafeHeapType(bytes, isFloat));
 return value;
}

function SAFE_HEAP_STORE_D(dest, value, bytes) {
 return SAFE_HEAP_STORE(dest, value, bytes, true);
}

/** @param {number|boolean=} isFloat */ function SAFE_HEAP_LOAD(dest, bytes, unsigned, isFloat) {
 dest >>>= 0;
 if (dest <= 0) abort(`segmentation fault loading ${bytes} bytes from address ${dest}`);
 if (dest % bytes !== 0) abort(`alignment error loading from address ${dest}, which was expected to be aligned to a multiple of ${bytes}`);
 if (runtimeInitialized) {
  var brk = _sbrk(0);
  if (dest + bytes > brk) abort(`segmentation fault, exceeded the top of the available dynamic heap when loading ${bytes} bytes from address ${dest}. DYNAMICTOP=${brk}`);
  if (brk < _emscripten_stack_get_base()) abort(`brk >= _emscripten_stack_get_base() (brk=${brk}, _emscripten_stack_get_base()=${_emscripten_stack_get_base()})`);
  if (brk > wasmMemory.buffer.byteLength) abort(`brk <= wasmMemory.buffer.byteLength (brk=${brk}, wasmMemory.buffer.byteLength=${wasmMemory.buffer.byteLength})`);
 }
 var type = getSafeHeapType(bytes, isFloat);
 var ret = getValue_safe(dest, type);
 if (unsigned) ret = unSign(ret, parseInt(type.substr(1), 10));
 return ret;
}

function SAFE_HEAP_LOAD_D(dest, bytes, unsigned) {
 return SAFE_HEAP_LOAD(dest, bytes, unsigned, true);
}

function SAFE_FT_MASK(value, mask) {
 var ret = value & mask;
 if (ret !== value) {
  abort(`Function table mask error: function pointer is ${value} which is masked by ${mask}, the likely cause of this is that the function pointer is being called by the wrong type.`);
 }
 return ret;
}

function segfault() {
 abort("segmentation fault");
}

function alignfault() {
 abort("alignment fault");
}

var wasmMemory;

var wasmModule;

var ABORT = false;

var EXITSTATUS;

/** @type {function(*, string=)} */ function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed" + (text ? ": " + text : ""));
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

assert(!Module["STACK_SIZE"], "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");

assert(typeof Int32Array != "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined, "JS engine does not provide full typed array support");

if (!ENVIRONMENT_IS_PTHREAD) {
 {
  var INITIAL_MEMORY = 16777216;
  legacyModuleProp("INITIAL_MEMORY", "INITIAL_MEMORY");
  assert(INITIAL_MEMORY >= 5242880, "INITIAL_MEMORY should be larger than STACK_SIZE, was " + INITIAL_MEMORY + "! (STACK_SIZE=" + 5242880 + ")");
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

function writeStackCookie() {
 var max = _emscripten_stack_get_end();
 assert((max & 3) == 0);
 if (max == 0) {
  max += 4;
 }
 GROWABLE_HEAP_U32()[((max) >>> 2) >>> 0] = 34821223;
 GROWABLE_HEAP_U32()[(((max) + (4)) >>> 2) >>> 0] = 2310721022;
}

function checkStackCookie() {
 if (ABORT) return;
 var max = _emscripten_stack_get_end();
 if (max == 0) {
  max += 4;
 }
 var cookie1 = GROWABLE_HEAP_U32()[((max) >>> 2) >>> 0];
 var cookie2 = GROWABLE_HEAP_U32()[(((max) + (4)) >>> 2) >>> 0];
 if (cookie1 != 34821223 || cookie2 != 2310721022) {
  abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
 }
}

(function() {
 var h16 = new Int16Array(1);
 var h8 = new Int8Array(h16.buffer);
 h16[0] = 25459;
 if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
})();

var __ATPRERUN__ = [];

var __ATINIT__ = [];

var __ATEXIT__ = [];

var __ATPOSTRUN__ = [];

var runtimeInitialized = false;

function preRun() {
 assert(!ENVIRONMENT_IS_PTHREAD);
 callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
 assert(!runtimeInitialized);
 runtimeInitialized = true;
 if (ENVIRONMENT_IS_PTHREAD) return;
 checkStackCookie();
 setStackLimits();
 callRuntimeCallbacks(__ATINIT__);
}

function postRun() {
 checkStackCookie();
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

assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

var runDependencies = 0;

var runDependencyWatcher = null;

var dependenciesFulfilled = null;

var runDependencyTracking = {};

function getUniqueRunDependency(id) {
 var orig = id;
 while (1) {
  if (!runDependencyTracking[id]) return id;
  id = orig + Math.random();
 }
}

function addRunDependency(id) {
 runDependencies++;
 if (id) {
  assert(!runDependencyTracking[id]);
  runDependencyTracking[id] = 1;
  if (runDependencyWatcher === null && typeof setInterval != "undefined") {
   runDependencyWatcher = setInterval(() => {
    if (ABORT) {
     clearInterval(runDependencyWatcher);
     runDependencyWatcher = null;
     return;
    }
    var shown = false;
    for (var dep in runDependencyTracking) {
     if (!shown) {
      shown = true;
      err("still waiting on run dependencies:");
     }
     err(`dependency: ${dep}`);
    }
    if (shown) {
     err("(end of list)");
    }
   }, 1e4);
  }
 } else {
  err("warning: run dependency added without ID");
 }
}

function removeRunDependency(id) {
 runDependencies--;
 if (id) {
  assert(runDependencyTracking[id]);
  delete runDependencyTracking[id];
 } else {
  err("warning: run dependency removed without ID");
 }
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
 if (what.indexOf("RuntimeError: unreachable") >= 0) {
  what += '. "unreachable" may be due to ASYNCIFY_STACK_SIZE not being large enough (try increasing it)';
 }
 /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
 readyPromiseReject(e);
 throw e;
}

var FS = {
 error() {
  abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM");
 },
 init() {
  FS.error();
 },
 createDataFile() {
  FS.error();
 },
 createPreloadedFile() {
  FS.error();
 },
 createLazyFile() {
  FS.error();
 },
 open() {
  FS.error();
 },
 mkdev() {
  FS.error();
 },
 registerDevice() {
  FS.error();
 },
 analyzePath() {
  FS.error();
 },
 ErrnoError() {
  FS.error();
 }
};

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

var dataURIPrefix = "data:application/octet-stream;base64,";

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */ var isDataURI = filename => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */ var isFileURI = filename => filename.startsWith("file://");

function createExportWrapper(name, nargs) {
 return (...args) => {
  assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
  var f = wasmExports[name];
  assert(f, `exported native function \`${name}\` not found`);
  assert(args.length <= nargs, `native function \`${name}\` called with ${args.length} args but expects ${nargs}`);
  return f(...args);
 };
}

class EmscriptenEH extends Error {}

class EmscriptenSjLj extends EmscriptenEH {}

class CppException extends EmscriptenEH {
 constructor(excPtr) {
  super(excPtr);
  this.excPtr = excPtr;
  const excInfo = getExceptionMessage(excPtr);
  this.name = excInfo[0];
  this.message = excInfo[1];
 }
}

function findWasmBinary() {
 if (Module["locateFile"]) {
  var f = "ort-wasm-threaded.jsep.wasm";
  if (!isDataURI(f)) {
   return locateFile(f);
  }
  return f;
 }
 return new URL("ort-wasm-threaded.jsep.wasm", import.meta.url).href;
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
  if (isFileURI(wasmBinaryFile)) {
   err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
  }
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
 if (!wasmImports.__instrumented) {
  wasmImports.__instrumented = true;
  Asyncify.instrumentWasmImports(wasmImports);
 }
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
  wasmTable = wasmExports["__indirect_function_table"];
  assert(wasmTable, "table not found in wasm exports");
  addOnInit(wasmExports["__wasm_call_ctors"]);
  wasmModule = module;
  removeRunDependency("wasm-instantiate");
  return wasmExports;
 }
 addRunDependency("wasm-instantiate");
 var trueModule = Module;
 function receiveInstantiationResult(result) {
  assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
  trueModule = null;
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

function legacyModuleProp(prop, newName, incoming = true) {
 if (!Object.getOwnPropertyDescriptor(Module, prop)) {
  Object.defineProperty(Module, prop, {
   configurable: true,
   get() {
    let extra = incoming ? " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)" : "";
    abort(`\`Module.${prop}\` has been replaced by \`${newName}\`` + extra);
   }
  });
 }
}

function ignoredModuleProp(prop) {
 if (Object.getOwnPropertyDescriptor(Module, prop)) {
  abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
 }
}

function isExportedByForceFilesystem(name) {
 return name === "FS_createPath" || name === "FS_createDataFile" || name === "FS_createPreloadedFile" || name === "FS_unlink" || name === "addRunDependency" || name === "FS_createLazyFile" || name === "FS_createDevice" || name === "removeRunDependency";
}

function missingGlobal(sym, msg) {
 if (typeof globalThis != "undefined") {
  Object.defineProperty(globalThis, sym, {
   configurable: true,
   get() {
    warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
    return undefined;
   }
  });
 }
}

missingGlobal("buffer", "Please use HEAP8.buffer or wasmMemory.buffer");

missingGlobal("asm", "Please use wasmExports instead");

function missingLibrarySymbol(sym) {
 if (typeof globalThis != "undefined" && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
  Object.defineProperty(globalThis, sym, {
   configurable: true,
   get() {
    var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
    var librarySymbol = sym;
    if (!librarySymbol.startsWith("_")) {
     librarySymbol = "$" + sym;
    }
    msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
    if (isExportedByForceFilesystem(sym)) {
     msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
    }
    warnOnce(msg);
    return undefined;
   }
  });
 }
 unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
 if (!Object.getOwnPropertyDescriptor(Module, sym)) {
  Object.defineProperty(Module, sym, {
   configurable: true,
   get() {
    var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
    if (isExportedByForceFilesystem(sym)) {
     msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
    }
    abort(msg);
   }
  });
 }
}

function dbg(...args) {
 if (ENVIRONMENT_IS_NODE && fs) {
  fs.writeSync(2, args.join(" ") + "\n");
 } else console.warn(...args);
}

var ASM_CONSTS = {
 6988608: ($0, $1, $2, $3, $4) => {
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
 6989323: ($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
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
 6989595: $0 => {
  Module.jsepReleaseKernel($0);
 },
 6989629: ($0, $1) => Module.jsepRunKernel(Number($0), Number($1), Module.jsepSessionState.sessionHandle, Module.jsepSessionState.errors),
 6989757: $0 => {
  Module.jsepCreateKernel("BiasAdd", $0, undefined);
 },
 6989812: $0 => {
  Module.jsepCreateKernel("BiasSplitGelu", $0, undefined);
 },
 6989873: $0 => {
  Module.jsepCreateKernel("FastGelu", $0, undefined);
 },
 6989929: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) => {
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
 6990513: $0 => {
  Module.jsepCreateKernel("Gelu", $0, undefined);
 },
 6990565: ($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
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
 6990782: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("LayerNormalization", $0, ({
   "axis": $1,
   "epsilon": $2,
   "simplified": !!$3
  }));
 },
 6990893: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("LayerNormalization", $0, ({
   "axis": $1,
   "epsilon": $2,
   "simplified": !!$3
  }));
 },
 6991004: ($0, $1, $2, $3, $4, $5) => {
  Module.jsepCreateKernel("MatMulNBits", $0, ({
   "k": $1,
   "n": $2,
   "accuracyLevel": $3,
   "bits": $4,
   "blockSize": $5
  }));
 },
 6991131: ($0, $1, $2, $3, $4, $5) => {
  Module.jsepCreateKernel("MultiHeadAttention", $0, ({
   "numHeads": $1,
   "isUnidirectional": $2,
   "maskFilterValue": $3,
   "scale": $4,
   "doRotary": $5
  }));
 },
 6991290: ($0, $1) => {
  Module.jsepCreateKernel("QuickGelu", $0, ({
   "alpha": $1
  }));
 },
 6991354: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("RotaryEmbedding", $0, ({
   "interleaved": !!$1,
   "numHeads": $2,
   "rotaryEmbeddingDim": $3,
   "scale": $4
  }));
 },
 6991493: ($0, $1, $2) => {
  Module.jsepCreateKernel("SkipLayerNormalization", $0, ({
   "epsilon": $1,
   "simplified": !!$2
  }));
 },
 6991595: ($0, $1, $2) => {
  Module.jsepCreateKernel("SkipLayerNormalization", $0, ({
   "epsilon": $1,
   "simplified": !!$2
  }));
 },
 6991697: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("GatherBlockQuantized", $0, ({
   "gatherAxis": $1,
   "quantizeAxis": $2,
   "blockSize": $3
  }));
 },
 6991818: $0 => Module.jsepAlloc($0),
 6991851: $0 => Module.jsepFree($0),
 6991883: ($0, $1, $2) => {
  Module.jsepCopy(Number($0), Number($1), Number($2), true);
 },
 6991946: ($0, $1, $2) => {
  Module.jsepCopy(Number($0), Number($1), Number($2));
 },
 6992003: $0 => {
  Module.jsepCreateKernel("Abs", $0, undefined);
 },
 6992054: $0 => {
  Module.jsepCreateKernel("Neg", $0, undefined);
 },
 6992105: $0 => {
  Module.jsepCreateKernel("Floor", $0, undefined);
 },
 6992158: $0 => {
  Module.jsepCreateKernel("Ceil", $0, undefined);
 },
 6992210: $0 => {
  Module.jsepCreateKernel("Reciprocal", $0, undefined);
 },
 6992268: $0 => {
  Module.jsepCreateKernel("Sqrt", $0, undefined);
 },
 6992320: $0 => {
  Module.jsepCreateKernel("Exp", $0, undefined);
 },
 6992371: $0 => {
  Module.jsepCreateKernel("Erf", $0, undefined);
 },
 6992422: $0 => {
  Module.jsepCreateKernel("Sigmoid", $0, undefined);
 },
 6992477: ($0, $1, $2) => {
  Module.jsepCreateKernel("HardSigmoid", $0, ({
   "alpha": $1,
   "beta": $2
  }));
 },
 6992556: $0 => {
  Module.jsepCreateKernel("Log", $0, undefined);
 },
 6992607: $0 => {
  Module.jsepCreateKernel("Sin", $0, undefined);
 },
 6992658: $0 => {
  Module.jsepCreateKernel("Cos", $0, undefined);
 },
 6992709: $0 => {
  Module.jsepCreateKernel("Tan", $0, undefined);
 },
 6992760: $0 => {
  Module.jsepCreateKernel("Asin", $0, undefined);
 },
 6992812: $0 => {
  Module.jsepCreateKernel("Acos", $0, undefined);
 },
 6992864: $0 => {
  Module.jsepCreateKernel("Atan", $0, undefined);
 },
 6992916: $0 => {
  Module.jsepCreateKernel("Sinh", $0, undefined);
 },
 6992968: $0 => {
  Module.jsepCreateKernel("Cosh", $0, undefined);
 },
 6993020: $0 => {
  Module.jsepCreateKernel("Asinh", $0, undefined);
 },
 6993073: $0 => {
  Module.jsepCreateKernel("Acosh", $0, undefined);
 },
 6993126: $0 => {
  Module.jsepCreateKernel("Atanh", $0, undefined);
 },
 6993179: $0 => {
  Module.jsepCreateKernel("Tanh", $0, undefined);
 },
 6993231: $0 => {
  Module.jsepCreateKernel("Not", $0, undefined);
 },
 6993282: ($0, $1, $2) => {
  Module.jsepCreateKernel("Clip", $0, ({
   "min": $1,
   "max": $2
  }));
 },
 6993351: $0 => {
  Module.jsepCreateKernel("Clip", $0, undefined);
 },
 6993403: ($0, $1) => {
  Module.jsepCreateKernel("Elu", $0, ({
   "alpha": $1
  }));
 },
 6993461: $0 => {
  Module.jsepCreateKernel("Gelu", $0, undefined);
 },
 6993513: $0 => {
  Module.jsepCreateKernel("Relu", $0, undefined);
 },
 6993565: ($0, $1) => {
  Module.jsepCreateKernel("LeakyRelu", $0, ({
   "alpha": $1
  }));
 },
 6993629: ($0, $1) => {
  Module.jsepCreateKernel("ThresholdedRelu", $0, ({
   "alpha": $1
  }));
 },
 6993699: ($0, $1) => {
  Module.jsepCreateKernel("Cast", $0, ({
   "to": $1
  }));
 },
 6993757: $0 => {
  Module.jsepCreateKernel("Add", $0, undefined);
 },
 6993808: $0 => {
  Module.jsepCreateKernel("Sub", $0, undefined);
 },
 6993859: $0 => {
  Module.jsepCreateKernel("Mul", $0, undefined);
 },
 6993910: $0 => {
  Module.jsepCreateKernel("Div", $0, undefined);
 },
 6993961: $0 => {
  Module.jsepCreateKernel("Pow", $0, undefined);
 },
 6994012: $0 => {
  Module.jsepCreateKernel("Equal", $0, undefined);
 },
 6994065: $0 => {
  Module.jsepCreateKernel("Greater", $0, undefined);
 },
 6994120: $0 => {
  Module.jsepCreateKernel("GreaterOrEqual", $0, undefined);
 },
 6994182: $0 => {
  Module.jsepCreateKernel("Less", $0, undefined);
 },
 6994234: $0 => {
  Module.jsepCreateKernel("LessOrEqual", $0, undefined);
 },
 6994293: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceMean", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 6994468: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceMax", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 6994642: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceMin", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 6994816: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceProd", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 6994991: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceSum", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 6995165: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceL1", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 6995338: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceL2", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 6995511: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceLogSum", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 6995688: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceSumSquare", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 6995868: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("ReduceLogSumExp", $0, ({
   "keepDims": !!$1,
   "noopWithEmptyAxes": !!$2,
   "axes": $3 ? (Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0))) : []
  }));
 },
 6996048: $0 => {
  Module.jsepCreateKernel("Where", $0, undefined);
 },
 6996101: ($0, $1, $2) => {
  Module.jsepCreateKernel("Transpose", $0, ({
   "perm": $1 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($1) >>> 0, Number($2) >>> 0)) : []
  }));
 },
 6996225: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("DepthToSpace", $0, ({
   "blocksize": $1,
   "mode": UTF8ToString($2),
   "format": $3 ? "NHWC" : "NCHW"
  }));
 },
 6996358: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("DepthToSpace", $0, ({
   "blocksize": $1,
   "mode": UTF8ToString($2),
   "format": $3 ? "NHWC" : "NCHW"
  }));
 },
 6996491: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) => {
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
 6996924: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
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
 6997585: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) => {
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
 6998018: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
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
 6998679: ($0, $1) => {
  Module.jsepCreateKernel("GlobalAveragePool", $0, ({
   "format": $1 ? "NHWC" : "NCHW"
  }));
 },
 6998770: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
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
 6999249: ($0, $1) => {
  Module.jsepCreateKernel("GlobalAveragePool", $0, ({
   "format": $1 ? "NHWC" : "NCHW"
  }));
 },
 6999340: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
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
 6999819: ($0, $1) => {
  Module.jsepCreateKernel("GlobalMaxPool", $0, ({
   "format": $1 ? "NHWC" : "NCHW"
  }));
 },
 6999906: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
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
 7000381: ($0, $1) => {
  Module.jsepCreateKernel("GlobalMaxPool", $0, ({
   "format": $1 ? "NHWC" : "NCHW"
  }));
 },
 7000468: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
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
 7000943: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("Gemm", $0, ({
   "alpha": $1,
   "beta": $2,
   "transA": $3,
   "transB": $4
  }));
 },
 7001047: $0 => {
  Module.jsepCreateKernel("MatMul", $0, undefined);
 },
 7001101: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("ArgMax", $0, ({
   "keepDims": !!$1,
   "selectLastIndex": !!$2,
   "axis": $3
  }));
 },
 7001209: ($0, $1, $2, $3) => {
  Module.jsepCreateKernel("ArgMin", $0, ({
   "keepDims": !!$1,
   "selectLastIndex": !!$2,
   "axis": $3
  }));
 },
 7001317: ($0, $1) => {
  Module.jsepCreateKernel("Softmax", $0, ({
   "axis": $1
  }));
 },
 7001380: ($0, $1) => {
  Module.jsepCreateKernel("Concat", $0, ({
   "axis": $1
  }));
 },
 7001440: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("Split", $0, ({
   "axis": $1,
   "numOutputs": $2,
   "splitSizes": $3 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0)) : []
  }));
 },
 7001596: $0 => {
  Module.jsepCreateKernel("Expand", $0, undefined);
 },
 7001650: ($0, $1) => {
  Module.jsepCreateKernel("Gather", $0, ({
   "axis": Number($1)
  }));
 },
 7001721: ($0, $1) => {
  Module.jsepCreateKernel("GatherElements", $0, ({
   "axis": Number($1)
  }));
 },
 7001800: ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) => {
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
 7002162: ($0, $1, $2, $3, $4, $5, $6) => {
  Module.jsepCreateKernel("Slice", $0, ({
   "starts": $1 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($1) >>> 0, Number($2) >>> 0)) : [],
   "ends": $3 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0)) : [],
   "axes": $5 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($5) >>> 0, Number($6) >>> 0)) : []
  }));
 },
 7002426: $0 => {
  Module.jsepCreateKernel("Tile", $0, undefined);
 },
 7002478: ($0, $1, $2) => {
  Module.jsepCreateKernel("InstanceNormalization", $0, ({
   "epsilon": $1,
   "format": $2 ? "NHWC" : "NCHW"
  }));
 },
 7002592: ($0, $1, $2) => {
  Module.jsepCreateKernel("InstanceNormalization", $0, ({
   "epsilon": $1,
   "format": $2 ? "NHWC" : "NCHW"
  }));
 },
 7002706: $0 => {
  Module.jsepCreateKernel("Range", $0, undefined);
 },
 7002759: ($0, $1) => {
  Module.jsepCreateKernel("Einsum", $0, ({
   "equation": UTF8ToString($1)
  }));
 },
 7002840: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("Pad", $0, ({
   "mode": $1,
   "value": $2,
   "pads": $3 ? Array.from(GROWABLE_HEAP_I32().subarray(Number($3) >>> 0, Number($4) >>> 0)) : []
  }));
 },
 7002983: ($0, $1, $2, $3, $4, $5) => {
  Module.jsepCreateKernel("BatchNormalization", $0, ({
   "epsilon": $1,
   "momentum": $2,
   "spatial": !!$4,
   "trainingMode": !!$3,
   "format": $5 ? "NHWC" : "NCHW"
  }));
 },
 7003152: ($0, $1, $2, $3, $4, $5) => {
  Module.jsepCreateKernel("BatchNormalization", $0, ({
   "epsilon": $1,
   "momentum": $2,
   "spatial": !!$4,
   "trainingMode": !!$3,
   "format": $5 ? "NHWC" : "NCHW"
  }));
 },
 7003321: ($0, $1, $2) => {
  Module.jsepCreateKernel("CumSum", $0, ({
   "exclusive": Number($1),
   "reverse": Number($2)
  }));
 },
 7003418: ($0, $1, $2) => {
  Module.jsepCreateKernel("DequantizeLinear", $0, ({
   "axis": $1,
   "blockSize": $2
  }));
 },
 7003508: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("GridSample", $0, ({
   "align_corners": $1,
   "mode": UTF8ToString($2),
   "padding_mode": UTF8ToString($3),
   "format": $4 ? "NHWC" : "NCHW"
  }));
 },
 7003678: ($0, $1, $2, $3, $4) => {
  Module.jsepCreateKernel("GridSample", $0, ({
   "align_corners": $1,
   "mode": UTF8ToString($2),
   "padding_mode": UTF8ToString($3),
   "format": $4 ? "NHWC" : "NCHW"
  }));
 },
 7003848: () => {
  Module.jsepCaptureBegin();
 },
 7003879: () => {
  Module.jsepCaptureEnd();
 },
 7003908: () => {
  Module.jsepReplay();
 },
 7003933: () => (typeof wasmOffsetConverter !== "undefined")
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
 worker.onmessage = e => {
  var cmd = e["data"]["cmd"];
  err(`received "${cmd}" command from terminated worker: ${worker.workerID}`);
 };
};

var killThread = pthread_ptr => {
 assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! killThread() can only ever be called from main application thread!");
 assert(pthread_ptr, "Internal Error! Null pthread_ptr in killThread!");
 var worker = PThread.pthreads[pthread_ptr];
 delete PThread.pthreads[pthread_ptr];
 terminateWorker(worker);
 __emscripten_thread_free_data(pthread_ptr);
 PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
 worker.pthread_ptr = 0;
};

var cancelThread = pthread_ptr => {
 assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! cancelThread() can only ever be called from main application thread!");
 assert(pthread_ptr, "Internal Error! Null pthread_ptr in cancelThread!");
 var worker = PThread.pthreads[pthread_ptr];
 worker.postMessage({
  "cmd": "cancel"
 });
};

var cleanupThread = pthread_ptr => {
 assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! cleanupThread() can only ever be called from main application thread!");
 assert(pthread_ptr, "Internal Error! Null pthread_ptr in cleanupThread!");
 var worker = PThread.pthreads[pthread_ptr];
 assert(worker);
 PThread.returnWorkerToPool(worker);
};

var zeroMemory = (address, size) => {
 GROWABLE_HEAP_U8().fill(0, address, address + size);
 return address;
};

var spawnThread = threadParams => {
 assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! spawnThread() can only ever be called from main application thread!");
 assert(threadParams.pthread_ptr, "Internal error, no pthread ptr!");
 var worker = PThread.getNewWorker();
 if (!worker) {
  return 6;
 }
 assert(!worker.pthread_ptr, "Internal error!");
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
 checkStackCookie();
 if (e instanceof WebAssembly.RuntimeError) {
  if (_emscripten_stack_get_current() <= 0) {
   err("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 5242880)");
  }
 }
 quit_(1, e);
};

function exitOnMainThread(returnCode) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(1, 0, 0, returnCode);
 _exit(returnCode);
}

/** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
 EXITSTATUS = status;
 checkUnflushedContent();
 if (ENVIRONMENT_IS_PTHREAD) {
  assert(!implicit);
  exitOnMainThread(status);
  throw "unwind";
 }
 if (keepRuntimeAlive() && !implicit) {
  var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
  readyPromiseReject(msg);
  err(msg);
 }
 _proc_exit(status);
};

var _exit = exitJS;

var ptrToString = ptr => {
 assert(typeof ptr === "number");
 return "0x" + ptr.toString(16).padStart(8, "0");
};

var PThread = {
 unusedWorkers: [],
 runningWorkers: [],
 tlsInitFunctions: [],
 pthreads: {},
 nextWorkerID: 1,
 debugInit() {
  function pthreadLogPrefix() {
   var t = 0;
   if (runtimeInitialized && typeof _pthread_self != "undefined") {
    t = _pthread_self();
   }
   return "w:" + workerID + ",t:" + ptrToString(t) + ": ";
  }
  var origDbg = dbg;
  dbg = (...args) => origDbg(pthreadLogPrefix() + args.join(" "));
 },
 init() {
  PThread.debugInit();
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
  assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! terminateAllThreads() can only ever be called from main application thread!");
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
   if (worker.pthread_ptr) {
    message = `Pthread ${ptrToString(worker.pthread_ptr)} sent an error!`;
   }
   err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
   throw e;
  };
  if (ENVIRONMENT_IS_NODE) {
   worker.on("message", data => worker.onmessage({
    data: data
   }));
   worker.on("error", e => worker.onerror(e));
  }
  assert(wasmMemory instanceof WebAssembly.Memory, "WebAssembly memory should have been loaded by now!");
  assert(wasmModule instanceof WebAssembly.Module, "WebAssembly Module should have been loaded by now!");
  var handlers = [];
  var knownHandlers = [];
  for (var handler of knownHandlers) {
   if (Module.hasOwnProperty(handler)) {
    handlers.push(handler);
   }
  }
  worker.workerID = PThread.nextWorkerID++;
  worker.postMessage({
   "cmd": "load",
   "handlers": handlers,
   "wasmMemory": wasmMemory,
   "wasmModule": wasmModule,
   "workerID": worker.workerID
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
   if (!ENVIRONMENT_IS_NODE) {
    err("Tried to spawn a new thread, but the thread pool is exhausted.\n" + "This might result in a deadlock unless some threads eventually exit or the code explicitly breaks out to the event loop.\n" + "If you want to increase the pool size, use setting `-sPTHREAD_POOL_SIZE=...`." + "\nIf you want to throw an explicit error instead of the risk of deadlocking in those cases, use setting `-sPTHREAD_POOL_SIZE_STRICT=2`.");
   }
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

var decrementExceptionRefcount = ptr => ___cxa_decrement_exception_refcount(ptr);

var establishStackSpace = () => {
 var pthread_ptr = _pthread_self();
 var stackHigh = GROWABLE_HEAP_U32()[(((pthread_ptr) + (52)) >>> 2) >>> 0];
 var stackSize = GROWABLE_HEAP_U32()[(((pthread_ptr) + (56)) >>> 2) >>> 0];
 var stackLow = stackHigh - stackSize;
 assert(stackHigh != 0);
 assert(stackLow != 0);
 assert(stackHigh > stackLow, "stackHigh must be higher then stackLow");
 _emscripten_stack_set_limits(stackHigh, stackLow);
 setStackLimits();
 stackRestore(stackHigh);
 writeStackCookie();
};

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
   if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte " + ptrToString(u0) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!");
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
 assert(typeof ptr == "number", `UTF8ToString expects a number (got ${typeof ptr})`);
 ptr >>>= 0;
 return ptr ? UTF8ArrayToString(GROWABLE_HEAP_U8(), ptr, maxBytesToRead) : "";
};

var getExceptionMessageCommon = ptr => {
 var sp = stackSave();
 var type_addr_addr = stackAlloc(4);
 var message_addr_addr = stackAlloc(4);
 ___get_exception_message(ptr, type_addr_addr, message_addr_addr);
 var type_addr = GROWABLE_HEAP_U32()[((type_addr_addr) >>> 2) >>> 0];
 var message_addr = GROWABLE_HEAP_U32()[((message_addr_addr) >>> 2) >>> 0];
 var type = UTF8ToString(type_addr);
 _free(type_addr);
 var message;
 if (message_addr) {
  message = UTF8ToString(message_addr);
  _free(message_addr);
 }
 stackRestore(sp);
 return [ type, message ];
};

var getExceptionMessage = ptr => getExceptionMessageCommon(ptr);

Module["getExceptionMessage"] = getExceptionMessage;

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

function getValue_safe(ptr, type = "i8") {
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

var incrementExceptionRefcount = ptr => ___cxa_increment_exception_refcount(ptr);

var invokeEntryPoint = (ptr, arg) => {
 runtimeKeepaliveCounter = 0;
 var result = (a1 => dynCall_ii(ptr, a1))(arg);
 checkStackCookie();
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

var setStackLimits = () => {
 var stackLow = _emscripten_stack_get_base();
 var stackHigh = _emscripten_stack_get_end();
 ___set_stack_limits(stackLow, stackHigh);
};

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

function setValue_safe(ptr, value, type = "i8") {
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

var unSign = (value, bits) => {
 if (value >= 0) {
  return value;
 }
 return bits <= 32 ? 2 * Math.abs(1 << (bits - 1)) + value : Math.pow(2, bits) + value;
};

var warnOnce = text => {
 warnOnce.shown ||= {};
 if (!warnOnce.shown[text]) {
  warnOnce.shown[text] = 1;
  if (ENVIRONMENT_IS_NODE) text = "warning: " + text;
  err(text);
 }
};

function ___assert_fail(condition, filename, line, func) {
 condition >>>= 0;
 filename >>>= 0;
 func >>>= 0;
 abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [ filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function" ]);
}

var exceptionCaught = [];

var uncaughtExceptionCount = 0;

function ___cxa_begin_catch(ptr) {
 ptr >>>= 0;
 var info = new ExceptionInfo(ptr);
 if (!info.get_caught()) {
  info.set_caught(true);
  uncaughtExceptionCount--;
 }
 info.set_rethrown(false);
 exceptionCaught.push(info);
 ___cxa_increment_exception_refcount(info.excPtr);
 return info.get_exception_ptr();
}

var exceptionLast = 0;

var ___cxa_end_catch = () => {
 _setThrew(0, 0);
 assert(exceptionCaught.length > 0);
 var info = exceptionCaught.pop();
 ___cxa_decrement_exception_refcount(info.excPtr);
 exceptionLast = 0;
};

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

function ___resumeException(ptr) {
 ptr >>>= 0;
 if (!exceptionLast) {
  exceptionLast = new CppException(ptr);
 }
 throw exceptionLast;
}

var setTempRet0 = val => __emscripten_tempret_set(val);

var findMatchingCatch = args => {
 var thrown = exceptionLast?.excPtr;
 if (!thrown) {
  setTempRet0(0);
  return 0;
 }
 var info = new ExceptionInfo(thrown);
 info.set_adjusted_ptr(thrown);
 var thrownType = info.get_type();
 if (!thrownType) {
  setTempRet0(0);
  return thrown;
 }
 for (var arg in args) {
  var caughtType = args[arg];
  if (caughtType === 0 || caughtType === thrownType) {
   break;
  }
  var adjusted_ptr_addr = info.ptr + 16;
  if (___cxa_can_catch(caughtType, thrownType, adjusted_ptr_addr)) {
   setTempRet0(caughtType);
   return thrown;
  }
 }
 setTempRet0(thrownType);
 return thrown;
};

function ___cxa_find_matching_catch_2() {
 return findMatchingCatch([]);
}

function ___cxa_find_matching_catch_3(arg0) {
 arg0 >>>= 0;
 return findMatchingCatch([ arg0 ]);
}

function ___cxa_find_matching_catch_4(arg0, arg1) {
 arg0 >>>= 0;
 arg1 >>>= 0;
 return findMatchingCatch([ arg0, arg1 ]);
}

function ___cxa_find_matching_catch_5(arg0, arg1, arg2) {
 arg0 >>>= 0;
 arg1 >>>= 0;
 arg2 >>>= 0;
 return findMatchingCatch([ arg0, arg1, arg2 ]);
}

var ___cxa_rethrow = () => {
 var info = exceptionCaught.pop();
 if (!info) {
  abort("no exception to throw");
 }
 var ptr = info.excPtr;
 if (!info.get_rethrown()) {
  exceptionCaught.push(info);
  info.set_rethrown(true);
  info.set_caught(false);
  uncaughtExceptionCount++;
 }
 exceptionLast = new CppException(ptr);
 throw exceptionLast;
};

function ___cxa_throw(ptr, type, destructor) {
 ptr >>>= 0;
 type >>>= 0;
 destructor >>>= 0;
 var info = new ExceptionInfo(ptr);
 info.init(type, destructor);
 exceptionLast = new CppException(ptr);
 uncaughtExceptionCount++;
 throw exceptionLast;
}

var ___cxa_uncaught_exceptions = () => uncaughtExceptionCount;

function ___handle_stack_overflow(requested) {
 requested >>>= 0;
 var base = _emscripten_stack_get_base();
 var end = _emscripten_stack_get_end();
 abort(`stack overflow (Attempt to set SP to ${ptrToString(requested)}` + `, with stack limits [${ptrToString(end)} - ${ptrToString(base)}` + "]). If you require more stack space build with -sSTACK_SIZE=<bytes>");
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
 abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
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
 assert(typeof str === "string", `stringToUTF8Array expects a string (got ${typeof str})`);
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
   if (u > 1114111) warnOnce("Invalid Unicode code point " + ptrToString(u) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
   heap[outIdx++ >>> 0] = 240 | (u >> 18);
   heap[outIdx++ >>> 0] = 128 | ((u >> 12) & 63);
   heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63);
   heap[outIdx++ >>> 0] = 128 | (u & 63);
  }
 }
 heap[outIdx >>> 0] = 0;
 return outIdx - startIdx;
};

var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
 assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
 return stringToUTF8Array(str, GROWABLE_HEAP_U8(), outPtr, maxBytesToWrite);
};

function ___syscall_getcwd(buf, size) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(5, 0, 1, buf, size);
 buf >>>= 0;
 size >>>= 0;
 abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
}

function ___syscall_getdents64(fd, dirp, count) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(6, 0, 1, fd, dirp, count);
 dirp >>>= 0;
 count >>>= 0;
 abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
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
 abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
}

function ___syscall_mkdirat(dirfd, path, mode) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(9, 0, 1, dirfd, path, mode);
 path >>>= 0;
 abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
}

function ___syscall_newfstatat(dirfd, path, buf, flags) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(10, 0, 1, dirfd, path, buf, flags);
 path >>>= 0;
 buf >>>= 0;
 abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
}

function syscallGetVarargI() {
 assert(SYSCALLS.varargs != undefined);
 var ret = GROWABLE_HEAP_I32()[((+SYSCALLS.varargs) >>> 2) >>> 0];
 SYSCALLS.varargs += 4;
 return ret;
}

function ___syscall_openat(dirfd, path, flags, varargs) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(11, 0, 1, dirfd, path, flags, varargs);
 path >>>= 0;
 varargs >>>= 0;
 SYSCALLS.varargs = varargs;
 abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
}

function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(12, 0, 1, dirfd, path, buf, bufsize);
 path >>>= 0;
 buf >>>= 0;
 bufsize >>>= 0;
 abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
}

function ___syscall_rmdir(path) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(13, 0, 1, path);
 path >>>= 0;
 abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
}

function ___syscall_stat64(path, buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(14, 0, 1, path, buf);
 path >>>= 0;
 buf >>>= 0;
 abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
}

function ___syscall_unlinkat(dirfd, path, flags) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(15, 0, 1, dirfd, path, flags);
 path >>>= 0;
 abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
}

var __abort_js = () => {
 abort("native code called abort()");
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
  err("user callback triggered after runtime exited or application aborted.  Ignoring.");
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
  assert(wait.async);
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
   err(`Cannot send message to thread with ID ${targetThreadId}, unknown thread ID!`);
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
 assert(!(funcIndex && emAsmAddr));
 assert(func.length == numCallArgs, "Call args mismatch in _emscripten_receive_on_main_thread_js");
 PThread.currentProxiedOperationCallerThread = callingThread;
 var rtn = func(...proxiedJSCallArgs);
 PThread.currentProxiedOperationCallerThread = 0;
 assert(typeof rtn != "bigint");
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
 assert(winterName);
 assert(summerName);
 assert(lengthBytesUTF8(winterName) <= 16, `timezone name truncated to fit in TZNAME_MAX (${winterName})`);
 assert(lengthBytesUTF8(summerName) <= 16, `timezone name truncated to fit in TZNAME_MAX (${summerName})`);
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
 assert(Array.isArray(readEmAsmArgsArray));
 assert(buf % 16 == 0);
 readEmAsmArgsArray.length = 0;
 var ch;
 while (ch = GROWABLE_HEAP_U8()[sigPtr++ >>> 0]) {
  var chr = String.fromCharCode(ch);
  var validChars = [ "d", "f", "i", "p" ];
  validChars.push("j");
  assert(validChars.includes(chr), `Invalid character ${ch}("${chr}") in readEmAsmArgs! Use only [${validChars}], and do not specify "v" for void return argument.`);
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
 assert(ASM_CONSTS.hasOwnProperty(code), `No EM_ASM constant found at address ${code}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
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

var _emscripten_check_blocking_allowed = () => {
 if (ENVIRONMENT_IS_NODE) return;
 if (ENVIRONMENT_IS_WORKER) return;
 warnOnce("Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread");
};

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
 } /*success*/ catch (e) {
  err(`growMemory: Attempted to grow heap from ${b.byteLength} bytes to ${size} bytes, but got error: ${e}`);
 }
};

function _emscripten_resize_heap(requestedSize) {
 requestedSize >>>= 0;
 var oldSize = GROWABLE_HEAP_U8().length;
 if (requestedSize <= oldSize) {
  return false;
 }
 var maxHeapSize = getHeapMax();
 if (requestedSize > maxHeapSize) {
  err(`Cannot enlarge memory, requested ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`);
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
 err(`Failed to grow the heap from ${oldSize} bytes to ${newSize} bytes, not enough memory!`);
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
  assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
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
 abort("fd_close called without SYSCALLS_REQUIRE_FILESYSTEM");
}

function _fd_read(fd, iov, iovcnt, pnum) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(21, 0, 1, fd, iov, iovcnt, pnum);
 iov >>>= 0;
 iovcnt >>>= 0;
 pnum >>>= 0;
 abort("fd_read called without SYSCALLS_REQUIRE_FILESYSTEM");
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
 assert(buffer);
 if (curr === 0 || curr === 10) {
  (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
  buffer.length = 0;
 } else {
  buffer.push(curr);
 }
};

var flush_NO_FILESYSTEM = () => {
 _fflush(0);
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

function _llvm_eh_typeid_for(type) {
 type >>>= 0;
 return type;
}

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
 assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
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

var wasmTableMirror = [];

/** @type {WebAssembly.Table} */ var wasmTable;

var getWasmTableEntry = funcPtr => {
 var func = wasmTableMirror[funcPtr];
 if (!func) {
  if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
  wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
 }
 assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
 return func;
};

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
  assert(sig[i] in typeNames, "invalid signature char: " + sig[i]);
  type.parameters.push(typeNames[sig[i]]);
 }
 return type;
};

var runtimeKeepalivePop = () => {
 assert(runtimeKeepaliveCounter > 0);
 runtimeKeepaliveCounter -= 1;
};

var Asyncify = {
 instrumentWasmImports(imports) {
  var importPattern = /^(jsepCopy|jsepCopyAsync|jsepDownload|invoke_.*|__asyncjs__.*)$/;
  for (let [x, original] of Object.entries(imports)) {
   if (typeof original == "function") {
    let isAsyncifyImport = original.isAsync || importPattern.test(x);
    imports[x] = (...args) => {
     var originalAsyncifyState = Asyncify.state;
     try {
      return original(...args);
     } finally {
      var changedToDisabled = originalAsyncifyState === Asyncify.State.Normal && Asyncify.state === Asyncify.State.Disabled;
      var ignoredInvoke = x.startsWith("invoke_") && true;
      if (Asyncify.state !== originalAsyncifyState && !isAsyncifyImport && !changedToDisabled && !ignoredInvoke) {
       throw new Error(`import ${x} was not in ASYNCIFY_IMPORTS, but changed the state`);
      }
     }
    };
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
       assert(y === x);
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
  assert(Asyncify.currData, "Tried to wait for an async operation when none is in progress.");
  assert(!Asyncify.asyncPromiseHandlers, "Cannot have multiple async operations in flight at once");
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
  assert(Asyncify.state !== Asyncify.State.Disabled, "Asyncify cannot be done during or after the runtime exits");
  if (ABORT) return;
  if (Asyncify.state === Asyncify.State.Normal) {
   var reachedCallback = false;
   var reachedAfterCallback = false;
   startAsync((handleSleepReturnValue = 0) => {
    assert(!handleSleepReturnValue || typeof handleSleepReturnValue == "number" || typeof handleSleepReturnValue == "boolean");
    if (ABORT) return;
    Asyncify.handleSleepReturnValue = handleSleepReturnValue;
    reachedCallback = true;
    if (!reachedAfterCallback) {
     return;
    }
    assert(!Asyncify.exportCallStack.length, "Waking up (starting to rewind) must be done from JS, without compiled code on the stack.");
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

function checkIncomingModuleAPI() {
 ignoredModuleProp("ENVIRONMENT");
 ignoredModuleProp("GL_MAX_TEXTURE_IMAGE_UNITS");
 ignoredModuleProp("SDL_canPlayWithWebAudio");
 ignoredModuleProp("SDL_numSimultaneouslyQueuedBuffers");
 ignoredModuleProp("INITIAL_MEMORY");
 ignoredModuleProp("wasmMemory");
 ignoredModuleProp("arguments");
 ignoredModuleProp("buffer");
 ignoredModuleProp("canvas");
 ignoredModuleProp("doNotCaptureKeyboard");
 ignoredModuleProp("dynamicLibraries");
 ignoredModuleProp("elementPointerLock");
 ignoredModuleProp("extraStackTrace");
 ignoredModuleProp("forcedAspectRatio");
 ignoredModuleProp("keyboardListeningElement");
 ignoredModuleProp("freePreloadedMediaOnUse");
 ignoredModuleProp("loadSplitModule");
 ignoredModuleProp("logReadFiles");
 ignoredModuleProp("mainScriptUrlOrBlob");
 ignoredModuleProp("mem");
 ignoredModuleProp("monitorRunDependencies");
 ignoredModuleProp("noExitRuntime");
 ignoredModuleProp("noInitialRun");
 ignoredModuleProp("onAbort");
 ignoredModuleProp("onCustomMessage");
 ignoredModuleProp("onExit");
 ignoredModuleProp("onFree");
 ignoredModuleProp("onFullScreen");
 ignoredModuleProp("onMalloc");
 ignoredModuleProp("onRealloc");
 ignoredModuleProp("onRuntimeInitialized");
 ignoredModuleProp("postMainLoop");
 ignoredModuleProp("postRun");
 ignoredModuleProp("preInit");
 ignoredModuleProp("preMainLoop");
 ignoredModuleProp("preRun");
 ignoredModuleProp("preinitializedWebGLContext");
 ignoredModuleProp("preloadPlugins");
 ignoredModuleProp("print");
 ignoredModuleProp("printErr");
 ignoredModuleProp("quit");
 ignoredModuleProp("setStatus");
 ignoredModuleProp("statusMessage");
 ignoredModuleProp("stderr");
 ignoredModuleProp("stdin");
 ignoredModuleProp("stdout");
 ignoredModuleProp("thisProgram");
 ignoredModuleProp("wasm");
 ignoredModuleProp("websocket");
 ignoredModuleProp("fetchSettings");
}

var wasmImports;

function assignWasmImports() {
 wasmImports = {
  /** @export */ HaveOffsetConverter: HaveOffsetConverter,
  /** @export */ __assert_fail: ___assert_fail,
  /** @export */ __asyncjs__jsepDownload: __asyncjs__jsepDownload,
  /** @export */ __cxa_begin_catch: ___cxa_begin_catch,
  /** @export */ __cxa_end_catch: ___cxa_end_catch,
  /** @export */ __cxa_find_matching_catch_2: ___cxa_find_matching_catch_2,
  /** @export */ __cxa_find_matching_catch_3: ___cxa_find_matching_catch_3,
  /** @export */ __cxa_find_matching_catch_4: ___cxa_find_matching_catch_4,
  /** @export */ __cxa_find_matching_catch_5: ___cxa_find_matching_catch_5,
  /** @export */ __cxa_rethrow: ___cxa_rethrow,
  /** @export */ __cxa_throw: ___cxa_throw,
  /** @export */ __cxa_uncaught_exceptions: ___cxa_uncaught_exceptions,
  /** @export */ __handle_stack_overflow: ___handle_stack_overflow,
  /** @export */ __pthread_create_js: ___pthread_create_js,
  /** @export */ __resumeException: ___resumeException,
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
  /** @export */ alignfault: alignfault,
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
  /** @export */ invoke_di: invoke_di,
  /** @export */ invoke_dii: invoke_dii,
  /** @export */ invoke_diii: invoke_diii,
  /** @export */ invoke_djj: invoke_djj,
  /** @export */ invoke_fffffff: invoke_fffffff,
  /** @export */ invoke_fi: invoke_fi,
  /** @export */ invoke_fiff: invoke_fiff,
  /** @export */ invoke_fii: invoke_fii,
  /** @export */ invoke_fiii: invoke_fiii,
  /** @export */ invoke_fijjjjifi: invoke_fijjjjifi,
  /** @export */ invoke_fj: invoke_fj,
  /** @export */ invoke_i: invoke_i,
  /** @export */ invoke_if: invoke_if,
  /** @export */ invoke_iffi: invoke_iffi,
  /** @export */ invoke_ii: invoke_ii,
  /** @export */ invoke_iidd: invoke_iidd,
  /** @export */ invoke_iidi: invoke_iidi,
  /** @export */ invoke_iif: invoke_iif,
  /** @export */ invoke_iiff: invoke_iiff,
  /** @export */ invoke_iii: invoke_iii,
  /** @export */ invoke_iiif: invoke_iiif,
  /** @export */ invoke_iiifi: invoke_iiifi,
  /** @export */ invoke_iiii: invoke_iiii,
  /** @export */ invoke_iiiii: invoke_iiiii,
  /** @export */ invoke_iiiiid: invoke_iiiiid,
  /** @export */ invoke_iiiiidfffiii: invoke_iiiiidfffiii,
  /** @export */ invoke_iiiiii: invoke_iiiiii,
  /** @export */ invoke_iiiiiii: invoke_iiiiiii,
  /** @export */ invoke_iiiiiiii: invoke_iiiiiiii,
  /** @export */ invoke_iiiiiiiii: invoke_iiiiiiiii,
  /** @export */ invoke_iiiiiiiiii: invoke_iiiiiiiiii,
  /** @export */ invoke_iiiiiiiiiii: invoke_iiiiiiiiiii,
  /** @export */ invoke_iiiiiiiiiiii: invoke_iiiiiiiiiiii,
  /** @export */ invoke_iiiiiiiiiiiii: invoke_iiiiiiiiiiiii,
  /** @export */ invoke_iiiiiiiiiiiiifii: invoke_iiiiiiiiiiiiifii,
  /** @export */ invoke_iiiiiiiiiiiiiiiiifii: invoke_iiiiiiiiiiiiiiiiifii,
  /** @export */ invoke_iiiiiiiiiiiiiiiiii: invoke_iiiiiiiiiiiiiiiiii,
  /** @export */ invoke_iiiiiiiiiiiiiiiiiifi: invoke_iiiiiiiiiiiiiiiiiifi,
  /** @export */ invoke_iiiiiiiiiiiiiiiiiiii: invoke_iiiiiiiiiiiiiiiiiiii,
  /** @export */ invoke_iiiiiiiiiiiiiiiiiiiiiii: invoke_iiiiiiiiiiiiiiiiiiiiiii,
  /** @export */ invoke_iiiiiiiiiiiiiiiiiiiiiiii: invoke_iiiiiiiiiiiiiiiiiiiiiiii,
  /** @export */ invoke_iiiiiiiiiiiji: invoke_iiiiiiiiiiiji,
  /** @export */ invoke_iiiiiiiiij: invoke_iiiiiiiiij,
  /** @export */ invoke_iiiiiiiiiji: invoke_iiiiiiiiiji,
  /** @export */ invoke_iiiiiiiiijii: invoke_iiiiiiiiijii,
  /** @export */ invoke_iiiiiiiiijj: invoke_iiiiiiiiijj,
  /** @export */ invoke_iiiiiiiij: invoke_iiiiiiiij,
  /** @export */ invoke_iiiiiiiijjjfi: invoke_iiiiiiiijjjfi,
  /** @export */ invoke_iiiiiij: invoke_iiiiiij,
  /** @export */ invoke_iiiiiijji: invoke_iiiiiijji,
  /** @export */ invoke_iiiiiijjjii: invoke_iiiiiijjjii,
  /** @export */ invoke_iiiiij: invoke_iiiiij,
  /** @export */ invoke_iiiiiji: invoke_iiiiiji,
  /** @export */ invoke_iiiiijiii: invoke_iiiiijiii,
  /** @export */ invoke_iiiiijiiiii: invoke_iiiiijiiiii,
  /** @export */ invoke_iiiiijji: invoke_iiiiijji,
  /** @export */ invoke_iiiij: invoke_iiiij,
  /** @export */ invoke_iiiiji: invoke_iiiiji,
  /** @export */ invoke_iiiijii: invoke_iiiijii,
  /** @export */ invoke_iiiijjii: invoke_iiiijjii,
  /** @export */ invoke_iiiijjj: invoke_iiiijjj,
  /** @export */ invoke_iiiijjjiii: invoke_iiiijjjiii,
  /** @export */ invoke_iiij: invoke_iiij,
  /** @export */ invoke_iiiji: invoke_iiiji,
  /** @export */ invoke_iiijii: invoke_iiijii,
  /** @export */ invoke_iiijiii: invoke_iiijiii,
  /** @export */ invoke_iiijiiiii: invoke_iiijiiiii,
  /** @export */ invoke_iiijjii: invoke_iiijjii,
  /** @export */ invoke_iij: invoke_iij,
  /** @export */ invoke_iiji: invoke_iiji,
  /** @export */ invoke_iijii: invoke_iijii,
  /** @export */ invoke_iijiiii: invoke_iijiiii,
  /** @export */ invoke_iijj: invoke_iijj,
  /** @export */ invoke_iijjii: invoke_iijjii,
  /** @export */ invoke_iijjjf: invoke_iijjjf,
  /** @export */ invoke_iijjjii: invoke_iijjjii,
  /** @export */ invoke_iijjjj: invoke_iijjjj,
  /** @export */ invoke_ij: invoke_ij,
  /** @export */ invoke_iji: invoke_iji,
  /** @export */ invoke_ijii: invoke_ijii,
  /** @export */ invoke_ijiiii: invoke_ijiiii,
  /** @export */ invoke_j: invoke_j,
  /** @export */ invoke_jfi: invoke_jfi,
  /** @export */ invoke_ji: invoke_ji,
  /** @export */ invoke_jii: invoke_jii,
  /** @export */ invoke_jiii: invoke_jiii,
  /** @export */ invoke_jiiii: invoke_jiiii,
  /** @export */ invoke_jiiij: invoke_jiiij,
  /** @export */ invoke_jiij: invoke_jiij,
  /** @export */ invoke_jiijj: invoke_jiijj,
  /** @export */ invoke_jij: invoke_jij,
  /** @export */ invoke_jiji: invoke_jiji,
  /** @export */ invoke_jj: invoke_jj,
  /** @export */ invoke_jjj: invoke_jjj,
  /** @export */ invoke_v: invoke_v,
  /** @export */ invoke_vfiii: invoke_vfiii,
  /** @export */ invoke_vi: invoke_vi,
  /** @export */ invoke_vid: invoke_vid,
  /** @export */ invoke_vidi: invoke_vidi,
  /** @export */ invoke_vif: invoke_vif,
  /** @export */ invoke_viffiii: invoke_viffiii,
  /** @export */ invoke_vifi: invoke_vifi,
  /** @export */ invoke_vifii: invoke_vifii,
  /** @export */ invoke_vifiifiiii: invoke_vifiifiiii,
  /** @export */ invoke_vifiifiiiiiii: invoke_vifiifiiiiiii,
  /** @export */ invoke_vifiii: invoke_vifiii,
  /** @export */ invoke_vii: invoke_vii,
  /** @export */ invoke_viid: invoke_viid,
  /** @export */ invoke_viidi: invoke_viidi,
  /** @export */ invoke_viif: invoke_viif,
  /** @export */ invoke_viiff: invoke_viiff,
  /** @export */ invoke_viifiifijjjii: invoke_viifiifijjjii,
  /** @export */ invoke_viifiii: invoke_viifiii,
  /** @export */ invoke_viifjjijiiii: invoke_viifjjijiiii,
  /** @export */ invoke_viifjjjijiiiii: invoke_viifjjjijiiiii,
  /** @export */ invoke_viii: invoke_viii,
  /** @export */ invoke_viiif: invoke_viiif,
  /** @export */ invoke_viiiff: invoke_viiiff,
  /** @export */ invoke_viiifii: invoke_viiifii,
  /** @export */ invoke_viiifiifii: invoke_viiifiifii,
  /** @export */ invoke_viiifiiiiiifiiii: invoke_viiifiiiiiifiiii,
  /** @export */ invoke_viiii: invoke_viiii,
  /** @export */ invoke_viiiiff: invoke_viiiiff,
  /** @export */ invoke_viiiifiiifiii: invoke_viiiifiiifiii,
  /** @export */ invoke_viiiii: invoke_viiiii,
  /** @export */ invoke_viiiiidiidii: invoke_viiiiidiidii,
  /** @export */ invoke_viiiiidiidiiii: invoke_viiiiidiidiiii,
  /** @export */ invoke_viiiiif: invoke_viiiiif,
  /** @export */ invoke_viiiiiff: invoke_viiiiiff,
  /** @export */ invoke_viiiiifiifii: invoke_viiiiifiifii,
  /** @export */ invoke_viiiiifiifiiii: invoke_viiiiifiifiiii,
  /** @export */ invoke_viiiiifiiiifiii: invoke_viiiiifiiiifiii,
  /** @export */ invoke_viiiiifiiiiii: invoke_viiiiifiiiiii,
  /** @export */ invoke_viiiiii: invoke_viiiiii,
  /** @export */ invoke_viiiiiid: invoke_viiiiiid,
  /** @export */ invoke_viiiiiif: invoke_viiiiiif,
  /** @export */ invoke_viiiiiiff: invoke_viiiiiiff,
  /** @export */ invoke_viiiiiiffifiiiii: invoke_viiiiiiffifiiiii,
  /** @export */ invoke_viiiiiiffiifiiiii: invoke_viiiiiiffiifiiiii,
  /** @export */ invoke_viiiiiifii: invoke_viiiiiifii,
  /** @export */ invoke_viiiiiii: invoke_viiiiiii,
  /** @export */ invoke_viiiiiiidiiii: invoke_viiiiiiidiiii,
  /** @export */ invoke_viiiiiiifiiii: invoke_viiiiiiifiiii,
  /** @export */ invoke_viiiiiiii: invoke_viiiiiiii,
  /** @export */ invoke_viiiiiiiif: invoke_viiiiiiiif,
  /** @export */ invoke_viiiiiiiii: invoke_viiiiiiiii,
  /** @export */ invoke_viiiiiiiiifiii: invoke_viiiiiiiiifiii,
  /** @export */ invoke_viiiiiiiiii: invoke_viiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiii: invoke_viiiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiiii: invoke_viiiiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiiiii: invoke_viiiiiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiiiiii: invoke_viiiiiiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiiiiiifi: invoke_viiiiiiiiiiiiiifi,
  /** @export */ invoke_viiiiiiiiiiiiiii: invoke_viiiiiiiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiiiiiiifiiiii: invoke_viiiiiiiiiiiiiiifiiiii,
  /** @export */ invoke_viiiiiiiiiiiiiiii: invoke_viiiiiiiiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiiiiiiiii: invoke_viiiiiiiiiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiiiiiiiiii: invoke_viiiiiiiiiiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiiiiiiiiiii: invoke_viiiiiiiiiiiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiiiiiiiiiiii: invoke_viiiiiiiiiiiiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiiiiiiiiiiiiiii: invoke_viiiiiiiiiiiiiiiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiiiiiiiiiiiiiiiiiii: invoke_viiiiiiiiiiiiiiiiiiiiiiiiiii,
  /** @export */ invoke_viiiiiiiiiiiijfii: invoke_viiiiiiiiiiiijfii,
  /** @export */ invoke_viiiiiiiijiiiiii: invoke_viiiiiiiijiiiiii,
  /** @export */ invoke_viiiiiiiijiiiiiiiiiiiiiiiii: invoke_viiiiiiiijiiiiiiiiiiiiiiiii,
  /** @export */ invoke_viiiiiiiijjj: invoke_viiiiiiiijjj,
  /** @export */ invoke_viiiiiiijiiii: invoke_viiiiiiijiiii,
  /** @export */ invoke_viiiiiij: invoke_viiiiiij,
  /** @export */ invoke_viiiiiijjiiiii: invoke_viiiiiijjiiiii,
  /** @export */ invoke_viiiiiijjjjjii: invoke_viiiiiijjjjjii,
  /** @export */ invoke_viiiiij: invoke_viiiiij,
  /** @export */ invoke_viiiiijiiiiii: invoke_viiiiijiiiiii,
  /** @export */ invoke_viiiiijjiiiii: invoke_viiiiijjiiiii,
  /** @export */ invoke_viiiiijjj: invoke_viiiiijjj,
  /** @export */ invoke_viiiij: invoke_viiiij,
  /** @export */ invoke_viiiiji: invoke_viiiiji,
  /** @export */ invoke_viiiijii: invoke_viiiijii,
  /** @export */ invoke_viiiijiiiiiiif: invoke_viiiijiiiiiiif,
  /** @export */ invoke_viiiijiiiiiiii: invoke_viiiijiiiiiiii,
  /** @export */ invoke_viiiijjji: invoke_viiiijjji,
  /** @export */ invoke_viiij: invoke_viiij,
  /** @export */ invoke_viiiji: invoke_viiiji,
  /** @export */ invoke_viiijii: invoke_viiijii,
  /** @export */ invoke_viiijiii: invoke_viiijiii,
  /** @export */ invoke_viiijiiiiiiiii: invoke_viiijiiiiiiiii,
  /** @export */ invoke_viiijiijjj: invoke_viiijiijjj,
  /** @export */ invoke_viiijj: invoke_viiijj,
  /** @export */ invoke_viiijjiiiiiii: invoke_viiijjiiiiiii,
  /** @export */ invoke_viiijjjfffi: invoke_viiijjjfffi,
  /** @export */ invoke_viiijjjii: invoke_viiijjjii,
  /** @export */ invoke_viiijjjjji: invoke_viiijjjjji,
  /** @export */ invoke_viij: invoke_viij,
  /** @export */ invoke_viiji: invoke_viiji,
  /** @export */ invoke_viijii: invoke_viijii,
  /** @export */ invoke_viijiiii: invoke_viijiiii,
  /** @export */ invoke_viijiiiiiiiiii: invoke_viijiiiiiiiiii,
  /** @export */ invoke_viijiiiiiiijjii: invoke_viijiiiiiiijjii,
  /** @export */ invoke_viijiiiijiii: invoke_viijiiiijiii,
  /** @export */ invoke_viijj: invoke_viijj,
  /** @export */ invoke_viijjiii: invoke_viijjiii,
  /** @export */ invoke_viijjiiiiiiiii: invoke_viijjiiiiiiiii,
  /** @export */ invoke_viijjj: invoke_viijjj,
  /** @export */ invoke_viijjjj: invoke_viijjjj,
  /** @export */ invoke_viijjjjjjjjjjjjjii: invoke_viijjjjjjjjjjjjjii,
  /** @export */ invoke_vij: invoke_vij,
  /** @export */ invoke_vijfjiiiii: invoke_vijfjiiiii,
  /** @export */ invoke_viji: invoke_viji,
  /** @export */ invoke_vijii: invoke_vijii,
  /** @export */ invoke_vijiii: invoke_vijiii,
  /** @export */ invoke_vijiiiiii: invoke_vijiiiiii,
  /** @export */ invoke_vijiiiiiiii: invoke_vijiiiiiiii,
  /** @export */ invoke_vijiji: invoke_vijiji,
  /** @export */ invoke_vijjfffiii: invoke_vijjfffiii,
  /** @export */ invoke_vijji: invoke_vijji,
  /** @export */ invoke_vijjiiii: invoke_vijjiiii,
  /** @export */ invoke_vijjjiiji: invoke_vijjjiiji,
  /** @export */ invoke_vijjjjiii: invoke_vijjjjiii,
  /** @export */ invoke_vijjjjjjifiiii: invoke_vijjjjjjifiiii,
  /** @export */ invoke_vijjjjjjjjjjjjjii: invoke_vijjjjjjjjjjjjjii,
  /** @export */ invoke_vj: invoke_vj,
  /** @export */ invoke_vjifiii: invoke_vjifiii,
  /** @export */ invoke_vjiii: invoke_vjiii,
  /** @export */ invoke_vjiiiii: invoke_vjiiiii,
  /** @export */ invoke_vjiiiiii: invoke_vjiiiiii,
  /** @export */ invoke_vjiiiiiii: invoke_vjiiiiiii,
  /** @export */ invoke_vjjii: invoke_vjjii,
  /** @export */ invoke_vjjjii: invoke_vjjjii,
  /** @export */ invoke_vjjjjfiii: invoke_vjjjjfiii,
  /** @export */ invoke_vjjjjjiiiii: invoke_vjjjjjiiiii,
  /** @export */ invoke_vjjjjjjddddjji: invoke_vjjjjjjddddjji,
  /** @export */ invoke_vjjjjjjffffjji: invoke_vjjjjjjffffjji,
  /** @export */ invoke_vjjjjjjfffifiiiii: invoke_vjjjjjjfffifiiiii,
  /** @export */ invoke_vjjjjjjfffifiiiiiii: invoke_vjjjjjjfffifiiiiiii,
  /** @export */ invoke_vjjjjjjffiifiiiiii: invoke_vjjjjjjffiifiiiiii,
  /** @export */ invoke_vjjjjjjjjfffiifiiiii: invoke_vjjjjjjjjfffiifiiiii,
  /** @export */ invoke_vjjjjjjjjfffiifiiiiii: invoke_vjjjjjjjjfffiifiiiiii,
  /** @export */ llvm_eh_typeid_for: _llvm_eh_typeid_for,
  /** @export */ memory: wasmMemory,
  /** @export */ proc_exit: _proc_exit,
  /** @export */ segfault: segfault,
  /** @export */ strftime: _strftime,
  /** @export */ strftime_l: _strftime_l
 };
}

var wasmExports = createWasm();

var ___wasm_call_ctors = createExportWrapper("__wasm_call_ctors", 0);

var _OrtInit = Module["_OrtInit"] = createExportWrapper("OrtInit", 2);

var _OrtGetLastError = Module["_OrtGetLastError"] = createExportWrapper("OrtGetLastError", 2);

var _OrtCreateSessionOptions = Module["_OrtCreateSessionOptions"] = createExportWrapper("OrtCreateSessionOptions", 10);

var _OrtAppendExecutionProvider = Module["_OrtAppendExecutionProvider"] = createExportWrapper("OrtAppendExecutionProvider", 2);

var _OrtAddFreeDimensionOverride = Module["_OrtAddFreeDimensionOverride"] = createExportWrapper("OrtAddFreeDimensionOverride", 3);

var _OrtAddSessionConfigEntry = Module["_OrtAddSessionConfigEntry"] = createExportWrapper("OrtAddSessionConfigEntry", 3);

var _OrtReleaseSessionOptions = Module["_OrtReleaseSessionOptions"] = createExportWrapper("OrtReleaseSessionOptions", 1);

var _OrtCreateSession = Module["_OrtCreateSession"] = createExportWrapper("OrtCreateSession", 3);

var _OrtReleaseSession = Module["_OrtReleaseSession"] = createExportWrapper("OrtReleaseSession", 1);

var _OrtGetInputOutputCount = Module["_OrtGetInputOutputCount"] = createExportWrapper("OrtGetInputOutputCount", 3);

var _OrtGetInputName = Module["_OrtGetInputName"] = createExportWrapper("OrtGetInputName", 2);

var _OrtGetOutputName = Module["_OrtGetOutputName"] = createExportWrapper("OrtGetOutputName", 2);

var _OrtFree = Module["_OrtFree"] = createExportWrapper("OrtFree", 1);

var _OrtCreateTensor = Module["_OrtCreateTensor"] = createExportWrapper("OrtCreateTensor", 6);

var _OrtGetTensorData = Module["_OrtGetTensorData"] = createExportWrapper("OrtGetTensorData", 5);

var _OrtReleaseTensor = Module["_OrtReleaseTensor"] = createExportWrapper("OrtReleaseTensor", 1);

var _OrtCreateRunOptions = Module["_OrtCreateRunOptions"] = createExportWrapper("OrtCreateRunOptions", 4);

var _OrtAddRunConfigEntry = Module["_OrtAddRunConfigEntry"] = createExportWrapper("OrtAddRunConfigEntry", 3);

var _OrtReleaseRunOptions = Module["_OrtReleaseRunOptions"] = createExportWrapper("OrtReleaseRunOptions", 1);

var _OrtCreateBinding = Module["_OrtCreateBinding"] = createExportWrapper("OrtCreateBinding", 1);

var _OrtBindInput = Module["_OrtBindInput"] = createExportWrapper("OrtBindInput", 3);

var _OrtBindOutput = Module["_OrtBindOutput"] = createExportWrapper("OrtBindOutput", 4);

var _OrtClearBoundOutputs = Module["_OrtClearBoundOutputs"] = createExportWrapper("OrtClearBoundOutputs", 1);

var _OrtReleaseBinding = Module["_OrtReleaseBinding"] = createExportWrapper("OrtReleaseBinding", 1);

var _OrtRunWithBinding = Module["_OrtRunWithBinding"] = createExportWrapper("OrtRunWithBinding", 5);

var _OrtRun = Module["_OrtRun"] = createExportWrapper("OrtRun", 8);

var _OrtEndProfiling = Module["_OrtEndProfiling"] = createExportWrapper("OrtEndProfiling", 1);

var ___cxa_free_exception = createExportWrapper("__cxa_free_exception", 1);

var _JsepOutput = Module["_JsepOutput"] = createExportWrapper("JsepOutput", 3);

var _JsepGetNodeName = Module["_JsepGetNodeName"] = createExportWrapper("JsepGetNodeName", 1);

var _pthread_self = () => (_pthread_self = wasmExports["pthread_self"])();

var _free = Module["_free"] = createExportWrapper("free", 1);

var _fflush = createExportWrapper("fflush", 1);

var _malloc = Module["_malloc"] = createExportWrapper("malloc", 1);

var __emscripten_tls_init = createExportWrapper("_emscripten_tls_init", 0);

var __emscripten_thread_init = createExportWrapper("_emscripten_thread_init", 6);

var __emscripten_thread_crashed = createExportWrapper("_emscripten_thread_crashed", 0);

var _emscripten_main_thread_process_queued_calls = createExportWrapper("emscripten_main_thread_process_queued_calls", 0);

var _emscripten_main_runtime_thread_id = createExportWrapper("emscripten_main_runtime_thread_id", 0);

var _emscripten_stack_get_base = () => (_emscripten_stack_get_base = wasmExports["emscripten_stack_get_base"])();

var _emscripten_stack_get_end = () => (_emscripten_stack_get_end = wasmExports["emscripten_stack_get_end"])();

var __emscripten_run_on_main_thread_js = createExportWrapper("_emscripten_run_on_main_thread_js", 5);

var __emscripten_thread_free_data = createExportWrapper("_emscripten_thread_free_data", 1);

var __emscripten_thread_exit = createExportWrapper("_emscripten_thread_exit", 1);

var _emscripten_get_sbrk_ptr = createExportWrapper("emscripten_get_sbrk_ptr", 0);

var _sbrk = createExportWrapper("sbrk", 1);

var __emscripten_check_mailbox = createExportWrapper("_emscripten_check_mailbox", 0);

var _setThrew = createExportWrapper("setThrew", 2);

var __emscripten_tempret_set = createExportWrapper("_emscripten_tempret_set", 1);

var _emscripten_stack_init = () => (_emscripten_stack_init = wasmExports["emscripten_stack_init"])();

var _emscripten_stack_set_limits = (a0, a1) => (_emscripten_stack_set_limits = wasmExports["emscripten_stack_set_limits"])(a0, a1);

var _emscripten_stack_get_free = () => (_emscripten_stack_get_free = wasmExports["emscripten_stack_get_free"])();

var __emscripten_stack_restore = a0 => (__emscripten_stack_restore = wasmExports["_emscripten_stack_restore"])(a0);

var __emscripten_stack_alloc = a0 => (__emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"])(a0);

var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"])();

var ___cxa_decrement_exception_refcount = createExportWrapper("__cxa_decrement_exception_refcount", 1);

var ___cxa_increment_exception_refcount = createExportWrapper("__cxa_increment_exception_refcount", 1);

var ___get_exception_message = createExportWrapper("__get_exception_message", 3);

var ___cxa_can_catch = createExportWrapper("__cxa_can_catch", 3);

var ___cxa_is_pointer_type = createExportWrapper("__cxa_is_pointer_type", 1);

var ___set_stack_limits = Module["___set_stack_limits"] = createExportWrapper("__set_stack_limits", 2);

var dynCall_vi = Module["dynCall_vi"] = createExportWrapper("dynCall_vi", 2);

var dynCall_iiii = Module["dynCall_iiii"] = createExportWrapper("dynCall_iiii", 4);

var dynCall_iii = Module["dynCall_iii"] = createExportWrapper("dynCall_iii", 3);

var dynCall_ii = Module["dynCall_ii"] = createExportWrapper("dynCall_ii", 2);

var dynCall_vii = Module["dynCall_vii"] = createExportWrapper("dynCall_vii", 3);

var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = createExportWrapper("dynCall_iiiiiii", 7);

var dynCall_v = Module["dynCall_v"] = createExportWrapper("dynCall_v", 1);

var dynCall_viii = Module["dynCall_viii"] = createExportWrapper("dynCall_viii", 4);

var dynCall_iiiiii = Module["dynCall_iiiiii"] = createExportWrapper("dynCall_iiiiii", 6);

var dynCall_iiiii = Module["dynCall_iiiii"] = createExportWrapper("dynCall_iiiii", 5);

var dynCall_viiii = Module["dynCall_viiii"] = createExportWrapper("dynCall_viiii", 5);

var dynCall_ji = Module["dynCall_ji"] = createExportWrapper("dynCall_ji", 2);

var dynCall_viijiiiiiiiiii = Module["dynCall_viijiiiiiiiiii"] = createExportWrapper("dynCall_viijiiiiiiiiii", 14);

var dynCall_viiiiii = Module["dynCall_viiiiii"] = createExportWrapper("dynCall_viiiiii", 7);

var dynCall_viiij = Module["dynCall_viiij"] = createExportWrapper("dynCall_viiij", 5);

var dynCall_djj = Module["dynCall_djj"] = createExportWrapper("dynCall_djj", 3);

var dynCall_jii = Module["dynCall_jii"] = createExportWrapper("dynCall_jii", 3);

var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji", 4);

var dynCall_iiiiiij = Module["dynCall_iiiiiij"] = createExportWrapper("dynCall_iiiiiij", 7);

var dynCall_i = Module["dynCall_i"] = createExportWrapper("dynCall_i", 1);

var dynCall_iij = Module["dynCall_iij"] = createExportWrapper("dynCall_iij", 3);

var dynCall_vij = Module["dynCall_vij"] = createExportWrapper("dynCall_vij", 3);

var dynCall_viiijii = Module["dynCall_viiijii"] = createExportWrapper("dynCall_viiijii", 7);

var dynCall_viiiii = Module["dynCall_viiiii"] = createExportWrapper("dynCall_viiiii", 6);

var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = createExportWrapper("dynCall_viiiiiiii", 9);

var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = createExportWrapper("dynCall_iiiiiiii", 8);

var dynCall_iiiiiiiij = Module["dynCall_iiiiiiiij"] = createExportWrapper("dynCall_iiiiiiiij", 9);

var dynCall_jj = Module["dynCall_jj"] = createExportWrapper("dynCall_jj", 2);

var dynCall_vif = Module["dynCall_vif"] = createExportWrapper("dynCall_vif", 3);

var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = createExportWrapper("dynCall_viiiiiii", 8);

var dynCall_viiiijii = Module["dynCall_viiiijii"] = createExportWrapper("dynCall_viiiijii", 8);

var dynCall_iji = Module["dynCall_iji"] = createExportWrapper("dynCall_iji", 3);

var dynCall_viiijiii = Module["dynCall_viiijiii"] = createExportWrapper("dynCall_viiijiii", 8);

var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiii", 10);

var dynCall_ij = Module["dynCall_ij"] = createExportWrapper("dynCall_ij", 2);

var dynCall_viijj = Module["dynCall_viijj"] = createExportWrapper("dynCall_viijj", 5);

var dynCall_fii = Module["dynCall_fii"] = createExportWrapper("dynCall_fii", 3);

var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiii", 11);

var dynCall_fi = Module["dynCall_fi"] = createExportWrapper("dynCall_fi", 2);

var dynCall_jiii = Module["dynCall_jiii"] = createExportWrapper("dynCall_jiii", 4);

var dynCall_vid = Module["dynCall_vid"] = createExportWrapper("dynCall_vid", 3);

var dynCall_dii = Module["dynCall_dii"] = createExportWrapper("dynCall_dii", 3);

var dynCall_viiiiiiiiiii = Module["dynCall_viiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiii", 12);

var dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiiii", 10);

var dynCall_iiiiiiiiiii = Module["dynCall_iiiiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiiiii", 11);

var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiii", 9);

var dynCall_iiiiijiii = Module["dynCall_iiiiijiii"] = createExportWrapper("dynCall_iiiiijiii", 9);

var dynCall_viij = Module["dynCall_viij"] = createExportWrapper("dynCall_viij", 4);

var dynCall_viif = Module["dynCall_viif"] = createExportWrapper("dynCall_viif", 4);

var dynCall_iiiiijiiiii = Module["dynCall_iiiiijiiiii"] = createExportWrapper("dynCall_iiiiijiiiii", 11);

var dynCall_vijiii = Module["dynCall_vijiii"] = createExportWrapper("dynCall_vijiii", 6);

var dynCall_iiiiiiiiij = Module["dynCall_iiiiiiiiij"] = createExportWrapper("dynCall_iiiiiiiiij", 10);

var dynCall_iiiiiijji = Module["dynCall_iiiiiijji"] = createExportWrapper("dynCall_iiiiiijji", 9);

var dynCall_iidi = Module["dynCall_iidi"] = createExportWrapper("dynCall_iidi", 4);

var dynCall_viiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiii", 14);

var dynCall_iiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiiiiiii", 13);

var dynCall_viiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiii", 15);

var dynCall_viiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiiiiii", 18);

var dynCall_viiiiiiiiiiii = Module["dynCall_viiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiii", 13);

var dynCall_jjj = Module["dynCall_jjj"] = createExportWrapper("dynCall_jjj", 3);

var dynCall_viiji = Module["dynCall_viiji"] = createExportWrapper("dynCall_viiji", 5);

var dynCall_viiiiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiiiiiiii", 20);

var dynCall_viiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiiiii", 17);

var dynCall_viijjj = Module["dynCall_viijjj"] = createExportWrapper("dynCall_viijjj", 6);

var dynCall_viifiifijjjii = Module["dynCall_viifiifijjjii"] = createExportWrapper("dynCall_viifiifijjjii", 13);

var dynCall_vifiifiiii = Module["dynCall_vifiifiiii"] = createExportWrapper("dynCall_vifiifiiii", 10);

var dynCall_vifiifiiiiiii = Module["dynCall_vifiifiiiiiii"] = createExportWrapper("dynCall_vifiifiiiiiii", 13);

var dynCall_vijiji = Module["dynCall_vijiji"] = createExportWrapper("dynCall_vijiji", 6);

var dynCall_jiij = Module["dynCall_jiij"] = createExportWrapper("dynCall_jiij", 4);

var dynCall_vjifiii = Module["dynCall_vjifiii"] = createExportWrapper("dynCall_vjifiii", 7);

var dynCall_viidi = Module["dynCall_viidi"] = createExportWrapper("dynCall_viidi", 5);

var dynCall_iffi = Module["dynCall_iffi"] = createExportWrapper("dynCall_iffi", 4);

var dynCall_fiii = Module["dynCall_fiii"] = createExportWrapper("dynCall_fiii", 4);

var dynCall_vjiiiii = Module["dynCall_vjiiiii"] = createExportWrapper("dynCall_vjiiiii", 7);

var dynCall_vjiiiiii = Module["dynCall_vjiiiiii"] = createExportWrapper("dynCall_vjiiiiii", 8);

var dynCall_vijiiiiii = Module["dynCall_vijiiiiii"] = createExportWrapper("dynCall_vijiiiiii", 9);

var dynCall_vjiiiiiii = Module["dynCall_vjiiiiiii"] = createExportWrapper("dynCall_vjiiiiiii", 9);

var dynCall_viiiiiifii = Module["dynCall_viiiiiifii"] = createExportWrapper("dynCall_viiiiiifii", 10);

var dynCall_iiiiidfffiii = Module["dynCall_iiiiidfffiii"] = createExportWrapper("dynCall_iiiiidfffiii", 12);

var dynCall_viiiiiiiiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiiiiiiiiiiii", 24);

var dynCall_viiiiiiiif = Module["dynCall_viiiiiiiif"] = createExportWrapper("dynCall_viiiiiiiif", 10);

var dynCall_viiiiiiiiiiiiiiifiiiii = Module["dynCall_viiiiiiiiiiiiiiifiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiiiifiiiii", 22);

var dynCall_viiiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiiiiiii", 19);

var dynCall_viiifii = Module["dynCall_viiifii"] = createExportWrapper("dynCall_viiifii", 7);

var dynCall_viiiiifiiiiii = Module["dynCall_viiiiifiiiiii"] = createExportWrapper("dynCall_viiiiifiiiiii", 13);

var dynCall_viiff = Module["dynCall_viiff"] = createExportWrapper("dynCall_viiff", 5);

var dynCall_viiiiiff = Module["dynCall_viiiiiff"] = createExportWrapper("dynCall_viiiiiff", 8);

var dynCall_viiiiff = Module["dynCall_viiiiff"] = createExportWrapper("dynCall_viiiiff", 7);

var dynCall_ffff = Module["dynCall_ffff"] = createExportWrapper("dynCall_ffff", 4);

var dynCall_viiiff = Module["dynCall_viiiff"] = createExportWrapper("dynCall_viiiff", 6);

var dynCall_viiiiiiff = Module["dynCall_viiiiiiff"] = createExportWrapper("dynCall_viiiiiiff", 9);

var dynCall_fiiii = Module["dynCall_fiiii"] = createExportWrapper("dynCall_fiiii", 5);

var dynCall_vfiii = Module["dynCall_vfiii"] = createExportWrapper("dynCall_vfiii", 5);

var dynCall_iiji = Module["dynCall_iiji"] = createExportWrapper("dynCall_iiji", 4);

var dynCall_viiiiif = Module["dynCall_viiiiif"] = createExportWrapper("dynCall_viiiiif", 7);

var dynCall_iiiiiiiiiiiiiiiiifii = Module["dynCall_iiiiiiiiiiiiiiiiifii"] = createExportWrapper("dynCall_iiiiiiiiiiiiiiiiifii", 20);

var dynCall_iijjjj = Module["dynCall_iijjjj"] = createExportWrapper("dynCall_iijjjj", 6);

var dynCall_viijjiiiiiiiii = Module["dynCall_viijjiiiiiiiii"] = createExportWrapper("dynCall_viijjiiiiiiiii", 14);

var dynCall_vijjjiiji = Module["dynCall_vijjjiiji"] = createExportWrapper("dynCall_vijjjiiji", 9);

var dynCall_viijiiiiiiijjii = Module["dynCall_viijiiiiiiijjii"] = createExportWrapper("dynCall_viijiiiiiiijjii", 15);

var dynCall_iif = Module["dynCall_iif"] = createExportWrapper("dynCall_iif", 3);

var dynCall_viiiiidiidii = Module["dynCall_viiiiidiidii"] = createExportWrapper("dynCall_viiiiidiidii", 12);

var dynCall_viiifiifii = Module["dynCall_viiifiifii"] = createExportWrapper("dynCall_viiifiifii", 10);

var dynCall_vijjjjiii = Module["dynCall_vijjjjiii"] = createExportWrapper("dynCall_vijjjjiii", 9);

var dynCall_j = Module["dynCall_j"] = createExportWrapper("dynCall_j", 1);

var dynCall_iidd = Module["dynCall_iidd"] = createExportWrapper("dynCall_iidd", 4);

var dynCall_iijj = Module["dynCall_iijj"] = createExportWrapper("dynCall_iijj", 4);

var dynCall_viid = Module["dynCall_viid"] = createExportWrapper("dynCall_viid", 4);

var dynCall_viffiii = Module["dynCall_viffiii"] = createExportWrapper("dynCall_viffiii", 7);

var dynCall_viiijjjii = Module["dynCall_viiijjjii"] = createExportWrapper("dynCall_viiijjjii", 9);

var dynCall_viiiiijjj = Module["dynCall_viiiiijjj"] = createExportWrapper("dynCall_viiiiijjj", 9);

var dynCall_iiiiiiiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiiiiiiiiiiii", 18);

var dynCall_viiiiiif = Module["dynCall_viiiiiif"] = createExportWrapper("dynCall_viiiiiif", 8);

var dynCall_iiiiiiiiiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiiiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiiiiiiiiiiiiii", 20);

var dynCall_iiiiiiiiiiiiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiiiiiiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiiiiiiiiiiiiiiiii", 23);

var dynCall_viiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiiii", 16);

var dynCall_iiiiiiiiiiiiiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiiiiiiiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiiiiiiiiiiiiiiiiii", 24);

var dynCall_viiiiiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiiiiiiiii", 21);

var dynCall_viiiiiiiiiiiiiifi = Module["dynCall_viiiiiiiiiiiiiifi"] = createExportWrapper("dynCall_viiiiiiiiiiiiiifi", 17);

var dynCall_jij = Module["dynCall_jij"] = createExportWrapper("dynCall_jij", 3);

var dynCall_viiiijiiiiiiif = Module["dynCall_viiiijiiiiiiif"] = createExportWrapper("dynCall_viiiijiiiiiiif", 14);

var dynCall_viiiiifiifii = Module["dynCall_viiiiifiifii"] = createExportWrapper("dynCall_viiiiifiifii", 12);

var dynCall_viiiiifiifiiii = Module["dynCall_viiiiifiifiiii"] = createExportWrapper("dynCall_viiiiifiifiiii", 14);

var dynCall_viifiii = Module["dynCall_viifiii"] = createExportWrapper("dynCall_viifiii", 7);

var dynCall_viiiifiiifiii = Module["dynCall_viiiifiiifiii"] = createExportWrapper("dynCall_viiiifiiifiii", 13);

var dynCall_viiiiidiidiiii = Module["dynCall_viiiiidiidiiii"] = createExportWrapper("dynCall_viiiiidiidiiii", 14);

var dynCall_di = Module["dynCall_di"] = createExportWrapper("dynCall_di", 2);

var dynCall_viiiiifiiiifiii = Module["dynCall_viiiiifiiiifiii"] = createExportWrapper("dynCall_viiiiifiiiifiii", 15);

var dynCall_iiff = Module["dynCall_iiff"] = createExportWrapper("dynCall_iiff", 4);

var dynCall_viiifiiiiiifiiii = Module["dynCall_viiifiiiiiifiiii"] = createExportWrapper("dynCall_viiifiiiiiifiiii", 16);

var dynCall_iiiiiiiiiiiiiiiiiifi = Module["dynCall_iiiiiiiiiiiiiiiiiifi"] = createExportWrapper("dynCall_iiiiiiiiiiiiiiiiiifi", 20);

var dynCall_viiiiiiiijjj = Module["dynCall_viiiiiiiijjj"] = createExportWrapper("dynCall_viiiiiiiijjj", 12);

var dynCall_viiiiiijjjjjii = Module["dynCall_viiiiiijjjjjii"] = createExportWrapper("dynCall_viiiiiijjjjjii", 14);

var dynCall_diii = Module["dynCall_diii"] = createExportWrapper("dynCall_diii", 4);

var dynCall_viji = Module["dynCall_viji"] = createExportWrapper("dynCall_viji", 4);

var dynCall_vifi = Module["dynCall_vifi"] = createExportWrapper("dynCall_vifi", 4);

var dynCall_viiiiij = Module["dynCall_viiiiij"] = createExportWrapper("dynCall_viiiiij", 7);

var dynCall_vijjjjjjjjjjjjjii = Module["dynCall_vijjjjjjjjjjjjjii"] = createExportWrapper("dynCall_vijjjjjjjjjjjjjii", 17);

var dynCall_viiijjiiiiiii = Module["dynCall_viiijjiiiiiii"] = createExportWrapper("dynCall_viiijjiiiiiii", 13);

var dynCall_viijiiiijiii = Module["dynCall_viijiiiijiii"] = createExportWrapper("dynCall_viijiiiijiii", 12);

var dynCall_viifjjjijiiiii = Module["dynCall_viifjjjijiiiii"] = createExportWrapper("dynCall_viifjjjijiiiii", 14);

var dynCall_vjjjjjjffffjji = Module["dynCall_vjjjjjjffffjji"] = createExportWrapper("dynCall_vjjjjjjffffjji", 14);

var dynCall_vjjjjjjddddjji = Module["dynCall_vjjjjjjddddjji"] = createExportWrapper("dynCall_vjjjjjjddddjji", 14);

var dynCall_viifjjijiiii = Module["dynCall_viifjjijiiii"] = createExportWrapper("dynCall_viifjjijiiii", 12);

var dynCall_viiiiiiifiiii = Module["dynCall_viiiiiiifiiii"] = createExportWrapper("dynCall_viiiiiiifiiii", 13);

var dynCall_viiiiiid = Module["dynCall_viiiiiid"] = createExportWrapper("dynCall_viiiiiid", 8);

var dynCall_viiiiiiidiiii = Module["dynCall_viiiiiiidiiii"] = createExportWrapper("dynCall_viiiiiiidiiii", 13);

var dynCall_viiiiiiiiiiiijfii = Module["dynCall_viiiiiiiiiiiijfii"] = createExportWrapper("dynCall_viiiiiiiiiiiijfii", 17);

var dynCall_viiiji = Module["dynCall_viiiji"] = createExportWrapper("dynCall_viiiji", 6);

var dynCall_viiijjjjji = Module["dynCall_viiijjjjji"] = createExportWrapper("dynCall_viiijjjjji", 10);

var dynCall_vifii = Module["dynCall_vifii"] = createExportWrapper("dynCall_vifii", 5);

var dynCall_vifiii = Module["dynCall_vifiii"] = createExportWrapper("dynCall_vifiii", 6);

var dynCall_iiijiiiii = Module["dynCall_iiijiiiii"] = createExportWrapper("dynCall_iiijiiiii", 9);

var dynCall_vj = Module["dynCall_vj"] = createExportWrapper("dynCall_vj", 2);

var dynCall_viiiij = Module["dynCall_viiiij"] = createExportWrapper("dynCall_viiiij", 6);

var dynCall_iiiiiiiiiiiiifii = Module["dynCall_iiiiiiiiiiiiifii"] = createExportWrapper("dynCall_iiiiiiiiiiiiifii", 16);

var dynCall_viiijjjfffi = Module["dynCall_viiijjjfffi"] = createExportWrapper("dynCall_viiijjjfffi", 11);

var dynCall_viiijiijjj = Module["dynCall_viiijiijjj"] = createExportWrapper("dynCall_viiijiijjj", 10);

var dynCall_viijjjj = Module["dynCall_viijjjj"] = createExportWrapper("dynCall_viijjjj", 7);

var dynCall_viiiiiiiiifiii = Module["dynCall_viiiiiiiiifiii"] = createExportWrapper("dynCall_viiiiiiiiifiii", 14);

var dynCall_vjjjjjjffiifiiiiii = Module["dynCall_vjjjjjjffiifiiiiii"] = createExportWrapper("dynCall_vjjjjjjffiifiiiiii", 18);

var dynCall_viiiiiiffiifiiiii = Module["dynCall_viiiiiiffiifiiiii"] = createExportWrapper("dynCall_viiiiiiffiifiiiii", 17);

var dynCall_viiiiiiffifiiiii = Module["dynCall_viiiiiiffifiiiii"] = createExportWrapper("dynCall_viiiiiiffifiiiii", 16);

var dynCall_vjjjjjjjjfffiifiiiiii = Module["dynCall_vjjjjjjjjfffiifiiiiii"] = createExportWrapper("dynCall_vjjjjjjjjfffiifiiiiii", 21);

var dynCall_vjjjjjjjjfffiifiiiii = Module["dynCall_vjjjjjjjjfffiifiiiii"] = createExportWrapper("dynCall_vjjjjjjjjfffiifiiiii", 20);

var dynCall_vjjjjjjfffifiiiiiii = Module["dynCall_vjjjjjjfffifiiiiiii"] = createExportWrapper("dynCall_vjjjjjjfffifiiiiiii", 19);

var dynCall_vjjjjjjfffifiiiii = Module["dynCall_vjjjjjjfffifiiiii"] = createExportWrapper("dynCall_vjjjjjjfffifiiiii", 17);

var dynCall_fffffff = Module["dynCall_fffffff"] = createExportWrapper("dynCall_fffffff", 7);

var dynCall_jfi = Module["dynCall_jfi"] = createExportWrapper("dynCall_jfi", 3);

var dynCall_vijjjjjjifiiii = Module["dynCall_vijjjjjjifiiii"] = createExportWrapper("dynCall_vijjjjjjifiiii", 14);

var dynCall_vjjjjjiiiii = Module["dynCall_vjjjjjiiiii"] = createExportWrapper("dynCall_vjjjjjiiiii", 11);

var dynCall_vjjjjfiii = Module["dynCall_vjjjjfiii"] = createExportWrapper("dynCall_vjjjjfiii", 9);

var dynCall_fijjjjifi = Module["dynCall_fijjjjifi"] = createExportWrapper("dynCall_fijjjjifi", 9);

var dynCall_vijjfffiii = Module["dynCall_vijjfffiii"] = createExportWrapper("dynCall_vijjfffiii", 10);

var dynCall_vijiiiiiiii = Module["dynCall_vijiiiiiiii"] = createExportWrapper("dynCall_vijiiiiiiii", 11);

var dynCall_fif = Module["dynCall_fif"] = createExportWrapper("dynCall_fif", 3);

var dynCall_iiiiiiiiiiii = Module["dynCall_iiiiiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiiiiii", 12);

var dynCall_iiiiiji = Module["dynCall_iiiiiji"] = createExportWrapper("dynCall_iiiiiji", 7);

var dynCall_viiijj = Module["dynCall_viiijj"] = createExportWrapper("dynCall_viiijj", 6);

var dynCall_viiiiijiiiiii = Module["dynCall_viiiiijiiiiii"] = createExportWrapper("dynCall_viiiiijiiiiii", 13);

var dynCall_viiiiijjiiiii = Module["dynCall_viiiiijjiiiii"] = createExportWrapper("dynCall_viiiiijjiiiii", 13);

var dynCall_viiiiji = Module["dynCall_viiiiji"] = createExportWrapper("dynCall_viiiiji", 7);

var dynCall_viijjiii = Module["dynCall_viijjiii"] = createExportWrapper("dynCall_viijjiii", 8);

var dynCall_vijii = Module["dynCall_vijii"] = createExportWrapper("dynCall_vijii", 5);

var dynCall_iiiiji = Module["dynCall_iiiiji"] = createExportWrapper("dynCall_iiiiji", 6);

var dynCall_viijjjjjjjjjjjjjii = Module["dynCall_viijjjjjjjjjjjjjii"] = createExportWrapper("dynCall_viijjjjjjjjjjjjjii", 18);

var dynCall_viiiijiiiiiiii = Module["dynCall_viiiijiiiiiiii"] = createExportWrapper("dynCall_viiiijiiiiiiii", 14);

var dynCall_iijjjf = Module["dynCall_iijjjf"] = createExportWrapper("dynCall_iijjjf", 6);

var dynCall_viiiijjji = Module["dynCall_viiiijjji"] = createExportWrapper("dynCall_viiiijjji", 9);

var dynCall_jjjjjj = Module["dynCall_jjjjjj"] = createExportWrapper("dynCall_jjjjjj", 6);

var dynCall_jjjjjjj = Module["dynCall_jjjjjjj"] = createExportWrapper("dynCall_jjjjjjj", 7);

var dynCall_viiijiiiiiiiii = Module["dynCall_viiijiiiiiiiii"] = createExportWrapper("dynCall_viiijiiiiiiiii", 14);

var dynCall_iiiijjj = Module["dynCall_iiiijjj"] = createExportWrapper("dynCall_iiiijjj", 7);

var dynCall_viijiiii = Module["dynCall_viijiiii"] = createExportWrapper("dynCall_viijiiii", 8);

var dynCall_iiijjii = Module["dynCall_iiijjii"] = createExportWrapper("dynCall_iiijjii", 7);

var dynCall_iijjii = Module["dynCall_iijjii"] = createExportWrapper("dynCall_iijjii", 6);

var dynCall_viiiiiijjiiiii = Module["dynCall_viiiiiijjiiiii"] = createExportWrapper("dynCall_viiiiiijjiiiii", 14);

var dynCall_viiiiiiiijiiiiii = Module["dynCall_viiiiiiiijiiiiii"] = createExportWrapper("dynCall_viiiiiiiijiiiiii", 16);

var dynCall_vjjii = Module["dynCall_vjjii"] = createExportWrapper("dynCall_vjjii", 5);

var dynCall_vjjjii = Module["dynCall_vjjjii"] = createExportWrapper("dynCall_vjjjii", 6);

var dynCall_viiif = Module["dynCall_viiif"] = createExportWrapper("dynCall_viiif", 5);

var dynCall_vijjiiii = Module["dynCall_vijjiiii"] = createExportWrapper("dynCall_vijjiiii", 8);

var dynCall_vijfjiiiii = Module["dynCall_vijfjiiiii"] = createExportWrapper("dynCall_vijfjiiiii", 10);

var dynCall_fj = Module["dynCall_fj"] = createExportWrapper("dynCall_fj", 2);

var dynCall_viiiiiiiiiiiiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiiiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiiiiiiiiiiiiiiii", 28);

var dynCall_iiiiiiiiijj = Module["dynCall_iiiiiiiiijj"] = createExportWrapper("dynCall_iiiiiiiiijj", 11);

var dynCall_viiiiiiiijiiiiiiiiiiiiiiiii = Module["dynCall_viiiiiiiijiiiiiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiijiiiiiiiiiiiiiiiii", 27);

var dynCall_iiiiiiiiiiiji = Module["dynCall_iiiiiiiiiiiji"] = createExportWrapper("dynCall_iiiiiiiiiiiji", 13);

var dynCall_if = Module["dynCall_if"] = createExportWrapper("dynCall_if", 2);

var dynCall_ijiiii = Module["dynCall_ijiiii"] = createExportWrapper("dynCall_ijiiii", 6);

var dynCall_viijii = Module["dynCall_viijii"] = createExportWrapper("dynCall_viijii", 6);

var dynCall_iijii = Module["dynCall_iijii"] = createExportWrapper("dynCall_iijii", 5);

var dynCall_iiij = Module["dynCall_iiij"] = createExportWrapper("dynCall_iiij", 4);

var dynCall_jiiij = Module["dynCall_jiiij"] = createExportWrapper("dynCall_jiiij", 5);

var dynCall_jiijj = Module["dynCall_jiijj"] = createExportWrapper("dynCall_jiijj", 5);

var dynCall_iiiji = Module["dynCall_iiiji"] = createExportWrapper("dynCall_iiiji", 5);

var dynCall_iiifi = Module["dynCall_iiifi"] = createExportWrapper("dynCall_iiifi", 5);

var dynCall_iiijii = Module["dynCall_iiijii"] = createExportWrapper("dynCall_iiijii", 6);

var dynCall_iiiiiiiiiji = Module["dynCall_iiiiiiiiiji"] = createExportWrapper("dynCall_iiiiiiiiiji", 11);

var dynCall_iiiiijji = Module["dynCall_iiiiijji"] = createExportWrapper("dynCall_iiiiijji", 8);

var dynCall_iiiijjii = Module["dynCall_iiiijjii"] = createExportWrapper("dynCall_iiiijjii", 8);

var dynCall_iiiijii = Module["dynCall_iiiijii"] = createExportWrapper("dynCall_iiiijii", 7);

var dynCall_iiijiii = Module["dynCall_iiijiii"] = createExportWrapper("dynCall_iiijiii", 7);

var dynCall_iiiiiiiiijii = Module["dynCall_iiiiiiiiijii"] = createExportWrapper("dynCall_iiiiiiiiijii", 12);

var dynCall_iiiiiijjjii = Module["dynCall_iiiiiijjjii"] = createExportWrapper("dynCall_iiiiiijjjii", 11);

var dynCall_iiiiiiiijjjfi = Module["dynCall_iiiiiiiijjjfi"] = createExportWrapper("dynCall_iiiiiiiijjjfi", 13);

var dynCall_iijiiii = Module["dynCall_iijiiii"] = createExportWrapper("dynCall_iijiiii", 7);

var dynCall_iijjjii = Module["dynCall_iijjjii"] = createExportWrapper("dynCall_iijjjii", 7);

var dynCall_iiiijjjiii = Module["dynCall_iiiijjjiii"] = createExportWrapper("dynCall_iiiijjjiii", 10);

var dynCall_jiiii = Module["dynCall_jiiii"] = createExportWrapper("dynCall_jiiii", 5);

var dynCall_iiif = Module["dynCall_iiif"] = createExportWrapper("dynCall_iiif", 4);

var dynCall_vidi = Module["dynCall_vidi"] = createExportWrapper("dynCall_vidi", 4);

var dynCall_fiff = Module["dynCall_fiff"] = createExportWrapper("dynCall_fiff", 4);

var dynCall_vjiii = Module["dynCall_vjiii"] = createExportWrapper("dynCall_vjiii", 5);

var dynCall_ijii = Module["dynCall_ijii"] = createExportWrapper("dynCall_ijii", 4);

var dynCall_viiiiiij = Module["dynCall_viiiiiij"] = createExportWrapper("dynCall_viiiiiij", 8);

var dynCall_viiiiiiijiiii = Module["dynCall_viiiiiiijiiii"] = createExportWrapper("dynCall_viiiiiiijiiii", 13);

var dynCall_iiiij = Module["dynCall_iiiij"] = createExportWrapper("dynCall_iiiij", 5);

var dynCall_vijji = Module["dynCall_vijji"] = createExportWrapper("dynCall_vijji", 5);

var dynCall_iidiiii = Module["dynCall_iidiiii"] = createExportWrapper("dynCall_iidiiii", 7);

var dynCall_iiiiij = Module["dynCall_iiiiij"] = createExportWrapper("dynCall_iiiiij", 6);

var dynCall_iiiiid = Module["dynCall_iiiiid"] = createExportWrapper("dynCall_iiiiid", 6);

var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = createExportWrapper("dynCall_iiiiijj", 7);

var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = createExportWrapper("dynCall_iiiiiijj", 8);

var _asyncify_start_unwind = createExportWrapper("asyncify_start_unwind", 1);

var _asyncify_stop_unwind = createExportWrapper("asyncify_stop_unwind", 0);

var _asyncify_start_rewind = createExportWrapper("asyncify_start_rewind", 1);

var _asyncify_stop_rewind = createExportWrapper("asyncify_stop_rewind", 0);

var ___start_em_js = Module["___start_em_js"] = 7003990;

var ___stop_em_js = Module["___stop_em_js"] = 7004236;

function invoke_iiii(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_iiii(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iii(index, a1, a2) {
 var sp = stackSave();
 try {
  return dynCall_iii(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vi(index, a1) {
 var sp = stackSave();
 try {
  dynCall_vi(index, a1);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_ii(index, a1) {
 var sp = stackSave();
 try {
  return dynCall_ii(index, a1);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vii(index, a1, a2) {
 var sp = stackSave();
 try {
  dynCall_vii(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viii(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  dynCall_viii(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_v(index) {
 var sp = stackSave();
 try {
  dynCall_v(index);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiii(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_viiii(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return dynCall_iiiiii(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiii(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return dynCall_iiiii(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_jiji(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_jiji(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_iiiiiij(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiij(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_i(index) {
 var sp = stackSave();
 try {
  return dynCall_i(index);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_ji(index, a1) {
 var sp = stackSave();
 try {
  return dynCall_ji(index, a1);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_djj(index, a1, a2) {
 var sp = stackSave();
 try {
  return dynCall_djj(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_jii(index, a1, a2) {
 var sp = stackSave();
 try {
  return dynCall_jii(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_iij(index, a1, a2) {
 var sp = stackSave();
 try {
  return dynCall_iij(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vij(index, a1, a2) {
 var sp = stackSave();
 try {
  dynCall_vij(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiij(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiij(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  dynCall_viiiii(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  dynCall_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_dii(index, a1, a2) {
 var sp = stackSave();
 try {
  return dynCall_dii(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  dynCall_viiiiii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iijiiii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return dynCall_iijiiii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_jjj(index, a1, a2) {
 var sp = stackSave();
 try {
  return dynCall_jjj(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_viiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vif(index, a1, a2) {
 var sp = stackSave();
 try {
  dynCall_vif(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vid(index, a1, a2) {
 var sp = stackSave();
 try {
  dynCall_vid(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiijii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  dynCall_viiijii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iji(index, a1, a2) {
 var sp = stackSave();
 try {
  return dynCall_iji(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiijiii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  dynCall_viiijiii(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiijii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  dynCall_viiiijii(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_ij(index, a1) {
 var sp = stackSave();
 try {
  return dynCall_ij(index, a1);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viijj(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_viijj(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fii(index, a1, a2) {
 var sp = stackSave();
 try {
  return dynCall_fii(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fi(index, a1) {
 var sp = stackSave();
 try {
  return dynCall_fi(index, a1);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_jiii(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_jiii(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_viiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_jj(index, a1) {
 var sp = stackSave();
 try {
  return dynCall_jj(index, a1);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_viij(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  dynCall_viij(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viif(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  dynCall_viif(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiijiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
 var sp = stackSave();
 try {
  return dynCall_iiiiijiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiijiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  return dynCall_iiiiijiii(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijiii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  dynCall_vijiii(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiij(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiij(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiijji(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiijji(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viji(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  dynCall_viji(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iidi(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_iidi(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiji(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_viiji(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viijjj(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  dynCall_viijjj(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viifiifijjjii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  dynCall_viifiifijjjii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vifiifiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  dynCall_vifiifiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vifiifiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  dynCall_vifiifiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijiji(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  dynCall_vijiji(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_jiij(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_jiij(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_vjifiii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  dynCall_vjifiii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viidi(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_viidi(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iffi(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_iffi(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fiii(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_fiii(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiifii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  dynCall_viiiiiifii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjiiiii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  dynCall_vjiiiii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  dynCall_vjiiiiii(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  dynCall_vijiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  dynCall_vjiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiidfffiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
 var sp = stackSave();
 try {
  return dynCall_iiiiidfffiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiif(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiif(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiiiiifiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiiiiifiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiifii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  dynCall_viiifii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiifiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  dynCall_viiiiifiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiji(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_iiji(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiif(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  dynCall_viiiiif(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiff(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  dynCall_viiiff(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiff(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiff(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiff(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  dynCall_viiiiiff(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiiiiiiiiifii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiiiiiiiiiifii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iijjjj(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return dynCall_iijjjj(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viijjiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_viijjiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijjjiiji(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  dynCall_vijjjiiji(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viijiiiiiiijjii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) {
 var sp = stackSave();
 try {
  dynCall_viijiiiiiiijjii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iif(index, a1, a2) {
 var sp = stackSave();
 try {
  return dynCall_iif(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiidiidii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
 var sp = stackSave();
 try {
  dynCall_viiiiidiidii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiifiifii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  dynCall_viiifiifii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijjjjiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  dynCall_vijjjjiii(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iidd(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_iidd(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iijj(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_iijj(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viid(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  dynCall_viid(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viffiii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  dynCall_viffiii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiijjjii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  dynCall_viiijjjii(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_j(index) {
 var sp = stackSave();
 try {
  return dynCall_j(index);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_iiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiijjj(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  dynCall_viiiiijjj(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiif(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  dynCall_viiiiiif(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiiiifi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiiiifi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_jij(index, a1, a2) {
 var sp = stackSave();
 try {
  return dynCall_jij(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_viiiijiiiiiiif(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_viiiijiiiiiiif(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiifiifii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
 var sp = stackSave();
 try {
  dynCall_viiiiifiifii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiifiifiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_viiiiifiifiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viifiii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  dynCall_viifiii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiifiiifiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  dynCall_viiiifiiifiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiidiidiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_viiiiidiidiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_di(index, a1) {
 var sp = stackSave();
 try {
  return dynCall_di(index, a1);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiifiiiifiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) {
 var sp = stackSave();
 try {
  dynCall_viiiiifiiiifiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiff(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_iiff(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiifiiiiiifiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
 var sp = stackSave();
 try {
  dynCall_viiifiiiiiifiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vfiii(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_vfiii(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiff(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_viiff(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiiiiiiiiiifi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiiiiiiiiiiifi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiijjj(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiijjj(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiijjjjjii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_viiiiiijjjjjii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_diii(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_diii(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vifi(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  dynCall_vifi(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiij(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  dynCall_viiiiij(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijjjjjjjjjjjjjii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
 var sp = stackSave();
 try {
  dynCall_vijjjjjjjjjjjjjii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiijjiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  dynCall_viiijjiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viijiiiijiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
 var sp = stackSave();
 try {
  dynCall_viijiiiijiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viifjjjijiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_viifjjjijiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjjjjjjffffjji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_vjjjjjjffffjji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjjjjjjddddjji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_vjjjjjjddddjji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viifjjijiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
 var sp = stackSave();
 try {
  dynCall_viifjjijiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiifiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiifiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiid(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  dynCall_viiiiiid(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiidiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiidiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiijfii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiijfii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiji(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  dynCall_viiiji(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiijjjjji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  dynCall_viiijjjjji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vifii(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_vifii(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vifiii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  dynCall_vifiii(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiijiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  return dynCall_iiijiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vj(index, a1) {
 var sp = stackSave();
 try {
  dynCall_vj(index, a1);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiij(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  dynCall_viiiij(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiff(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  dynCall_viiiiff(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiiiiifii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiiiiiifii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiijjjfffi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
 var sp = stackSave();
 try {
  dynCall_viiijjjfffi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiijiijjj(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  dynCall_viiijiijjj(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viijjjj(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  dynCall_viijjjj(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fffffff(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return dynCall_fffffff(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiifiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiifiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjjjjjjffiifiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) {
 var sp = stackSave();
 try {
  dynCall_vjjjjjjffiifiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiffiifiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiffiifiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiffifiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiffifiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjjjjjjjjfffiifiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20) {
 var sp = stackSave();
 try {
  dynCall_vjjjjjjjjfffiifiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjjjjjjjjfffiifiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) {
 var sp = stackSave();
 try {
  dynCall_vjjjjjjjjfffiifiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjjjjjjfffifiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18) {
 var sp = stackSave();
 try {
  dynCall_vjjjjjjfffifiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjjjjjjfffifiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
 var sp = stackSave();
 try {
  dynCall_vjjjjjjfffifiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijjjjjjifiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_vijjjjjjifiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjjjjjiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
 var sp = stackSave();
 try {
  dynCall_vjjjjjiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjjjjfiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  dynCall_vjjjjfiii(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fijjjjifi(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  return dynCall_fijjjjifi(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijjfffiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  dynCall_vijjfffiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
 var sp = stackSave();
 try {
  dynCall_vijiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_jfi(index, a1, a2) {
 var sp = stackSave();
 try {
  return dynCall_jfi(index, a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_iiiiiji(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiji(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiijj(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  dynCall_viiijj(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiijiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  dynCall_viiiiijiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiijjiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  dynCall_viiiiijjiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiji(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  dynCall_viiiiji(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viijjiii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  dynCall_viijjiii(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijii(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_vijii(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiji(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return dynCall_iiiiji(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viijjjjjjjjjjjjjii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) {
 var sp = stackSave();
 try {
  dynCall_viijjjjjjjjjjjjjii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiijiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_viiiijiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iijjjf(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return dynCall_iijjjf(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiijjji(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  dynCall_viiiijjji(index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiijiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_viiijiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiijjj(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return dynCall_iiiijjj(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viijiiii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  dynCall_viijiiii(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiijjii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return dynCall_iiijjii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiijjiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_viiiiiijjiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiijiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiijiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjjii(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_vjjii(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjjjii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  dynCall_vjjjii(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiif(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_viiif(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiij(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_viiij(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijjiiii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  dynCall_vijjiiii(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijfjiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  dynCall_vijfjiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fj(index, a1) {
 var sp = stackSave();
 try {
  return dynCall_fj(index, a1);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23, a24, a25, a26, a27) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiiiiiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23, a24, a25, a26, a27);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiijj(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiijj(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiijiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23, a24, a25, a26) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiiijiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23, a24, a25, a26);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiiiji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiiiiji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_if(index, a1) {
 var sp = stackSave();
 try {
  return dynCall_if(index, a1);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_ijiiii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return dynCall_ijiiii(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viijiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
 var sp = stackSave();
 try {
  dynCall_viijiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viijii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  dynCall_viijii(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iijii(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return dynCall_iijii(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiijii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return dynCall_iiiijii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiij(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_iiij(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_jiiij(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return dynCall_jiiij(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_jiijj(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return dynCall_jiijj(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_iiiji(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return dynCall_iiiji(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiifi(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return dynCall_iiifi(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiijii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return dynCall_iiijii(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiiji(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiijji(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  return dynCall_iiiiijji(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiijjii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  return dynCall_iiiijjii(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiijiii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return dynCall_iiijiii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiijii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiiijii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiijjjii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiijjjii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiijjjfi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  return dynCall_iiiiiiiijjjfi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iijjjii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return dynCall_iijjjii(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiijjjiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  return dynCall_iiiijjjiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_jiiii(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return dynCall_jiiii(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
  return 0n;
 }
}

function invoke_iiif(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_iiif(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vidi(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  dynCall_vidi(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fiff(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_fiff(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vjiii(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_vjiii(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_ijii(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_ijii(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiij(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  dynCall_viiiiiij(index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiijiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
 var sp = stackSave();
 try {
  dynCall_viiiiiiijiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiij(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return dynCall_iiiij(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vijji(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  dynCall_vijji(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iijjii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return dynCall_iijjii(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiij(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return dynCall_iiiiij(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return dynCall_iiiiid(index, a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (!(e instanceof EmscriptenEH)) throw e;
  _setThrew(1, 0);
 }
}

function applySignatureConversions(wasmExports) {
 wasmExports = Object.assign({}, wasmExports);
 var makeWrapper_p = f => () => f() >>> 0;
 var makeWrapper_pp = f => a0 => f(a0) >>> 0;
 var makeWrapper_pP = f => a0 => f(a0) >>> 0;
 wasmExports["pthread_self"] = makeWrapper_p(wasmExports["pthread_self"]);
 wasmExports["malloc"] = makeWrapper_pp(wasmExports["malloc"]);
 wasmExports["emscripten_main_runtime_thread_id"] = makeWrapper_p(wasmExports["emscripten_main_runtime_thread_id"]);
 wasmExports["emscripten_stack_get_base"] = makeWrapper_p(wasmExports["emscripten_stack_get_base"]);
 wasmExports["emscripten_stack_get_end"] = makeWrapper_p(wasmExports["emscripten_stack_get_end"]);
 wasmExports["sbrk"] = makeWrapper_pP(wasmExports["sbrk"]);
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

var missingLibrarySymbols = [ "writeI53ToI64", "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "readI53FromI64", "readI53FromU64", "convertI32PairToI53", "convertI32PairToI53Checked", "convertU32PairToI53", "getTempRet0", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "initRandomFill", "randomFill", "emscriptenLog", "runMainThreadEmAsm", "jstoi_q", "listenOnce", "autoResumeAudioContext", "dynCallLegacy", "getDynCaller", "dynCall", "asmjsMangle", "asyncLoad", "alignMemory", "mmapAlloc", "HandleAllocator", "getNativeTypeSize", "STACK_SIZE", "STACK_ALIGN", "POINTER_SIZE", "ASSERTIONS", "getCFunc", "ccall", "cwrap", "uleb128Encode", "generateFuncType", "convertJsFunctionToWasm", "getEmptyTableSlot", "updateTableMap", "getFunctionAddress", "addFunction", "removeFunction", "reallyNegative", "strLen", "reSign", "formatString", "intArrayToString", "AsciiToString", "UTF16ToString", "stringToUTF16", "lengthBytesUTF16", "UTF32ToString", "stringToUTF32", "lengthBytesUTF32", "stringToNewUTF8", "stringToUTF8OnStack", "registerKeyEventCallback", "maybeCStringToJsString", "findEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "hideEverythingExceptGivenElement", "restoreHiddenElements", "setLetterbox", "softFullscreenResizeWebGLRenderTarget", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "registerPointerlockErrorEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "setCanvasElementSizeCallingThread", "setCanvasElementSizeMainThread", "setCanvasElementSize", "getCanvasSizeCallingThread", "getCanvasSizeMainThread", "getCanvasElementSize", "getCallstack", "convertPCtoSourceLocation", "checkWasiClock", "wasiRightsToMuslOFlags", "wasiOFlagsToMuslOFlags", "createDyncallWrapper", "safeSetTimeout", "setImmediateWrapped", "clearImmediateWrapped", "polyfillSetImmediate", "getPromise", "makePromise", "idsToPromises", "makePromiseCallback", "Browser_asyncPrepareDataCounter", "setMainLoop", "getSocketFromFD", "getSocketAddress", "heapObjectForWebGLType", "toTypedArrayIndex", "webgl_enable_ANGLE_instanced_arrays", "webgl_enable_OES_vertex_array_object", "webgl_enable_WEBGL_draw_buffers", "webgl_enable_WEBGL_multi_draw", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "colorChannelsInGlTextureFormat", "emscriptenWebGLGetTexPixelData", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "__glGetActiveAttribOrUniform", "writeGLArray", "emscripten_webgl_destroy_context_before_on_calling_thread", "registerWebGlEventCallback", "ALLOC_NORMAL", "ALLOC_STACK", "allocate", "writeStringToMemory", "writeAsciiToMemory", "setErrNo", "demangle", "stackTrace" ];

missingLibrarySymbols.forEach(missingLibrarySymbol);

var unexportedSymbols = [ "run", "addOnPreRun", "addOnInit", "addOnPreMain", "addOnExit", "addOnPostRun", "addRunDependency", "removeRunDependency", "FS_createFolder", "FS_createPath", "FS_createLazyFile", "FS_createLink", "FS_createDevice", "FS_readFile", "out", "err", "callMain", "abort", "wasmMemory", "wasmExports", "GROWABLE_HEAP_I8", "GROWABLE_HEAP_U8", "GROWABLE_HEAP_I16", "GROWABLE_HEAP_U16", "GROWABLE_HEAP_I32", "GROWABLE_HEAP_U32", "GROWABLE_HEAP_F32", "GROWABLE_HEAP_F64", "writeStackCookie", "checkStackCookie", "MAX_INT53", "MIN_INT53", "bigintToI53Checked", "setTempRet0", "ptrToString", "zeroMemory", "exitJS", "getHeapMax", "growMemory", "ENV", "setStackLimits", "MONTH_DAYS_REGULAR", "MONTH_DAYS_LEAP", "MONTH_DAYS_REGULAR_CUMULATIVE", "MONTH_DAYS_LEAP_CUMULATIVE", "isLeapYear", "ydayFromDate", "arraySum", "addDays", "ERRNO_CODES", "ERRNO_MESSAGES", "DNS", "Protocols", "Sockets", "timers", "warnOnce", "readEmAsmArgsArray", "readEmAsmArgs", "runEmAsmFunction", "jstoi_s", "getExecutableName", "handleException", "keepRuntimeAlive", "runtimeKeepalivePush", "runtimeKeepalivePop", "callUserCallback", "maybeExit", "wasmTable", "noExitRuntime", "sigToWasmTypes", "freeTableIndexes", "functionsInTableMap", "unSign", "PATH", "PATH_FS", "UTF8Decoder", "UTF8ArrayToString", "stringToUTF8Array", "intArrayFromString", "stringToAscii", "UTF16Decoder", "writeArrayToMemory", "JSEvents", "specialHTMLTargets", "findCanvasEventTarget", "currentFullscreenStrategy", "restoreOldWindowedStyle", "jsStackTrace", "UNWIND_CACHE", "ExitStatus", "getEnvStrings", "flush_NO_FILESYSTEM", "promiseMap", "uncaughtExceptionCount", "exceptionLast", "exceptionCaught", "ExceptionInfo", "findMatchingCatch", "getExceptionMessageCommon", "incrementExceptionRefcount", "decrementExceptionRefcount", "getExceptionMessage", "Browser", "getPreloadedImageData__data", "wget", "SYSCALLS", "tempFixedLengthArray", "miniTempWebGLFloatBuffers", "miniTempWebGLIntBuffers", "GL", "AL", "GLUT", "EGL", "GLEW", "IDBStore", "runAndAbortIfError", "Asyncify", "Fibers", "SDL", "SDL_gfx", "allocateUTF8", "allocateUTF8OnStack", "PThread", "terminateWorker", "killThread", "cleanupThread", "registerTLSInit", "cancelThread", "spawnThread", "exitOnMainThread", "proxyToMainThread", "proxiedJSCallArgs", "invokeEntryPoint", "checkMailbox" ];

unexportedSymbols.forEach(unexportedRuntimeSymbol);

var calledRun;

dependenciesFulfilled = function runCaller() {
 if (!calledRun) run();
 if (!calledRun) dependenciesFulfilled = runCaller;
};

function stackCheckInit() {
 assert(!ENVIRONMENT_IS_PTHREAD);
 _emscripten_stack_init();
 writeStackCookie();
}

function run() {
 if (runDependencies > 0) {
  return;
 }
 if (!ENVIRONMENT_IS_PTHREAD) stackCheckInit();
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
  assert(!Module["_main"], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
  postRun();
 }
 {
  doRun();
 }
 checkStackCookie();
}

function checkUnflushedContent() {
 var oldOut = out;
 var oldErr = err;
 var has = false;
 out = err = x => {
  has = true;
 };
 try {
  flush_NO_FILESYSTEM();
 } catch (e) {}
 out = oldOut;
 err = oldErr;
 if (has) {
  warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.");
  warnOnce("(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)");
 }
}

run();

"use strict";

Module["PTR_SIZE"] = 4;

moduleRtn = readyPromise;

for (const prop of Object.keys(Module)) {
 if (!(prop in moduleArg)) {
  Object.defineProperty(moduleArg, prop, {
   configurable: true,
   get() {
    abort(`Access to module property ('${prop}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`);
   }
  });
 }
}


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
