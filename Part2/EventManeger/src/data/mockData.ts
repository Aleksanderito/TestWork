import type { Learner, Responsible } from '../types'

export const learners: Learner[] = [
  {
    id: 1,
    code: 'EMP-001',
    fullName: 'Иванов Иван Сергеевич',
    position: 'Менеджер по продажам',
    department: 'Отдел продаж',
  },
  {
    id: 2,
    code: 'EMP-002',
    fullName: 'Петрова Анна Викторовна',
    position: 'Ведущий специалист',
    department: 'Отдел сопровождения',
  },
  {
    id: 3,
    code: 'EMP-003',
    fullName: 'Сидоров Максим Олегович',
    position: 'Инженер',
    department: 'Технический отдел',
  },
  {
    id: 4,
    code: 'EMP-004',
    fullName: 'Кузнецова Мария Андреевна',
    position: 'Аналитик',
    department: 'Отдел аналитики',
  },
  {
    id: 5,
    code: 'EMP-005',
    fullName: 'Смирнов Алексей Павлович',
    position: 'Руководитель группы',
    department: 'Проектный офис',
  },
]

export const responsibles: Responsible[] = [
  { id: 1, fullName: 'Соколова Екатерина Игоревна', position: 'Менеджер по обучению' },
  { id: 2, fullName: 'Волков Дмитрий Николаевич', position: 'Руководитель учебного центра' },
  { id: 3, fullName: 'Федорова Ольга Романовна', position: 'Бизнес-тренер' },
]
