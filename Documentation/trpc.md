## 1. Installation

<https://trpc.io/docs/client/nextjs/setup>

~ pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query zod

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