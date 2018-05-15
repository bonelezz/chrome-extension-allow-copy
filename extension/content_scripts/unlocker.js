const unlocker = (() => {
  // a raw script to be into page,
  // because content_script's access to BOM is restricted by Chrome
  // see: https://developer.chrome.com/extensions/content_scripts#isolated_world
  function agent() {
    let isUnlockingCached = false
    const isUnlocking = () => isUnlockingCached
    document.addEventListener('allow_copy', event => {
      const { unlock } = event.detail
      isUnlockingCached = unlock
    })

    const copyEvents = [
      'copy',
      'cut',
      'contextmenu',
      'selectstart',
      'mousedown',
      'mouseup',
      'mousemove',
      'keydown',
      'keypress',
      'keyup',
    ]
    const rejectOtherHandlers = e => {
      if (isUnlocking()) {
        e.stopPropagation()
        if (e.stopImmediatePropagation) e.stopImmediatePropagation()
      }
    }
    copyEvents.forEach(evt => {
      document.documentElement.addEventListener(evt, rejectOtherHandlers, {
        capture: true,
      })
    })
  }

  const logger = {
    log(...args) {
      // return console.log(...args)
    },
    error(...args) {
      // return console.error(...args)
    },
  }

  const JS_ELEM_ID = 'allow-copy_script'
  const injectAgent = (wnd = window.top) => {
    try {
      const doc = wnd.document
      if (!doc.getElementById(JS_ELEM_ID)) {
        const script = doc.createElement('SCRIPT')
        script.id = JS_ELEM_ID
        script.textContent = `(${agent})()`
        doc.documentElement.append(script)
      }
    } catch (error) {
      logger.error('[simple allow copy] cannot inject agent', error)
    }
  }

  const enableAgent = (wnd = window.top) => {
    try {
      const event = new CustomEvent('allow_copy', { detail: { unlock: true } })
      wnd.document.dispatchEvent(event)
    } catch (error) {
      logger.error('[simple allow copy] cannot enable agent', error)
    }
  }
  const disableAgent = (wnd = window.top) => {
    try {
      const event = new CustomEvent('allow_copy', { detail: { unlock: false } })
      wnd.document.dispatchEvent(event)
    } catch (error) {
      logger.error('[simple allow copy] cannot disable agent', error)
    }
  }

  const CSS_ELEM_ID = 'allow-copy_style'
  const addCss = (wnd = window.top) => {
    try {
      const doc = wnd.document
      removeCss(wnd)
      const style = doc.createElement('STYLE')
      style.id = CSS_ELEM_ID
      style.innerHTML =
        ' html,body,*,*::before,*::after { -webkit-user-select: initial !important; user-select: initial !important; } '
      doc.documentElement.append(style)
    } catch (error) {
      logger.error('[simple allow copy] cannot add css', error)
    }
  }
  const removeCss = (wnd = window.top) => {
    try {
      const style = wnd.document.getElementById(CSS_ELEM_ID)
      if (style) {
        style.remove()
      }
    } catch (error) {
      logger.error('[simple allow copy] cannot remove css', error)
    }
  }

  const getFrameWindows = (wnd = window) => {
    try {
      const doc = wnd.document
      const iframes = [].slice.apply(doc.getElementsByTagName('iframe'))
      return [].concat(
        wnd,
        ...iframes
          .map(iframe => iframe.contentWindow)
          .map(childWnd => getFrameWindows(childWnd))
      )
    } catch (error) {
      logger.error('[simple allow copy] cannot get frame window', error)
      return [wnd]
    }
  }

  let wnds = []
  let isEnabled = false

  const enable = () => {
    isEnabled = true
    wnds.forEach(wnd => {
      enableAgent(wnd)
      addCss(wnd)
    })
  }
  const disable = () => {
    isEnabled = false
    wnds.forEach(wnd => {
      disableAgent(wnd)
      removeCss(wnd)
    })
  }

  if (isEnabled) {
    enable()
  } else {
    disable()
  }

  const initForFrames = () => {
    wnds = getFrameWindows()
    logger.log('windows ', wnds)
    wnds.forEach(wnd => injectAgent(wnd))
    if (isEnabled) {
      enable()
    } else {
      disable()
    }
  }

  initForFrames()
  ;[1000, 3000, 5000, 10000].forEach(delay => {
    setTimeout(initForFrames, delay)
  })

  return {
    enable,
    disable,
  }
})()
