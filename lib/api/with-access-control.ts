import { ensureCompanyCan } from '@/core/access-control'
import { CompanyAction } from '@/core/access-control/company-actions'
import { getServerSession } from '../auth/get-server-session'

export async function withAccessControl(
  action: CompanyAction
) {
  const session = await getServerSession()

  if (!session?.user?.companyId) {
    throw new Error('Unauthorized')
  }

  await ensureCompanyCan(session.user.companyId, action)

  return session
}
