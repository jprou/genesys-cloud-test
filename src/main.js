import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'

createApp(App).mount('#app')

    let urlParams = new URLSearchParams(window.location.search);
    // alert(`Your interaction id is: ${urlParams.get('id')}`);
    console.log(`Your interaction id is: ${urlParams.get('id')}`)

   


