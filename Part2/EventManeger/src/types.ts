export type EventStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'

export type Learner = {
  id: number
  code: string
  fullName: string
  position: string
  department: string
}

export type Responsible = {
  id: number
  fullName: string
  position: string
}

export type TrainingEvent = {
  id: number
  code: string
  title: string
  date: string
  status: EventStatus
  learners: Learner[]
  responsibles: Responsible[]
}
