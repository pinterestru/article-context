'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/shared/Button'

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    contact: '',
    comment: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (isSubmitted) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-6 text-white shadow-lg">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <span className="text-lg">✈️</span>
          </div>
          <h3 className="text-lg font-semibold">Заявка на продвижение канала</h3>
        </div>
        <div className="py-6 text-center">
          <div className="mb-3 text-2xl">🎉</div>
          <div className="mb-2 text-lg font-semibold">Заявка успешно отправлена!</div>
          <p className="text-sm text-white/80">
            Мы рассмотрим вашу заявку и свяжемся с вами в течение 24 часов.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-6 text-white shadow-lg">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-lg font-semibold">Заявка на продвижение канала</h3>
      </div>
      <div className="mb-4">
        <p className="text-sm leading-relaxed text-white/80">
          Поможем запустить рекламу, найти свою аудиторию и монетизировать канал
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="contact"
          type="text"
          placeholder="Контакт для связи"
          value={formData.contact}
          onChange={handleInputChange}
          className="border-white/25 bg-white/15 text-white placeholder:text-white/70 focus:border-white/40 focus:bg-white/20"
          required
        />

        <Textarea
          name="comment"
          placeholder="Расскажите о вашем канале и целях продвижения"
          value={formData.comment}
          onChange={handleInputChange}
          rows={3}
          className="resize-none border-white/25 bg-white/15 text-white placeholder:text-white/70 focus:border-white/40 focus:bg-white/20"
          required
        />

        <Button
          type="submit"
          className="w-full bg-white font-semibold text-blue-600 shadow-md hover:bg-white/90"
        >
          Отправить заявку
        </Button>
      </form>
    </div>
  )
}
