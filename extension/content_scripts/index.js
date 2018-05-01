const content_scripts = (() => {
  let activeConfig = {}

  const applyConfig = config => {
    const { unlock } = config
    if (unlock) {
      unlocker.enable()
    } else {
      unlocker.disable()
    }
    proxy.invoke('setSiteConfig', { origin: location.origin, config })
  }

  proxy.on('toggle', () => {
    activeConfig.unlock = !activeConfig.unlock
    applyConfig(activeConfig)
  })

  proxy.invoke('getSiteConfig', { origin: location.origin }).then(config => {
    activeConfig = config
    applyConfig(config)
  })
})()
