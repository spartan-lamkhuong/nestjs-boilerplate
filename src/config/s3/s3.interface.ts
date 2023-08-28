export interface S3UploadInput {
  bucketName: string;
  dataBuffer: Buffer;
  key: string;
  options?: {
    ContentType?: string;
    ACL?:
      | 'public-read'
      | 'private'
      | 'public-read-write'
      | 'authenticated-read'
      | 'aws-exec-read'
      | 'bucket-owner-read'
      | 'bucket-owner-full-control';
  };
}

export interface S3SignedUrlInput {
  bucketName: string;
  key: string;
  options?: {
    expires?: number;
  };
}

export interface S3DownloadInput {
  bucketName: string;
  key: string;
}

export interface S3SaveFileToDiskInput extends S3DownloadInput {
  path: string;
}

export interface FileStorageService {
  uploadFile(s3UploadInput: S3UploadInput): Promise<void>;
  downloadFile(s3DownloadInput: S3DownloadInput): Promise<Buffer>;
  deleteFile(bucketName: string, key: string): Promise<void>;
  getSignedUrl(s3SignedUrl: S3SignedUrlInput): Promise<string>;
  saveFileToDisk(s3SaveFileToDiskInput: S3SaveFileToDiskInput): Promise<void>;
}
