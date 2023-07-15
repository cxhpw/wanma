<script setup lang="ts">
import { Conversation } from "@/types/chat";
import ConversationComponent from "./Conversation.vue";
import { computed, ref } from "vue";
interface Props {
  conversations: Conversation[];
  selectConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversation: Conversation) => void;
  onUpdatedConversation: (conversation: Conversation) => void;
}
const props = defineProps<Props>();
const active = computed(() =>
  props.conversations.indexOf(props.selectConversation!),
);
</script>

<template>
  <div class="flex-col flex-1 overflow-y-auto border-b border-slate-800">
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
    </div>
  </div>
</template>

<style lang="scss" module></style>
