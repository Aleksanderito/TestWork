import type { TrainingEvent } from '../types'
import { StatusBadge } from './StatusBadge'

interface Props {
  events: TrainingEvent[]
  onOpen: (event: TrainingEvent) => void
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EventTable({ events, onOpen }: Props) {
  if (!events.length) {
    return <div className="empty">По выбранным условиям мероприятий нет.</div>
  }

  return (
    <div className="table-scroll">
      <table className="events-table">
        <thead>
          <tr>
            <th>Код</th>
            <th>Название</th>
            <th>Дата и время</th>
            <th>Статус</th>
            <th aria-label="Открыть" />
          </tr>
        </thead>
        <tbody>
          {events.map((item) => (
            <tr key={item.id} onClick={() => onOpen(item)} tabIndex={0} onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onOpen(item)
            }}>
              <td className="event-code">{item.code}</td>
              <td className="event-name">{item.title}</td>
              <td className="event-date">{formatDate(item.date)}</td>
              <td><StatusBadge status={item.status} /></td>
              <td className="row-arrow" aria-hidden="true">→</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
