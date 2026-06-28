import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { StorageEnum } from "../enum/multer_enum";
import { createReadStream } from "node:fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
class S3Service {
    private readonly s3Client = new S3Client({
        region: process.env.AWS_REGION!,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
    });

    constructor() { }

    async uploadFile({
        store = StorageEnum.disk,
        Bucket = process.env.AWS_BUCKET_NAME as string,
        path = "general",
        ACL = "private" as ObjectCannedACL,
        file,
    }: {
        store?: StorageEnum;
        Bucket?: string;
        path?: string | undefined;
        ACL?: ObjectCannedACL;
        file: Express.Multer.File;
    }): Promise<{secure_url: string, public_id: string}> {
        const command = new PutObjectCommand({
            Bucket,
            Key: `${process.env.AWS_BUCKET_NAME}/${path}/${Date.now()}__${Math.random()}/${file.originalname}`,
            ACL,
            Body:
                store === StorageEnum.memory ? file.buffer : createReadStream(file.path),
            ContentType: file.mimetype,
        });

        await this.s3Client.send(command)
        if (!command.input?.Key) {
            throw new BadRequestException("Fail to upload");
        }
        
        return { 
            secure_url: `https://${command.input.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${command.input.Key}`, 
            public_id: command.input.Key 
        }
    };

    async uploadLargeFile({
        file,
        store = StorageEnum.disk,
        path = "General",
        ACL = ObjectCannedACL.private,
    }: {
        file: Express.Multer.File;
        store?: StorageEnum;
        path?: string;
        ACL?: ObjectCannedACL;
    }): Promise<string> {
        const command = new Upload({
            client: this.s3Client,
            params: {
                Bucket: process.env.AWS_BUCKET_NAME,
                ACL,
                Key: `${process.env.AWS_BUCKET_NAME}/${path}/${Date.now()}__${Math.random()}/${file.originalname}`,
                Body: store === StorageEnum.memory ? file.buffer : createReadStream(file.path),
                ContentType: file.mimetype,
            },
        });

        command.on("httpUploadProgress", (progress) => {
            console.log(progress);
        });

        const result = await command.done();

        return result.Key as string;
    }

    async uploadFiles({
        files,
        store = StorageEnum.memory,
        path = "General",
        ACL = ObjectCannedACL.private,
        isLarge = false,
    }: {
        files: Express.Multer.File[];
        store?: StorageEnum;
        path?: string;
        ACL?: ObjectCannedACL;
        isLarge?: boolean;
    }): Promise<Object> {
        let urls: Object[] = [];

        if (isLarge) {
            urls = await Promise.all(files.map((file) => {
                return this.uploadLargeFile({ file, store, path, ACL });
            }));
        } else {
            urls = await Promise.all(files.map((file) => {
                return this.uploadFile({ file, store: store!, path, ACL });
            }));
        }

        return urls;
    }

    async createPreSignedUrl({
        path,
        fileName,
        ContentType,
        expiresIn = 60,
    }: {
        path: string;
        fileName: string;
        ContentType: string;
        expiresIn?: number;
    }) {
        const Key = `${process.env.AWS_BUCKET_NAME}/${path}/${Date.now()}__${Math.random()}/${fileName}`;
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key,
            ContentType,
        });

        const url = await getSignedUrl(this.s3Client, command, { expiresIn });
        return { url, Key };
    }

    async getFile(Key: string) {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key,
        });

        return await this.s3Client.send(command);
    }

    async getPreSignedUrl({
        Key,
        expiresIn = 60,
        download = "true",
    }: {
        Key: string;
        expiresIn?: number;
        download?: string | undefined;
    }) {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key,
            ResponseContentDisposition: download === "true"
                ? `attachment; filename="${Key.split("/").pop()}"`
                : undefined,
        });

        const url = await getSignedUrl(this.s3Client, command, { expiresIn });
        return url;
    }

    async getFiles(folderName: string) {
        const command = new ListObjectsV2Command({
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: `${process.env.AWS_BUCKET_NAME}/${folderName}`,
        });

        return await this.s3Client.send(command);
    }

    async deleteFile(Key: string) {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key,
        });

        return await this.s3Client.send(command);
    }

    async deleteFiles(Keys: string[]) {
        const keyMapped = Keys.map((k) => {
            return { Key: k };
        });

        const command = new DeleteObjectsCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Delete: {
                Objects: keyMapped,
            },
        });

        return await this.s3Client.send(command);
    }

    async deleteFolder(folderName: string) {
        const data = await this.getFiles(folderName);

        const keyMapped = data?.Contents?.map((k) => {
            return k.Key;
        });

        if (!keyMapped || keyMapped.length === 0) return;

        return await this.deleteFiles(keyMapped as string[]);
    }

}

export default S3Service