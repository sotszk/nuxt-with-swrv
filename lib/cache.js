class DataCache {
  constructor(ttl = 0) {
    this.items = new Map()
    this.ttl = ttl
  }

  get(key, ttl) {
    this.shift(ttl)
    return this.items.get(key)
  }

  set(key, value) {
    const item = {
      data: value,
      createdAt: Date.now(),
    }
    this.items.set(key, item)
  }

  delete(key) {
    this.items.delete(key)
  }

  shift(ttl) {
    const timeToLive = ttl || this.ttl
    if (!timeToLive) {
      return
    }

    this.items.forEach((value, key) => {
      if (value.createdAt < Date.now - timeToLive) {
        this.items.delete(key)
      }
    })
  }
}

export default DataCache
