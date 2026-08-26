import { Response } from 'express';
import { HttpStatusCode } from '../../core/errors/app-error.js';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface StandardApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  statusCode: number;
  message?: string;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
  timestamp: string;
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    statusCode: HttpStatusCode = HttpStatusCode.OK,
    meta?: PaginationMeta | Record<string, unknown>
  ): Response {
    const responsePayload: StandardApiResponse<T> = {
      status: 'success',
      statusCode,
      message,
      data,
      ...(meta ? { meta } : {}),
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(responsePayload);
  }

  public static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return ApiResponse.success(res, data, message, HttpStatusCode.CREATED);
  }

  public static noContent(res: Response): Response {
    return res.status(HttpStatusCode.NO_CONTENT).send();
  }

  public static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message: string = 'Records retrieved successfully'
  ): Response {
    return ApiResponse.success(res, data, message, HttpStatusCode.OK, pagination);
  }
}
