#!/bin/bash

set -e

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

rm -rf "$SCRIPT_DIR/out"

npm ci
npx tsc

npm whoami || { echo "Please run 'npm login' first"; exit 1; }
npm publish --access public
