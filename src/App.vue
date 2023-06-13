<script setup>
import HelloWorld from "./components/HelloWorld.vue";
import TheWelcome from "./components/TheWelcome.vue";
import platformClient from "purecloud-platform-client-v2";

import { ref, onMounted } from "vue";

onMounted(() => {
  let urlParams = new URLSearchParams(window.location.search);
  // alert(`Your interaction id is: ${urlParams.get('id')}`);
  console.log(`Your interaction id is: ${urlParams.get("id")}`);
  let convoId = urlParams.get("id");

  var client = platformClient.ApiClient.instance;
  client.setEnvironment(platformClient.PureCloudRegionHosts.eu_west_1);
  console.log("Crossclient" + JSON.stringify(client));
  var clientId = "6ea9ac07-8f3f-4444-8800-f5cb40b13a41";
  var redirectUri = "https://genesys-cloud-test.onrender.com/";
  var state = convoId;
  var environment = "mypurecloud.ie";

  let subscriptionMap = {
    "channel.metadata": () => {
      console.log("Notification heartbeat.");
    },
  };

  let currentConversation = null;

  var notificationsApi = new platformClient.NotificationsApi();

  var conversationsApi = new platformClient.ConversationsApi();

  const usersApi = new platformClient.UsersApi();

  let channel = null;

  let userId = null;

  let ws = null;

  client
    .loginImplicitGrant(clientId, redirectUri, {
      state: state,
      environment: environment,
    })
    .then((data) => {
      console.log("Authenticated" + JSON.stringify(data));
      console.log(client.authData);

      convoId = data.state;

      return usersApi.getUsersMe();
    })
    .then((userMe) => {
      console.log("UserMe" + JSON.stringify(userMe));
  
      userId = userMe.id;

      // Get current conversation
      return conversationsApi.getConversation(convoId);
    })
    .then((conv) => {
      currentConversation = conv;

      return setupChatChannel();
    })
    .then((data) => {
      console.log("Finished Setup");

      // Error Handling
    })
    .catch((e) => console.log(e));

  // .then(() => {
  // notificationsApi.postNotificationsChannels()
  // .then((channel) => {
  //   console.log('---- Created Notifications Channel ----');
  //     console.log(data);
  //     channel = data;
  //     ws = new WebSocket(channel.connectUri);
  //     ws.onmessage = onSocketMessage;
  // })
  // .catch((err) => {
  //     console.log(err);
  // });
  // });

  /**
 * Set-up the channel for chat conversations
 */
function setupChatChannel(){
    return createChannel()
    .then(data => {
        // Subscribe to incoming chat conversations
        return addSubscription(
            `v2.users.${userId}.conversations.chats`,
            subscribeChatConversation(convoId));
    });
}

/**
 * Subscribes the conversation to the notifications channel
 * @param {String} conversationId 
 * @returns {Promise}
 */
function subscribeChatConversation(conversationId){
    return addSubscription(
            `v2.conversations.chats.${conversationId}.messages`,
            onMessage);
}

let onMessage = (data) => {
    switch(data.metadata.type){
        case 'typing-indicator':
            break;
        case 'message':
            // Values from the event
            let eventBody = data.eventBody;
            let message = eventBody.body;
            let convId = eventBody.conversation.id;
            let senderId = eventBody.sender.id;

            // Conversation values for cross reference
            let conversation = currentConversation;
            let participant = conversation.participants.find(p => p.chats[0].id == senderId);
            let purpose = participant.purpose;

            // Get agent communication ID
            if(purpose == 'agent') {
                agentID = senderId;
                agentAssistant.clearStackedText();
            } else {
                let agent = conversation.participants.find(p => p.purpose == 'agent');
                agentID = agent.chats[0].id;
            }

            // // Get some recommended replies
            // if(purpose == 'customer') agentAssistant.getRecommendations(message, convId, agentID);

            console.log(data);

            break;
    }
};

  function onSocketMessage(event) {
    let data = JSON.parse(event.data);

    subscriptionMap[data.topicName](data);
  }

  function createChannel() {
    return notificationsApi.postNotificationsChannels().then((data) => {
      console.log("---- Created Notifications Channel ----");
      console.log(data);

      channel = data;
      ws = new WebSocket(channel.connectUri);
      ws.onmessage = onSocketMessage;
    });
  }

  function addSubscription(topic, callback) {
    let body = [{ id: topic }];

    return notificationsApi
      .postNotificationsChannelSubscriptions(channel.id, body)
      .then((data) => {
        subscriptionMap[topic] = callback;
        console.log(`Added subscription to ${topic}`);
      });
  }

  function setupChatChannel() {
    return createChannel().then((data) => {
      // Subscribe to incoming chat conversations
      return addSubscription(
        `v2.users.${userId}.conversations.chats`,
        subscribeChatConversation(convoId)
      );
    });
  }

  /**
   * Subscribes the conversation to the notifications channel
   * @param {String} conversationId
   * @returns {Promise}
   */
  function subscribeChatConversation(conversationId) {
    return addSubscription(
      `v2.conversations.chats.${conversationId}.messages`,
      onMessage
    );
  }
});
</script>

<template>
  <header>
    <img
      alt="Vue logo"
      class="logo"
      src="./assets/logo.svg"
      width="125"
      height="125"
    />

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
