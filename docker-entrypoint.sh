#!/bin/bash
# Generate runtime-config.js from Cloud Run env vars at container start.
# The browser fetches this file before the bundled app runs, so the app
# can read window.RUNTIME_CONFIG instead of process.env.
set -eu

CONFIG_FILE=/usr/share/nginx/html/runtime-config.js

# Accept either GEMINI_API_KEY or the generic API_KEY secret name.
GEMINI_API_KEY_VALUE="${GEMINI_API_KEY:-${API_KEY:-}}"

cat > "$CONFIG_FILE" <<EOF
window.RUNTIME_CONFIG = {
  GEMINI_API_KEY: "${GEMINI_API_KEY_VALUE}",
  API_KEY: "${GEMINI_API_KEY_VALUE}"
};
EOF

echo "Generated $CONFIG_FILE"
