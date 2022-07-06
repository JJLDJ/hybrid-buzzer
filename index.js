const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express();
const server = http.Server(app);
const io = socketio(server);

const title = 'Buffer Buzzer'

let data = {
  users: [],
  buzzes: [],
}

const getData = () => ({
  users: data.users,
  buzzes: data.buzzes.map(b => {
    const [ name, team, buzzTime, buzzTimeDisplay ] = b.split('-')
    return { name, team, buzzTime, buzzTimeDisplay }
  })
})

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => res.render('index', { title }))
app.get('/host', (req, res) => res.render('host', Object.assign({ title }, getData())))

io.on('connection', (socket) => {
  socket.on('join', (user) => {
    data.users.push(user.id)
    io.emit('active', data.users.length)
    console.log(`${user.name} joined!`)
  })

  socket.on('buzz', (user) => {
    // Dedupe filter by name & team.
    if (getData()
            .buzzes
            .filter(buzz => buzz.name == user.name && buzz.team == user.team)
            .length > 0) {
      console.log(`${user.name} buzzed in! (but was de-dupe filtered)`)
      return;
    }

    let buzzTime = new Date().valueOf()
    let firstBuzzTime = data.buzzes.length ? getData().buzzes[0].buzzTime : buzzTime

    let buzzTimeDisplay =
      `(+${Math.round((parseInt(buzzTime) - parseInt(firstBuzzTime)) / 10) / 100} s)`

    data.buzzes.push(`${user.name}-${user.team}-${buzzTime}-${buzzTimeDisplay}`)
    io.emit('buzzes', data.buzzes)
    console.log(`${user.name} buzzed in!`)
  })

  socket.on('clear', () => {
    data.buzzes = []
    io.emit('buzzes', data.buzzes)
    console.log(`Clear buzzes`)
  })
})

server.listen(8090, () => console.log('Listening on 8090'))
