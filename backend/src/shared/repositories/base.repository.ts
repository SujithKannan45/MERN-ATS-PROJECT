import {
  Model,
  Document,
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  PipelineStage,
  ClientSession,
} from 'mongoose';
import { IBaseRepository, PaginatedResult, PaginationOptions } from './base.repository.interface.js';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  public async create(item: Partial<T>, session?: ClientSession): Promise<T> {
    const doc = new this.model(item);
    return (await doc.save({ session })) as T;
  }

  public async createMany(items: Partial<T>[], session?: ClientSession): Promise<T[]> {
    return (await this.model.insertMany(items as T[], { session })) as unknown as T[];
  }

  public async findById(
    id: string,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ): Promise<T | null> {
    return this.model.findById(id, projection, options).exec();
  }

  public async findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options).exec();
  }

  public async find(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ): Promise<T[]> {
    return this.model.find(filter, projection, options).exec();
  }

  public async findWithPagination(
    filter: FilterQuery<T> = {},
    pagination: PaginationOptions = {},
    projection?: ProjectionType<T>
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 10));
    const skip = (page - 1) * limit;
    const sort = pagination.sort || { createdAt: -1 };

    const [data, totalItems] = await Promise.all([
      this.model.find(filter, projection).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  public async updateById(
    id: string,
    update: UpdateQuery<T>,
    options: QueryOptions<T> = { new: true }
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, options).exec();
  }

  public async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>
  ): Promise<boolean> {
    const result = await this.model.updateOne(filter, update, options as any).exec();
    return result.modifiedCount > 0;
  }

  public async updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>
  ): Promise<number> {
    const result = await this.model.updateMany(filter, update, options as any).exec();
    return result.modifiedCount;
  }

  public async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  public async deleteOne(filter: FilterQuery<T>): Promise<boolean> {
    const result = await this.model.deleteOne(filter).exec();
    return result.deletedCount > 0;
  }

  public async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount;
  }

  public async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  public async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.model.exists(filter).exec();
    return doc !== null;
  }

  public async aggregate(pipeline: PipelineStage[]): Promise<unknown[]> {
    return this.model.aggregate(pipeline).exec();
  }
}
