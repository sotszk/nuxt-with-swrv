import { getCurrentInstance, set } from '@vue/composition-api'

export const useStoreCache = () => {
  const vm = getCurrentInstance()

  const storeCacheStorage = {
    get() {
      return vm.$store.state.storage
    },
    set(key, value) {
      vm.$store.commit('setData', {
        key,
        value,
      })
    },
  }
  return storeCacheStorage
}
