import { act, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Reveal } from '@/components/news/Reveal'

const originalAnimate = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate')
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  if (originalAnimate) Object.defineProperty(HTMLElement.prototype, 'animate', originalAnimate)
  else delete (HTMLElement.prototype as Partial<HTMLElement>).animate
})

function motionEnvironment(top = 1200, reduced = false) {
  const original = window.matchMedia
  let preferenceChange = () => {}
  const preference = {
    ...original('(prefers-reduced-motion: reduce)'),
    matches: reduced,
    addEventListener: (_name: string, callback: () => void) => {
      preferenceChange = callback
    },
  }
  vi.spyOn(window, 'matchMedia').mockImplementation(() => preference as MediaQueryList)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top,
    bottom: top + 100,
    height: 100,
  } as DOMRect)
  let enter: IntersectionObserverCallback = () => {}
  const disconnect = vi.fn()
  const unobserve = vi.fn()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        enter = callback
      }
      observe = vi.fn()
      disconnect = disconnect
      unobserve = unobserve
    },
  )
  const cancel = vi.fn()
  const animate = vi.fn(() => ({ cancel }))
  vi.stubGlobal('Animation', class {})
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate })
  return {
    enter: (target: Element) =>
      act(() =>
        enter(
          [{ isIntersecting: true, target } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        ),
      ),
    reduce: () =>
      act(() => {
        preference.matches = true
        preferenceChange()
      }),
    animate,
    cancel,
    disconnect,
  }
}

describe('Scroll reveal', () => {
  it('animates content below the first screen once as it enters', () => {
    const motion = motionEnvironment()
    const { container } = render(<Reveal>Actividad</Reveal>)
    const element = container.firstElementChild!
    expect(element.getAttribute('data-reveal')).toBe('pending')
    motion.enter(element)
    expect(element.hasAttribute('data-reveal')).toBe(false)
    expect(motion.animate).toHaveBeenCalledTimes(1)
    motion.enter(element)
    expect(motion.animate).toHaveBeenCalledTimes(1)
  })

  it('never hides the content already visible on initial load', () => {
    const motion = motionEnvironment(100)
    const { container } = render(<Reveal>Bienvenida</Reveal>)
    expect(container.firstElementChild?.hasAttribute('data-reveal')).toBe(false)
    expect(motion.animate).not.toHaveBeenCalled()
  })

  it('keeps everything visible with reduced motion', () => {
    const motion = motionEnvironment(1200, true)
    const { container } = render(<Reveal>Comunidad</Reveal>)
    expect(screen.getByText('Comunidad')).toBeTruthy()
    expect(motion.animate).not.toHaveBeenCalled()
    expect(container.firstElementChild?.hasAttribute('data-reveal')).toBe(false)
  })

  it.each([false, true])('responds immediately to reduced motion while running=%s', (running) => {
    const motion = motionEnvironment()
    const { container } = render(<Reveal>Actividad</Reveal>)
    const element = container.firstElementChild!
    if (running) motion.enter(element)
    motion.reduce()
    expect(element.hasAttribute('data-reveal')).toBe(false)
    if (running) expect(motion.cancel).toHaveBeenCalled()
    else expect(motion.animate).not.toHaveBeenCalled()
  })

  it('keeps the content visible without animation support', () => {
    motionEnvironment()
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: undefined,
    })
    const { container } = render(<Reveal>Actividad</Reveal>)
    expect(container.firstElementChild?.hasAttribute('data-reveal')).toBe(false)
  })

  it('reveals immediately for keyboard focus and cleans up on unmount', () => {
    const motion = motionEnvironment()
    const { container, unmount } = render(
      <Reveal>
        <button>Agenda</button>
      </Reveal>,
    )
    const element = container.firstElementChild!
    fireEvent.focusIn(screen.getByRole('button'))
    expect(element.hasAttribute('data-reveal')).toBe(false)
    unmount()
    expect(motion.disconnect).toHaveBeenCalled()
  })
})
