import multer from 'multer'
import type { Request } from 'express'
import { StorageEnum, FileType } from '../enum/multer_enum'
import { tmpdir } from 'node:os'
import { v4 as uuidv4 } from 'uuid'
import { BadRequestException } from '@nestjs/common'

export const multer_cloud = ({
    custom_type = FileType.image,
    storageType = StorageEnum.memory,
    fileSize = 5 * 1024 * 1024
}: {
    custom_type?: string[],
    storageType?: StorageEnum,
    fileSize?: number
} = {}) => {
    const storage = storageType === StorageEnum.memory ? multer.memoryStorage() : multer.diskStorage({
        destination: tmpdir(),
        filename: (_req: Request, file: Express.Multer.File, cb: Function) => {
            const uniqueSuffix = uuidv4() + '-' + file.originalname
            cb(null, uniqueSuffix)
        },
    })

    function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
        if (!custom_type!.includes(file.mimetype))
            return cb(new BadRequestException(`this type ${file.mimetype} not allowed`))
        if (file.size > fileSize)
            return cb(new BadRequestException(`this file size ${file.size} not allowed`))
        cb(null, true)
    }

    return { storage, fileFilter }
}