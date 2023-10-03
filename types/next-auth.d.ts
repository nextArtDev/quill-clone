// import NextAuth from 'next-auth'

// declare module 'next-auth' {
//   interface User {
//     phone: string
//     password: string
//   }
//   interface Session {
//     user: User & {
//       phone: string
//     }
//     token: {
//       phone: string
//     }
//   }
// }

// import type { Session, User } from 'next-auth'
// import type { JWT } from 'next-auth/jwt'

// declare module 'next-auth/jwt' {
//   interface JWT {
//     id: string
//     phone: string | null
//     name: string
//     isVerified: boolean
//   }
// }

// declare module 'next-auth' {
//   interface Session {
//     user: User & {
//       id: string
//       phone: string | null
//       name: string
//       isVerified: boolean
//     }
//   }
// }

import type { Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    phone: string
    name: string
    isVerified: string
  }
}

declare module 'next-auth' {
  interface Session {
    user: User & {
      id: string
      name: string
    }
    // user: {
    //   id: string
    // } & Session['user']
  }
}
