import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/utils/cn'
import type { StaticPageProps } from '../../types'

export function PrivacyPageTelegramHub({ className }: StaticPageProps) {
  const lastUpdated = "1 января 2024"
  
  return (
    <main className={cn('min-h-screen py-8 md:py-12', className)}>
      <Container>
        <article className="mx-auto max-w-4xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Политика конфиденциальности
            </h1>
            <p className="text-sm text-muted-foreground">
              Последнее обновление: {lastUpdated}
            </p>
          </header>
          
          <div className="prose max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Информация, которую мы собираем</h2>
              <div className="text-muted-foreground">
                <p>Мы собираем информацию, которую вы предоставляете нам напрямую при использовании каталога Telegram-каналов.</p>
                <ul>
                  <li><strong>Информация о просмотрах:</strong> Мы отслеживаем, какие категории и каналы вы просматриваете для улучшения рекомендаций.</li>
                  <li><strong>Данные об устройстве:</strong> Базовая информация о вашем устройстве для корректного отображения сайта.</li>
                  <li><strong>Файлы cookie:</strong> Используются для сохранения ваших предпочтений и улучшения работы сайта.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Как мы используем информацию</h2>
              <div className="text-muted-foreground">
                <p>Собранная информация используется для:</p>
                <ul>
                  <li>Предоставления актуального каталога образовательных каналов</li>
                  <li>Улучшения структуры и навигации по каталогу</li>
                  <li>Анализа популярности различных категорий контента</li>
                  <li>Обеспечения корректной работы сайта на разных устройствах</li>
                  <li>Защиты от спама и злоупотреблений</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Передача информации третьим лицам</h2>
              <div className="text-muted-foreground">
                <p>Мы не продаем и не передаем вашу личную информацию третьим лицам. Исключения:</p>
                <ul>
                  <li><strong>С вашего согласия:</strong> Только с вашего явного разрешения.</li>
                  <li><strong>По требованию закона:</strong> В случае официальных запросов от государственных органов.</li>
                  <li><strong>Аналитические сервисы:</strong> Мы используем Google Analytics для анализа трафика (данные анонимизированы).</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Безопасность данных</h2>
              <div className="text-muted-foreground">
                <p>Мы применяем современные методы защиты данных, включая SSL-шифрование. Однако помните, что ни один метод передачи данных через интернет не является абсолютно безопасным.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Ваши права</h2>
              <div className="text-muted-foreground">
                <p>Вы имеете право:</p>
                <ul>
                  <li>Запросить информацию о собранных данных</li>
                  <li>Потребовать удаления ваших данных</li>
                  <li>Отказаться от сбора аналитической информации</li>
                  <li>Управлять настройками файлов cookie в вашем браузере</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Связь с нами</h2>
              <div className="text-muted-foreground">
                <p>По всем вопросам, связанным с конфиденциальностью, вы можете связаться с нами через форму обратной связи на сайте.</p>
              </div>
            </section>
          </div>
        </article>
      </Container>
    </main>
  )
}