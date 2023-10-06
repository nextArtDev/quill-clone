'use client'

import { useState } from 'react'
import { useS3FileUpload } from 'next-s3-uploader'
import { useS3Upload } from 'next-s3-upload'

import Dropzone from 'react-dropzone'
import { Cloud, File, Loader2 } from 'lucide-react'
// import { useUploadThing } from '@/lib/uploadthing'
import { trpc } from '@/app/_trpc/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import axios from 'axios'

const UploadDropzone = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const router = useRouter()

  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [files, setFiles] = useState<File[]>([])
  const [urls, setUrls] = useState([])
  const { toast } = useToast()
  const { uploadToS3 } = useS3Upload()

  // const { startUpload } = useUploadThing(
  //   isSubscribed ? 'proPlanUploader' : 'freePlanUploader'
  // )

  // const { mutate: startPolling } = trpc.getFile.useMutation(
  //   {
  //     onSuccess: (file) => {
  //       router.push(`/dashboard/${file.id}`)
  //     },
  //     retry: true,
  //     retryDelay: 500,
  //   }
  // )

  const startSimulatedProgress = () => {
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval)
          return prevProgress
        }
        return prevProgress + 5
      })
    }, 500)

    return interval
  }

  return (
    <Dropzone
      //   multiple={false}
      onDrop={async (acceptedFile) => {
        setIsUploading(true)

        // if (acceptedFile?.length) {
        //   setFiles((prevFiles) => [
        //     ...prevFiles,
        //     ...acceptedFile.map(
        //       (file) =>
        //         Object.assign(file, { preview: URL.createObjectURL(file) })
        //       //   file, { preview: URL.createObjectURL(file) }
        //     ),
        //   ])
        // }
        // setFiles(...URL.createObjectURL(acceptedFile))
        // console.log(files)
        const progressInterval = startSimulatedProgress()
        // const files = Array.from(acceptedFile)
        // const files = acceptedFile

        for (let index = 0; index < acceptedFile.length; index++) {
          const file = acceptedFile[index]
          console.log(file)
          const fileType = encodeURIComponent(file.type)

          const {
            data: { url, fields, key },
          } = await axios.post(`/api/s3upload?fileType=${fileType}`)
          const data = {
            ...fields,
            'Content-Type': file.type,
            file,
          }

          const formData = new FormData()

          Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value as any)
          })

          await fetch(url, {
            method: 'POST',
            body: formData,
          })

          console.log(key)
        }
        // if (acceptedFile && acceptedFile.length > 0) {
        //   const fileType = encodeURIComponent(acceptedFile[0].type)

        //   const {
        //     data: { url, fields, key },
        //   } = await axios.post(`/api/s3upload?fileType=${fileType}`)
        //   const data = {
        //     ...fields,
        //     'Content-Type': acceptedFile[0].type,
        //     acceptedFile,
        //   }

        //   const formData = new FormData()

        //   Object.entries(data).forEach(([key, value]) => {
        //     formData.append(key, value as any)
        //   })

        //   await fetch(url, {
        //     method: 'POST',
        //     body: formData,
        //   })

        //   console.log(key)

        // if (acceptedFile?.length) {
        //   setFiles((prevFiles) => [
        //     ...prevFiles,
        //     ...acceptedFile.map(
        //       (file) =>
        //         Object.assign(file, { preview: URL.createObjectURL(file) })
        //       //   file, { preview: URL.createObjectURL(file) }
        //     ),
        //   ])
        // }
        // console.log(files)
        // const formData = new FormData()
        // files.forEach((file) => formData.append('file', file))
        // // const objectUrl = URL.createObjectURL(acceptedFile[0])
        // console.log(formData)
        // const data = await axios.post('/api/upload', { formData })
        // console.log(data)
        // handle file uploading
        // const res = await startUpload(acceptedFile)
        // if (!res) {
        //   return toast({
        //     title: 'Something went wrong',
        //     description: 'Please try again later',
        //     variant: 'destructive',
        //   })
        // }

        // const [fileResponse] = res

        // const key = fileResponse?.key
        //   const {
        //       data: { withUrls },
        //     } = await axios.get(`/api/upload`)
        //     if (!key) {
        //         return toast({
        //             title: 'Something went wrong',
        //             description: 'Please try again later',
        //             variant: 'destructive',
        //         })
        //     }

        clearInterval(progressInterval)
        setUploadProgress(100)

        //   startPolling({ key })
      }}
      // }
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-3" />
                <p className="mb-2 text-sm text-zinc-700 text-center ">
                  <span className="font-semibold  ">برای آپلود کلیک کنید</span>
                  <br className="py-4" /> یا فایل مورد نظر را اینجا رها کنید.
                </p>
                <p className="text-xs text-zinc-500 mt-2 ">
                  PDF (up to {isSubscribed ? '16' : '4'}MB)
                </p>
              </div>

              {/* to getting feedbacks to user  */}
              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    // indicatorColor={
                    //   uploadProgress === 100 ? 'bg-green-500' : ''
                    // }
                    value={uploadProgress}
                    className={`h-1 w-full bg-zinc-200 ${
                      uploadProgress === 100 ? 'bg-green-500' : ''
                    }`}
                  />
                  {uploadProgress === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-3">
                      در حال هدایت به صفحه ...
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              /> */}
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  )
}

const UploadButtonTest = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v)
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>آپلود PDF</Button>
      </DialogTrigger>
      <DialogContent>
        <UploadDropzone isSubscribed={isSubscribed} />
      </DialogContent>
    </Dialog>
  )
}

export default UploadButtonTest
