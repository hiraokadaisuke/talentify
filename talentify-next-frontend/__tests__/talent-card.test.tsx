import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import TalentCard, { PublicTalent } from '@/components/talent-search/TalentCard'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => React.createElement('img', props),
}))

describe('TalentCard image handling', () => {
  const baseTalent: PublicTalent = {
    id: '1',
    stage_name: 'Test',
    genre: null,
    area: null,
    avatar_url: null,
    rating: null,
    rate: null,
    bio: null,
  }

  it('uses placeholder when avatar_url is empty', () => {
    const markup = renderToStaticMarkup(
      React.createElement(TalentCard, { talent: { ...baseTalent, avatar_url: '' } })
    )
    expect(markup).toContain('/avatar-default.svg')
  })

  it('uses placeholder when avatar_url is invalid', () => {
    const markup = renderToStaticMarkup(
      React.createElement(TalentCard, {
        talent: { ...baseTalent, avatar_url: 'invalid-url' },
      })
    )
    expect(markup).toContain('/avatar-default.svg')
  })

  it('renders provided avatar_url when valid', () => {
    const url = 'https://example.com/avatar.png'
    const markup = renderToStaticMarkup(
      React.createElement(TalentCard, {
        talent: { ...baseTalent, avatar_url: url },
      })
    )
    expect(markup).toContain(url)
  })
})
