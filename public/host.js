const socket = io()
const body = document.querySelector('#js-body')
const active = document.querySelector('.js-active')
const buzzList = document.querySelector('.js-buzzes')
const clear = document.querySelector('.js-clear')

socket.on('active', (numberActive) => {
  active.innerText = `${numberActive} joined`
})

socket.on('buzzes', (buzzes) => {
  if (buzzes.length) {
    body.classList.add(`winner-${buzzes[0].split('-')[1].toLowerCase()}`)
  }

  buzzList.innerHTML = buzzes
    .map(buzz => {
      const p = buzz.split('-')
      return { name: p[0], team: p[1], buzzTime: p[2], buzzTimeDisplay: p[3] }
    })
    .map(user =>
      `<li><b>${user.name}</b> on <b>Team ${user.team}</b> <span class='buzz-time'>${user.buzzTimeDisplay}</span></li>`)
    .join('')
})

clear.addEventListener('click', () => {
  socket.emit('clear')
  body.className = ''
})

