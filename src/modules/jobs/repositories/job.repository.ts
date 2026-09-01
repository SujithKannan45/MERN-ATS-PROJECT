import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository.js';
import { Job, IJobDocument } from '../models/job.model.js';
import { IJobRepository } from './job.repository.interface.js';
import { JobQueryDto, IJobDashboardStats } from '../dtos/job.dto.js';
import { PaginatedResult } from '../../../shared/repositories/base.repository.interface.js';

export class JobRepository extends BaseRepository<IJobDocument> implements IJobRepository {
  constructor() {
    super(Job);
  }

  public async findJobsWithFilters(
    userId: string,
    query: JobQueryDto
  ): Promise<PaginatedResult<IJobDocument>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IJobDocument> = {
      userId: new Types.ObjectId(userId),
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.workplaceType) {
      filter.workplaceType = query.workplaceType;
    }

    if (query.employmentType) {
      filter.employmentType = query.employmentType;
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { companyName: searchRegex },
        { jobTitle: searchRegex },
        { location: searchRegex },
        { requiredSkills: { $in: [searchRegex] } },
      ];
    }

    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [data, totalItems] = await Promise.all([
      this.model.find(filter).sort(sortOptions).skip(skip).limit(limit).exec(),
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

  public async findByIdAndUserId(id: string, userId: string): Promise<IJobDocument | null> {
    return this.model.findOne({ _id: id, userId }).exec();
  }

  public async deleteByIdAndUserId(id: string, userId: string): Promise<IJobDocument | null> {
    return this.model.findOneAndDelete({ _id: id, userId }).exec();
  }

  public async getDashboardStatistics(userId: string): Promise<IJobDashboardStats> {
    const userObjectId = new Types.ObjectId(userId);

    const statsAggregation = await this.model.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts: Record<string, number> = {};
    let total = 0;

    statsAggregation.forEach((item) => {
      statusCounts[item._id] = item.count;
      total += item.count;
    });

    const savedJobs = statusCounts['Saved'] || 0;
    const appliedJobs = statusCounts['Applied'] || 0;
    const interviewScheduled = statusCounts['Interview Scheduled'] || 0;
    const interviewCompleted = statusCounts['Interview Completed'] || 0;
    const offers = statusCounts['Offer Received'] || 0;
    const rejections = statusCounts['Rejected'] || 0;
    const acceptedJobs = statusCounts['Accepted'] || 0;
    const archivedJobs = statusCounts['Archived'] || 0;

    return {
      totalJobs: total,
      savedJobs,
      appliedJobs,
      interviews: interviewScheduled + interviewCompleted,
      offers,
      rejections,
      acceptedJobs,
      archivedJobs,
    };
  }
}
