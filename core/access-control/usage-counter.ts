import { db } from '@/lib/prisma'
import { CompanyAction } from './company-actions'

export async function getUsageCount(
  companyId: string,
  action: CompanyAction
) {
  switch (action) {
    case 'REGISTER_MOVEMENT':
      return Promise.all([
        db.harvest.count({ where: { companyId } }),
        db.buy.count({ where: { companyId } }),
        db.beneficiation.count({ where: { companyId } }),
        db.consumptionExit.count({ where: { companyId } }),
        db.saleExit.count({ where: { companyId } }),
        db.seedStockAdjustment.count({ where: { companyId } }),
        db.transformation.count({ where: { companyId } }),
        db.purchase.count({ where: { companyId } }),
        db.transferExit.count({ where: { companyId } }),
        db.application.count({ where: { companyId } }),
        db.industryTransfer.count({ where: { companyId } }),
        db.industryHarvest.count({ where: { companyId } }),
        db.industrySale.count({ where: { companyId } }),
        db.industryStockAdjustment.count({ where: { companyId } }),
        db.fuelPurchase.count({ where: { companyId } }),
        db.refuel.count({ where: { companyId } }),
        db.maintenance.count({ where: { companyId } }),
        db.rain.count({ where: { companyId } }),
      ]).then(r => r.reduce((a, b) => a + b, 0))

    case 'CREATE_MASTER_DATA':
      return Promise.all([
        db.farm.count({ where: { companyId } }),
        db.customer.count({ where: { companyId } }),
        db.talhao.count({ where: { companyId } }),
        db.cultivar.count({ where: { companyId } }),
        db.productionCycle.count({ where: { companyId } }),
        db.product.count({ where: { companyId } }),
        db.industryDeposit.count({ where: { companyId } }),
        db.industryTransporter.count({ where: { companyId } }),
        db.machine.count({ where: { companyId } }),
        db.fuelTank.count({ where: { companyId } }),
      ]).then(r => r.reduce((a, b) => a + b, 0))

    case 'CREATE_USER':
      return db.user.count({ where: { companyId } })

    case 'FINANCIAL_OPERATION':
    throw new Error('FINANCIAL_OPERATION does not use usage counter')

  }
}
