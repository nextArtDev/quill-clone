## 1. Installation

<https://trpc.io/docs/client/nextjs/setup>

~ pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query zod

we should turn nextjs components in 'use client' when we use front-end side of trpc.
## 2. Provider

```typescript
'use client'

import { trpc } from '@/app/_trpc/client'
import { absoluteUrl } from '@/lib/utils'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { PropsWithChildren, useState } from 'react'

const Providers = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: absoluteUrl("/api/trpc"),
        }),
      ],
    })
  )

  return (
    <trpc.Provider
      client={trpcClient}
      queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default Providers

```

## 3.Creating an instance of trpc
we create it inside app folder: _app/_trpc/client.ts_

underscore determines for nextjs that it's not a actual route to navigate to
```typescript
import { AppRouter } from '@/trpc'
import { createTRPCReact } from '@trpc/react-query'

export const trpc = createTRPCReact<AppRouter>({})
```

## 4.Creating trpc folder at the root

It has two files: _trpc/index.ts_ and _trpc/trpc.ts_

trpc/trpc.ts

```typescript
import { getAuthSession } from '@/lib/auth'
import { TRPCError, initTRPC } from '@trpc/server'

const t = initTRPC.create()
const middleware = t.middleware

const isAuth = middleware(async (opts) => {

  const session = await getAuthSession()
  // console.log(session?.user.name)
  const user = session?.user

  if (!user || !user.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return opts.next({
    ctx: {
      userId: user.id,
      user,
    },
  })
})
```

trpc/index.ts **for creating our routes and al the api logics**

```typescript
import {
  privateProcedure,
  publicProcedure,
  router,
} from './trpc'

export const appRouter = router({

//Example logic
      getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx

    return await db.file.findMany({
      where: {
        userId,
      },
    })
  }),
})

export type AppRouter = typeof appRouter
```

### passing react query provider with trpc
 but its independent and has nothing with trpc 

```typescript

  return (
    <trpc.Provider
      client={trpcClient}
      queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
```

## 5. Adding nextjs app router adaptor

you can do so by using the fetch adapter, as they build on web standard Request and Response objects: 
inside: _app/api/trpc/[trpc]/route.ts_


```typescript
import { appRouter } from '@/trpc'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  })

export { handler as GET, handler as POST }

```

## public procedure
Its a pubic api; It allows us to create an api endpoint at anyone regardless wether they are authenticated or not can call.

## Query and Mutation
Query is used for getting data and mutation is used for are for mutating and modifying data (post, patch, delete).

## request
A request in trpc is a callback function applied to query or/and mutation, instead of Response (which is used in nextjs api routes) we just return anything we want to:

```typescript
export const appRouter = router({
    test: publicProcedure.query(()=>{
        return "Hello"
    })
})
```

## what happens in client?

After defining a procedure (wether public or private) we can access them in client:

```typescript
const {data} = trpc.test.useQuery()
```

## Creating Middleware and ctx
Getting all user's files:
- this should not be a public procedure, because every one should be able to just see its content, not others.
  for that we should create a middleware to determinate our access:
  inside _trpc/trpc.ts_
- first we define a middleware from _initTRPC.create()_ which we create.
- then we create our middleware callback function by using that, which by default accepts options (optc) argument
- we can throw **TRPCError** when error occurs, (instead of next error)
- Finally we can return _opts.next_ to say what we want to occur after this middleware. here its api route, but it can be another middleware too.
- option.next() takes a **ctx** or context which allows us to pass any value from this middleware directly into our _api routes that uses this procedure_
- we pass this middleware by **t.procedure.use()** to each api route that wants use that. 

every apiRoute which calls this procedure (here: export const privateProcedure = t.procedure.use(isAuth) ) makes sure that this function (here authentication) will call before the route will applied
```typescript
const t= initTRPC.create()

// 1. Creating middleware by trpc
const middleware = t.middleware

// 2. middleware callback function which by default accepts "opts"
const isAuth = middleware(async (opts) => {

  const session = await getAuthSession()
  const user = session?.user

  if (!user || !user.id) {

    // 3. TRPCError we can use
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

// 4. opts accepts .next callback to say what we will have after this middleware 
  return opts.next({

    // 5. we can pass anything we want to the api route which uses this procedure 
    ctx: {
      userId: user.id,
      user,
    },
  })
})

//6. how we can pass this middleware by name
export const privateProcedure = t.procedure.use(isAuth)
```
Now we can use this middleware inside our main trpc route (trpc/index.ts)


```typescript

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx
    return await prisma.file.findMany({
      where: {
        userId: +userId,
      },
    })
```

## _.input_ method and validation with Zod

_input_ method is like a body for post/put/delete routes we usually use in api requests.
we use zod to validate what we get on server-side;
_privateProcedure.input(z.object({ id: z.string() }))_ means every time you call "/deleteFile" api route, you need to pass an object, and this object needs to have a id property which is of type string. If not, api will throw a new error and doesn't work for us!

```typescript
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      //...
      })

      return file
    }),
```
## Delete Example

```typescript
//it should be private because unauthenticated people shouldn't be able to delete your route!
  deleteFile: privateProcedure

    .input(z.object({ id: z.string() }))

    //how we can access to the body or input in trpc, the first arg is ctx (from the middleware) and the second one is our body which passed from the request
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await prisma.file.findFirst({
        where: {
          id: input.id,

          //we should importantly make sure that this user that is authenticated now, is the one which has this file
          userId: +userId,
        },
      })
      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })
      await prisma.file.delete({
        where: { 
          id: input.id,
        },
      })
      return file
    }),
```

at the front-end:

```typescript
//Because we call a post request we need _useMutation _
  const { mutate: deleteFile } = //we get id like this not deleteFile(...) or other
    trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate()
    },
    onMutate({ id }) {
      setCurrentlyDeletingFile(id)
    },
    onSettled() {
      setCurrentlyDeletingFile(null)
    },
  })

  //...

  
  <Button

  //we pass "id" like this
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
```

## trpc useContext()
DOC: useContext is a hook that gives you access to helpers that let you manage the cached data of the queries you execute via @trpc/react-query.

```typescript
function MyComponent() {
  const utils = trpc.useContext();
  utils.post.all.fetch
  utils.post.all.fetchInfinite
  // [...]

  utils.getUserFiles.invalidate()
}
```
all wrapper files: 
fetch, prefetch, fetchInfinite, prefetchInfinite, ensureData, invalidate, refetch, cancel, setData, getData, setInfiniteData, getInfiniteData

## responses of useMutation on front-end

we can have responses like: onSuccess , onMutate, and onSettled functions

```typescript
  const { data: files, isLoading } = trpc.getUserFiles.useQuery()

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({

    // when route is successful
    onSuccess: () => {
      utils.getUserFiles.invalidate()
    },
    onMutate({ id }) {
      setCurrentlyDeletingFile(id)
    },
    onSettled() {
      setCurrentlyDeletingFile(null)
    },
  })
```
## How to use loading state for each file (avoiding naming conflict)
for that we have to use state. we can not use of "loading" state of useMutation.
after that by using onMute and onSettled functions, we can set this value.


```typescript
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

  //...

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
```

## onMutate
calls when the button is clicked right away! not after api call successfully, 

## onSettled
calls after api response returns, either with error or data.

## Polling approach
we need check if our file is in the database or not. We every for example 500ms asking, if the file is there, and api will tell us if its there or not. we do that by _retry_ property and _retryDelay_

```typescript
  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`)
    },

    //Polling requests
    retry: true,
    retryDelay: 500,
  })
```
## refetchInterval

_refetchInterval_ passes the data(what we send back from api route for example _status_) now we can define we want the pull until the file has a certain status.

## Example of getting upload status

```typescript
//Back-End
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))

    //we need to import input and ctx, if we want to use them
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      })
// status is Enum from constants, we have to tell typescript that's constant
      if (!file) return { status: 'PENDING' as const }

      return { status: file.uploadStatus }
    }),



    //Front-End

       const {data,isLoading} = trpc.getFileUploadStatus.useQuery(
      {
        fileId,
      },
      {
  // we pull data until data status is stable (wether it fails or succeed) stop pulling! if its nt stable, refetch every 500ms.
        refetchInterval: (data) =>
          data?.status === 'SUCCESS' ||
          data?.status === 'FAILED'
            ? false
            : 500,
      }
    )



```

## GetFileMessages Example useInfiniteQuery

```typescript

//privateProcedure: we have to be logged in to do this
getFileMessages: privateProcedure
    .input(
      z.object({

        //nullish: optional 
        limit: z.number().min(1).max(100).nullish(),

        //cursor: determine the number of messages for infinite query
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx
      const { fileId, cursor } = input
      const limit = input.limit ?? INFINITE_QUERY_LIMIT

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      const messages = await db.message.findMany({
        //take: prisma for taking!
        //take + 1 : 
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: 'desc',
        },

        //if we pass cursor, we get the id of that, if not, just undefined.
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      })

//determine the logic for the next cursor
      let nextCursor: typeof cursor | undefined = undefined
      if (messages.length > limit) {
  // pop removes the last element from an array and returns it
        const nextItem = messages.pop()
        nextCursor = nextItem?.id
      }

      return {
        messages,
        nextCursor,
      }
    }),
//..


//front-end
  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) =>
          lastPage?.nextCursor,
          //keep previous data to avoid flashes
        keepPreviousData: true,
      }
    )

    const messages = data?.pages.flatMap(
    (page) => page.messages
  )

```

## How extend type by trpc
we get a message from trpc route, but the message model in prisma has more than this properties, how we extend our datas:

_types/message.ts_

```typescript
import { AppRouter } from '@/trpc'
import { inferRouterOutputs } from '@trpc/server'

//  infer the type of any route that we are in trpc 
type RouterOutput = inferRouterOutputs<AppRouter>

//the type of messages that we get from trpc route or get what trpc returns from our api endpoint
type Messages = RouterOutput['getFileMessages']['messages']

//first omit old message
type OmitText = Omit<Messages[number], 'text'>

//we get the string and jsx element
type ExtendedText = {
  text: string | JSX.Element
}

// export this extended message
export type ExtendedMessage = OmitText & ExtendedText


// front-end 
//just import that type for our messages!

interface MessageProps {
  message: ExtendedMessage
  isNextMessageSamePerson: boolean
}


```

## Optimistic update with react-query and trpc
As soon as we typing a message, we want to see the result, if that failed, we will get it back! 

first we need access to trpc utils:
```typescript
const utils = trpc.useContext()

 const { mutate: sendMessage } = useMutation({
    mutationFn: async ({
      message,
    }: {
      message: string
    }) => {
      const response = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({
          fileId,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      return response.body
    },

    // Optimistic update 
    onMutate: async ({ message }) => {
      //as soon as we press the button remove it from the input
      backupMessage.current = message
      setMessage('')

      // step 1 

      // we want to cancel any outgoing messages to they dont overwrite pur optimistic update
      await utils.getFileMessages.cancel()

      // step 2

      //We snapshot the previous value we have 
      const previousMessages =
        utils.getFileMessages.getInfiniteData()

      // step 3

      //optimistically insert new value, right away as we send it, by "setInfiniteData" (instead of getInfiniteDate above)
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
    
//Because react-query accepts "pages" and "pageParams"
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            }
          }
// 4. Cloning the old Pages
          let newPages = [...old.pages]
//our lates (for example) 10 messages
          let latestPage = newPages[0]!
//5. directly mutating the messages, we add one message and put all of old ones above
          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            //spreading all the other messages that are there
            ...latestPage.messages,
          ]
//we changed data and now insert it as last one we see
          newPages[0] = latestPage

// we return pages and just overwrite our pages
          return {
            ...old,
            pages: newPages,
          }
        }
      )
// we want loading after user sends message 
      setIsLoading(true)
//6. return pages and there is no message just return empty array
      return {
        previousMessages:
          previousMessages?.pages.flatMap(
            (page) => page.messages
          ) ?? [],
      }
    },
    onSuccess: async (stream) => {
      setIsLoading(false)

      // if (!stream) {
      //   return toast({
      //     title: 'There was a problem sending this message',
      //     description:
      //       'Please refresh this page and try again',
      //     variant: 'destructive',
      //   })
      // }

      // const reader = stream.getReader()
      // const decoder = new TextDecoder()
      // let done = false

      // // accumulated response
      // let accResponse = ''

      // while (!done) {
      //   const { value, done: doneReading } =
      //     await reader.read()
      //   done = doneReading
      //   const chunkValue = decoder.decode(value)

      //   accResponse += chunkValue

        // append chunk to the actual message
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          (old) => {
            if (!old) return { pages: [], pageParams: [] }

            let isAiResponseCreated = old.pages.some(
              (page) =>
                page.messages.some(
                  (message) => message.id === 'ai-response'
                )
            )

            let updatedPages = old.pages.map((page) => {
              if (page === old.pages[0]) {
                let updatedMessages

                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: 'ai-response',
                      text: accResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ]
                } else {
                  updatedMessages = page.messages.map(
                    (message) => {
                      if (message.id === 'ai-response') {
                        return {
                          ...message,
                          text: accResponse,
                        }
                      }
                      return message
                    }
                  )
                }

                return {
                  ...page,
                  messages: updatedMessages,
                }
              }

              return page
            })

            return { ...old, pages: updatedPages }
          }
        )
      }
    },

// 7. if sth went wrong, we want to put inserted message back into the text box
    onError: (_, __, context) => {
      setMessage(backupMessage.current)
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      )
    },
    onSettled: async () => {
      setIsLoading(false)

      await utils.getFileMessages.invalidate({ fileId })
    },
  })


```
