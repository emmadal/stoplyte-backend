import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  static privateBucketName() {
    return `stoplyte-private-storage`;
  }

  static publicBucketName() {
    return `stoplyte-public-storage`;
  }

  async generateUploadLink(fileName, privateStorage = false) {
    const s3Client = new S3Client({
      region: process.env.AMZ_REGION || 'us-east-2',
      credentials: {
        accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
        secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY,
      },
    });

    const command = privateStorage
      ? new PutObjectCommand({
          Bucket: StorageService.privateBucketName(),
          Key: fileName,
        })
      : new PutObjectCommand({
          Bucket: StorageService.publicBucketName(),
          Key: fileName,
          ACL: 'public-read',
        });

    try {
      return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (err) {
      console.error('Error creating signed URL', err);
      throw err;
    }
  }
}
