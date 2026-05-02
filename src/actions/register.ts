'use server'

import { RegisterSchema } from '@/lib/schemas'

export interface RegisterResult {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  // Extract data from FormData
  const rawData = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  // Server-side validation (Double Validation Layer 2)
  const result = RegisterSchema.safeParse(rawData)

  if (!result.success) {
    const errors: Record<string, string[]> = {}
    
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string
      if (!errors[field]) {
        errors[field] = []
      }
      errors[field].push(issue.message)
    })

    return {
      success: false,
      message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
      errors,
    }
  }

  // Simulate database operation
  try {
    // Here you would normally save to database
    // await db.user.create({ data: result.data })
    
    console.log('User registered:', result.data)

    return {
      success: true,
      message: 'Đăng ký thành công! Chào mừng bạn tham gia.',
    }
  } catch (error) {
    return {
      success: false,
      message: 'Đã xảy ra lỗi server. Vui lòng thử lại sau.',
    }
  }
}
