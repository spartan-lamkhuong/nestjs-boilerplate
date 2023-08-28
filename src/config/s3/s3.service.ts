import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';

import { SIGNED_URL_EXPIRE_SECONDS_DEFAULT } from './constant';
import {
  FileStorageService,
  S3DownloadInput,
  S3SaveFileToDiskInput,
  S3SignedUrlInput,
  S3UploadInput,
} from './s3.interface';

@Injectable()
export class S3Service implements FileStorageService {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET'),
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(s3UploadInput: S3UploadInput): Promise<void> {
    const { bucketName, dataBuffer, key, options } = s3UploadInput;
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: dataBuffer,
        ...options,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteFile(bucketName: string, key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async downloadFile(s3DownloadInput: S3DownloadInput): Promise<any> {
    try {
      const { bucketName, key } = s3DownloadInput;
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      return response.Body;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getSignedUrl(s3SignedUrl: S3SignedUrlInput): Promise<string> {
    const { bucketName, key, options } = s3SignedUrl;
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, {
        expiresIn:
          (options && options.expires) || SIGNED_URL_EXPIRE_SECONDS_DEFAULT,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async streamToString(stream: Readable): Promise<string> {
    return await new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
  }

  async saveFileToDisk(s3SaveFileToDiskInput: S3SaveFileToDiskInput) {
    try {
      const { bucketName, key, path } = s3SaveFileToDiskInput;
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      this.streamToString(response.Body as Readable).then((data) => {
        createWriteStream(path).write(data);
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  getS3FullUrl() {
    return `https://${this.configService.get(
      'AWS_S3_BUCKET_UPLOAD',
    )}.s3.${this.configService.get('AWS_S3_REGION')}.amazonaws.com`;
  }
}
