'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Button } from '@/components/ui/button'
import { ExternalLink, Users } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// Featured channels - one from each category with enhanced data
const FEATURED_CHANNELS = [
  {
    id: 'ege-featured',
    name: 'Lomonosov School | ЕГЭ 2025',
    description: 'Комплексная подготовка к ЕГЭ по всем предметам',
    url: 'https://t.me/lomonosov_school',
    subscriberCount: 7140,
    avatar: 'https://static2.tgstat.ru/channels/_100/b3/b32d5cd6fda16029ed1fc350bc9e91db.jpg',
    category: 'Подготовка к ЕГЭ',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    accent: 'bg-emerald-500/20',
    icon: '🎓',
    tagline: 'Успешная сдача ЕГЭ',
    highlights: ['Все предметы', 'Методика', '100 баллов'],
  },
  {
    id: 'marketing-featured',
    name: 'О МАРКЕТИНГЕ',
    description: 'Просто и понятно об основах рекламы и актуальных тенденциях в интернете.',
    url: 'https://t.me/marketingovoe_o',
    subscriberCount: 12990,
    avatar: 'https://static4.tgstat.ru/channels/_100/11/1147152c384041cdb954566016b82228.jpg',
    category: 'Маркетинг',
    gradient: 'from-pink-500 via-red-500 to-orange-500',
    accent: 'bg-pink-500/20',
    icon: '📈',
    tagline: 'Рекламные тренды 2025',
    highlights: ['SMM стратегии', 'Таргетинг', 'Креативы'],
  },
  {
    id: 'programming-featured',
    name: 'Easy Python | Программирование',
    description: 'Всё о Python-разработке — лучшие гайды, курсы, инструменты и ресурсы',
    url: 'https://t.me/easy_python_tg',
    subscriberCount: 15923,
    avatar: 'https://static4.tgstat.ru/channels/_100/5c/5cd1336c20efb43aabc0b5f32e8963fa.jpg',
    category: 'Программирование',
    gradient: 'from-green-500 via-blue-500 to-purple-500',
    accent: 'bg-green-500/20',
    icon: '💻',
    tagline: 'Python с нуля до профи',
    highlights: ['Django', 'FastAPI', 'Machine Learning'],
  },
  {
    id: 'management-featured',
    name: 'Про удобство',
    description: 'Про продуктоводство, UX, работу с b2b-продуктом и здравый смысл',
    url: 'https://t.me/proudobstvo',
    subscriberCount: 18304,
    avatar: 'https://static2.tgstat.ru/channels/_100/42/426d6a78126d5d4544306ab9ff0e39a5.jpg',
    category: 'Управление',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    accent: 'bg-indigo-500/20',
    icon: '🚀',
    tagline: 'Продуктовое мышление',
    highlights: ['UX Research', 'Product Strategy', 'Team Lead'],
  },
  {
    id: 'design-featured',
    name: 'Fonts Best',
    description: 'Полезности для дизайнеров: шрифты, мокапы, UI/UX-ресурсы и туториалы',
    url: 'https://t.me/fonts_best',
    subscriberCount: 19903,
    avatar: 'https://static9.tgstat.ru/channels/_100/9a/9aa2869fc5c6e4276ca893aea67040db.jpg',
    category: 'Дизайн',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    accent: 'bg-amber-500/20',
    icon: '🎨',
    tagline: 'Ресурсы для дизайнеров',
    highlights: ['Шрифты', 'Мокапы', 'UI Kits'],
  },
  {
    id: 'analytics-featured',
    name: 'Карточный домик',
    description: 'Статистика как смысл жизни',
    url: 'https://t.me/kartochniydomik',
    subscriberCount: 17072,
    avatar: 'https://static1.tgstat.ru/channels/_100/5a/5a32ce4f4b8806856a3d567dc1113c2e.jpg',
    category: 'Аналитика',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    accent: 'bg-cyan-500/20',
    icon: '📊',
    tagline: 'Data-driven решения',
    highlights: ['Визуализация', 'A/B тесты', 'Метрики'],
  },
]

function formatSubscriberCount(count: number): string {
  if (count >= 1000) {
    return `${Math.floor(count / 1000)}K`
  }
  return count.toString()
}

interface ChannelSlideProps {
  channel: (typeof FEATURED_CHANNELS)[0]
}

function ChannelSlide({ channel }: ChannelSlideProps) {
  return (
    <div
      className={`relative bg-gradient-to-br ${channel.gradient} min-h-[280px] overflow-hidden rounded-2xl shadow-2xl md:min-h-[320px]`}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/10" />
      <div className="absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-white/5" />
      <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-white/5" />

      <div className="relative z-10 flex h-full flex-col p-6 md:p-8">
        {/* Header with icon and category */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{channel.icon}</div>
            <div
              className={`px-3 py-1 ${channel.accent} rounded-full border border-white/20 text-xs font-semibold text-white backdrop-blur-sm`}
            >
              {channel.category}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-white/90">
            <Users className="h-4 w-4" />
            <span>{formatSubscriberCount(channel.subscriberCount)}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 items-start gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border-2 border-white/30 bg-white/10 shadow-lg backdrop-blur-sm md:h-28 md:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={channel.avatar}
                  alt={channel.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-3">
              <h3 className="mb-1 line-clamp-2 text-xl leading-tight font-bold text-white md:text-2xl">
                {channel.name}
              </h3>
              <p className="text-sm font-medium text-white/80">{channel.tagline}</p>
            </div>

            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/90">
              {channel.description}
            </p>

            {/* Highlights */}
            <div className="mb-4 flex flex-wrap gap-2">
              {channel.highlights?.map((highlight, index) => (
                <span
                  key={index}
                  className="rounded-md border border-white/20 bg-white/15 px-2 py-1 text-xs text-white/90 backdrop-blur-sm"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with action */}
        <div className="flex items-center justify-between border-t border-white/20 pt-4">
          <div className="text-sm text-white/80">Присоединяйтесь к сообществу</div>

          <Button
            asChild
            size="sm"
            className="bg-white font-semibold text-gray-900 shadow-lg hover:bg-white/90"
          >
            <a
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Подписаться
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

interface CarouselDotsProps {
  slides: typeof FEATURED_CHANNELS
  selectedIndex: number
  onDotClick: (index: number) => void
}

function CarouselDots({ slides, selectedIndex, onDotClick }: CarouselDotsProps) {
  return (
    <div className="mt-4 flex justify-center gap-2">
      {slides.map((_, index) => (
        <button
          key={index}
          className={cn(
            'h-2 w-2 rounded-full transition-all duration-200',
            selectedIndex === index ? 'w-4 bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
          )}
          onClick={() => onDotClick(index)}
          aria-label={`Перейти к слайду ${index + 1}`}
        />
      ))}
    </div>
  )
}

export function TelegramChannelsBanner() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: false,
      containScroll: 'trimSnaps',
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  )

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi])

  return (
    <section className="w-full">
      <div className="overflow-hidden">
        <div className="embla mx-auto max-w-7xl" ref={emblaRef}>
          <div className="embla__container flex">
            {FEATURED_CHANNELS.map((channel) => (
              <div
                key={channel.id}
                className="embla__slide min-w-0 flex-[0_0_100%] px-[var(--container-padding)]"
              >
                <ChannelSlide channel={channel} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <CarouselDots
        slides={FEATURED_CHANNELS}
        selectedIndex={selectedIndex}
        onDotClick={scrollTo}
      />
    </section>
  )
}
