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

