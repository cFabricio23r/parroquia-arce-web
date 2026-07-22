'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

const ERROR_MSG = 'No pudimos conectar con la transmisión. Probá de nuevo en un momento.'

type RadioState = {
  available: boolean
  playing: boolean
  volume: number
  error: string | null
  toggle: () => void
  setVolume: (value: number) => void
}

const RadioContext = createContext<RadioState | null>(null)

export function useRadio(): RadioState {
  const context = useContext(RadioContext)
  if (!context) throw new Error('useRadio debe usarse dentro de <RadioProvider>')
  return context
}

/**
 * Dueño del UNICO <audio> del sitio. Vive en el layout, asi que sobrevive los
 * cambios de ruta: si le das play en el home y entras a /radio, la musica sigue.
 *
 * El `src` se asigna recien al reproducir para no descargar el stream de fondo.
 */
export function RadioProvider({
  available,
  streamUrl,
  children,
}: {
  available: boolean
  streamUrl: string
  children: React.ReactNode
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.8)
  const [error, setError] = useState<string | null>(null)

  // Si comunicaciones apaga la radio mientras alguien escucha, cortar.
  useEffect(() => {
    if (!available && audioRef.current) {
      audioRef.current.pause()
      setPlaying(false)
    }
  }, [available])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const fail = useCallback(() => {
    setPlaying(false)
    setError(ERROR_MSG)
  }, [])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !available) return
    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }
    setError(null)
    if (audio.src !== streamUrl) audio.src = streamUrl
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(fail)
  }, [available, playing, streamUrl, fail])

  const value = useMemo<RadioState>(
    () => ({ available, playing, volume, error, toggle, setVolume: setVolumeState }),
    [available, playing, volume, error, toggle],
  )

  return (
    <RadioContext.Provider value={value}>
      {children}
      {/* Sin `src` hasta el primer play: el navegador no descarga nada de fondo. */}
      <audio ref={audioRef} preload="none" onError={fail} />
    </RadioContext.Provider>
  )
}
