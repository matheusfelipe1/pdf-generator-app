# Spec

## Overview

The PDF Generator app is a modern iOS-first document export tool. It supports two input modes: text and file. File input supports HTML, TXT and Markdown. Text input supports the same three formats. The app provides a preview of the generated document and saves the final result as a PDF in the user's Documents directory.

## User flow

1. User chooses input source: text or file.
2. User chooses content type: HTML, TXT or Markdown.
3. If text mode is selected, the user types or pastes content.
4. If file mode is selected, the user picks a local file.
5. The app renders a live preview.
6. User taps Save PDF.
7. The app exports the PDF file into Documents and shows the saved path.

## Technical behavior

- The preview renderer converts raw content into a styled HTML document.
- Markdown is parsed through a markdown renderer before preview and export.
- TXT is escaped to avoid HTML injection.
- HTML is passed directly to the rendering engine.
- The export pipeline saves a generated PDF file using the iOS-supported print-to-file API.
