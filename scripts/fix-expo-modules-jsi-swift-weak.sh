#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="$ROOT_DIR/node_modules/expo-modules-jsi"

if [ ! -d "$TARGET_DIR" ]; then
  echo "expo-modules-jsi not found. Skipping Swift compatibility patch."
  exit 0
fi

if ! command -v grep >/dev/null 2>&1; then
  echo "grep is required for ExpoModulesJSI Swift compatibility patch."
  exit 1
fi

if ! command -v find >/dev/null 2>&1; then
  echo "find is required for ExpoModulesJSI Swift compatibility patch."
  exit 1
fi

echo "Applying ExpoModulesJSI Swift compatibility patch..."

swift_files=$(find "$TARGET_DIR" -name '*.swift')
for file in $swift_files; do
  sed -i '' 's/weak let runtime/weak var runtime/g' "$file"
done

replace_once() {
  local file_path="$1"
  local from_text="$2"
  local to_text="$3"

  if [ ! -f "$file_path" ]; then
    return
  fi

  if grep -Fq "$from_text" "$file_path"; then
    sed -i '' "s|$from_text|$to_text|g" "$file_path"
    echo "Patched: $file_path"
  fi
}

replace_once \
  "$TARGET_DIR/apple/Sources/ExpoModulesJSI/Contexts/HostFunctionContext.swift" \
  "internal final class HostFunctionContext: Sendable" \
  "internal final class HostFunctionContext: @unchecked Sendable"

replace_once \
  "$TARGET_DIR/apple/Sources/ExpoModulesJSI/Contexts/HostFunctionContext.swift" \
  "internal final class UnownedThisHostFunctionContext: Sendable" \
  "internal final class UnownedThisHostFunctionContext: @unchecked Sendable"

replace_once \
  "$TARGET_DIR/apple/Sources/ExpoModulesJSI/Contexts/HostObjectContext.swift" \
  "internal final class HostObjectContext: Sendable" \
  "internal final class HostObjectContext: @unchecked Sendable"

replace_once \
  "$TARGET_DIR/apple/Sources/ExpoModulesJSI/Runtime/Values/JavaScriptError.swift" \
  "public final class JavaScriptError: Error, Sendable" \
  "public final class JavaScriptError: Error, @unchecked Sendable"

replace_once \
  "$TARGET_DIR/apple/Sources/ExpoModulesJSI/Runtime/JavaScriptPropNameID.swift" \
  "public final class JavaScriptPropNameID: JavaScriptType" \
  "public final class JavaScriptPropNameID: @unchecked Sendable, JavaScriptType"

replace_once \
  "$TARGET_DIR/apple/Sources/ExpoModulesJSI/Runtime/Values/JavaScriptValue.swift" \
  "public final class JavaScriptValue: JavaScriptType, Equatable, Escapable" \
  "public final class JavaScriptValue: @unchecked Sendable, JavaScriptType, Equatable, Escapable"

replace_once \
  "$TARGET_DIR/apple/Sources/ExpoModulesJSI/Coding/JavaScriptCodable+Date.swift" \
  "let millisecondsValue: JavaScriptValue = .number(milliseconds)" \
  "let millisecondsValue = JavaScriptValue.number(milliseconds)"

replace_once \
  "$TARGET_DIR/apple/Sources/ExpoModulesJSI/Coding/JavaScriptCodable+Date.swift" \
  "let millisecondsValue = JavaScriptValue(runtime, milliseconds)" \
  "let millisecondsValue = JavaScriptValue.number(milliseconds)"

replace_once \
  "$TARGET_DIR/apple/Sources/ExpoModulesJSI/Coding/JavaScriptCodable+Date.swift" \
  "guard milliseconds.isFinite, abs(milliseconds) <= maxJavaScriptDateMilliseconds else {" \
  "guard milliseconds.isFinite, Swift.abs(milliseconds) <= maxJavaScriptDateMilliseconds else {"

echo "ExpoModulesJSI Swift compatibility patch applied."
