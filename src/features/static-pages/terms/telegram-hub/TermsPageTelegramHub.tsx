import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/utils/cn'
import type { StaticPageProps } from '../../types'

export function TermsPageTelegramHub({ className }: StaticPageProps) {
  const lastUpdated = "1 января 2024"
  
  return (
    <main className={cn('min-h-screen py-8 md:py-12', className)}>
      <Container>
        <article className="mx-auto max-w-4xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Условия использования
            </h1>
            <p className="text-sm text-muted-foreground">
              Последнее обновление: {lastUpdated}
            </p>
          </header>
          
          <div className="prose max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Принятие условий</h2>
              <div className="text-muted-foreground">
                <p>Используя наш каталог Telegram-каналов, вы соглашаетесь с настоящими условиями использования. Если вы не согласны с какими-либо условиями, пожалуйста, воздержитесь от использования сайта.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Описание сервиса</h2>
              <div className="text-muted-foreground">
                <p>Наш сайт предоставляет курируемый каталог образовательных Telegram-каналов. Мы не являемся владельцами представленных каналов и не несём ответственности за их контент.</p>
                <ul>
                  <li>Каталог носит исключительно информационный характер</li>
                  <li>Мы не гарантируем доступность или качество контента в каналах</li>
                  <li>Все каналы принадлежат их создателям</li>
                  <li>Мы оставляем за собой право удалять каналы из каталога</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Правила использования</h2>
              <div className="text-muted-foreground">
                <p>При использовании нашего сервиса вы обязуетесь:</p>
                <ul>
                  <li>Не использовать автоматизированные средства для сбора информации</li>
                  <li>Не пытаться получить несанкционированный доступ к сайту</li>
                  <li>Не размещать вредоносное ПО или спам</li>
                  <li>Уважать авторские права владельцев каналов</li>
                  <li>Использовать сервис только в законных целях</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Интеллектуальная собственность</h2>
              <div className="text-muted-foreground">
                <p>Дизайн сайта, логотип и структура каталога являются нашей интеллектуальной собственностью. Контент Telegram-каналов принадлежит их создателям. Telegram является зарегистрированным товарным знаком Telegram Messenger LLP.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Отказ от ответственности</h2>
              <div className="text-muted-foreground">
                <p>Сервис предоставляется «как есть». Мы не даём никаких гарантий относительно точности, полноты или актуальности информации. Мы не несём ответственности за контент в Telegram-каналах или последствия его использования.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Изменения условий</h2>
              <div className="text-muted-foreground">
                <p>Мы оставляем за собой право изменять эти условия в любое время. Продолжая использовать сайт после внесения изменений, вы соглашаетесь с обновлёнными условиями.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Применимое право</h2>
              <div className="text-muted-foreground">
                <p>Настоящие условия регулируются законодательством Российской Федерации. Все споры решаются в соответствии с действующим законодательством РФ.</p>
              </div>
            </section>
          </div>
        </article>
      </Container>
    </main>
  )
}