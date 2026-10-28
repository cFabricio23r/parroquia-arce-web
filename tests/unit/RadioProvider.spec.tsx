import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { RadioProvider, useRadio } from '@/components/site/radio/RadioProvider'

let radio: ReturnType<typeof useRadio>
function Probe() {
  radio = useRadio()
  return null
}

afterEach(() => vi.restoreAllMocks())

describe('RadioProvider', () => {
  it('pause stops playback and is a no-op when already paused', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    render(
      <RadioProvider available streamUrl="https://example.test/stream">
        <Probe />
      </RadioProvider>,
    )
    await act(async () => radio.toggle())
    expect(play).toHaveBeenCalledTimes(1)
    expect(radio.playing).toBe(true)

    act(() => radio.pause())
    expect(radio.playing).toBe(false)
    expect(pause).toHaveBeenCalledTimes(1)

    expect(() => act(() => radio.pause())).not.toThrow()
    expect(radio.playing).toBe(false)
    expect(pause).toHaveBeenCalledTimes(1)
  })
})
