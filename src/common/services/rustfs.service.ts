import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { StreamableFile } from '@nestjs/common';

@Injectable()
export class RustfsService {
  private readonly logger = new Logger(RustfsService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('RUSTFS_BUCKET')!;
    this.client = new S3Client({
      endpoint: this.configService.get<string>('RUSTFS_ENDPOINT')!,
      region: this.configService.get<string>('RUSTFS_REGION') ?? 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('RUSTFS_ACCESS_KEY')!,
        secretAccessKey: this.configService.get<string>('RUSTFS_SECRET_KEY')!,
      },
      forcePathStyle: true, // RustFS 필수 옵션
    });
  }

  /**
   * 파일 업로드
   * @param key 오브젝트 키 (경로 포함 파일명)
   * @param body 파일 버퍼
   * @param mimetype MIME 타입
   * @returns 저장된 key
   */
  async upload(key: string, body: Buffer, mimetype: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: mimetype,
      }),
    );
    this.logger.log(`업로드 완료: ${key}`);
    return key;
  }

  /**
   * 파일 다운로드 (StreamableFile 반환)
   * @param key 오브젝트 키
   * @param originalFileName 다운로드 시 사용할 파일명
   */
  async download(key: string, originalFileName: string): Promise<{ stream: StreamableFile; fileName: string }> {
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      const stream = res.Body as Readable;
      return { stream: new StreamableFile(stream), fileName: originalFileName };
    } catch (err) {
      this.logger.error(`다운로드 실패: ${key}`, err.stack);
      throw new NotFoundException('파일이 스토리지에 존재하지 않습니다.');
    }
  }

  /**
   * 파일 스트림 반환 (pipe 등 직접 사용 시)
   */
  async getStream(key: string): Promise<Readable> {
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      return res.Body as Readable;
    } catch (err) {
      this.logger.error(`스트림 조회 실패: ${key}`, err.stack);
      throw new NotFoundException('파일이 스토리지에 존재하지 않습니다.');
    }
  }

  /**
   * Presigned URL 생성 (브라우저 직접 접근용)
   * @param key 오브젝트 키
   * @param expiresIn 유효 시간 (초, 기본 1시간)
   */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn });
  }

  /**
   * 파일 단건 삭제
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      this.logger.log(`삭제 완료: ${key}`);
    } catch (err) {
      this.logger.warn(`삭제 실패 (무시): ${key} - ${err.message}`);
    }
  }

  /**
   * 파일 다건 삭제
   */
  async deleteMany(keys: string[]): Promise<void> {
    if (!keys || keys.length === 0) return;

    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: keys.map((Key) => ({ Key })),
          Quiet: true,
        },
      }),
    );
    this.logger.log(`다건 삭제 완료: ${keys.length}개`);
  }

  /**
   * Multer 파일로부터 key를 생성하고 업로드
   * @param prefix 키 접두사 (ex: 'coa', 'iqc/1', 'drawings/1')
   * @param file Multer 메모리 파일
   * @param customFileName 저장할 파일명 (없으면 타임스탬프_원본파일명)
   */
  async uploadFile(prefix: string, file: Express.Multer.File, customFileName?: string): Promise<{ key: string; originalName: string }> {
    const timestamp = Date.now();
    const safeName = (customFileName ?? file.originalname).replace(/[<>:"/\\|?*]/g, '_');
    const key = `${prefix}/${timestamp}_${safeName}`;
    await this.upload(key, file.buffer, file.mimetype);
    return { key, originalName: file.originalname };
  }
}
