import { APIRoute, sanitizeKey } from 'next-s3-upload'
// export default APIRoute.configure({
//   key(req, filename) {
//     return `https://${process.env.LIARA_BUCKET_NAME}.storage.iran.liara.space/${filename}`
//   },
// })

export default APIRoute.configure({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  bucket: process.env.LIARA_ENDPOINT,
  region: 'default',
  endpoint: process.env.LIARA_BUCKET_NAME,
  //   forcePathStyle: true,
})
