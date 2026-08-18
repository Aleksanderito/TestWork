import { createServer } from 'node:http'
import { readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataFile = join(__dirname, 'data', 'events.json')
const port = Number(process.env.PORT || 3000)

async function readEvents() {
  const content = await readFile(dataFile, 'utf8')
  return JSON.parse(content)
}

async function saveEvents(events) {
  const tempFile = `${dataFile}.tmp`
  await writeFile(tempFile, `${JSON.stringify(events, null, 2)}\n`, 'utf8')
  await rename(tempFile, dataFile)
}

function sendJson(response, status, data) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify(data))
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
      if (body.length > 1_000_000) {
        reject(new Error('Слишком большой запрос'))
        request.destroy()
      }
    })

    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch {
        reject(new Error('Некорректный JSON'))
      }
    })

    request.on('error', reject)
  })
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && request.url === '/api/events') {
      const events = await readEvents()
      sendJson(response, 200, events)
      return
    }

    if (request.method === 'POST' && request.url === '/api/events') {
      const event = await readBody(request)

      if (!event.code?.trim() || !event.title?.trim() || !event.date || !event.status) {
        sendJson(response, 400, { message: 'Не заполнены обязательные поля' })
        return
      }

      const events = await readEvents()
      const duplicate = events.some((item) => item.code.toLowerCase() === event.code.trim().toLowerCase())

      if (duplicate) {
        sendJson(response, 409, { message: 'Мероприятие с таким кодом уже существует' })
        return
      }

      const id = events.length ? Math.max(...events.map((item) => Number(item.id) || 0)) + 1 : 1
      const createdEvent = {
        id,
        code: event.code.trim(),
        title: event.title.trim(),
        date: event.date,
        status: event.status,
        learners: Array.isArray(event.learners) ? event.learners : [],
        responsibles: Array.isArray(event.responsibles) ? event.responsibles : [],
      }

      events.unshift(createdEvent)
      await saveEvents(events)

      sendJson(response, 201, createdEvent)
      return
    }

    sendJson(response, 404, { message: 'Маршрут не найден' })
  } catch (error) {
    console.error(error)
    sendJson(response, 500, { message: 'Ошибка при работе с файлом мероприятий' })
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Events API started on port ${port}`)
})
