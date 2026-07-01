import { StringHelper } from '@/libs/StringHelper'
import { apiService } from '@/services/api'
import { type ApiResponse } from '@/types/base/ApiResponse'
import {
    type CursorPaginatedResultDto,
    defaultCursorPaginatedResult,
} from '@/types/base/CursorPaginatedResultDto'
import {
    defualtPaginatedResult,
    type PaginatedResultDto,
} from '@/types/base/PaginatedResultDto'
import {
    type AddOrganizationUnitMemberDto,
    defaultDetailOrganizationUnitDto,
    type OrganizationUnitDto,
    type OrganizationUnitMemberDto,
    type OrganizationUnitMemberFilter,
    type DetailOrganizationUnitDto,
    type UserOrganizationUnitCursorFilterDto,
} from '@/types/sys/OrganizationUnit'
import { type UserSelectDto } from '@/types/sys/User'
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'

const endpoint = 'organization/organization-units'

export const useGetAll = () => {
    var queryClient = useQueryClient()
    var cachedData = queryClient.getQueryData<OrganizationUnitDto[]>([
        endpoint,
        'getAll',
    ])
    return useQuery<OrganizationUnitDto[], Error>({
        queryKey: [endpoint, 'getAll'],
        queryFn: async () => {
            const response = await apiService.get<ApiResponse<OrganizationUnitDto[]>>(
                `${endpoint}`,
            )
            if (response.success && response.data) {
                return response.data
            }
            return []
        },
        enabled: !cachedData || cachedData.length === 0,
        placeholderData: keepPreviousData || [],
    })
}

export const useGetSingleTree = (id: number) => {
    var queryClient = useQueryClient()
    var cachedData = queryClient.getQueryData<OrganizationUnitDto>([
        endpoint,
        'getSingleTree',
    ])
    return useQuery<OrganizationUnitDto, Error>({
        queryKey: [endpoint, 'getSingleTree', id],
        queryFn: async () => {
            const response = await apiService.get<ApiResponse<OrganizationUnitDto>>(
                `${endpoint}/${id}/tree`,
            )
            if (response.success && response.data) {
                return response.data
            }
            return {} as OrganizationUnitDto
        },
        enabled: !cachedData,
        placeholderData: keepPreviousData,
    })
}

export const useGet = (id: number) => {
    return useQuery<DetailOrganizationUnitDto, Error>({
        queryKey: [endpoint, 'get', id],
        queryFn: async () => {
            const response = await apiService.get<ApiResponse<DetailOrganizationUnitDto>>(
                `${endpoint}/${id}`,
            )
            if (response.success && response.data) {
                return response.data
            }
            return { ...defaultDetailOrganizationUnitDto }
        },
        enabled: id > 0,
    })
}

export const useSave = () => {
    return useMutation({
        mutationFn: async (payload: DetailOrganizationUnitDto) => {
            if (!payload.id || payload.id < 1) {
                return apiService.post<ApiResponse<OrganizationUnitDto>>(
                    `${endpoint}`,
                    payload,
                )
            }
            return apiService.put<ApiResponse<OrganizationUnitDto>>(`${endpoint}`, payload)
        },
    })
}

export const useDelete = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await apiService.delete<ApiResponse<boolean>>(
                `${endpoint}/${id}`,
            )
            return response.success
        },
    })
}

export const useGetMembers = (filter: OrganizationUnitMemberFilter) => {
    return useQuery<PaginatedResultDto<OrganizationUnitMemberDto>, Error>({
        queryKey: [endpoint, 'getMembers', filter],
        queryFn: async () => {
            const response = await apiService.get<
                ApiResponse<PaginatedResultDto<OrganizationUnitMemberDto>>
            >(`${endpoint}/get-members?${StringHelper.objectToUrlParams(filter)}`)
            if (response.success && response.data) {
                return response.data
            }
            return { ...defualtPaginatedResult }
        },
        enabled: filter.OrganizationUnitId > 0,
        placeholderData: keepPreviousData,
    })
}

export const useAddMember = () => {
    return useMutation({
        mutationFn: async (payload: AddOrganizationUnitMemberDto) => {
            const response = await apiService.post<ApiResponse<boolean>>(
                `${endpoint}/add-members`,
                payload,
            )
            return response.success
        },
    })
}

export const useGetUsersNotInOrganizationUnit = (
    filter: UserOrganizationUnitCursorFilterDto,
) => {
    return useQuery<CursorPaginatedResultDto<UserSelectDto, string>, Error>({
        queryKey: [endpoint, 'usersNotInOrganizationUnit', filter],
        queryFn: async () => {
            const query = StringHelper.objectToUrlParams({ ...filter })
            const url = query
                ? `${endpoint}/users-not-in-OrganizationUnit?${query}`
                : `${endpoint}/users-not-in-OrganizationUnit`
            const response =
                await apiService.get<
                    ApiResponse<CursorPaginatedResultDto<UserSelectDto, string>>
                >(url)
            if (response.success && response.data) {
                return response.data
            }
            return { ...defaultCursorPaginatedResult }
        },
        enabled: filter.OrganizationUnitId > 0,
        placeholderData: keepPreviousData,
    })
}

export const useRemoveMember = () => {
    return useMutation({
        mutationFn: async (payload: number[]) => {
            const response = await apiService.delete<ApiResponse<boolean>>(
                `${endpoint}/remove-member`,
                payload,
            )
            return response.success
        },
    })
}

export const OrganizationUnitHook = {
    useGetAll,
    useGet,
    useSave,
    useDelete,
    useGetMembers,
    useAddMember,
    useGetUsersNotInOrganizationUnit,
    useRemoveMember,
}
