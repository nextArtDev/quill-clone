'use client'

import { FC } from 'react'

import { trpc } from '@/app/_trpc/client'
// import UploadButton from './UploadButton'
import { Ghost, Loader2, MessageSquare, Plus, Trash } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import Link from 'next/link'
import { format } from 'date-fns-jalali'
import { Button } from './ui/button'
import { useState } from 'react'
import UploadButton from './UploadButton'
// import { getUserSubscriptionPlan } from '@/lib/stripe'

interface DashboardProps {
  // subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

// const Dashboard: FC<DashboardProps> = ({ subscriptionPlan }) => {
const Dashboard: FC<DashboardProps> = ({}) => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null)

  const utils = trpc.useContext()

  const { data: files, isLoading } = trpc.getUserFiles.useQuery()

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      //reloads the page and invalidates old data
      utils.getUserFiles.invalidate()
    },
    //It called when the Delete button pressed! not after api calling.
    onMutate({ id }) {
      setCurrentlyDeletingFile(id)
    },
    //When ever successfully or with error we get response form api call
    onSettled() {
      setCurrentlyDeletingFile(null)
    },
  })
  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 pr-4 flex flex-col items-center justify-around gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-4xl text-gray-900">فایلهای من</h1>

        {/* <UploadButton isSubscribed={subscriptionPlan.isSubscribed} /> */}
        <UploadButton />
      </div>

      {/* display all user files */}
      {files && files?.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    {/* decoration element */}
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3 gap-3">
                        <h3 className="truncate mr-4 text-lg font-medium text-zinc-900">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {format(new Date(file.createdAt), 'dd MMM yyyy')}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* for when we add message functionality to the pdf file (how many messages user has exchanges with pdf file) */}
                    <MessageSquare className="h-4 w-4" />
                    ماکت
                  </div>

                  <Button
                    onClick={() => deleteFile({ id: file.id })}
                    size="sm"
                    className="w-full"
                    variant="destructive"
                  >
                    {currentlyDeletingFile === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <div className="mt-8 px-10 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3 ">
          <Skeleton height={100} className="my-2" count={1} />
          <Skeleton height={100} className="my-2" count={1} />
          <Skeleton height={100} className="my-2" count={1} />
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3">
          <Ghost className="h-8 w-8 text-zinc-800 text-black/40 " />
          <h3 className="font-semibold text-xl">اینجا کاملا خالیه!</h3>
          <p>اولین PDF خودت را آپلود کن.</p>
        </div>
      )}
    </main>
  )
}

export default Dashboard
