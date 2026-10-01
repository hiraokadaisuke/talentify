export type BillingSnapshot = {
  billing_name: string | null
  billing_address: string | null
  invoice_registration_number: string | null
} | null

export type PayoutSnapshot = {
  bank_name: string | null
  branch_name: string | null
  account_type: string | null
  account_number: string | null
  account_holder: string | null
} | null

export type InvoiceContractSnapshot = {
  invoice_number: string
  amount: number
  transport_fee: number
  extra_fee: number
  due_date: string | null
  notes: string | null
}

export type PerformanceContractSnapshot = {
  offer_id: string
  date: string
  start_time: string
  end_time: string
  time_range: string
  event_name: string | null
  offer_message: string | null
}

type ContractSnapshotBase = {
  captured_at: string
  store_name: string
  store_address?: string | null
  store_contact_name?: string | null
  talent_name: string
  billing?: BillingSnapshot
  invoice: InvoiceContractSnapshot
  payout: PayoutSnapshot
}

export type ContractSnapshotV1 = ContractSnapshotBase & {
  version: 1
}

export type ContractSnapshotV2 = ContractSnapshotBase & {
  version: 2
  performance: PerformanceContractSnapshot
}

export type ContractSnapshot = ContractSnapshotV1 | ContractSnapshotV2

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function readInvoice(value: unknown): InvoiceContractSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const invoice = value as Record<string, unknown>

  if (
    typeof invoice.invoice_number !== 'string' ||
    typeof invoice.amount !== 'number' ||
    typeof invoice.transport_fee !== 'number' ||
    typeof invoice.extra_fee !== 'number' ||
    !isNullableString(invoice.due_date) ||
    !isNullableString(invoice.notes)
  ) {
    return null
  }

  return invoice as unknown as InvoiceContractSnapshot
}

function readBilling(value: unknown): BillingSnapshot | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== 'object' || Array.isArray(value)) return undefined

  const billing = value as Record<string, unknown>
  if (
    !isNullableString(billing.billing_name) ||
    !isNullableString(billing.billing_address) ||
    !isNullableString(billing.invoice_registration_number)
  ) {
    return undefined
  }

  return billing as unknown as Exclude<BillingSnapshot, null>
}

function readPayout(value: unknown): PayoutSnapshot | undefined {
  if (value === null) return null
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  const payout = value as Record<string, unknown>
  if (
    !isNullableString(payout.bank_name) ||
    !isNullableString(payout.branch_name) ||
    !isNullableString(payout.account_type) ||
    !isNullableString(payout.account_number) ||
    !isNullableString(payout.account_holder)
  ) {
    return undefined
  }

  return payout as unknown as Exclude<PayoutSnapshot, null>
}

function readPerformance(value: unknown): PerformanceContractSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const performance = value as Record<string, unknown>

  if (
    typeof performance.offer_id !== 'string' ||
    typeof performance.date !== 'string' ||
    typeof performance.start_time !== 'string' ||
    typeof performance.end_time !== 'string' ||
    typeof performance.time_range !== 'string' ||
    !isNullableString(performance.event_name) ||
    !isNullableString(performance.offer_message)
  ) {
    return null
  }

  return performance as unknown as PerformanceContractSnapshot
}

export function readContractSnapshot(value: unknown): ContractSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const snapshot = value as Record<string, unknown>

  if (
    (snapshot.version !== 1 && snapshot.version !== 2) ||
    typeof snapshot.captured_at !== 'string' ||
    typeof snapshot.store_name !== 'string' ||
    typeof snapshot.talent_name !== 'string' ||
    !isNullableString(snapshot.store_address ?? null) ||
    !isNullableString(snapshot.store_contact_name ?? null)
  ) {
    return null
  }

  const invoice = readInvoice(snapshot.invoice)
  const billing = readBilling(snapshot.billing)
  const payout = readPayout(snapshot.payout)

  if (!invoice || billing === undefined || payout === undefined) {
    return null
  }

  const base = {
    captured_at: snapshot.captured_at,
    store_name: snapshot.store_name,
    store_address: (snapshot.store_address ?? null) as string | null,
    store_contact_name: (snapshot.store_contact_name ?? null) as string | null,
    talent_name: snapshot.talent_name,
    billing,
    invoice,
    payout,
  }

  if (snapshot.version === 1) {
    return {
      version: 1,
      ...base,
    }
  }

  const performance = readPerformance(snapshot.performance)
  if (!performance) return null

  return {
    version: 2,
    ...base,
    performance,
  }
}

export function getPerformanceSnapshot(
  snapshot: ContractSnapshot | null
): PerformanceContractSnapshot | null {
  return snapshot?.version === 2 ? snapshot.performance : null
}
