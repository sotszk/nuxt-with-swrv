import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  toRefs,
  onServerPrefetch,
  getCurrentInstance,
  reactive,
  onUpdated,
} from '@vue/composition-api'

import DataCache from '@/lib/cache'
import LocalStorageCache from '@/lib/local-storage-cache'

const isDocumentVisible = () => {
  if (
    typeof document !== 'undefined' &&
    typeof document.visibilityState !== 'undefined'
  ) {
    return document.visibilityState !== 'hidden'
  }
  return true
}

export const mutate = async (key, res, cache = dataCache) => {
  let data
  let error
  let isValidating = true

  if (res && (typeof res.then === 'function' || res instanceof Promise)) {
    try {
      data = await res
    } catch (err) {
      error = err
    }
  } else {
    data = res
  }

  isValidating = false

  const newData = { data, error, isValidating }
  if (typeof data !== 'undefined') {
    cache.set(key, newData)
  }

  return newData
}

const dataCache = new DataCache()
const promisesCache = new DataCache()

const defaultConfig = {
  cache: dataCache,
  revalidateOnFocus: true,
  revalidateDebounce: 0,
  dedupingInterval: 200000,
  ttl: 0,
  onError: (_, __) => {},
}

export const useSwr = (key, fn, config = {}) => {
  let unmounted = false
  const vm = getCurrentInstance()
  const isServer = vm.$isServer

  config = {
    ...defaultConfig,
    ...config,
  }

  const keyRef = typeof key === 'function' ? key : ref(key)

  const stateRef = reactive({
    data: undefined,
    error: null,
    isValidating: true,
  })

  const revalidate = async () => {
    const keyVal = keyRef.value
    if (!isDocumentVisible) return
    const cacheItem = config.cache.get(keyVal, config.ttl)
    let newData = cacheItem && cacheItem.data

    console.log('cacheItem', cacheItem)

    stateRef.isValidating = true
    if (newData) {
      stateRef.data = newData.data
      stateRef.error = newData.error
    }

    const trigger = async () => {
      console.log('triggered')
      const promiseFromCache = promisesCache.get(
        keyVal,
        config.dedupingInterval
      )
      if (!promiseFromCache) {
        const newPromise = fn(keyVal)
        promisesCache.set(keyVal, newPromise)
        newData = await mutate(keyVal, newPromise, config.cache)
        if (typeof newData.data !== 'undefined') {
          stateRef.data = newData.data
        }
        if (newData.error) {
          stateRef.error = newData.error
          config.onError(newData.error, keyVal)
        }
        stateRef.isValidating = false
      } else {
        console.log('has Promise cache')
        newData = await mutate(keyVal, promiseFromCache.data, config.cache)
        // console.log('newData', newData)
        if (typeof newData !== 'undefined') {
          stateRef.data = newData.data
        }
        if (newData.error) {
          stateRef.error = newData.error
          config.onError(newData.error, keyVal)
        }
        stateRef.isValidating = false
      }
    }

    if (newData && config.revalidateDebounce) {
      setTimeout(async () => {
        if (!unmounted) {
          await trigger()
        }
      }, config.revalidateDebounce)
    } else {
      await trigger()
    }

    promisesCache.delete(keyVal)
  }

  const timer = null

  onMounted(() => {
    const tick = async () => {}

    if (config.revalidateOnFocus) {
      document.addEventListener('visibilitychange', revalidate, false)
      window.addEventListener('focus', revalidate, false)
    }
  })

  try {
    watch(keyRef, (val) => {
      keyRef.value = val
      console.log('watch triggered')
      revalidate()
      if (timer) {
        clearTimeout(timer)
      }
    })
  } catch {
    // do nothing
  }

  // onUpdated(() => {
  //   console.log('keyRef:', keyRef.value)
  // })

  onUnmounted(() => {
    unmounted = true
    if (config.revalidateOnFocus) {
      document.removeEventListener('visibilitychange', revalidate, false)
      window.removeEventListener('focus', revalidate, false)
    }
  })

  if (isServer) {
    onServerPrefetch(async () => {
      await revalidate()
    })
  }

  return {
    ...toRefs(stateRef),
    revalidate,
    _cache: config.cache,
    _promisesCache: promisesCache,
  }
}
