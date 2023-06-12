<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import platformClient from 'purecloud-platform-client-v2'

import { ref, onMounted } from 'vue'

onMounted(() => {
  console.log("Crossssss");
    var client = platformClient.ApiClient.instance;
    console.log("Crossclient" + client);
    var clientId = "6ea9ac07-8f3f-4444-8800-f5cb40b13a41";
    var redirectUri = "https://jp-cloud-test.onrender.com/";
    var state = "test";
    var environment = "mypurecloud.ie";

    var notificationsApi = new platformClient.NotificationsApi();

    client.loginImplicitGrant(clientId, redirectUri, { state: state, environment: environment })
    .then((data) => {
      debugger;
        console.log("Authenticated" + data);
        console.log(client.authData);
        notificationsApi.postNotificationsChannels()
        .then((channel) => {
          debugger;
            console.log(channel);
            var socket = new WebSocket(channel.connectUri);
            socket.onmessage = function (message) {
              debugger;
                console.log(message);
            }
            let topic = "v2.users." + client.authData.userId + ".conversations";
            notificationsApi.postNotificationsChannelSubscriptions(channel.id, [{id: topic}])
        })
        .catch((err) => {
          debugger;
            console.log(err);
        });
    });
})
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <TheWelcome />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
