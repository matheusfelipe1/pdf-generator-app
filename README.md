# PDF Generator App

A modern React Native app built with Expo for creating PDFs from either text input or uploaded files. The app supports HTML, TXT and Markdown sources and includes a live preview before saving the final document to the device's Documents directory.

## Features

- Source selection: text or file
- Supported file formats: HTML, TXT and Markdown
- Live HTML preview
- PDF export to the app Documents directory
- MVVM architecture
- iOS-first design with a modern dark-glass UI

## Project structure

- `src/models` - domain models
- `src/services` - parsing and export services
- `src/viewmodels` - logic orchestration
- `src/screens` - presentation layer

## Running the app

```bash
npm install
npm run ios
```

## Notes

This implementation is optimized for iOS while keeping the code architecture compatible with standard Expo patterns.
