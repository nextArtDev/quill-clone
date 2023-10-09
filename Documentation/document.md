## clsx

npm i clsx

in tailwind doesnt matter if we first add one class and then another, but by clsx it matters

## shadcn themes

we first select the theme we want from shadcn, then copy and paste it into our global.css

## Creating a component with Button styles

```typescript
        <Link
          className={buttonVariants({
            size: 'lg',
            className: 'mt-5',
          })}
          href="/dashboard"
          target="_blank"
        >
```

because shadcn defines a buttonVariant in the way we can use it as a className variant

```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

## CSS isolate property
DOC:
The isolation CSS property determines whether an element must create a new stacking context.
This property is especially helpful when used in conjunction with mix-blend-mode and z-index.
_It isolates component for blending with other backgrounds_

## aria-hidden 
is using for screen readers, it aria-hidden="true" it means its a fully decoration element.

## transform-gpu 

Hardware acceleration
A lot of transformations can be executed on the GPU instead of the CPU. This enables better performance. You can use the transform-gpu utility to enable GPU Acceleration.

<div class="transform-gpu scale-150 ..."></div>

## stylish background gradient

```typescript
      {/* value proposition section */}
      <div>
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>

          <div>
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mt-16 flow-root sm:mt-24">
                <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                  <Image
                    src={dashboardPreview.src}
                    alt="product preview"
                    width={1364}
                    height={866}
                    quality={100}
                    className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
            />
          </div>
        </div>
      </div>
```
## Auth accessing

server side: 

```typescript

const Navbar = async () => {
  const session = await getAuthSession()
  const user = session?.user

  console.log(session?.user.name)
```

client side 

```typescript
import { signOut } from "next-auth/react"
import { signIn } from "next-auth/react"

const Navbar = () => {
  const { data: session, status, update } = useSession()
  const user = session?.user

  console.log(session?.user.name)

  export default () => <button onClick={() => signOut()}>Sign out</button>
  
  export default () => <button onClick={() => signIn()}>Sign in</button>
```
## origin query parameter

if some one is not authenticated and want to do sth that needs it, we send user to the auth, but pass a query parameter to that link, to get back when auth workflow ends!

```typescript
  const session = await getAuthSession()
  const user = session?.user

  if (!user) {
    //origin query parameter is just for redirecting back, after sign-in
    redirect('/sign-in?origin=dashboard')
  }
```

and we check it in the backend:
_api/auth-callback_

```typescript
const Page = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const origin = searchParams.get('origin')

  trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      if (success) {
        // user is synced to db
        router.push(origin ? `/${origin}` : '/dashboard')
      }
    },
    onError: (err) => {
      if (err.data?.code === 'UNAUTHORIZED') {
        router.push('/sign-in')
      }
    },
    retry: true,
    retryDelay: 500,
  })

  //...
```
### how we can handle that in api?

```typescript
if(success){
  //if user authenticate
  // if there is any origin, go to that, else, go to the dashboard
  router.push(origin ? "/${origin}" : '/dashboard')
}
```

## children type

we can instead of ReactNode type, pass **PropsWithChildren** type from react, to the children

```typescript
const TRPCProvider = ({ children }: PropsWithChildren) => {
return(
)
}
```

## Loading state by react-loading-skeleton

~pnpm add react-loading-skeleton

```typescript
import Skeleton from 'react-loading-skeleton'

//...

<Skeleton height={100} className="my-2" count={3} />
```
then we should pass the css file to the rootLayout file:

***app/layout.tsx***
```typescript
import 'react-loading-skeleton/dist/skeleton.css'
```

## css autoFocus property

its using when the page is loaded for the first time.
