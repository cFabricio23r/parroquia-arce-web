import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const radio = { available: true, playing: false, volume: 0.8, error: null, toggle: vi.fn(), pause: vi.fn(), setVolume: vi.fn() }
vi.mock('@/components/site/radio/RadioProvider', () => ({ useRadio: () => radio }))

import { ReflectionPlayer } from '@/components/reflections/ReflectionPlayer'

const makeUi = () => <ReflectionPlayer src="https://example.test/a.mp3" title="Las Bienaventuranzas" />
const ui = makeUi()
const getAudio = (c: HTMLElement) => c.querySelector('audio') as HTMLAudioElement

function withDuration(audio: HTMLAudioElement, duration: number) {
  Object.defineProperty(audio, 'duration', { configurable: true, value: duration })
  act(() => {
    fireEvent(audio, new Event('loadedmetadata'))
  })
}

beforeEach(() => {
  radio.playing = false
  radio.pause.mockClear()
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
    this.dispatchEvent(new Event('play'))
    return Promise.resolve()
  })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    this.dispatchEvent(new Event('pause'))
  })
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

describe('ReflectionPlayer', () => {
  it('pauses the radio when the reflection starts playing', () => {
    radio.playing = true
    render(ui)
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir la reflexión' }))
    expect(radio.pause).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Pausar la reflexión' })).toBeTruthy()
  })

  it('pauses itself when the radio starts', () => {
    const { rerender } = render(ui)
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir la reflexión' }))
    const pause = HTMLMediaElement.prototype.pause as unknown as ReturnType<typeof vi.fn>
    pause.mockClear()
    radio.playing = true
    rerender(makeUi()) // elemento nuevo: si no, React se salta el render
    expect(pause).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Reproducir la reflexión' })).toBeTruthy()
  })

  it('seek buttons move 15 seconds and clamp to 0 and duration', () => {
    const { container } = render(ui)
    const audio = getAudio(container)
    withDuration(audio, 100)
    const fwd = screen.getByRole('button', { name: 'Adelantar 15 segundos' })
    const back = screen.getByRole('button', { name: 'Atrasar 15 segundos' })
    audio.currentTime = 10
    fireEvent.click(fwd)
    expect(audio.currentTime).toBe(25)
    fireEvent.click(back)
    fireEvent.click(back)
    expect(audio.currentTime).toBe(0)
    audio.currentTime = 95
    fireEvent.click(fwd)
    expect(audio.currentTime).toBe(100)
  })

  it('range announces spoken time', () => {
    const { container } = render(ui)
    const audio = getAudio(container)
    withDuration(audio, 872)
    audio.currentTime = 214
    act(() => {
      fireEvent(audio, new Event('timeupdate'))
    })
    const range = screen.getByLabelText('Escuchá la reflexión')
    expect(range.getAttribute('aria-valuetext')).toBe('3 minutos 34 segundos de 14 minutos 32 segundos')
    expect(screen.getByText('3:34')).toBeTruthy()
    expect(screen.getByText('14:32')).toBeTruthy()
  })

  it('cycles playback speed 1x, 1.25x, 1.5x', () => {
    const { container } = render(ui)
    const btn = () => screen.getByRole('button', { name: /Velocidad de reproducción/ })
    expect(btn().getAttribute('aria-label')).toBe('Velocidad de reproducción: 1x')
    fireEvent.click(btn())
    expect(btn().getAttribute('aria-label')).toBe('Velocidad de reproducción: 1.25x')
    expect(getAudio(container).playbackRate).toBe(1.25)
    fireEvent.click(btn())
    fireEvent.click(btn())
    expect(btn().getAttribute('aria-label')).toBe('Velocidad de reproducción: 1x')
  })

  it('shows the retry message on media error', () => {
    const { container } = render(ui)
    expect(getAudio(container).getAttribute('preload')).toBe('metadata')
    act(() => {
      fireEvent(getAudio(container), new Event('error'))
    })
    expect(screen.getByText('No pudimos cargar el audio. Probá de nuevo en un momento.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalled()
    expect(screen.queryByText(/No pudimos cargar/)).toBeNull()
  })
})
