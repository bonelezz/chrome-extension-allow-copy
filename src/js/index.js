// unblock copy-relevant events
const events = [
  'copy',
  'cut',
  'contextmenu',
  'selectstart',
  'dragstart',
  'drag',
  'dragend',
  'mousedown'
]
events.forEach(evt =>
  document.documentElement.addEventListener(evt, e => e.stopPropagation(), {
    capture: true
  })
)

// unblock keypress events
const keyEvents = ['keydown', 'keypress', 'keyup']
keyEvents.forEach(evt =>
  document.documentElement.addEventListener(
    evt,
    e => (e.ctrlKey || e.metaKey || e.key === 'F12') && e.stopPropagation(),
    {
      capture: true
    }
  )
)

// allow select in css
const style = document.createElement('STYLE')
style.innerHTML = ' * { user-select: initial !important; } '
document.head.append(style)
