import { useEffect, useMemo, useState } from 'react'
import { addEvent, getEvents } from './api/events'
import { CreateEventModal } from './components/CreateEventModal'
import { EventModal } from './components/EventModal'
import { EventTable } from './components/EventTable'
import type { EventStatus, TrainingEvent } from './types'

export default function App() {
  const [events, setEvents] = useState<TrainingEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<TrainingEvent | null>(null)
  const [createOpened, setCreateOpened] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | EventStatus>('all')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    try {
      setLoading(true)
      setLoadError('')
      const data = await getEvents()
      setEvents(data)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить мероприятия')
    } finally {
      setLoading(false)
    }
  }

  const visibleEvents = useMemo(() => {
    const text = search.trim().toLowerCase()

    return events.filter((item) => {
      const byText = !text || item.code.toLowerCase().includes(text) || item.title.toLowerCase().includes(text)
      const byStatus = status === 'all' || item.status === status
      return byText && byStatus
    })
  }, [events, search, status])

  async function createEvent(data: Omit<TrainingEvent, 'id'>) {
    const createdEvent = await addEvent(data)
    setEvents((current) => [createdEvent, ...current])
    setCreateOpened(false)
  }

  function showStatus(value: EventStatus) {
    setStatus(value)
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })
  }

  const plannedCount = events.filter((item) => item.status === 'planned').length
  const inProgressCount = events.filter((item) => item.status === 'in_progress').length
  const completedCount = events.filter((item) => item.status === 'completed').length

  return (
    <>
      <section className="hero">
        <div className="hero-pattern" aria-hidden="true" />

        <header className="hero-header container">
          <div className="brand" aria-label="Event Control">
            <span className="brand-sign" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="brand-text">
              <strong>EVENT CONTROL</strong>
              <small>учебный центр</small>
            </span>
          </div>

          <nav className="top-nav" aria-label="Основная навигация">
            <a href="#events" className="active">Мероприятия</a>
            <span>Обучающиеся</span>
            <span>Ответственные</span>
          </nav>

          <span className="language">RU</span>
        </header>

        <div className="hero-content container">
          <p className="hero-kicker">Система управления обучением</p>
          <h1>Учебные<br />мероприятия</h1>
          <p className="hero-description">
            Планируйте обучение сотрудников, назначайте участников и следите за статусом мероприятий.
          </p>

          <button className="hero-create" type="button" onClick={() => setCreateOpened(true)}>
            Создать мероприятие <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="hero-links container">
          <button type="button" onClick={() => showStatus('planned')}>
            <span className="hero-link-title">Ближайшие</span>
            <span className="hero-link-meta">{plannedCount} запланировано</span>
            <span className="hero-link-arrow">→</span>
          </button>
          <button type="button" onClick={() => showStatus('in_progress')}>
            <span className="hero-link-title">Идут сейчас</span>
            <span className="hero-link-meta">{inProgressCount} в процессе</span>
            <span className="hero-link-arrow">→</span>
          </button>
          <button type="button" onClick={() => showStatus('completed')}>
            <span className="hero-link-title">Завершённые</span>
            <span className="hero-link-meta">{completedCount} завершено</span>
            <span className="hero-link-arrow">→</span>
          </button>
        </div>
      </section>

      <main className="container events-section" id="events">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Расписание</span>
            <h2>Мероприятия</h2>
          </div>
          <div className="event-counter">
            <strong>{visibleEvents.length}</strong>
            <span>из {events.length}</span>
          </div>
        </div>

        <div className="filters">
          <label className="search-field">
            <span className="search-icon" aria-hidden="true" />
            <input
              type="search"
              aria-label="Поиск мероприятий"
              placeholder="Поиск по коду или названию"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <select
            aria-label="Фильтр по статусу"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | EventStatus)}
          >
            <option value="all">Все статусы</option>
            <option value="planned">Запланировано</option>
            <option value="in_progress">Идет сейчас</option>
            <option value="completed">Завершено</option>
            <option value="cancelled">Отменено</option>
          </select>

          <button className="primary desktop-create" type="button" onClick={() => setCreateOpened(true)}>
            + Новое мероприятие
          </button>
        </div>

        <section className="card">
          {loading && <div className="data-message">Загрузка мероприятий...</div>}

          {!loading && loadError && (
            <div className="data-message data-error">
              <span>{loadError}</span>
              <button className="secondary" type="button" onClick={loadEvents}>Повторить</button>
            </div>
          )}

          {!loading && !loadError && (
            <EventTable events={visibleEvents} onOpen={setSelectedEvent} />
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>Event Control</span>
          <span>Учебные мероприятия</span>
        </div>
      </footer>

      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      {createOpened && (
        <CreateEventModal
          existingCodes={events.map((item) => item.code)}
          onCreate={createEvent}
          onClose={() => setCreateOpened(false)}
        />
      )}
    </>
  )
}
