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
    class="overflow-hidden"
  >
    <ChatMessage
      v-for="message in conversation.messages"
      :key="message.content"
      :message="message"
    ></ChatMessage>
    <div class="w-full h-28 md:h-48 flex-shrink-0"></div>
  </div>
</template>

<style scoped></style>
