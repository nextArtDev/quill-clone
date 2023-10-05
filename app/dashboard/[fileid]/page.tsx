import PdfRenderer from '@/components/PdfRenderer'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: {
    fileid: string
  }
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = params

  //   const { getUser } = getKindeServerSession()
  //   const user = getUser()

  const session = await getAuthSession()
  const user = session?.user

  if (!user || !user.id) redirect(`/sign-in?origin=dashboard/${fileid}`)

  const file = await prisma.file.findFirst({
    where: {
      id: fileid,

      //this is important to each person can see its own file.
      userId: +user.id,
    },
  })

  if (!file) notFound()

  //   const plan = await getUserSubscriptionPlan()

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left sidebar & main wrapper */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            {/* Main area */}
            {/* <PdfRenderer url={file.url} /> */}
            {file.name}
          </div>
        </div>

        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          {/* <ChatWrapper isSubscribed={plan.isSubscribed} fileId={file.id} /> */}
        </div>
      </div>
    </div>
  )
}

export default Page
