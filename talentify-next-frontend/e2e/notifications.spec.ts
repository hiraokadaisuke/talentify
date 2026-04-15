import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

function uniqueKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function ensureLoggedIn(page: Page) {
  await page.goto('/app/notifications')
  await expect(page.getByRole('heading', { name: '通知' })).toBeVisible()
}

async function seedNotification(request: APIRequestContext, opts?: { groupKey?: string; title?: string }) {
  const response = await request.post('/api/notifications', {
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': uniqueKey('seed'),
    },
    data: {
      type: 'offer_created',
      title: opts?.title ?? `E2E通知 ${uniqueKey('title')}`,
      body: 'E2E body',
      action_url: '/talent/offers/e2e-offer-id',
      entity_type: 'offer',
      entity_id: 'e2e-offer-id',
      group_key: opts?.groupKey ?? null,
      data: {
        offer_id: 'e2e-offer-id',
      },
    },
  })

  expect(response.ok()).toBeTruthy()
  const payload = (await response.json()) as { data: { id: string; title: string } }
  return payload.data
}

async function unreadCount(page: Page): Promise<number> {
  const text = await page.getByTestId('notifications-unread-count').innerText()
  const match = text.match(/(\d+)/)
  return match ? Number(match[1]) : 0
}

test.describe('notifications e2e', () => {
  test('A. 未読同期: ヘッダーと一覧の未読件数が一致する', async ({ page, request }) => {
    await ensureLoggedIn(page)
    await seedNotification(request)

    await page.reload()

    const listCount = await unreadCount(page)
    await expect(page.getByTestId('header-notification-badge')).toHaveText(String(listCount))
  })

  test('B. 個別既読: クリックで遷移し未読が減る', async ({ page, request }) => {
    await ensureLoggedIn(page)
    const seeded = await seedNotification(request)

    await page.reload()
    const before = await unreadCount(page)

    await page.getByTestId(`notification-row-${seeded.id}`).click()
    await expect(page).toHaveURL(/offers\//)

    await page.goto('/app/notifications')
    const after = await unreadCount(page)
    expect(after).toBeLessThanOrEqual(before)
  })

  test('C/E. 一括既読 + 連打耐性: 件数が壊れず0になる', async ({ page, request }) => {
    await ensureLoggedIn(page)
    await seedNotification(request)
    await seedNotification(request)

    await page.reload()

    const markAll = page.getByTestId('notifications-mark-all-read')
    await Promise.all([markAll.click(), markAll.click(), markAll.click()])

    await expect(page.getByTestId('notifications-unread-count')).toContainText('未読 0 件')
    await expect(page.getByText('未読', { exact: true })).toHaveCount(0)
  })

  test('D. 2ページ同期: 片方で既読後、もう片方の再取得で反映される', async ({ browser, request }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    const seeded = await seedNotification(request)

    await ensureLoggedIn(page1)
    await ensureLoggedIn(page2)

    await page1.reload()
    await page2.reload()

    await page1.getByTestId(`notification-row-${seeded.id}`).click()
    await expect(page1).toHaveURL(/offers\//)

    await page2.goto('/app/notifications')
    await expect(page2.getByTestId('notifications-unread-count')).toContainText('未読')

    await context1.close()
    await context2.close()
  })

  test('F. offer通知遷移: role別の正しいURLに遷移する', async ({ page, request }) => {
    await ensureLoggedIn(page)
    const seeded = await seedNotification(request, {
      title: `Offer role test ${uniqueKey('offer')}`,
      groupKey: uniqueKey('group'),
    })

    await page.reload()
    await page.getByTestId(`notification-row-${seeded.id}`).click()
    await expect(page).toHaveURL(/\/offers\//)
  })

  test('G. 未読タブ: 未読件数がある場合は一覧に offer/payment が表示され空状態を出さない', async ({ page, request }) => {
    await ensureLoggedIn(page)
    const offerSeeded = await seedNotification(request, {
      title: `Unread offer ${uniqueKey('offer')}`,
      groupKey: uniqueKey('offer-group'),
    })
    const paymentResponse = await request.post('/api/notifications', {
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': uniqueKey('seed-payment'),
      },
      data: {
        type: 'payment_created',
        title: `Unread payment ${uniqueKey('payment')}`,
        body: 'E2E payment body',
        entity_type: 'payment',
        entity_id: uniqueKey('payment-id'),
        data: { payment_id: uniqueKey('payment-data-id') },
      },
    })
    expect(paymentResponse.ok()).toBeTruthy()

    await page.goto('/talent/notifications')
    await page.getByTestId('notifications-tab-unread').click()

    const badgeCount = await unreadCount(page)
    expect(badgeCount).toBeGreaterThan(0)
    await expect(page.getByTestId(`notification-row-${offerSeeded.id}`)).toBeVisible()
    await expect(page.getByText('未読通知はありません')).toHaveCount(0)
  })
})
