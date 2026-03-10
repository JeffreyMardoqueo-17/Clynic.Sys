"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

type CarouselSlide = {
  title: string
  subtitle: string
  badge: string
  imageSrc?: string
  imageAlt?: string
}

type SystemCarouselProps = {
  slides: CarouselSlide[]
}

export function SystemCarousel({ slides }: SystemCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  return (
    <div className="landing-carousel">
      <div
        className="landing-carousel-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        aria-live="polite"
      >
        {slides.map((slide) => (
          <article key={slide.title} className="landing-carousel-slide">
            <div className="landing-image-mockup">
              <div className="landing-image-toolbar">
                <span />
                <span />
                <span />
              </div>
              <div className="landing-image-content">
                <p className="landing-image-badge">{slide.badge}</p>
                <h3>{slide.title}</h3>
                <p>{slide.subtitle}</p>
                {slide.imageSrc ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <Image
                      src={slide.imageSrc}
                      alt={slide.imageAlt ?? slide.title}
                      width={1280}
                      height={720}
                      className="h-auto w-full object-cover"
                      priority={false}
                    />
                  </div>
                ) : (
                  <p className="landing-image-placeholder">Espacio para screenshot real del sistema</p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="landing-carousel-controls">
        <button type="button" onClick={goToPrev} aria-label="Slide anterior" className="landing-carousel-btn">
          <ChevronLeft className="size-4" />
        </button>
        <div className="landing-carousel-dots" role="tablist" aria-label="Seleccion de slides">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              role="tab"
              aria-selected={currentIndex === index}
              aria-label={`Ir al slide ${index + 1}`}
              className={currentIndex === index ? "is-active" : ""}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
        <button type="button" onClick={goToNext} aria-label="Siguiente slide" className="landing-carousel-btn">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
