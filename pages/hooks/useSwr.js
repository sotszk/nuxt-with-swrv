import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  toRefs,
  onServerPrefetch,
  getCurrentInstance,
  reactive,
} from '@vue/composition-api'

const defaultConfig = {
  cache: null,
  onError: (_, __) => {},
}

export const useSwr = (key, fetcher, config = {}) => {
  let unmounted = false
  const vm = getCurrentInstance()
  const isServer = vm.$isServer

  config = {
    ...defaultConfig,
  }

  const keyRef = typeof key === 'function' ? key : ref(key)
  const stateRef = reactive({
    data: undefined,
    error: null,
    isValidating: true,
  })

  const revalidate = async () => {
    const trigger = () => {
      console.log('triggered')
    }
    await setTimeout(async () => {
      if (!unmounted) {
        await trigger()
      }
    }, 2000)
    // console.log('after triggered')
  }

  let timer = null

  onMounted(() => {
    timer = null

    const tick = async () => {}
  })

  onUnmounted(() => {
    unmounted = true
  })

  if (isServer) {
    onServerPrefetch(async () => {
      await revalidate()
    })
  }

  return {
    ...toRefs(stateRef),
    revalidate,
  }
}
