import { HydratedDocument, ProjectionType, QueryFilter, QueryOptions, Types, UpdateQuery } from "mongoose";
import { Model } from "mongoose";

export interface PaginationResult<TDoc> {
    docs: HydratedDocument<TDoc>[]
    total: number
    page: number
    limit: number
    totalPages: number
}

abstract class BaseRepo<TDoc> {
    constructor(protected readonly model: Model<TDoc>) { }

    async create(data: Partial<TDoc>): Promise<HydratedDocument<TDoc>> {
        return this.model.create(data)
    }

    async findById(id: Types.ObjectId): Promise<HydratedDocument<TDoc> | null> {
        return this.model.findById(id)
    }

    async find(
        filter?: QueryFilter<TDoc>,
        projection?: ProjectionType<TDoc> | null | undefined,
        options?: QueryOptions<TDoc>
    ): Promise<HydratedDocument<TDoc>[]> {
        return this.model.find(filter, projection, options)
    }

    async findPaginated({
        filter,
        projection,
        options,
        page,
        limit,
        sort,
    }: {
        filter?: QueryFilter<TDoc>,
        projection?: ProjectionType<TDoc> | null | undefined,
        options?: QueryOptions<TDoc>,
        page?: number,
        limit?: number,
        sort?: string,
    } = {}): Promise<PaginationResult<TDoc>> {
        page = +page! || 1
        limit = +limit! || 2
        if (page < 1) page = 1
        if (limit < 1) limit = 2
        const skip = (page - 1) * limit
        const [docs, total] = await Promise.all([
            this.model.find(filter, projection, { ...options, skip, limit, sort }),
            this.model.countDocuments(filter)
        ])
        return { docs, total, page, limit, totalPages: Math.ceil(total / limit) }
    }

    async countDocuments(filter?: QueryFilter<TDoc>): Promise<number> {
        return this.model.countDocuments(filter)
    }

    async findOne(
        {
            filter,
            projection,
            options
        }: {
            filter?: QueryFilter<TDoc>,
            projection?: ProjectionType<TDoc> | null | undefined,
            options?: QueryOptions<TDoc>
        }): Promise<HydratedDocument<TDoc> | null> {
        return this.model.findOne(filter, projection, { ...options })
    }

    async findOneAndUpdate(
        {
            filter,
            update,
            options
        }: {
            filter?: QueryFilter<TDoc>,
            update?: UpdateQuery<TDoc>,
            options?: QueryOptions<TDoc>
        }): Promise<HydratedDocument<TDoc> | null> {
        return this.model.findOneAndUpdate(filter, update, { returnDocument: 'after', ...options })
    }

    async findByIdAndUpdate(
        {
            id,
            update,
            options
        }: {
            id: Types.ObjectId,
            update: UpdateQuery<TDoc>,
            options?: QueryOptions<TDoc>
        }): Promise<HydratedDocument<TDoc> | null> {
        return this.model.findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after', ...options })
    }

    async findByIdAndDelete(id: Types.ObjectId): Promise<HydratedDocument<TDoc> | null> {
        return this.model.findByIdAndDelete(id)
    }
}

export default BaseRepo