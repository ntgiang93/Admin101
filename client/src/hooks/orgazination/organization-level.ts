import { apiService } from '@/services/api'
import { type ApiResponse } from '@/types/base/ApiResponse'
import {
    defaultOrganizationLevelDto,
    type OrganizationLevelDto,
    type SaveOrganizationLevelDto,
} from '@/types/sys/OrganizationLevel'
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'

const endpoint = 'organization/organization-level'

export const useGetAll = () => {
    var queryClient = useQueryClient()
    var cachedData = queryClient.getQueryData<OrganizationLevelDto[]>([
        endpoint,
        'getAll',
    ])
    return useQuery<OrganizationLevelDto[], Error>({
        queryKey: [endpoint, 'getAll'],
        queryFn: async () => {
            const response = await apiService.get<ApiResponse<OrganizationLevelDto[]>>(
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

export const useGet = (id: number) => {
    return useQuery<OrganizationLevelDto, Error>({
        queryKey: [endpoint, 'get', id],
        queryFn: async () => {
            const response = await apiService.get<ApiResponse<OrganizationLevelDto>>(
                `${endpoint}/${id}`,
            )
            if (response.success && response.data) {
                return response.data
            }
            return { ...defaultOrganizationLevelDto }
        },
        enabled: id > 0,
    })
}

export const useSave = () => {
    return useMutation({
        mutationFn: async (payload: SaveOrganizationLevelDto) => {
            if (!payload.id || payload.id < 1) {
                return apiService.post<ApiResponse<OrganizationLevelDto>>(
                    `${endpoint}`,
                    payload,
                )
            }
            return apiService.put<ApiResponse<OrganizationLevelDto>>(
                `${endpoint}`,
                payload,
            )
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

export const OrganizationLevelHook = {
    useGetAll,
    useGet,
    useSave,
    useDelete,
}
