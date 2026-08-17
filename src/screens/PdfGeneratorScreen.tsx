import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { ContentType, SourceType } from '../models/DocumentModel';
import { PdfGeneratorViewModel } from '../viewmodels/PdfGeneratorViewModel';

/**
 * Screen responsible for collecting the user input and displaying the live document preview.
 */
export default function PdfGeneratorScreen() {
  const initialDocument = PdfGeneratorViewModel.createInitialModel();

  const [sourceType, setSourceType] = useState<SourceType>(initialDocument.sourceType);
  const [contentType, setContentType] = useState<ContentType>(initialDocument.contentType);
  const [content, setContent] = useState<string>(initialDocument.content);
  const [fileName, setFileName] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready to generate your PDF.');

  const previewHtml = useMemo(
    () => PdfGeneratorViewModel.getPreviewHtml(content, contentType),
    [content, contentType],
  );

  const updateSourceType = (nextSourceType: SourceType) => {
    setSourceType(nextSourceType);
    setStatus(`Input switched to ${nextSourceType === 'text' ? 'manual text' : 'file selection'}.`);
  };

  const handlePickFile = async () => {
    try {
      setStatus('Reading selected file...');
      const selectedFile = await PdfGeneratorViewModel.pickFile();

      if (!selectedFile) {
        setStatus('No file was selected.');
        return;
      }

      setSourceType('file');
      setContentType(selectedFile.contentType);
      setContent(selectedFile.content);
      setFileName(selectedFile.fileName);
      setStatus(`File loaded: ${selectedFile.fileName}`);
      setSavedPath(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load the file.';
      setStatus(message);
    }
  };

  const handleSavePdf = async () => {
    if (!content.trim()) {
      setStatus('Please add content before generating the PDF.');
      return;
    }

    try {
      setIsSaving(true);
      setStatus('Creating PDF file...');

      const result = await PdfGeneratorViewModel.savePdf(content, contentType);
      setSavedPath(result.uri);
      setStatus(`PDF saved to Documents: ${result.fileName}. Tap the link below to open it.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The PDF could not be created.';
      setStatus(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenSavedPdf = async () => {
    if (!savedPath) {
      return;
    }

    try {
      setStatus('Opening saved PDF...');
      await PdfGeneratorViewModel.openSavedPdf(savedPath);
      setStatus('Saved PDF opened successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to open the saved PDF.';
      setStatus(message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.kicker}>PDF Generator</Text>
          <Text style={styles.title}>Create a clean PDF in seconds</Text>
          <Text style={styles.subtitle}>Use text or a local file to generate a polished PDF preview and save it to the Documents folder.</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Input source</Text>
          <View style={styles.segmentedRow}>
            {PdfGeneratorViewModel.getSourceTypeOptions().map((option) => {
              const isSelected = sourceType === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => updateSourceType(option.value)}
                  style={[styles.segmentButton, isSelected && styles.segmentButtonSelected]}
                >
                  <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Document type</Text>
          <View style={styles.segmentedRow}>
            {PdfGeneratorViewModel.getContentTypeOptions().map((option) => {
              const isSelected = contentType === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setContentType(option.value)}
                  style={[styles.segmentButton, isSelected && styles.segmentButtonSelected]}
                >
                  <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {sourceType === 'text' ? (
            <TextInput
              style={styles.textInput}
              multiline
              value={content}
              onChangeText={setContent}
              placeholder="Start typing your content here..."
              placeholderTextColor="#8391a8"
              textAlignVertical="top"
            />
          ) : (
            <Pressable onPress={handlePickFile} style={styles.filePicker}>
              <Text style={styles.filePickerLabel}>{fileName ? `Loaded file: ${fileName}` : 'Choose a file (HTML, TXT or Markdown)'}</Text>
            </Pressable>
          )}

          <View style={styles.actionRow}>
            <Pressable
              onPress={handleSavePdf}
              disabled={isSaving}
              style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]}
            >
              {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Save PDF</Text>}
            </Pressable>
          </View>

          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={styles.statusText}>{status}</Text>
            {savedPath ? (
              <View style={styles.savedFileArea}>
                <Pressable onPress={handleOpenSavedPdf} style={styles.savedFileButton}>
                  <Text style={styles.savedFileButtonText}>Open saved PDF</Text>
                </Pressable>
                <Pressable onPress={handleOpenSavedPdf}>
                  <Text style={styles.savedPath}>Saved at: {savedPath}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Live preview</Text>
          <View style={styles.previewFrame}>
            <WebView source={{ html: previewHtml }} style={styles.webView} scrollEnabled={false} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  headerCard: {
    backgroundColor: '#0f1f36',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1d3557',
    marginBottom: 18,
  },
  kicker: {
    color: '#7dd3fc',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '700',
  },
  title: {
    color: '#ecfeff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  panel: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1f2a3a',
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  segmentedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#17212e',
    borderWidth: 1,
    borderColor: '#2b3d57',
    alignItems: 'center',
  },
  segmentButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#60a5fa',
  },
  segmentText: {
    color: '#dce9ff',
    fontWeight: '600',
  },
  segmentTextSelected: {
    color: '#ffffff',
  },
  textInput: {
    backgroundColor: '#0b1220',
    minHeight: 190,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27364b',
    padding: 16,
    color: '#eff6ff',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  filePicker: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27364b',
    padding: 18,
    marginBottom: 16,
  },
  filePickerLabel: {
    color: '#cfe2ff',
    fontSize: 15,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#38bdf8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38bdf8',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#041321',
    fontSize: 16,
    fontWeight: '800',
  },
  statusBox: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#24334d',
    padding: 14,
  },
  statusLabel: {
    color: '#7dd3fc',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statusText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
  },
  savedFileArea: {
    marginTop: 10,
    gap: 8,
  },
  savedFileButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f3a57',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1c5f8c',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  savedFileButtonText: {
    color: '#9be7ff',
    fontSize: 13,
    fontWeight: '700',
  },
  savedPath: {
    color: '#7ef0c0',
    fontSize: 12,
    lineHeight: 18,
    textDecorationLine: 'underline',
  },
  previewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dfeaf6',
  },
  previewFrame: {
    height: 420,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbeaf7',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
