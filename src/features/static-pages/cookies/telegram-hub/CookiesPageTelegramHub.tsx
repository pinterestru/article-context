import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/utils/cn'
import type { StaticPageProps } from '../../types'

export function CookiesPageTelegramHub({ className }: StaticPageProps) {
  const lastUpdated = "1 января 2024"
  
  return (
    <main className={cn('min-h-screen py-8 md:py-12', className)}>
      <Container>
        <article className="mx-auto max-w-4xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Политика использования файлов cookie
            </h1>
            <p className="text-sm text-muted-foreground">
              Последнее обновление: {lastUpdated}
            </p>
          </header>
          
          <div className="prose max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Что такое файлы cookie</h2>
              <div className="text-muted-foreground">
                <p>Файлы cookie — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении нашего каталога. Они помогают сайту работать эффективнее и запоминать ваши предпочтения.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Как мы используем cookie</h2>
              <div className="text-muted-foreground">
                <p>Мы используем файлы cookie для следующих целей:</p>
                <ul>
                  <li><strong>Необходимые cookie:</strong> Обеспечивают базовую функциональность сайта</li>
                  <li><strong>Аналитические cookie:</strong> Помогают понять, как посетители используют каталог</li>
                  <li><strong>Функциональные cookie:</strong> Сохраняют ваши предпочтения (язык, тема оформления)</li>
                  <li><strong>Производительность:</strong> Оптимизируют скорость загрузки страниц</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Сторонние сервисы</h2>
              <div className="text-muted-foreground">
                <p>Мы используем следующие сторонние сервисы, которые могут устанавливать свои cookie:</p>
                <ul>
                  <li><strong>Google Analytics:</strong> Для анализа посещаемости и поведения пользователей</li>
                  <li><strong>Яндекс.Метрика:</strong> Для детальной аналитики российской аудитории</li>
                  <li><strong>CloudFlare:</strong> Для защиты от DDoS-атак и ускорения загрузки</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Управление cookie</h2>
              <div className="text-muted-foreground">
                <p>Вы можете управлять файлами cookie через настройки вашего браузера:</p>
                <ul>
                  <li>Просматривать установленные cookie и удалять их</li>
                  <li>Блокировать cookie от определённых сайтов</li>
                  <li>Получать уведомления при установке новых cookie</li>
                  <li>Полностью отключить cookie (это может нарушить работу сайта)</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Отказ от cookie</h2>
              <div className="text-muted-foreground">
                <p>Вы можете отказаться от использования cookie, но это может повлиять на функциональность сайта. Некоторые функции, такие как сохранение предпочтений, могут стать недоступными.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Обновления политики</h2>
              <div className="text-muted-foreground">
                <p>Мы можем обновлять эту политику. Рекомендуем периодически проверять эту страницу для ознакомления с изменениями.</p>
              </div>
            </section>
          </div>
        </article>
      </Container>
    </main>
  )
}