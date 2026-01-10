"use client"

import { useEffect, useState } from "react"
import HoverButton from "@/components/HoverButton"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

type CompanyPlan = "BASIC" | "PREMIUM"

const AcquirePlanButton = () => {
  const [plan, setPlan] = useState<CompanyPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPlan() {
      const res = await fetch("/api/companies/me")
      const data = await res.json()
      setPlan(data.plan)
      setLoading(false)
    }

    loadPlan()
  }, [])

  async function handleSubscribe() {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    }
  }

  if (loading) {
    return (
      <HoverButton className="w-full flex items-center justify-center" disabled>
        Carregando...
      </HoverButton>
    )
  }

  const hasPremiumPlan = plan === "PREMIUM"

  if (hasPremiumPlan) {
    return (
      <HoverButton className="w-full flex items-center justify-center gap-2">
        <Link href={`${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL}`}>
          Gerenciar plano
        </Link>
      </HoverButton>
    )
  }

  return (
    <HoverButton
      className="w-full flex items-center justify-center gap-2"
      onClick={handleSubscribe}
    >
      <ShoppingCart size={16} />
      Adquirir plano
    </HoverButton>
  )
}

export default AcquirePlanButton
