'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterSchema, type RegisterInput } from '@/lib/schemas'
import { registerUser } from '@/actions/register'

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields, dirtyFields },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })

  const password = watch('password')

  useEffect(() => {
    if (password) {
      let strength = 0
      if (password.length >= 8) strength++
      if (/[A-Z]/.test(password)) strength++
      if (/[0-9]/.test(password)) strength++
      if (/[^A-Za-z0-9]/.test(password)) strength++
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [password])

  const shouldShowError = (fieldName: keyof RegisterInput) => {
    return errors[fieldName] && (touchedFields[fieldName] || dirtyFields[fieldName])
  }

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('fullName', data.fullName)
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('confirmPassword', data.confirmPassword)

      const response = await registerUser(formData)
      setResult(response)

      if (response.success) {
        reset()
        setPasswordStrength(0)
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStrengthClass = (strength: number) => {
    if (strength <= 1) return 'weak'
    if (strength <= 2) return 'medium'
    return 'strong'
  }

  return (
    <div className="registration-card">
      <div className="registration-header">
        <div className="registration-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" x2="19" y1="8" y2="14" />
            <line x1="22" x2="16" y1="11" y2="11" />
          </svg>
        </div>
        <h2>Đăng ký thành viên</h2>
        <p>Tham gia cùng chúng tôi ngay hôm nay</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="registration-form">
        <div className={`form-group ${shouldShowError('fullName') ? 'has-error' : ''}`}>
          <label htmlFor="fullName">
            <i className="fas fa-user"></i>
            Họ và tên
          </label>
          <input
            type="text"
            id="fullName"
            placeholder="Nhập họ và tên của bạn"
            {...register('fullName')}
            className={shouldShowError('fullName') ? 'input-error' : ''}
          />
          {shouldShowError('fullName') && (
            <span className="error-message">{errors.fullName?.message}</span>
          )}
        </div>

        <div className={`form-group ${shouldShowError('email') ? 'has-error' : ''}`}>
          <label htmlFor="email">
            <i className="fas fa-envelope"></i>
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Nhập địa chỉ email"
            {...register('email')}
            className={shouldShowError('email') ? 'input-error' : ''}
          />
          {shouldShowError('email') && (
            <span className="error-message">{errors.email?.message}</span>
          )}
        </div>

        <div className={`form-group ${shouldShowError('password') ? 'has-error' : ''}`}>
          <label htmlFor="password">
            <i className="fas fa-lock"></i>
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 số"
            {...register('password')}
            className={shouldShowError('password') ? 'input-error' : ''}
          />
          {shouldShowError('password') && (
            <span className="error-message">{errors.password?.message}</span>
          )}
          {password && (
            <div className="password-strength">
              <div className={`strength-bar ${passwordStrength >= 1 ? getStrengthClass(passwordStrength) : ''}`} />
              <div className={`strength-bar ${passwordStrength >= 2 ? getStrengthClass(passwordStrength) : ''}`} />
              <div className={`strength-bar ${passwordStrength >= 3 ? getStrengthClass(passwordStrength) : ''}`} />
            </div>
          )}
        </div>

        <div className={`form-group ${shouldShowError('confirmPassword') ? 'has-error' : ''}`}>
          <label htmlFor="confirmPassword">
            <i className="fas fa-shield-alt"></i>
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            {...register('confirmPassword')}
            className={shouldShowError('confirmPassword') ? 'input-error' : ''}
          />
          {shouldShowError('confirmPassword') && (
            <span className="error-message">{errors.confirmPassword?.message}</span>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Đang xử lý...
            </>
          ) : (
            <>
              <i className="fas fa-user-plus"></i>
              Đăng ký ngay
            </>
          )}
        </button>
      </form>

      {result && (
        <div className={`result-message ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <i className="fas fa-check-circle"></i>
          ) : (
            <i className="fas fa-exclamation-circle"></i>
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}
