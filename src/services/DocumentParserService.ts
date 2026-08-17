import { marked } from 'marked';

import { ContentType } from '../models/DocumentModel';

/**
 * Centralizes all transformations between raw user content and rendered HTML.
 *
 * This service keeps parsing logic isolated from the screen layer so the preview
 * and PDF export always use the same formatting rules.
 */
export class DocumentParserService {
  private static readonly A4_PAGE_CSS = `
    @page {
      size: A4;
      margin: 14mm;
    }
  `;

  /**
   * Returns the supported content categories displayed in the UI.
   */
  public static readonly supportedContentTypes: ContentType[] = ['html', 'txt', 'markdown'];

  /**
   * Maps a file name to a content type.
   */
  public static resolveContentTypeFromFileName(fileName: string): ContentType {
    const normalizedName = fileName.toLowerCase();

    if (normalizedName.endsWith('.html') || normalizedName.endsWith('.htm')) {
      return 'html';
    }

    if (normalizedName.endsWith('.md') || normalizedName.endsWith('.markdown')) {
      return 'markdown';
    }

    return 'txt';
  }

  /**
   * Escapes HTML so plain text can be safely displayed inside a styled document.
   */
  public static escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Converts the raw input into HTML according to the selected content type.
   */
  public static toHtml(content: string, contentType: ContentType): string {
    switch (contentType) {
      case 'html':
        return content.trim() || '<p>Empty document.</p>';
      case 'txt':
        return `<pre style="white-space: pre-wrap; font-family: 'SF Pro Display', Arial, sans-serif; line-height: 1.7; color: #111827;">${this.escapeHtml(content || 'Empty document.')}</pre>`;
      case 'markdown': {
        const parsed = marked.parse(content || '# Empty document\n\nNo content available.', {
          gfm: true,
          breaks: true,
        });

        return typeof parsed === 'string' ? parsed : '<p>Empty document.</p>';
      }
      default:
        return `<p>Unsupported content type.</p>`;
    }
  }

  /**
   * Wraps the generated HTML inside a full browser-ready document for preview and PDF export.
   */
  public static buildPreviewDocument(content: string, contentType: ContentType): string {
    const bodyContent = this.toHtml(content, contentType);

    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            ${this.A4_PAGE_CSS}

            body {
              margin: 0;
              padding: 24px;
              background: #f8fafc;
              color: #0f172a;
              font-family: 'SF Pro Display', 'Segoe UI', sans-serif;
            }
            * { box-sizing: border-box; }
            .page {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 14mm;
              background: #ffffff;
              box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
            }
            h1, h2, h3, h4 { color: #0f172a; margin-bottom: 12px; }
            p, li { line-height: 1.7; }
            pre {
              background: #f1f5f9;
              border-radius: 12px;
              padding: 16px;
              overflow-x: auto;
            }
            code {
              background: #e2e8f0;
              border-radius: 6px;
              padding: 2px 6px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
            }
            th, td {
              border: 1px solid #dbe4f0;
              padding: 10px 12px;
              text-align: left;
            }
            blockquote {
              border-left: 4px solid #3b82f6;
              margin: 16px 0;
              padding: 12px 16px;
              background: #eff6ff;
            }
            a { color: #2563eb; }

            @media print {
              body {
                padding: 0;
                background: #ffffff;
              }
              .page {
                width: auto;
                min-height: auto;
                margin: 0;
                padding: 0;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <main class="page">${bodyContent}</main>
        </body>
      </html>`;
  }
}
