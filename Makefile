# Python Configuration
PYTHON_ENV_DIR = bin
PYTHON_BIN = $(PYTHON_ENV_DIR)/python3

# ONNX Configuration
ONNX_DIR = onnxruntime
BUILD_FLAGS = --build_wasm --skip_tests --parallel \
              --disable_wasm_exception_catching --disable_rtti \
              --enable_wasm_threads --enable_wasm_simd --use_jsep
BUILD_DIR = build/MacOs

# Git Configuration
GIT_REPO = https://github.com/tarekziade/onnxruntime.git
RELAXED_BRANCH = relaxed

# Build Artifacts
ARTIFACTS_DIR = .

.PHONY: all clean setup_env clone_repo build_normal build_debug clean_artifacts

# Default target
all: setup_env clone_repo build_normal build_debug

# Setup Python environment
setup_env: $(PYTHON_BIN)

$(PYTHON_BIN):
	python3 -m venv $(PYTHON_ENV_DIR)

# Clone ONNX repository and switch to the relaxed branch
clone_repo: $(ONNX_DIR)

$(ONNX_DIR): $(PYTHON_BIN)
	git clone $(GIT_REPO) $(ONNX_DIR)
	cd $(ONNX_DIR) && git fetch origin pull/22794/head:$(RELAXED_BRANCH)
	cd $(ONNX_DIR) && git switch $(RELAXED_BRANCH)

build_cpp:
	cd $(ONNX_DIR) && ../$(PYTHON_BIN) ./tools/ci_build/build.py \
			--build_dir build/MacOs/cpp \
			--config RelWithDebInfo --build_shared_lib \
			--parallel --compile_no_warning_as_error \
			--skip_submodule_sync --cmake_extra_defines CMAKE_OSX_ARCHITECTURES=arm64


# Generic build function
build:
	cd $(ONNX_DIR) && ../$(PYTHON_BIN) ./tools/ci_build/build.py $(BUILD_FLAGS) \
		--build_dir $(BUILD_DIR) \
		--config $(CONFIG)

# Copy build artifacts
copy_artifacts:
	mkdir -p $(ARTIFACTS_DIR)
	cp $(ONNX_DIR)/$(BUILD_DIR)/$(CONFIG)/*.wasm $(ARTIFACTS_DIR)
	cp $(ONNX_DIR)/$(BUILD_DIR)/$(CONFIG)/*.mjs $(ARTIFACTS_DIR)


build_normal: CONFIG=Release
build_normal: build copy_artifacts


# Build Normal Configuration
build_debuginfo: CONFIG=RelWithDebInfo
build_debuginfo: build copy_artifacts

# Build Debug Configuration
build_debug: CONFIG=Debug
build_debug: build copy_artifacts

# Clean artifacts and build directories
clean:
	rm -rf $(ONNX_DIR) $(PYTHON_ENV_DIR) $(ARTIFACTS_DIR)

clean_artifacts:
	rm -rf $(ARTIFACTS_DIR)

build_relaxed: $(ONNX_DIR)
	cd $(ONNX_DIR) && ../$(PYTHON_BIN) ./tools/ci_build/build.py $(BUILD_FLAGS) \
		--enable_wasm_relaxed_simd \
		--build_dir $(BUILD_DIR)
	cp $(ONNX_DIR)/$(BUILD_DIR)/Release/*.wasm .
	cp $(ONNX_DIR)/$(BUILD_DIR)/Release/*.mjs .

run:
	$(PYTHON_BIN) -m http.server
