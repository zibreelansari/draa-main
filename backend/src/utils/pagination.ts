import type { Model, FilterQuery, SortOrder } from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, SortOrder>;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 25;

export async function paginate<T>(
  model: Model<T>,
  filter: FilterQuery<T> = {},
  options: PaginationOptions = {},
  populateFields?: Array<{ path: string; select?: string }>
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(options.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 as SortOrder };

  const [total, rawData] = await Promise.all([
    model.countDocuments(filter),
    (() => {
      let query = model.find(filter).sort(sort).skip(skip).limit(limit);
      if (populateFields) {
        for (const p of populateFields) {
          query = query.populate(p.path, p.select) as typeof query;
        }
      }
      return query.lean();
    })(),
  ]);

  return {
    data: rawData as T[],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/** Extract pagination from Express query params */
export function extractPagination(query: Record<string, unknown>): PaginationOptions {
  return {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : DEFAULT_LIMIT,
  };
}
