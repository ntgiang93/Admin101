export type PaginationFilter = {
  page: number
  pageSize: number
  searchValue?: string
}

export const defaultPaginationFilter: PaginationFilter = {
  page: 1,
  pageSize: 20,
  searchValue: '',
}
