export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class PaginationUtil {
  static paginate<T>(
    data: T[],
    page: number = 1,
    limit: number = 10,
    total: number,
  ): PaginatedResult<T> {
    const currentPage = Math.max(1, page);
    const pageLimit = Math.max(1, Math.min(100, limit));
    const totalPages = Math.ceil(total / pageLimit);

    return {
      data,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total,
        totalPages,
      },
    };
  }

  static getSkipTake(page: number = 1, limit: number = 10) {
    const currentPage = Math.max(1, page);
    const pageLimit = Math.max(1, Math.min(100, limit));
    const skip = (currentPage - 1) * pageLimit;

    return { skip, take: pageLimit };
  }
}
