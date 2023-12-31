## React Dropzone

~pnpm add react-dropzone

inside dropzone we return a callback function which can return jsx elements from it that have access to getRootProps, getInputProps and acceptedFiles

### acceptedFiles prop
when somebody drop the file into dropzone, its gonna be in accepted files.
It takes acceptedFile into a callback and does what we want
### onDrop prop
thats what we want to do after droping the file into dropzone
### getRootProps and getInputProps props 
they're for using in top level div's, passing the getRootProps and calling it to the top-level div just gonna make the dropzone work.

```typescript
<Dropzone multiple={false} onDrop={(acceptedFile)=>{
  console.log(acceptedFile)
}} >
{({getRootProps , getInputProps, acceptedFiles})=>(
  <div {...getRootProps()} >

  </div>
)}
</Dropzone>
```

## shadcn progress
_value_ prop indicates the situation of progress bar,  

### determinate progress bar
we set upload progress to receive to the 95% percent in 500ms, after that, if the progress is completed, we complete the bar.

```typescript
const [uploadProgress, setUploadProgress] = useState<number>(0)

//progress bar completion 
  const startSimulatedProgress = () => {
// 1. reset the upload progress to zero
    setUploadProgress(0)

// 2. setting interval for completing the progress bar
    const interval = setInterval(() => {

// 3. setting upload progress
      setUploadProgress((prevProgress) => {

// 4. if upload progress is greater than 95 % clear interval to does not progress any more
        if (prevProgress >= 95) {
          clearInterval(interval)
          return prevProgress
        }

// 5. if its lower than 95%, increase it by 50
        return prevProgress + 5
      })
    }, 500)

    return interval
  }

//...
 return (
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFile) => {
        //6. set uploading to true, to show it for progressbar 
        setIsUploading(true)

    // 7. we call it after we drag and drop a file into it
        const progressInterval = startSimulatedProgress()

      
      // After api call was successful and handling the api

    // 8. we clear the interval of progress interval 
        clearInterval(progressInterval)

    // 9. finally we set the interval to 100% 
        setUploadProgress(100)

        // startPolling({ key })
      }}
    >

        //...

// 10. conditionally rendering the progressbar
{isUploading ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    indicatorColor={
                      uploadProgress === 100 ? 'bg-green-500' : ''
                    }
   // 11. setting the value to the uploadProgress     
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                  
                  {uploadProgress === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-3">
                      در حال هدایت به صفحه ...
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </div>
                  ) : null}
                </div>
              ) : null}
```

```typescript

const UploadDropzone = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const router = useRouter()

  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const { toast } = useToast()

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
      multiple={false}
      onDrop={async (acceptedFile) => {
        setIsUploading(true)

        const progressInterval = startSimulatedProgress()

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

        // if (!key) {
        //   return toast({
        //     title: 'Something went wrong',
        //     description: 'Please try again later',
        //     variant: 'destructive',
        //   })
        // }

        clearInterval(progressInterval)
        setUploadProgress(100)

        // startPolling({ key })
      }}
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
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-zinc-500">
                  PDF (up to {isSubscribed ? '16' : '4'}MB)
                </p>
              </div>

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
                    indicatorColor={
                      uploadProgress === 100 ? 'bg-green-500' : ''
                    }
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                  {uploadProgress === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Redirecting...
                    </div>
                  ) : null}
                </div>
              ) : null}

              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  )
}

const UploadButton = ({ isSubscribed }: { isSubscribed: boolean }) => {
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

export default UploadButton
```