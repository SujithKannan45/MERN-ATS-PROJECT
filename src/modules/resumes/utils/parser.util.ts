import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { logger } from '../../../core/logger/logger.js';
import { BadRequestError } from '../../../core/errors/app-error.js';

export class ParserUtil {
  /**
   * Cleans and sanitizes raw extracted text by removing control characters,
   * collapsing excessive whitespace, and preserving structural newlines.
   */
  public static cleanExtractedText(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') {
      return '';
    }

    return rawText
      // 1. Normalize line breaks to standard UNIX newline \n
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // 2. Strip non-printable ASCII and control characters (excluding \n and \t)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      // 3. Normalize non-standard whitespace/Unicode spaces to regular space
      .replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
      // 4. Collapse consecutive horizontal whitespace (spaces and tabs) to a single space
      .replace(/[^\S\n]+/g, ' ')
      // 5. Trim horizontal whitespace around newlines
      .replace(/[^\S\n]+\n/g, '\n')
      .replace(/\n[^\S\n]+/g, '\n')
      // 6. Collapse 3 or more consecutive newlines to maximum 2 (preserving paragraph breaks)
      .replace(/\n{3,}/g, '\n\n')
      // 7. Final trim
      .trim();
  }

  /**
   * Extracts and cleans raw text from a document buffer based on its MIME type/extension
   */
  public static async extractText(
    buffer: Buffer,
    fileType: 'pdf' | 'doc' | 'docx',
    mimeType: string
  ): Promise<string> {
    let rawText = '';

    try {
      if (fileType === 'pdf' || mimeType === 'application/pdf') {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        rawText = result.text;
      } else if (
        fileType === 'docx' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const result = await mammoth.extractRawText({ buffer });
        rawText = result.value;
      } else if (fileType === 'doc' || mimeType === 'application/msword') {
        // Fallback text extraction for legacy binary DOC files
        const stringBuffer = buffer.toString('utf-8');
        // Extract readable ASCII string clusters with length >= 3
        const matches = stringBuffer.match(/[\x20-\x7E\s]{3,}/g);
        rawText = matches ? matches.join(' ') : '';
      } else {
        throw new BadRequestError(`Unsupported file format '${fileType}' for text parsing.`);
      }
    } catch (error) {
      logger.error('Error during resume document parsing:', { error, fileType, mimeType });
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError(
        'Failed to parse document text. Please ensure the file is not corrupted or password-protected.'
      );
    }

    const cleanedText = this.cleanExtractedText(rawText);

    if (!cleanedText || cleanedText.length < 20) {
      throw new BadRequestError(
        'Extracted text is empty or too short. Please upload a document containing readable resume content.'
      );
    }

    return cleanedText;
  }
}
