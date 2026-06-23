import { type PaginationFilter } from '../base/PaginationFilter'

// Based on UserDto
export type UserDto = {
  id: string
  userName: string
  avatar?: string
  email: string
  phone: string
  fullName: string
  isActive: boolean
  isLocked?: boolean
  twoFa: boolean
  lockExprires?: Date
  roles: number[]
  rolesName: string[]
}

export const defaultUserDto: UserDto = {
  id: '',
  userName: '',
  avatar: undefined,
  email: '',
  phone: '',
  fullName: '',
  isActive: false,
  twoFa: false,
  isLocked: false,
  lockExprires: new Date(),
  roles: [],
  rolesName: [],
}

// Based on UpdateUserDto
export type UpdateUserDto = {
  id: string
  avatar?: string
  firstName?: string
  lastName?: string
  twoFa: boolean
}

export type SaveUserDto = {
  id: string
  fullName: string
  userName?: string
  email?: string
  phoneNumber?: string
  roles: number[]
}

export const defaultCreateUserDto: SaveUserDto = {
  id: '',
  fullName: '',
  userName: '',
  email: '',
  phoneNumber: '',
  roles: [],
}

// Based on UserTableDto
export type UserTableDto = {
  id: string
  userName: string
  avatar: string
  email: string
  phone: string
  department: string
  lastAccess?: Date | string
  fullName: string
  isActive: boolean
  isLocked: boolean
  roles: string[]
}

export type UserSelectDto = {
  id: string
  userName: string
  avatar?: string
  email: string
  fullName: string
}

// Based on UserTableRequestDto
export type UserTableRequestDto = PaginationFilter & {
  roles: string[]
  departments: number[]
  isActive?: boolean
  isLocked?: boolean
}

export const defaultUserTableRequest: UserTableRequestDto = {
  searchValue: '',
  page: 1,
  pageSize: 20,
  roles: [],
  departments: [],
  isActive: undefined,
  isLocked: undefined,
}

export type ChangePasswordDto = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export const defaultChangePasswordDto: ChangePasswordDto = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export type ForgotPasswordDto = {
  email: string
}

export const defaultForgotPasswordDto: ForgotPasswordDto = {
  email: '',
}
