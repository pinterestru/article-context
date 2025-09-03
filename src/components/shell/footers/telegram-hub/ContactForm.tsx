'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/shared/Button'

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    contact: '',
    comment: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (isSubmitted) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">✈️</span>
          </div>
          <h3 className="text-lg font-semibold">
            Заявка на продвижение канала
          </h3>
        </div>
        <div className="text-center py-6">
          <div className="text-2xl mb-3">🎉</div>
          <div className="text-lg font-semibold mb-2">
            Заявка успешно отправлена!
          </div>
          <p className="text-white/80 text-sm">
            Мы рассмотрим вашу заявку и свяжемся с вами в течение 24 часов.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-6 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold">
          Заявка на продвижение канала
        </h3>
      </div>
      <div className="mb-4">
        <p className="text-sm text-white/80 leading-relaxed">
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
          className="bg-white/15 border-white/25 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/40"
          required
        />
        
        <Textarea
          name="comment"
          placeholder="Расскажите о вашем канале и целях продвижения"
          value={formData.comment}
          onChange={handleInputChange}
          rows={3}
          className="bg-white/15 border-white/25 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/40 resize-none"
          required
        />
        
        <Button
          type="submit"
          className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold shadow-md"
        >
          Отправить заявку
        </Button>
      </form>
    </div>
  )
}