import { Toaster } from '../components/ui/toaster'

describe('Toaster', () => {
  it('renders with toast z-index class', () => {
    const element = Toaster()
    expect(element.props.className).toContain('toast-portal')
    expect(element.props.className).toContain('z-[var(--z-toast)]')
  })
})
