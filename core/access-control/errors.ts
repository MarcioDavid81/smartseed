export class ForbiddenPlanError extends Error {
  constructor(message?: string) {
    super(message ?? 'Ação não permitida no plano atual')
  }
}

export class PlanLimitReachedError extends Error {
  constructor(message?: string) {
    super(message ?? 'Adquira um plano PREMIUM para ter acesso ilimitado!')
  }
}
