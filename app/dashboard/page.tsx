import Dashboard from '@/components/Dashboard'
import { getAuthSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {}

async function page({}: Props) {
  const session = await getAuthSession()
  const user = session?.user

  if (!user) {
    return redirect('/sign-in?origin=dashboard')
  }
  return <Dashboard />
}

export default page
