const API_BASE = ''  // served from same origin

async function fetchReports() {
  const res = await fetch(`${API_BASE}/reports`)
  return res.json()
}

async function renderReports() { 
  const reports = await fetchReports()
  const container = document.getElementById('reports')
  container.innerHTML = ''

  reports.forEach(report => {
    const card = document.createElement('div')
    card.className = 'report-card'

    const details = document.createElement('div')
    details.className = 'report-details'
    details.innerHTML = `
      <p><strong>Report ID:</strong> ${report._id}</p>
      <p><strong>Post:</strong> ${report.post.description}</p>
      <p><strong>Reporter:</strong> ${report.reporter.firstName} ${report.reporter.lastName}</p>
      <p><strong>Reason:</strong> ${report.description}</p>
    `

    const actions = document.createElement('div')
    actions.className = 'report-actions'

    const admitBtn = document.createElement('button')
    admitBtn.className = 'admit-btn'
    admitBtn.textContent = 'Admit'
    admitBtn.onclick = () => handleAction(report._id, 'admit')

    const dismissBtn = document.createElement('button')
    dismissBtn.className = 'dismiss-btn'
    dismissBtn.textContent = 'Dismiss'
    dismissBtn.onclick = () => handleAction(report._id, 'dismiss')

    actions.append(admitBtn, dismissBtn)
    card.append(details, actions)
    container.appendChild(card)
  })
}

async function handleAction(reportId, action) {
  await fetch(`/reports/${reportId}/${action}`, { method: 'POST' })
  renderReports()
}

document.addEventListener('DOMContentLoaded', renderReports)
