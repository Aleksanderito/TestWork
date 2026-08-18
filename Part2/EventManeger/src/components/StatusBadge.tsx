import type { EventStatus } from '../types'

const labels: Record<EventStatus, string> = {
  planned: 'Запланировано',
  in_progress: 'Идет сейчас',
  completed: 'Завершено',
  cancelled: 'Отменено',
}

export function StatusBadge({ status }: { status: EventStatus }) {
  return <span className={`status status-${status}`}>{labels[status]}</span>
}

export { labels as statusLabels }
