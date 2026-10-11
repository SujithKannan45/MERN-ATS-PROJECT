import * as React from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { resumeService, type IResumeResponse } from '@/services/resume.service';
import { formatBytes } from '@/utils/cn';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (resume: IResumeResponse) => void;
  isUpdate?: boolean;
}

export function ResumeUploadModal({
  isOpen,
  onClose,
  onSuccess,
  isUpdate = false,
}: ResumeUploadModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateFile = (selectedFile: File): boolean => {
    setError(null);
    const validExtensions = ['pdf', 'doc', 'docx'];
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();

    if (!extension || !validExtensions.includes(extension)) {
      setError('Please select a valid PDF, DOC, or DOCX document.');
      return false;
    }

    // 5MB limit
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size exceeds the 5MB limit.');
      return false;
    }

    if (selectedFile.size === 0) {
      setError('Selected file is empty.');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (validateFile(selected)) {
        setFile(selected);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (validateFile(selected)) {
        setFile(selected);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setProgress(10);

      const uploader = isUpdate ? resumeService.updateResume : resumeService.uploadResume;
      const res = await uploader(file, (p) => {
        if (p.total) {
          const pct = Math.round((p.loaded / p.total) * 100);
          setProgress(Math.min(95, pct));
        }
      });

      setProgress(100);
      toast.success(
        isUpdate ? 'Resume updated and re-parsed successfully!' : 'Resume uploaded successfully!'
      );
      onSuccess(res);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={uploading}
          className="absolute right-4 top-4 rounded-sm text-muted-foreground hover:text-foreground focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1 mb-4">
          <h2 className="text-xl font-bold tracking-tight">
            {isUpdate ? 'Replace / Update Resume' : 'Upload Resume to Vault'}
          </h2>
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOC, DOCX up to 5MB. Cloudinary verified storage.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : file
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              <p className="text-[11px] text-primary underline mt-1">Click to choose another file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Drag and drop your resume file here
              </p>
              <p className="text-xs text-muted-foreground">or click to browse from your device</p>
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Uploading & extracting resume text...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            isLoading={uploading}
            className="gap-2"
          >
            {uploading ? 'Extracting...' : isUpdate ? 'Update Resume' : 'Upload Resume'}
          </Button>
        </div>
      </div>
    </div>
  );
}
