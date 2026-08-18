import type { TrainingEvent } from '../types'
import { Modal } from './Modal'
import { StatusBadge } from './StatusBadge'

interface Props {
  event: TrainingEvent
  onClose: () => void
}

export function EventModal({ event, onClose }: Props) {
  return (
    <Modal title={event.title} onClose={onClose} wide>
      <div className="event-info">
        <div><span>Код</span><b>{event.code}</b></div>
        <div><span>Дата</span><b>{new Date(event.date).toLocaleString('ru-RU')}</b></div>
        <div><span>Статус</span><StatusBadge status={event.status} /></div>
      </div>

      <h3>Обучающиеся</h3>
      <div className="table-scroll">
        <table className="people-table">
          <thead>
            <tr>
              <th>Код</th>
              <th>ФИО</th>
              <th>Должность</th>
              <th>Подразделение</th>
            </tr>
          </thead>
          <tbody>
            {event.learners.map((person) => (
              <tr key={person.id}>
                <td>{person.code}</td>
                <td>{person.fullName}</td>
                <td>{person.position}</td>
                <td>{person.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Ответственные</h3>
      {event.responsibles.length ? (
        <ul className="responsible-list">
          {event.responsibles.map((person) => (
            <li key={person.id}>
              <b>{person.fullName}</b>
              <span>{person.position}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Ответственные не указаны.</p>
      )}
    </Modal>
  )
}
