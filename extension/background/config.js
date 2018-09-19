const configManager = (() => {
  const get = key => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], result => resolve(result[key]))
    })
  }

  const set = (key, value) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, resolve)
    })
  }

  const remove = key => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, resolve)
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
      if (config.unlock) {
        await set(origin, config)
      } else {
        await remove(origin)
      }
    }
  }

  return { getSiteConfig, setSiteConfig }
})()
