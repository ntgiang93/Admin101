export const LANGUAGES = [
  { key: 'vi', label: 'VI', name: 'Tieng Viet' },
  { key: 'en', label: 'EN', name: 'English' },
] as const

export type Language = (typeof LANGUAGES)[number]['key']
export type TranslationKey = keyof typeof translations.vi

export const DEFAULT_LANGUAGE: Language = 'vi'
export const LANGUAGE_STORAGE_KEY = 'app_language'

export const translations = {
  vi: {
    'common.language': 'Ngôn ngữ',
    'common.search': 'Tìm kiếm...',
    'common.logout': 'Đăng xuất',
    'common.save': 'Lưu',
    'common.saving': 'Đang lưu',
    'common.close': 'Đóng',
    'common.cancel': 'Hủy bỏ',
    'common.add': 'Thêm',
    'common.addNew': 'Thêm mới',
    'common.edit': 'Sửa',
    'common.delete': 'Xóa',
    'common.actions': 'Thao tác',
    'common.reloadData': 'Tải lại dữ liệu',
    'common.name': 'Tên',
    'common.code': 'Mã',
    'common.type': 'Loại',
    'common.description': 'Mô tả',
    'common.required': 'Trường bắt buộc',
    'common.requiredField': 'Trường này là bắt buộc',
    'common.noData': 'Không có dữ liệu',
    'common.success': 'Thành công',
    'common.error': 'Có lỗi xảy ra',

    'login.welcome': 'Chào mừng trở lại',
    'login.subtitle': 'Đăng nhập vào tài khoản của bạn để tiếp tục.',
    'login.username': 'Tài khoản',
    'login.usernamePlaceholder': 'Nhập tài khoản',
    'login.usernameDescription': 'Sử dụng tài khoản Medworking để đăng nhập',
    'login.password': 'Mật khẩu',
    'login.passwordPlaceholder': 'Nhập mật khẩu',
    'login.passwordRequired': 'Vui lòng nhập mật khẩu.',
    'login.forgotPassword': 'Quên mật khẩu?',
    'login.submit': 'Đăng nhập',
    'login.noAccount': 'Chưa có tài khoản? Vui lòng liên hệ admin',

    'categories.title': 'Quản lý danh mục hệ thống',
  },
  en: {
    'common.language': 'Language',
    'common.search': 'Search...',
    'common.logout': 'Logout',
    'common.save': 'Save',
    'common.saving': 'Saving',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.add': 'Add',
    'common.addNew': 'Add new',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.actions': 'Actions',
    'common.reloadData': 'Reload data',
    'common.name': 'Name',
    'common.code': 'Code',
    'common.type': 'Type',
    'common.description': 'Description',
    'common.required': 'Required field',
    'common.requiredField': 'This field is required',
    'common.noData': 'No data',
    'common.success': 'Success',
    'common.error': 'Something went wrong',

    'login.welcome': 'Welcome back',
    'login.subtitle': 'Sign in to your account to continue.',
    'login.username': 'Username',
    'login.usernamePlaceholder': 'Enter username',
    'login.usernameDescription': 'Use your Medworking account to sign in',
    'login.password': 'Password',
    'login.passwordPlaceholder': 'Enter password',
    'login.passwordRequired': 'Please enter your password.',
    'login.forgotPassword': 'Forgot password?',
    'login.submit': 'Sign in',
    'login.noAccount': 'No account yet? Please contact admin',

    'categories.title': 'System category management',
  },
} as const

export const isLanguage = (value: string | null | undefined): value is Language =>
  LANGUAGES.some((language) => language.key === value)

export const getDefaultLanguage = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (isLanguage(savedLanguage)) return savedLanguage

  const browserLanguage = window.navigator.language.split('-')[0]
  if (isLanguage(browserLanguage)) return browserLanguage

  return DEFAULT_LANGUAGE
}

export const translate = (
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>,
) => {
  let value: string = translations[language][key] || translations.vi[key] || key

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value.replaceAll(`{${paramKey}}`, String(paramValue))
    })
  }

  return value
}
