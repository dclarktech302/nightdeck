'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function SavedBanner() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('saved') !== 'true') return
    window.history.replaceState({}, '', window.location.pathname)
    toast.success('Changes saved')
  }, [searchParams])

  return null
}