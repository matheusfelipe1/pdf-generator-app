import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';

import { ContentType, DocumentModel, PdfExportResult, SourceType } from '../models/DocumentModel';
import { DocumentParserService } from '../services/DocumentParserService';
import { PdfExportService } from '../services/PdfExportService';

/**
 * View model that manages the document pipeline from user input to PDF export.
 *
 * The screen remains as a thin UI layer, while the view model owns the business
 * logic for file selection, preview rendering, and file persistence.
 */
export class PdfGeneratorViewModel {
  public static createInitialModel(): DocumentModel {
    return {
      sourceType: 'text',
      contentType: 'markdown',
      content: `# Weekly executive summary\n\n## Highlights\n- Revenue increased by 18% this quarter.\n- Customer satisfaction remains above target.\n- Launch plan for the mobile experience is on schedule.\n\n## Notes\nThis demo document is ready to be previewed and exported as a PDF.`,
    };
  }

  public static getPreviewHtml(content: string, contentType: ContentType): string {
    return DocumentParserService.buildPreviewDocument(content, contentType);
  }

  public static async pickFile(): Promise<{ content: string; contentType: ContentType; fileName: string } | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const selectedAsset = result.assets[0];
    const fileName = selectedAsset.name || 'selected-document';
    const detectedType = DocumentParserService.resolveContentTypeFromFileName(fileName);

    if (!['html', 'txt', 'markdown'].includes(detectedType)) {
      throw new Error('Unsupported file type. Use HTML, TXT or Markdown documents only.');
    }

    const rawContent = await FileSystem.readAsStringAsync(selectedAsset.uri);

    return {
      content: rawContent,
      contentType: detectedType,
      fileName,
    };
  }

  public static async savePdf(content: string, contentType: ContentType): Promise<PdfExportResult> {
    return PdfExportService.export(content, contentType);
  }

  public static async openSavedPdf(uri: string): Promise<void> {
    const canOpenDirectly = await Linking.canOpenURL(uri);

    if (canOpenDirectly) {
      await Linking.openURL(uri);
      return;
    }

    const canShare = await Sharing.isAvailableAsync();

    if (!canShare) {
      throw new Error('Unable to open the saved PDF on this device.');
    }

    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: 'Open saved PDF',
    });
  }

  public static getSourceTypeOptions(): Array<{ label: string; value: SourceType }> {
    return [
      { label: 'Text', value: 'text' },
      { label: 'File', value: 'file' },
    ];
  }

  public static getContentTypeOptions(): Array<{ label: string; value: ContentType }> {
    return [
      { label: 'HTML', value: 'html' },
      { label: 'TXT', value: 'txt' },
      { label: 'Markdown', value: 'markdown' },
    ];
  }
}
