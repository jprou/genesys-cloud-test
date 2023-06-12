import './assets/main.css'

import { createApp } from 'vue'
import {platformClient} from 'purecloud-client-app-sdk';
import App from './App.vue'

createApp(App).mount('#app')

    let urlParams = new URLSearchParams(window.location.search);
    alert(`Your interaction id is: ${urlParams.get('id')}`);

    // var platformClient = require('purecloud-client-app-sdk');
    var client = platformClient.ApiClient.instance;
    var clientId = "6ea9ac07-8f3f-4444-8800-f5cb40b13a41";
    var redirectUri = "https://jp-cloud-test.onrender.com/";
    var state = "test";

    var notificationsApi = new platformClient.NotificationsApi();

    client.loginImplicitGrant(clientId, redirectUri, { state: state })
    .then((data) => {
        console.log("Authenticated" + data);
        console.log(client.authData);
        notificationsApi.postNotificationsChannels()
        .then((channel) => {
            console.log(channel);
            var socket = new WebSocket(channel.connectUri);
            socket.onmessage = function (message) {
                console.log(message);
            }
            let topic = "v2.users." + client.authData.userId + ".conversations";
            notificationsApi.postNotificationsChannelSubscriptions(channel.id, [{id: topic}])
        })
        .catch((err) => {
            console.log(err);
        });
    });


