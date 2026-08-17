# Requirements

## Functional requirements

1. The app must allow the user to generate a PDF from either text or a local file.
2. When the source is a file, the app must accept HTML, TXT and Markdown documents.
3. When the source is text, the app must accept HTML, TXT and Markdown content types.
4. The app must display a live preview before the PDF is saved.
5. When the user taps Save, the app must generate a PDF and save it to the Documents directory.
6. The app must support an iOS-first experience with a modern, polished UI.

## Non-functional requirements

1. The codebase must follow the MVVM design pattern.
2. The code must be documented in English.
3. The implementation should prioritize performance and clear separation of responsibilities.
4. The export flow must be deterministic and robust across supported document types.
