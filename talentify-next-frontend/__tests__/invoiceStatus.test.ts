import { getSubmitStatus } from '@/app/api/invoices/utils'

describe('getSubmitStatus', () => {
  const backup = process.env.INVOICE_AUTO_APPROVE

  afterEach(() => {
    process.env.INVOICE_AUTO_APPROVE = backup
  })

  it('returns approved when env true', () => {
    process.env.INVOICE_AUTO_APPROVE = 'true'
    expect(getSubmitStatus()).toBe('approved')
  })

  it('returns submitted when env not true', () => {
    delete process.env.INVOICE_AUTO_APPROVE
    expect(getSubmitStatus()).toBe('submitted')
  })
})
