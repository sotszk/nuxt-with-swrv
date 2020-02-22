export const state = () => ({
  counter: 0,
  storage: new Map(),
  ttl: 0,
})

export const mutations = {
  increment(state) {
    state.counter++
  },

  setData(state, { key, value }) {
    const item = {
      data: value,
      createdAt: Date.now(),
    }
    state.storage.set(key, item)
  },

  deleteData(state, key) {
    state.storage.delete(key)
  },

  setTimeToLive(state, ttl) {
    state.ttl = ttl
  },
}

export const actions = {
  shift({ commit, state }, ttl) {
    const timeToLive = ttl || state.ttl
    if (!timeToLive) {
      return
    }
    state.storage.forEach((value, key) => {
      if (value.createdAt < Date.now() - timeToLive) {
        console.log('deleted')
        commit('deleteData', key)
      }
    })
  },
}

export const getters = {
  double(state) {
    return state.counter * 2
  },

  getData(state) {
    return (key) => state.storage.get(key)
  },
}
