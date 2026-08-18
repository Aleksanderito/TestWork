import { useState, type FormEvent } from 'react'
import { learners, responsibles } from '../data/mockData'
import type { EventStatus, TrainingEvent } from '../types'
import { Modal } from './Modal'
import { statusLabels } from './StatusBadge'

interface Props {
  existingCodes: string[]
  onClose: () => void
  onCreate: (event: Omit<TrainingEvent, 'id'>) => Promise<void>
}

type Errors = {
  code?: string
  title?: string
  date?: string
  submit?: string
}

export function CreateEventModal({ existingCodes, onClose, onCreate }: Props) {
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<EventStatus>('planned')
  const [learnerIds, setLearnerIds] = useState<number[]>([])
  const [responsibleIds, setResponsibleIds] = useState<number[]>([])
  const [learnerToAdd, setLearnerToAdd] = useState('')
  const [responsibleToAdd, setResponsibleToAdd] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  function addLearner() {
    const id = Number(learnerToAdd)
    if (id && !learnerIds.includes(id)) {
      setLearnerIds([...learnerIds, id])
      setLearnerToAdd('')
    }
  }

  function addResponsible() {
    const id = Number(responsibleToAdd)
    if (id && !responsibleIds.includes(id)) {
      setResponsibleIds([...responsibleIds, id])
      setResponsibleToAdd('')
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()

    const nextErrors: Errors = {}
    const preparedCode = code.trim()

    if (!preparedCode) {
      nextErrors.code = 'Введите код'
    } else if (existingCodes.some((item) => item.toLowerCase() === preparedCode.toLowerCase())) {
      nextErrors.code = 'Такой код уже есть'
    }

    if (!title.trim()) nextErrors.title = 'Введите название'
    if (!date) nextErrors.date = 'Выберите дату'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      setSaving(true)
      await onCreate({
        code: preparedCode,
        title: title.trim(),
        date,
        status,
        learners: learners.filter((person) => learnerIds.includes(person.id)),
        responsibles: responsibles.filter((person) => responsibleIds.includes(person.id)),
      })
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Не удалось сохранить мероприятие' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Новое мероприятие" onClose={onClose} wide>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>
            Код мероприятия *
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="TRN-105" />
            {errors.code && <small className="error">{errors.code}</small>}
          </label>

          <label>
            Название *
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            {errors.title && <small className="error">{errors.title}</small>}
          </label>

          <label>
            Дата и время *
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            {errors.date && <small className="error">{errors.date}</small>}
          </label>

          <label>
            Статус *
            <select value={status} onChange={(e) => setStatus(e.target.value as EventStatus)}>
              {(Object.keys(statusLabels) as EventStatus[]).map((value) => (
                <option key={value} value={value}>{statusLabels[value]}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="picker-section">
          <h3>Обучающиеся</h3>
          <div className="picker">
            <select value={learnerToAdd} onChange={(e) => setLearnerToAdd(e.target.value)}>
              <option value="">Выберите сотрудника</option>
              {learners
                .filter((person) => !learnerIds.includes(person.id))
                .map((person) => <option key={person.id} value={person.id}>{person.fullName}</option>)}
            </select>
            <button type="button" className="secondary" onClick={addLearner}>Добавить</button>
          </div>

          {learnerIds.length > 0 && (
            <ul className="selected-list">
              {learners.filter((person) => learnerIds.includes(person.id)).map((person) => (
                <li key={person.id}>
                  <span>{person.fullName}</span>
                  <button type="button" onClick={() => setLearnerIds(learnerIds.filter((id) => id !== person.id))}>
                    удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="picker-section">
          <h3>Ответственные</h3>
          <div className="picker">
            <select value={responsibleToAdd} onChange={(e) => setResponsibleToAdd(e.target.value)}>
              <option value="">Выберите ответственного</option>
              {responsibles
                .filter((person) => !responsibleIds.includes(person.id))
                .map((person) => <option key={person.id} value={person.id}>{person.fullName}</option>)}
            </select>
            <button type="button" className="secondary" onClick={addResponsible}>Добавить</button>
          </div>

          {responsibleIds.length > 0 && (
            <ul className="selected-list">
              {responsibles.filter((person) => responsibleIds.includes(person.id)).map((person) => (
                <li key={person.id}>
                  <span>{person.fullName}</span>
                  <button type="button" onClick={() => setResponsibleIds(responsibleIds.filter((id) => id !== person.id))}>
                    удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {errors.submit && <p className="form-submit-error">{errors.submit}</p>}

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose} disabled={saving}>Отмена</button>
          <button type="submit" className="primary" disabled={saving}>{saving ? 'Сохранение...' : 'Создать'}</button>
        </div>
      </form>
    </Modal>
  )
}
