import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const images = [
  {
    src: '/uusi_tilaus.png',
    alt: 'Tilausten hallinta',
    caption: 'Tilausten hallinta',
  },
  {
    src: '/laskut.png',
    alt: 'Laskutus',
    caption: 'Laskutus',
  },
  {
    src: '/oma_yritys.png',
    alt: 'Oma yritys',
    caption: 'Yrityksen tietojen hallinta',
  },
]

export default function ImageCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[500px] flex flex-col items-center justify-center">
      <div className="relative w-full max-w-md aspect-[4/3] overflow-hidden rounded-xl bg-white shadow-lg">

        <AnimatePresence mode="wait">
          <motion.img
            key={images[index].src}
            src={images[index].src}
            alt={images[index].alt}
            className="w-full h-full object-cover absolute top-0 left-0"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: '0%' }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.6 }}
          />
        </AnimatePresence>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{images[index].caption}</p>
    </div>
  )
}
