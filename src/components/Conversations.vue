<script setup lang="ts">
import { Conversation } from "@/types/chat";
import ConversationComponent from "./Conversation.vue";
import { computed, ref } from "vue";
import Spinner from './Spinner.vue'
interface Props {
  loading: boolean;
  conversations: Conversation[];
  selectConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversation: Conversation) => void;
  onUpdatedConversation: (conversation: Conversation) => void;
}
const props = defineProps<Props>();
const active = computed(() => {
  // return props.conversations.indexOf(props.selectConversation!)
  let index = -1
  for (let i = 0; i < props.conversations.length; i++) {
    if (props.conversations[i].id === props.selectConversation?.id) {
      index = i
      break;
    }
  }
  return index
});
</script>

<template>
    <div class="flex flex-col gap-2 text-gray-100 text-sm">
      <ConversationComponent
        v-for="(conversation, index) in conversations"
        :key="conversation.id"
        :conversation="conversation"
        :isActive="active === index"
        @delete-conversation="onDeleteConversation"
        @change-select-conversation="onSelectConversation"
        @updated-conversation="onUpdatedConversation"
      ></ConversationComponent>
      <div v-if="loading">
        <Spinner></Spinner>
      </div>
    </div>
</template>

<style lang="scss" module></style>
