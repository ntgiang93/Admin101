import { type ApiResponse } from '@/types/base/ApiResponse'
import {
  defaultMenuItem,
  type MenuItem,
  type SaveMenuDto,
} from '@/types/sys/Menu'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { apiService } from '@/services/api.ts'

const endpoint = 'menu'

export const useGetUserMenu = () => {
  return useQuery<MenuItem[], Error>({
    queryKey: [endpoint, 'getUserMenu'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<MenuItem[]>>(
        `${endpoint}/user`,
      )
      if (response.success && response.data) {
        return response.data
      }
      return []
    },
    placeholderData: keepPreviousData || [],
    refetchOnMount: true,
  })
}

export const useGetMenuTree = () => {
  const queryClient = useQueryClient()
  const cachedData = queryClient.getQueryData<MenuItem[]>([
    endpoint,
    'getMenuTree',
  ])
  return useQuery<MenuItem[], Error>({
    queryKey: [endpoint, 'getMenuTree'],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<MenuItem[]>>(
        `${endpoint}`,
      )
      if (response.success && response.data) {
        return response.data
      }
      return []
    },
    placeholderData: keepPreviousData || [],
    enabled: !cachedData || cachedData.length === 0,
  })
}

export const useGet = (id: number) => {
  return useQuery<MenuItem, Error>({
    queryKey: [endpoint, 'get', id],
    queryFn: async () => {
      if(id == 0) return {...defaultMenuItem}
      const response = await apiService.get<ApiResponse<MenuItem>>(
        `${endpoint}/${id}`,
      )
      if (response.success && response.data) {
        return response.data
      }
      return { ...defaultMenuItem }
    },
    enabled: id >= 0,
  })
}

export const useSave = () => {
  return useMutation({
    mutationFn: async (menuItem: SaveMenuDto) => {
      if (menuItem.id < 1) {
        return await apiService.post<ApiResponse<MenuItem>>(
          `${endpoint}`,
          menuItem,
        )
      } else {
        return await apiService.put<ApiResponse<MenuItem>>(
          `${endpoint}`,
          menuItem,
        )
      }
    },
  })
}

export const useDelete = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      var response = await apiService.delete<ApiResponse<boolean>>(
        `${endpoint}/${id}`,
      )
      return response.success
    },
  })
}

export const MenuHook = {
  useGetUserMenu,
  useGetMenuTree,
  useGet,
  useSave,
  useDelete,
}
