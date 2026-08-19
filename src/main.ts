import './assets/main.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initThemeBeforeMount } from './stores/theme'

initThemeBeforeMount()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
