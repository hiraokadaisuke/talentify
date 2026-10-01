import { renderToStaticMarkup } from 'react-dom/server'
import CurrentStepNotice from '@/components/offer/CurrentStepNotice'

describe('CurrentStepNotice', () => {
  it('stays hidden while the current step is selected', () => {
    const html = renderToStaticMarkup(
      <CurrentStepNotice
        currentStep="invoice"
        selectedStep="invoice"
        onReturn={() => {}}
      />,
    )

    expect(html).toBe('')
  })

  it('shows the current action and return control while another step is selected', () => {
    const html = renderToStaticMarkup(
      <CurrentStepNotice
        currentStep="invoice"
        selectedStep="offer_submitted"
        onReturn={() => {}}
      />,
    )

    expect(html).toContain('別のステップを表示中です')
    expect(html).toContain('現在の対応ステップは「締結・請求」です。')
    expect(html).toContain('現在のステップへ戻る')
  })
})
