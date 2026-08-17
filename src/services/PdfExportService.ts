import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';

import { ContentType, PdfExportResult } from '../models/DocumentModel';
import { DocumentParserService } from './DocumentParserService';

/**
 * Exports the current HTML content to a PDF file inside the app documents directory.
 */
export class PdfExportService {
  public static async export(content: string, contentType: ContentType): Promise<PdfExportResult> {
    const documentHtml = DocumentParserService.buildPreviewDocument(content, contentType);

    const printResult = await Print.printToFileAsync({
      html: documentHtml,
      margins: {
        top: 18,
        bottom: 18,
        left: 18,
        right: 18,
      },
    });

    const saveDirectory = `${FileSystem.documentDirectory}pdf-generator/`;
    await FileSystem.makeDirectoryAsync(saveDirectory, { intermediates: true });

    const fileName = `pdf-generator-${Date.now()}.pdf`;
    const destinationUri = `${saveDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: printResult.uri,
      to: destinationUri,
    });

    return {
      uri: destinationUri,
      fileName,
    };
  }
}
