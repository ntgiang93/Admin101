export type MenuItem = {
  id: number
  viName: string
  enName: string
  path: string
  icon?: string
  displayOrder: number
  isActive: boolean
  parentId?: number
  sysmodule?: string
  children?: MenuItem[]
  [key: string]: any
}

export const defaultMenuItem: MenuItem = {
  id: 0,
  viName: '',
  enName: '',
  path: '',
  icon: '',
  displayOrder: 0,
  isActive: true,
  parentId: undefined,
  sysmodule: undefined,
  children: [],
}

export type SaveMenuDto = {
  id: number
  viName: string,
  enName: string,
  path: string
  icon?: string
  displayOrder: number
  isActive: boolean
  parentId?: number
  sysmodule: string
}

export const defaultSaveMenuDto: SaveMenuDto = {
  id: 0,
  viName: '',
  enName: '',
  path: '',
  icon: '',
  displayOrder: 0,
  isActive: true,
  parentId: undefined,
  sysmodule: '',
}
