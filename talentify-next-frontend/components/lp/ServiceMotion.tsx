'use client'

import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import './service-motion.css'

/** Progressive enhancement: the full page remains readable without JavaScript. */
export default function ServiceMotion() {
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    try { setPaused(sessionStorage.getItem('raiten:motion-paused') === 'true') } catch { /* Storage is optional. */ }
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.raiten-service')
    if (!root) return
    const stopped = paused || reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    root.dataset.motion = stopped ? 'paused' : 'active'
    if (stopped) return () => { delete root.dataset.motion }

    const animations = new Set<Animation>()
    const animate = (element: HTMLElement, index = 0, hero = false) => {
      const animation = element.animate(
        hero ? [{ translate: '0 24px' }, { translate: '0 0' }] : [{ opacity: .35, translate: '0 32px' }, { opacity: 1, translate: '0 0' }],
        { duration: hero ? 1100 : 850, delay: index * 65, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' },
      )
      animations.add(animation)
      animation.onfinish = () => animations.delete(animation)
    }
    root.querySelectorAll<HTMLElement>('.raiten-service-hero-copy > *, .raiten-hero-scene > :not(.raiten-hero-scene-note)').forEach((element, index) => animate(element, index % 6, true))

    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const element = entry.target as HTMLElement
        animate(element, Number(element.dataset.motionOrder || 0))
        reveal.unobserve(element)
      })
    }, { threshold: .12, rootMargin: '0px 0px -24px 0px' })
    root.querySelectorAll<HTMLElement>('.raiten-about-inner > div, .raiten-section-heading, .raiten-core-card, .raiten-journey-copy > h2, .raiten-workflow-step, .raiten-journey-scene, .raiten-audience, .raiten-management-copy, .raiten-management-preview, .raiten-connections-overview, .raiten-start-overview, .raiten-service-faq details, .raiten-closing-inner').forEach(element => {
      element.dataset.motionOrder = String(Array.from(element.parentElement?.children || []).indexOf(element) % 5)
      reveal.observe(element)
    })

    // Offscreen sections do not run decorative CSS animations.
    const visibility = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('motion-in-view', entry.isIntersecting)
    }), { rootMargin: '60px' })
    root.querySelectorAll('section').forEach(section => visibility.observe(section))

    const hero = root.querySelector<HTMLElement>('.raiten-service-hero')
    const progress = root.querySelector<HTMLElement>('.raiten-reading-progress > span')
    const management = root.querySelector<HTMLElement>('.raiten-management-preview')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.raiten-core-card'))
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('header a[href^="#"]'))
    const sections = Array.from(root.querySelectorAll<HTMLElement>('section[id], article[id]'))
    let frame = 0
    let pointerX = 0
    let pointerY = 0
    const update = () => {
      frame = 0
      const height = root.offsetHeight - innerHeight
      const ratio = Math.max(0, Math.min(1, (scrollY - root.offsetTop) / Math.max(1, height)))
      if (progress) progress.style.transform = `scaleX(${ratio})`
      if (hero) {
        const bounds = hero.getBoundingClientRect()
        if (bounds.bottom > 0) {
          root.style.setProperty('--hero-drift', `${Math.min(45, Math.max(0, -bounds.top) * .08)}px`)
          root.style.setProperty('--hero-x', `${pointerX * 12}px`)
          root.style.setProperty('--hero-y', `${pointerY * 9}px`)
        }
      }
      if (management && finePointer.matches) {
        const rect = management.getBoundingClientRect()
        if (rect.top < innerHeight && rect.bottom > 0) {
          const distance = Math.max(0, Math.min(1, rect.top / innerHeight))
          management.style.setProperty('--screen-angle', `${distance * 7}deg`)
        }
      }
      const current = sections.filter(section => section.getBoundingClientRect().top <= innerHeight * .4).at(-1)?.id
      links.forEach(link => {
        const active = link.hash === `#${current}`
        link.classList.toggle('motion-nav-active', active)
        if (active) link.setAttribute('aria-current', 'location')
        else link.removeAttribute('aria-current')
      })
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const onPointer = (event: PointerEvent) => {
      if (!hero || !finePointer.matches) return
      const rect = hero.getBoundingClientRect()
      pointerX = ((event.clientX - rect.left) / rect.width - .5) * 2
      pointerY = ((event.clientY - rect.top) / rect.height - .5) * 2
      schedule()
    }
    const onLeave = () => { pointerX = 0; pointerY = 0; schedule() }
    const onCardMove = (event: PointerEvent) => {
      if (!finePointer.matches) return
      const card = event.currentTarget as HTMLElement
      const rect = card.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      card.style.setProperty('--card-rx', `${(0.5 - y) * 7}deg`)
      card.style.setProperty('--card-ry', `${(x - 0.5) * 9}deg`)
      card.style.setProperty('--shine-x', `${x * 100}%`)
      card.style.setProperty('--shine-y', `${y * 100}%`)
    }
    const onCardLeave = (event: PointerEvent) => {
      const card = event.currentTarget as HTMLElement
      card.style.removeProperty('--card-rx')
      card.style.removeProperty('--card-ry')
    }
    cards.forEach(card => { card.addEventListener('pointermove', onCardMove); card.addEventListener('pointerleave', onCardLeave) })
    hero?.addEventListener('pointermove', onPointer)
    hero?.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const onVisibility = () => root.classList.toggle('motion-tab-hidden', document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    onVisibility()
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      reveal.disconnect()
      visibility.disconnect()
      animations.forEach(animation => animation.cancel())
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      document.removeEventListener('visibilitychange', onVisibility)
      hero?.removeEventListener('pointermove', onPointer)
      hero?.removeEventListener('pointerleave', onLeave)
      cards.forEach(card => {
        card.removeEventListener('pointermove', onCardMove)
        card.removeEventListener('pointerleave', onCardLeave)
        for (const key of ['--card-rx','--card-ry','--shine-x','--shine-y']) card.style.removeProperty(key)
      })
      root.querySelectorAll('.motion-in-view').forEach(element => element.classList.remove('motion-in-view'))
      root.querySelectorAll<HTMLElement>('[data-motion-order]').forEach(element => delete element.dataset.motionOrder)
      links.forEach(link => { link.classList.remove('motion-nav-active'); link.removeAttribute('aria-current') })
      for (const key of ['--hero-drift','--hero-x','--hero-y']) root.style.removeProperty(key)
      management?.style.removeProperty('--screen-angle')
      root.classList.remove('motion-tab-hidden')
      delete root.dataset.motion
    }
  }, [paused, reduced])

  const toggle = () => setPaused(value => {
    try { sessionStorage.setItem('raiten:motion-paused', String(!value)) } catch { /* Storage is optional. */ }
    return !value
  })
  return <>
    <div className="raiten-reading-progress" aria-hidden="true"><span /></div>
    <button className="raiten-motion-toggle" type="button" onClick={toggle} aria-pressed={paused || reduced} disabled={reduced} aria-label={reduced ? '端末の設定により演出を停止しています' : paused ? 'ページの動きを再開する' : 'ページの動きを停止する'}>{paused || reduced ? <Play size={13} /> : <Pause size={13} />}<span>{reduced ? '動きを抑えています' : paused ? '動きを再開' : '動きを止める'}</span></button>
  </>
}
