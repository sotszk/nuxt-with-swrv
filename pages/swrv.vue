<template>
  <div>
    <div>{{ title }}</div>
    <div><button @click="() => (count += 1)">+</button>{{ count }}</div>
    <nuxt-link to="/">go home</nuxt-link>
    <div>
      <button @click="() => revalidate()">revalidate</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from '@vue/composition-api'
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

export default {
  name: 'Swrv',

  setup() {
    const swr = useSwr()
    const { hello } = useHello()
    const count = ref(0)

    return {
      title: hello,
      count,
      ...swr,
    }
  },
}
</script>

<style scoped></style>
