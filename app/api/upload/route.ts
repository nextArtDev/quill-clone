import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { prisma } from '@/lib/prisma'
// const { DeleteObjectCommand } = require('@aws-sdk/client-s3')

const MAX_FILE_SIZE = 1024 * 1024 * 5

export const s3 = new S3Client({
  //   apiVersion: '2006-03-01',
  //   endpoint: process.env.LIARA_ENDPOINT,
  //   accessKeyId: process.env.LIARA_ACCESS_KEY,
  //   secretAccessKey: process.env.LIARA_SECRET_KEY,
  //   region: process.env.REGION,
  //   signatureVersion: 'v4',
})

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const id = nanoid()
    // const ex = input.fileType.split('/')[1]
    // const rawParams = request.url.split('?')[1]
    // const ex = rawParams.split('%2F')[1]
    // const key = `${id}.${ex}`
    const data = await request.json()

    console.log(data)
    // for (const d in data) {
    //   console.log([d])
    // }
    const files = data.getAll('file')
    // const promises = files.map((file: File) => {
    //   //     const params = {
    //   //       Bucket: 'your-bucket-name',
    //   //       Key: file.name,
    //   //       Body: file.data,
    //   //     }
    //   //     return s3.upload(params).promise()
    //   console.log(file)
    // })
    console.log(files)
    // const f = await Promise.all(promises)
    // console.log(f)

    // const command = new PutObjectCommand({
    //   Bucket: process.env.LIARA_BUCKET_NAME,
    //   Key: key,
    //   //   Body: ,
    // })
    // const { url, fields } = (await new Promise((resolve, reject) => {
    //   s3.createPresignedPost(
    //     {
    //       Bucket: process.env.LIARA_BUCKET_NAME,
    //       Fields: { key },
    //       Expires: 180,
    //       Conditions: [
    //         ['content-length-range', 0, MAX_FILE_SIZE],
    //         ['starts-with', '$Content-Type', 'image/'],
    //       ],
    //     },
    //     (err, signed) => {
    //       if (err) return reject(err)
    //       resolve(signed)
    //     }
    //   )
    // })) as any as { url: string; fields: any }

    // await prisma.image.createMany({
    //   data: {
    //     // imageKey: `https://${process.env.LIARA_BUCKET_NAME}.storage.iran.liara.space/${key}`,
    //     imageKey: key,
    //   },
    // })

    // console.log({ url, fields, key })
    // return NextResponse.json({ url, fields, key })
    return NextResponse.json({})
  } catch (error) {
    console.error('Error uploading image:', error)
    NextResponse.json({ message: 'Error uploading image' })
  }
}

// export async function DELETE(request: NextRequest, response: NextResponse) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const imageKey = searchParams.get('imageKey')

//     // await s3
//     //   .deleteObject({ Bucket: process.env.LIARA_BUCKET_NAME, Key: imageKey })
//     //   .promise()
//     // await s3
//     //   .deleteObject( process.env.LIARA_BUCKET_NAME!, Key: imageKey )
//     //   .promise()

//     return NextResponse.json({})
//   } catch (error) {
//     console.error('Error uploading image:', error)
//     NextResponse.json({ message: 'Error uploading image' })
//   }
// }

// export async function GET(request: NextRequest, response: NextResponse) {
//   try {
//     const imageKeys = await prisma.image.findMany()

//     const withUrls = await Promise.all(
//       imageKeys.map(async (imageKey) => {
//         return {
//           ...imageKey,
//           url: await s3.getSignedUrlPromise('getObject', {
//             Bucket: process.env.LIARA_BUCKET_NAME,
//             Key: imageKey.imageKey,
//           }),
//         }
//       })
//     )
//     console.log(withUrls)
//     return NextResponse.json({ withUrls })
//   } catch (error) {
//     console.error('Error uploading image:', error)
//     NextResponse.json({ message: 'Error uploading image' })
//   }
// }
