import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { envConfig } from '../../../config/env.config.js';
import { logger } from '../../../core/logger/logger.js';
import { InternalServerError } from '../../../core/errors/app-error.js';

// Configure Cloudinary SDK instance
cloudinary.config({
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
  api_key: envConfig.CLOUDINARY_API_KEY,
  api_secret: envConfig.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  bytes: number;
  format?: string;
}

export class CloudinaryUtil {
  /**
   * Uploads a file buffer directly to Cloudinary using a readable stream
   */
  public static async uploadResumeBuffer(
    buffer: Buffer,
    originalName: string,
    userId: string
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      // Sanitize filename for Cloudinary public ID
      const cleanFileName = originalName
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
      const publicId = `${cleanFileName}_${uniqueSuffix}`;
      const folder = `${envConfig.CLOUDINARY_FOLDER}/${userId}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'raw', // RAW preserves original binary format for PDF and DOC/DOCX documents
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            logger.error('Cloudinary resume upload failed:', { error, userId });
            return reject(
              new InternalServerError('Failed to upload document to cloud storage')
            );
          }

          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format,
          });
        }
      );

      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Deletes a resume document from Cloudinary by its public ID
   */
  public static async deleteResumeFile(publicId: string): Promise<boolean> {
    if (!publicId) return true;

    try {
      // First attempt raw resource deletion
      let result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

      // Fallback attempt image / auto if raw returned not found
      if (result.result !== 'ok') {
        result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      }

      logger.info(`Cloudinary asset deleted: ${publicId}`, { result: result.result });
      return result.result === 'ok';
    } catch (error) {
      logger.error(`Error deleting Cloudinary asset ${publicId}:`, { error });
      // Non-blocking error: log and return false so caller can proceed
      return false;
    }
  }

  /**
   * Generates a signed or attachment delivery URL for downloading
   */
  public static getDownloadUrl(publicId: string, secureUrl: string): string {
    try {
      return cloudinary.url(publicId, {
        resource_type: 'raw',
        flags: 'attachment',
        secure: true,
      }) || secureUrl;
    } catch {
      return secureUrl;
    }
  }
}
