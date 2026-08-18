import type { TrainingEvent } from '../types'

type NewEvent = Omit<TrainingEvent, 'id'>

export async function getEvents(): Promise<TrainingEvent[]> {
  const response = await fetch('/api/events')

  if (!response.ok) {
    throw new Error('Не удалось загрузить мероприятия')
  }

  return response.json()
}

export async function addEvent(event: NewEvent): Promise<TrainingEvent> {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || 'Не удалось сохранить мероприятие')
  }

  return response.json()
}
