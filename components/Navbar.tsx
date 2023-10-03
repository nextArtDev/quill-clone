'use client'
import Link from 'next/link'
import MaxWidthWrapper from './MaxWidthWrapper'
import { buttonVariants } from './ui/button'
// import {
//   LoginLink,
//   RegisterLink,
//   getKindeServerSession,
// } from '@kinde-oss/kinde-auth-nextjs/server'
// import UserAccountNav from './UserAccountNav'
// import MobileNav from './MobileNav'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const Navbar = () => {
  // const { getUser } = getKindeServerSession()
  // const user = getUser()
  const { data: session, status, update } = useSession()
  console.log(session?.user.name)
  const user = session?.user

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          {/* <MobileNav isAuth={!!user} /> */}

          <div className="hidden items-center space-x-4 sm:flex">
            {!user ? (
              <>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}
                >
                  تعرفه‌ها
                </Link>
                <Link
                  href="/sign-in"
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}
                >
                  ورود
                </Link>
                <Link
                  href="sign-up"
                  className={buttonVariants({
                    size: 'sm',
                  })}
                >
                  شروع کنید <ArrowLeft className="mr-1.5 h-5 w-5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({
                      variant: 'ghost',
                      size: 'lg',
                    }),
                    'flex gap-3'
                  )}
                >
                  دشبورد
                  <span className="text-blue-800 font-semibold space-y-1">
                    {`(${session?.user.name}) `}
                  </span>
                </Link>

                {/* <UserAccountNav
                  name={
                    !user.given_name || !user.family_name
                      ? 'Your Account'
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ''}
                  imageUrl={user.picture ?? ''}
                /> */}
              </>
            )}
          </div>
          <Link href="/" className="flex z-40 font-semibold">
            <span>کویل</span>
          </Link>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}

export default Navbar
