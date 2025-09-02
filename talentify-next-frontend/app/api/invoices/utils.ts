export function getSubmitStatus() {
  return process.env.INVOICE_AUTO_APPROVE === 'true' ? 'approved' : 'submitted'
}
