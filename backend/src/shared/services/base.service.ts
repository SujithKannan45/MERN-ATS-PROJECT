import { Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { IBaseRepository, PaginatedResult, PaginationOptions } from '../repositories/base.repository.interface.js';
import { IBaseService } from './base.service.interface.js';
import { NotFoundError } from '../../core/errors/app-error.js';

export abstract class BaseService<T extends Document> implements IBaseService<T> {
  protected readonly repository: IBaseRepository<T>;
  protected readonly entityName: string;

  constructor(repository: IBaseRepository<T>, entityName: string = 'Resource') {
    this.repository = repository;
    this.entityName = entityName;
  }

  public async create(item: Partial<T>): Promise<T> {
    return this.repository.create(item);
  }

  public async getById(id: string): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError(`${this.entityName} with ID '${id}' not found`);
    }
    return entity;
  }

  public async getOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.repository.findOne(filter);
  }

  public async getAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.repository.find(filter);
  }

  public async getAllPaginated(
    filter: FilterQuery<T> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    return this.repository.findWithPagination(filter, pagination);
  }

  public async updateById(
    id: string,
    update: UpdateQuery<T>,
    options: QueryOptions<T> = { new: true }
  ): Promise<T> {
    const updatedEntity = await this.repository.updateById(id, update, options);
    if (!updatedEntity) {
      throw new NotFoundError(`${this.entityName} with ID '${id}' not found for update`);
    }
    return updatedEntity;
  }

  public async deleteById(id: string): Promise<T> {
    const deletedEntity = await this.repository.deleteById(id);
    if (!deletedEntity) {
      throw new NotFoundError(`${this.entityName} with ID '${id}' not found for deletion`);
    }
    return deletedEntity;
  }
}
