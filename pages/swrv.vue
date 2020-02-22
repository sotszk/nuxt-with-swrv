<template>
  <div class="max-w-sm max-auto p-6">
    <div class="text-xl font-bold mb-4">{{ title }}</div>
    <div>
      <button class="btn btn-blue" @click="() => $store.commit('increment')">
        +</button
      ><span class="ml-4">{{ $store.state.counter }}</span>
      <span>{{ $store.getters.double }}</span>
    </div>
    <nuxt-link
      class="inline-block text-blue-400 hover:text-blue-600 my-4"
      to="/"
      >go home</nuxt-link
    >
    <div>
      <button
        class="bg-green-400 text-white py-6 px-8 text-lg"
        @click="() => revalidate()"
      >
        revalidate
      </button>
    </div>

    <div class="mt-4">
      <p v-if="loading" class="text-md text-teal-700">Loading...</p>
      <p v-if="responseData">{{ responseData.description }}</p>
    </div>
  </div>
</template>

<script>
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  computed,
} from '@vue/composition-api'
import { useSwr } from './hooks/useSwr'

const useHello = () => {
  onMounted(() => {
    console.log('mounted hello')
  })

  onUnmounted(() => {
    console.log('unmounted hello')
  })

  const hello = ref('Hello world')
  return { hello }
}

const useSample = () => {
  const { hello } = useHello()
  const count = ref(0)

  watch((onCleanup) => {
    document.title = `${hello.value} ${count.value}`
    onCleanup(() => {
      console.log('fired before document title changed')
    })
  })

  watch(
    () => count.value,
    () => {
      console.log(hello.value)
    },
    {
      lazy: true,
    }
  )
  return {
    hello,
    count,
  }
}

const createStoreCache = (store, ttl = 0) => {
  if (ttl) {
    store.commit('setTimeToLive', ttl)
  }

  return {
    get(key, ttl) {
      store.dispatch('shift', ttl)
      return store.getters.getData(key)
    },
    set(key, value) {
      store.commit('setData', { key, value })
    },
  }
}

export default {
  name: 'Swrv',

  setup(_, { root }) {
    const {
      data: responseData,
      error: responseError,
      isValidating: loading,
      revalidate,
      _cache,
      _promisesCache,
    } = useSwr(
      'https://qiita.com/api/v2/schema',
      (url) => fetch(url).then((res) => res.json()),
      {
        onError: () => console.log('error です'),
        // cache: createStoreCache(root.$store, 360000),
      }
    )
    // const { hello, count } = useSfample()

    // watch(
    //   () => loading.value,
    //   () => {
    //     console.log('dataCache', _cache)
    //     console.log('promisesCache', _promisesCache)
    //   },
    //   { lazy: true }
    // )

    const data = {
      title: ref('Hello world'),
      responseData,
      responseError,
      loading,
    }

    const methods = {
      revalidate,
    }

    return {
      ...data,
      ...methods,
    }
  },
}
</script>

<style scoped>
.btn {
  @apply font-bold py-2 px-4;
}
.btn-blue {
  @apply bg-blue-400 text-white;
}
</style>
