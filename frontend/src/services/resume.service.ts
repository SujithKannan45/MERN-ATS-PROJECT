import { apiClient } from './api.client';
import type { ApiResponse } from '@/types';

export type ResumeFileType = 'pdf' | 'doc' | 'docx';

export interface IResumeResponse {
  id: string;
  userId: string;
  fileName: string;
  fileType: ResumeFileType;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  cloudinaryPublicId: string;
  extractedText: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface IResumeMetadataResponse {
  id: string;
  userId: string;
  fileName: string;
  fileType: ResumeFileType;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface IDownloadResponse {
  downloadUrl: string;
  fileName: string;
  mimeType: string;
}

export const resumeService = {
  /**
   * Upload a new resume (PDF, DOC, DOCX)
   */
  async uploadResume(
    file: File,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<IResumeResponse> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await apiClient.post<ApiResponse<IResumeResponse>>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          onUploadProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
          });
        }
      },
    });
    return response.data.data;
  },

  /**
   * Replace / update existing resume with a new file
   */
  async updateResume(
    file: File,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<IResumeResponse> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await apiClient.put<ApiResponse<IResumeResponse>>('/resumes/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          onUploadProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
          });
        }
      },
    });
    return response.data.data;
  },

  /**
   * Fetch current user's full resume including extracted text
   */
  async getCurrentResume(): Promise<IResumeResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<IResumeResponse>>('/resumes/me');
      return response.data.data || null;
    } catch (err: unknown) {
      // 404 means no resume uploaded yet
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('not found') || msg.includes('404')) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Fetch lightweight resume metadata
   */
  async getMetadata(): Promise<IResumeMetadataResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<IResumeMetadataResponse>>('/resumes/metadata');
      return response.data.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Delete current resume
   */
  async deleteResume(): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<null>>('/resumes/delete');
    return { message: response.data.message || 'Resume deleted successfully' };
  },

  /**
   * Get secure download URL
   */
  async getDownloadInfo(): Promise<IDownloadResponse> {
    const response = await apiClient.get<ApiResponse<IDownloadResponse>>('/resumes/download');
    return response.data.data;
  },
};
