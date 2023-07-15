<script setup lang="ts">
import ChatMessage from "./ChatMessage.vue";
import { Conversation } from "@/types/chat";
interface Props {
  conversation: Conversation;
}
const props = defineProps<Props>();
</script>

<template>
  <div
    class="md:max-w-3xl xl:max-w-5xl m-auto mt-10 md:rounded-md overflow-hidden"
  >
    <ChatMessage
      v-for="(message, index) in conversation.messages"
      :key="message.content"
      :message="message"
    ></ChatMessage>
    <div class="w-full h-32 md:h-48 flex-shrink-0"></div>
  </div>
</template>

<style scoped></style>
