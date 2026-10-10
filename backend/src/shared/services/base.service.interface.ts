import { Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { PaginatedResult, PaginationOptions } from '../repositories/base.repository.interface.js';

export interface IBaseService<T extends Document> {
  create(item: Partial<T>): Promise<T>;
  getById(id: string): Promise<T>;
  getOne(filter: FilterQuery<T>): Promise<T | null>;
  getAll(filter?: FilterQuery<T>): Promise<T[]>;
  getAllPaginated(filter?: FilterQuery<T>, pagination?: PaginationOptions): Promise<PaginatedResult<T>>;
  updateById(id: string, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<T>;
  deleteById(id: string): Promise<T>;
}
