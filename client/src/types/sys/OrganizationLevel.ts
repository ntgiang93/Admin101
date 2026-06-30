export type OrganizationLevelDto = {
    id: number
    code: string
    name: string
    description?: string
    rank?: number
    isActive: boolean,
    isRooot: boolean
}

export const defaultOrganizationLevelDto: OrganizationLevelDto = {
    id: 0,
    code: '',
    name: '',
    description: '',
    rank: 0,
    isActive: true,
    isRooot: false
}

export type SaveOrganizationLevelDto = OrganizationLevelDto
