#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
node --test tests/policy_test.js tests/idle_test.js
