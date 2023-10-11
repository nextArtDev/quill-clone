## SSR URL
for example when we want to create an stripe session, in server-side we're not able to use relative url, so we need a helper function:
_lib/utils.ts_ 
```typescript

export function absoluteUrl(path: string) {
    //in we're in client side
  if (typeof window !== 'undefined') return path

  // we're on server and we want to put it on vercel
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}${path}`

//Other cases
  return `http://localhost:${
    process.env.PORT ?? 3000
  }${path}`
}
```
## Usage in trpc

```typescript
createStripeSession: privateProcedure.mutation(
    async ({ ctx }) => {
      const { userId } = ctx

//Using absolute-path
      const billingUrl = absoluteUrl('/dashboard/billing')

      if (!userId)
        throw new TRPCError({ code: 'UNAUTHORIZED' })

      const dbUser = await db.user.findFirst({
        where: {
          id: userId,
        },
      })

      if (!dbUser)
        throw new TRPCError({ code: 'UNAUTHORIZED' })

      const subscriptionPlan =
        await getUserSubscriptionPlan()

      if (
        subscriptionPlan.isSubscribed &&
        dbUser.stripeCustomerId
      ) {
        const stripeSession =
          await stripe.billingPortal.sessions.create({
            customer: dbUser.stripeCustomerId,
            return_url: billingUrl,
          })

        return { url: stripeSession.url }
      }

      const stripeSession =
        await stripe.checkout.sessions.create({
          success_url: billingUrl,
          cancel_url: billingUrl,
          payment_method_types: ['card', 'paypal'],
          mode: 'subscription',
          billing_address_collection: 'auto',
          line_items: [
            {
              price: PLANS.find(
                (plan) => plan.name === 'Pro'
              )?.price.priceIds.test,
              quantity: 1,
            },
          ],
          metadata: {
            userId: userId,
          },
        })

      return { url: stripeSession.url }
    }
  ),
```