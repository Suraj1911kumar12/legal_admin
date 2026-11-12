export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sortField: string;
  sortOrder: 1 | -1;
}

export const getPaginationOptions = (
  query: Record<string, any>,
  defaultSortField = 'createdAt',
  defaultSortOrder: 1 | -1 = -1
): PaginationOptions => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const rawLimit = parseInt(query.limit, 10) || 10;
  // Cap limit between 1 and 100
  const limit = Math.min(100, Math.max(1, rawLimit));
  const skip = (page - 1) * limit;

  const sortField = query.sortBy && typeof query.sortBy === 'string' ? query.sortBy : defaultSortField;
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  return {
    page,
    limit,
    skip,
    sortField,
    sortOrder
  };
};

export const calculatePagination = (total: number, page: number, limit: number) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1
  };
};

