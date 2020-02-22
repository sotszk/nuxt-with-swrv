class LocalStorageCache {
  constructor() {
    this.STORAGE_KEY = 'nuxt-with-swrv'
  }

  encode(storage) {
    return btoa(JSON.stringify(storage))
  }

  decode(storage) {
    return JSON.parse(atob(storage))
  }

  get(key) {
    const item = localStorage.getItem(this.STORAGE_KEY)
    if (item) {
      return JSON.parse(atob(item))[key]
    }
  }

  set(key, value) {
    console.log(value)
    let payload = {}
    const storage = localStorage.getItem(this.STORAGE_KEY)
    if (storage) {
      payload = this.decode(storage)
      payload[key] = { data: value }
    } else {
      payload = { [key]: { data: value } }
    }
    localStorage.setItem(this.STORAGE_KEY, this.encode(payload))
  }
}

export default LocalStorageCache
