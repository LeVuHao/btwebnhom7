'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <i className="fas fa-graduation-cap"></i>
        <span>HOM7</span>
      </div>
      <div className="nav-links">
        <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          <i className="fas fa-user-plus"></i>
          Đăng ký
        </Link>
        <Link href="/bao-cao" className={`nav-link ${isActive('/bao-cao') ? 'active' : ''}`}>
          <i className="fas fa-chart-bar"></i>
          Báo cáo
        </Link>
      </div>
    </nav>
  )
}
