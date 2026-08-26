import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  PipelineStage,
  ClientSession,
} from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1> | string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface IBaseRepository<T> {
  create(item: Partial<T>, session?: ClientSession): Promise<T>;
  createMany(items: Partial<T>[], session?: ClientSession): Promise<T[]>;
  findById(id: string, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T | null>;
  findOne(filter: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T | null>;
  find(filter?: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T[]>;
  findWithPagination(filter?: FilterQuery<T>, pagination?: PaginationOptions, projection?: ProjectionType<T>): Promise<PaginatedResult<T>>;
  updateById(id: string, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<T | null>;
  updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<boolean>;
  updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<number>;
  deleteById(id: string): Promise<T | null>;
  deleteOne(filter: FilterQuery<T>): Promise<boolean>;
  deleteMany(filter: FilterQuery<T>): Promise<number>;
  count(filter?: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
  aggregate(pipeline: PipelineStage[]): Promise<unknown[]>;
}
