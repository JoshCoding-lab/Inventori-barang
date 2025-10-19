'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Saat halaman utama diakses, langsung diarahkan ke halaman login
    router.replace('/login')
  }, [router])

  return null
}
