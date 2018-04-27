const unlocker = (() => {
  // inject a raw script into page,
  // because content_script's access to BOM is restricted by Chrome
  // see: https://developer.chrome.com/extensions/content_scripts#isolated_world
  function agent() {
    let isUnlockingCached = false
    const isUnlocking = () => isUnlockingCached
    document.addEventListener('allow_copy', event => {
      const { unlock } = event.detail
      isUnlockingCached = unlock
    })

    // some events are JUST for copy/cut/paste, we should protect them
    const directCopyEvents = ['copy', 'cut', 'contextmenu', 'selectstart']
    const rejectOtherHandlers = e => {
      if (isUnlocking()) {
        e.stopPropagation()
        if (e.stopImmediatePropagation) e.stopImmediatePropagation()
      }
    }
    directCopyEvents.forEach(evt => {
      document.documentElement.addEventListener(evt, rejectOtherHandlers, {
        capture: true,
      })
    })

    // some events are LIKELY to be used for copy/cut/paste, we should also protect them
    const indirectCopyEvents = [
      'mousedown',
      'mouseup',
      'mousemove',
      'keydown',
      'keypress',
      'keyup',
    ]
    const oldPrevent = Event.prototype.preventDefault
    Event.prototype.preventDefault = function() {
      if (isUnlocking() && indirectCopyEvents.includes(this.type)) {
        // do nothing, prevent it from preventDefault()
      } else {
        oldPrevent.apply(this, arguments)
      }
    }
  }

  const JS_ELEM_ID = 'allow-copy_script'
  const injectAgent = () => {
    const script = document.createElement('SCRIPT')
    script.id = JS_ELEM_ID
    script.textContent = `(${agent})()`
    document.documentElement.append(script)
  }
  const enableAgent = () => {
    const event = new CustomEvent('allow_copy', { detail: { unlock: true } })
    document.dispatchEvent(event)
  }
  const disableAgent = () => {
    const event = new CustomEvent('allow_copy', { detail: { unlock: false } })
    document.dispatchEvent(event)
  }

  const CSS_ELEM_ID = 'allow-copy_style'
  const addCss = () => {
    removeCss()
    const style = document.createElement('STYLE')
    style.id = CSS_ELEM_ID
    style.innerHTML =
      ' html,body,*,*::before,*::after { -webkit-user-select: initial !important; user-select: initial !important; } '
    document.documentElement.append(style)
  }
  const removeCss = () => {
    const style = document.getElementById(CSS_ELEM_ID)
    if (style) {
      style.remove()
    }
  }

  injectAgent()

  return {
    enable() {
      enableAgent()
      addCss()
    },
    disable() {
      disableAgent()
      removeCss()
    },
  }
})()
