PYTHON_BIN = bin/python3
ONNX_DIR = onnxruntime
BUILD_FLAGS = --config Release --build_wasm --skip_tests \
              --disable_wasm_exception_catching --disable_rtti \
              --enable_wasm_threads --enable_wasm_simd --use_jsep
BUILD_DIR = build/MacOs
GIT_REPO = https://github.com/microsoft/onnxruntime.git
RELAXED_BRANCH = relaxed

.PHONY: all clean build_normal build_relaxed

all: build_normal build_relaxed

$(PYTHON_BIN):
	python3 -m venv .

$(ONNX_DIR): $(PYTHON_BIN)
	git clone $(GIT_REPO) $(ONNX_DIR)
	cd $(ONNX_DIR) && git fetch origin pull/22794/head:$(RELAXED_BRANCH)
	cd $(ONNX_DIR) && git switch $(RELAXED_BRANCH)

build_normal: $(ONNX_DIR)
	cd $(ONNX_DIR) && ../$(PYTHON_BIN) ./tools/ci_build/build.py $(BUILD_FLAGS) \
		--build_dir $(BUILD_DIR)
	cp $(ONNX_DIR)/$(BUILD_DIR)/Debug/*.wasm .
	cp $(ONNX_DIR)/$(BUILD_DIR)/Debug/*.mjs .

build_relaxed: $(ONNX_DIR)
	cd $(ONNX_DIR) && ../$(PYTHON_BIN) ./tools/ci_build/build.py $(BUILD_FLAGS) \
		--enable_wasm_relaxed_simd \
		--build_dir $(BUILD_DIR)
	cp $(ONNX_DIR)/$(BUILD_DIR)/Debug/*.wasm .
	cp $(ONNX_DIR)/$(BUILD_DIR)/Debug/*.mjs .

clean:
	rm -rf $(ONNX_DIR) $(BUILD_DIR) *.wasm *.mjs
	rm -rf bin lib include

run:
	$(PYTHON_BIN) -m http.server
