<script setup lang="ts">
import { Conversation } from "@/types/chat";
import { ref, nextTick, watchEffect, onMounted, onUpdated } from "vue";

interface Props {
  conversation: Conversation;
  isActive: Boolean;
  onDeleteConversation?: (conversation: Conversation) => void;
  onUpdatedConversation: (
    conversation: Conversation,
    options: Record<any, string>,
  ) => void;
  onChangeSelectConversation: (conversation: Conversation) => void;
}
const props = defineProps<Props>();
const showTextInput = ref(false);
const showOperation = ref(false);
const isDelete = ref(false);
const TextInput = ref<HTMLInputElement | null>(null);

const handleDeleteConversation = () => {
  showOperation.value = true;
  isDelete.value = true;
};
const handleSelectConversation = () => {
  props.onChangeSelectConversation(props.conversation);
};
const handleEditConversationTitle = () => {
  showTextInput.value = true;
  showOperation.value = true;
  nextTick(() => {
    TextInput.value?.focus();
  });
};
const handleConfirm = (e: MouseEvent) => {
  e.stopPropagation();
  if (isDelete.value) {
    props.onDeleteConversation?.(props.conversation);
  } else {
    props.onUpdatedConversation(props.conversation, {
      key: "name",
      value: TextInput.value!.value,
    });
  }
  showTextInput.value = false;
  showOperation.value = false;
};
const handleCancel = (e: MouseEvent) => {
  e.stopPropagation();
  showTextInput.value = false;
  showOperation.value = false;
};
watchEffect(() => {
  if (!props.isActive) {
    showTextInput.value = false;
    showOperation.value = false;
  }
});
const handleBlur = () => {
  setTimeout(() => {
    showTextInput.value = false;
    showOperation.value = false;
  }, 200);
};
</script>

<template>
  <a
    class="flex py-3 px-3 items-center gap-3 relative rounded-md hover:bg-gray-500/10 cursor-pointer break-all group"
    :class="{ 'bg-gray-700 hover:bg-gray-700': isActive }"
    @click="handleSelectConversation"
  >
    <svg
      stroke="currentColor"
      fill="none"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-4 w-4"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      ></path>
    </svg>
    <div
      v-if="!showTextInput"
      class="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative mr-12"
    >
      {{ conversation.name }}
      <span
        v-if="isActive"
        class="absolute right-0 w-12 bg-gradient-to-l top-0 bottom-0 from-gray-700"
      ></span>
    </div>
    <input
      v-else
      type="text"
      ref="TextInput"
      class="flex-1 max-h-5 mr-12 bg-transparent box-border outline-none w-1 rounded-none focus:border-slate-400 focus:border"
      :value="conversation.name"
      @blur="handleBlur"
    />
    <div
      v-if="isActive && !showOperation"
      class="absolute right-1 z-10 flex text-gray-300"
    >
      <button
        class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
        @click="handleEditConversationTitle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="tabler-icon tabler-icon-pencil"
        >
          <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
          <path d="M13.5 6.5l4 4"></path>
        </svg>
      </button>
      <button
        class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
        @click="handleDeleteConversation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="tabler-icon tabler-icon-trash"
        >
          <path d="M4 7l16 0"></path>
          <path d="M10 11l0 6"></path>
          <path d="M14 11l0 6"></path>
          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
          <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
        </svg>
      </button>
    </div>
    <div v-if="showOperation" class="absolute right-1 z-10 flex text-gray-300">
      <button
        class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
        @click="handleConfirm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="tabler-icon tabler-icon-check"
        >
          <path d="M5 12l5 5l10 -10"></path>
        </svg>
      </button>
      <button
        class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
        @click="handleCancel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="tabler-icon tabler-icon-x"
        >
          <path d="M18 6l-12 12"></path>
          <path d="M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </a>
</template>

<style scoped></style>
