# Relaxed SIMD


Trying https://github.com/microsoft/onnxruntime/pull/22794

Build the two wasm flavors:

```bash 
make build_normal
make build_relaxed
```


And run the app:

```bash
make run
```

You can then compare the two results in your browser.

To activate Relaxed SIMD in Firefox Nightly, set `javascript.options.wasm_relaxed_simd`
