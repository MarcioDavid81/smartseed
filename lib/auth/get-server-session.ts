import { cookies, headers } from 'next/headers'
import { db } from '@/lib/prisma'
import { verifyToken } from '../auth'

export async function getServerSession() {
  const token = cookies().get('token')?.value
  if (!token) return null

  const payload = await verifyToken(token)

  if (!payload?.userId) return null

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      role: true,
      companyId: true,
    },
  })

  if (!user) return null

  return { user }
}
