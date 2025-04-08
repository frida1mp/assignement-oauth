await import('../socket.io/socket.io.js')

const taskTemplate = document.querySelector('#issue-template')
const issueList = document.querySelector('#issue-list')
console.log('list', issueList)
const baseURL = location.pathname
console.log('url', baseURL)

// If taskTemplate is not present on the page, write an error message.
console.assert(taskTemplate, 'Could not find "#issue-template" template element.')

const HOST = location.origin.replace(/^http/, 'ws') + '/issues-app/socket.io'
const socket = new WebSocket(HOST)
console.log('socket', socket)

// ----------------------------------------------------------------------------
// Event handlers.
//

// Connection closed.
socket.addEventListener('close', (event) => {
  console.info('close', event)
})

// Connection error.
socket.addEventListener('error', (event) => {
  console.error('error', event)
})

// Listen for messages.
socket.addEventListener('message', (event) => {
  console.log('socket messagesss', event.data)
  const { type, data } = JSON.parse(event.data)
  console.log('type?', type)
  if (type === 'issues/create') {
    console.log('create triggered')
    insertTaskRow(data)
    console.log('did insert run')
  } else if (type === 'issue/update') {
    console.log('update triggered', data)
    updateTaskRow(data)
  }
})

// Connection opened.
socket.addEventListener('open', (event) => {
  console.info('open', event)
  console.log('open socket')
})

// ----------------------------------------------------------------------------
// Helpers.
//

/**
 * Inserts a task row at the end of the task table.
 *
 * @param {object} issue - The task to add.
 */
function insertTaskRow(issue) {
  console.log('inside inserting', issue)
  const taskList = document.querySelector('#issue-list')

  // Do nothing if the task's already in the list.
  if (taskList.querySelector(`[data-id="${issue.id}"]`)) {
    return
  }

  // Ensure the task template is found
  const taskTemplate = document.querySelector('#issue-template')
  if (!taskTemplate) {
    console.error('#task-template element not found');
    return;
  }

  // Add the task to the list.
  const taskNode = taskTemplate.content.cloneNode(true)

  const taskRow = taskNode.querySelector('tr')
  const avatarImg = taskRow.querySelector('img')
  const doneCheck = taskNode.querySelector('input[type=checkbox]')
  const titleCell = taskRow.querySelector('td:nth-child(3)');
  const descriptionCell = taskNode.querySelector('td:nth-child(4)')
  console.log('des', descriptionCell)
  const [updateLink, deleteLink] = taskNode.querySelectorAll('a')

  taskRow.setAttribute('data-id', issue.id)

  if (issue.state === 'closed') {
    doneCheck.setAttribute('checked', '')
    descriptionCell.classList.add('text-muted')
  } else {
    doneCheck.removeAttribute('checked')
    descriptionCell.classList.remove('text-muted')
  }
  avatarImg.src = issue.avatar
  titleCell.textContent = issue.title
  descriptionCell.textContent = issue.description

  updateLink.href = `./issues/${issue.id}/update`
  deleteLink.href = `./issues/${issue.id}/delete`

  console.log('nnode', taskNode)

  taskList.appendChild(taskNode)
  console.log('Task added to the list');
}

/**
 * Updates a task row in the task table.
 *
 * @param {object} issue - The updated task data.
 */
function updateTaskRow(issue) {
  console.log('inside update task row', issue)

  const existingTaskRow = document.querySelector(`[data-unique-id="${issue.iid}"]`)
  console.log('existing task:', existingTaskRow)
  if (existingTaskRow) {
    console.log('exist')
    const titleCell = existingTaskRow.querySelector('td:nth-child(3)')
    const descriptionCell = existingTaskRow.querySelector('td:nth-child(4)')
    const doneCheck = existingTaskRow.querySelector('input[type=checkbox]')

    if (issue.state === 'closed') {
      doneCheck.checked = true
    } else {
      doneCheck.checked = false
    }

    titleCell.textContent = issue.title
    descriptionCell.textContent = issue.description
    console.log('de2', descriptionCell.textContent)
  }
}
