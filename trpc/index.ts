// import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { privateProcedure, publicProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
// import { db } from '@/db'
import { z } from 'zod'
// import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
import { absoluteUrl } from '@/lib/utils'
// import {
//   getUserSubscriptionPlan,
//   stripe,
// } from '@/lib/stripe'
// import { PLANS } from '@/config/stripe'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const appRouter = router({
  // authCallback: publicProcedure.query(async () => {
  //   // const { getUser } = getKindeServerSession()
  //   // const user = getUser()
  //     const session = await getAuthSession()
  //     // console.log(session?.user.name)
  //     const user = session?.user
  //   if (!user?.id || !user.phone)
  //     throw new TRPCError({ code: 'UNAUTHORIZED' })
  //   // check if the user is in the database
  //   const dbUser = await prisma.user.findFirst({
  //     where: {
  //       id: +user.id,
  //     },
  //   })
  //   if (!dbUser) {
  //     // create user in db
  //     await prisma.user.create({
  //       data: {
  //         id: +user.id,
  //         phone: user.phone,
  //       },
  //     })
  //   }
  //   return { success: true }
  // }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx
    return await prisma.file.findMany({
      where: {
        userId: +userId,
      },
    })
  }),
  // createStripeSession: privateProcedure.mutation(
  //   async ({ ctx }) => {
  //     const { userId } = ctx
  //     const billingUrl = absoluteUrl('/dashboard/billing')
  //     if (!userId)
  //       throw new TRPCError({ code: 'UNAUTHORIZED' })
  //     const dbUser = await db.user.findFirst({
  //       where: {
  //         id: userId,
  //       },
  //     })
  //     if (!dbUser)
  //       throw new TRPCError({ code: 'UNAUTHORIZED' })
  //     const subscriptionPlan =
  //       await getUserSubscriptionPlan()
  //     if (
  //       subscriptionPlan.isSubscribed &&
  //       dbUser.stripeCustomerId
  //     ) {
  //       const stripeSession =
  //         await stripe.billingPortal.sessions.create({
  //           customer: dbUser.stripeCustomerId,
  //           return_url: billingUrl,
  //         })
  //       return { url: stripeSession.url }
  //     }
  //     const stripeSession =
  //       await stripe.checkout.sessions.create({
  //         success_url: billingUrl,
  //         cancel_url: billingUrl,
  //         payment_method_types: ['card', 'paypal'],
  //         mode: 'subscription',
  //         billing_address_collection: 'auto',
  //         line_items: [
  //           {
  //             price: PLANS.find(
  //               (plan) => plan.name === 'Pro'
  //             )?.price.priceIds.test,
  //             quantity: 1,
  //           },
  //         ],
  //         metadata: {
  //           userId: userId,
  //         },
  //       })
  //     return { url: stripeSession.url }
  //   }
  // ),
  // getFileMessages: privateProcedure
  //   .input(
  //     z.object({
  //       limit: z.number().min(1).max(100).nullish(),
  //       cursor: z.string().nullish(),
  //       fileId: z.string(),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const { userId } = ctx
  //     const { fileId, cursor } = input
  //     const limit = input.limit ?? INFINITE_QUERY_LIMIT
  //     const file = await db.file.findFirst({
  //       where: {
  //         id: fileId,
  //         userId,
  //       },
  //     })
  //     if (!file) throw new TRPCError({ code: 'NOT_FOUND' })
  //     const messages = await db.message.findMany({
  //       take: limit + 1,
  //       where: {
  //         fileId,
  //       },
  //       orderBy: {
  //         createdAt: 'desc',
  //       },
  //       cursor: cursor ? { id: cursor } : undefined,
  //       select: {
  //         id: true,
  //         isUserMessage: true,
  //         createdAt: true,
  //         text: true,
  //       },
  //     })
  //     let nextCursor: typeof cursor | undefined = undefined
  //     if (messages.length > limit) {
  //       const nextItem = messages.pop()
  //       nextCursor = nextItem?.id
  //     }
  //     return {
  //       messages,
  //       nextCursor,
  //     }
  //   }),
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await prisma.file.findFirst({
        where: {
          id: input.fileId,
          userId: +ctx.userId,
        },
      })
      if (!file) return { status: 'PENDING' as const }
      return { status: file.uploadStatus }
    }),
  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx
      const file = await prisma.file.findFirst({
        where: {
          key: input.key,
          userId: +userId,
        },
      })
      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })
      return file
    }),

  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx
      const file = await prisma.file.findFirst({
        where: {
          id: input.id,
          userId: +userId, //we should importantly make sure that this user that is authenticated now, is the one which has this file
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
})

export type AppRouter = typeof appRouter
