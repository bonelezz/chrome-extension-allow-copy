const configManager = (() => {
  const get = key => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([key], result => resolve(result[key]))
    })
  }

  const set = (key, value) => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [key]: value }, resolve)
    })
  }

  const getDefaultConfig = () => ({
    unlock: false,
  })

  const getSiteConfig = async ({ origin }) => {
    if (!origin) return {}
    const siteConfig = (await get(origin)) || {}
    return {
      ...getDefaultConfig(),
      ...siteConfig,
    }
  }

  const setSiteConfig = async ({ origin, config }) => {
    if (!origin) {
      throw new Error('origin is required')
    } else {
      await set(origin, config)
    }
  }

  return { getSiteConfig, setSiteConfig }
})()
