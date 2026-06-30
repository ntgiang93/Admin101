export const SysModule = {
    Auth: 'Auth',
    Users: 'Users',
    Roles: 'Roles',
    UserRole: 'UserRole',
    Menu: 'Menu',
    UserProfile: 'UserProfile',
    Files: 'Files',
    SysCategories: 'SysCategories',
    BusinessCategory: 'BusinessCategory',
    OrganizationUnit: 'OrganizationUnit',
    OrganizationLevel: 'OrganizationLevel',
    JobTitle: 'JobTitle',
    JobScheduler: 'JobScheduler',
} as const

export type SysModule =
    (typeof SysModule)[keyof typeof SysModule]