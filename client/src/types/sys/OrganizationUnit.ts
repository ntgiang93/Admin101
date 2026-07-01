import {
    defaultPaginationFilter,
    type PaginationFilter,
} from '@/types/base/PaginationFilter.ts'

export type OrganizationUnitDto = {
    id: number
    name: string
    code: string
    description?: string
    organizationLevelId: number
    levelName: string
    parentId?: number
    address?: string
    headName: string
    children?: OrganizationUnitDto[]
}

export type DetailOrganizationUnitDto = {
    id: number
    name: string
    code: string
    description?: string
    organizationLevelId?: number 
    parentId?: number
    address?: string
    treePath: string
    headId: string
}

export const defaultDetailOrganizationUnitDto: DetailOrganizationUnitDto = {
    id: 0,
    name: '',
    code: '',
    description: '',
    organizationLevelId: undefined,
    parentId: undefined,
    address: '',
    treePath: '',
    headId: '',
}

export type OrganizationUnitMemberDto = {
    id: number
    userId: string
    userName: string
    fullName?: string
    avatar?: string
    email?: string
    isActive?: boolean
}

export type OrganizationUnitMemberFilter = PaginationFilter & {
    OrganizationUnitId: number
    isShowSubMembers: boolean
}

export const defaultOrganizationUnitMemberFilter: OrganizationUnitMemberFilter = {
    ...defaultPaginationFilter,
    OrganizationUnitId: 0,
    isShowSubMembers: true,
}

export type AddOrganizationUnitMemberDto = {
    OrganizationUnitId: number
    userIds: string[]
}

export type RemoveOrganizationUnitMemberDto = {
    OrganizationUnitId: number
    userIds: string[]
}

export type UserOrganizationUnitCursorFilterDto = {
    setSearchValue: string
    OrganizationUnitId: number
    limit: number
    /// <summary>
    /// cursor by created time
    /// </summary>
    cursor: string | null
}

export const defaultUserOrganizationUnitCursorFilterDto: UserOrganizationUnitCursorFilterDto =
    {
        setSearchValue: '',
        OrganizationUnitId: 0,
        limit: 50,
        cursor: null,
    }
