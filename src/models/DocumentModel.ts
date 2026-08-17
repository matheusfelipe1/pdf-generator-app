/**
 * Supported document source types for the PDF generator.
 *
 * This model keeps the input flow explicit so the screen can present
 * consistent UX states while the underlying view model handles the user actions.
 */
export type SourceType = 'file' | 'text';

/**
 * The document kind that determines how the content is rendered and exported.
 */
export type ContentType = 'html' | 'txt' | 'markdown';

/**
 * Represents the content currently being edited or selected by the user.
 */
export interface DocumentModel {
  sourceType: SourceType;
  contentType: ContentType;
  content: string;
  fileName?: string;
  uri?: string;
}

/**
 * Result returned after a PDF file is saved to the app documents folder.
 */
export interface PdfExportResult {
  uri: string;
  fileName: string;
}
