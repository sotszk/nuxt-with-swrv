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
    console.log('set')
  }

  delete(key) {
    console.log('deleted')
    this.items.delete(key)
  }

  shift(ttl) {
    const timeToLive = ttl || this.ttl
    console.log(timeToLive)
    if (!timeToLive) {
      return
    }

    console.log(this.items.size)
    this.items.forEach((value, key) => {
      console.log('??', value.createdAt < Date.now() - timeToLive)
      if (value.createdAt < Date.now() - timeToLive) {
        this.items.delete(key)
      }
    })
  }
}

export default DataCache
