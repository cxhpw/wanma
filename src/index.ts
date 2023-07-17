import { createApp, nextTick } from "vue";
import "@/scss/main.scss";
import "highlight.js/scss/agate.scss";
import "@/scss/animated.scss";
import Markdown from "@/components/markdown.vue";
import Conversations from "@/components/Conversations.vue";
import Spinner from "@/components/Spinner.vue";
import Chat from "@/components/Chat.vue";
import type { ChatBody, Conversation, MesType, Message, SteamBody } from "@/types/chat";
import { OpenAIModels } from "./types/openai";
import { getCoversation, getMessagesByConversationID, postConversation } from "./services/history";
import { getQuestionToken } from "./services/chat";

// @ts-ignore
function isInputEL(target: any): target is HTMLTextAreaElement {
  return (
    Object.prototype.toString.call(target) === "[object HTMLTextAreaElement]"
  );
}

const app = createApp({
  data() {
    return {
      content: "",
      showPrompt: false,
      showHint: false,
      showSidebar: true,
      activePromptIndex: 0,
      //@ts-ignore
      prompts: Object.freeze(window.site_config.prompts),
      //@ts-ignore
      standardPrompts: Object.freeze(window.site_config.standardPrompts),
      conversations: [] as unknown as Conversation[],
      selectedConversation: null,
      loading: false,
      loadingHistory: false
    };
  },
  async mounted() {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        this.$refs.promptListRef &&
        !this.$refs.promptListRef.contains(e.target as Node)
      ) {
        this.showPrompt = false;
      }
    };
    const resizeHandler = () => {
      if (window.innerWidth < 640) {
        this.showSidebar = false
      } else {
        this.showSidebar = true
      }
    }
    window.addEventListener("click", handleOutsideClick); 
    window.addEventListener("resize", resizeHandler);
    window.addEventListener("load", resizeHandler)
    nextTick(() => {
      this.$refs.TextInput.style.cssText = `max-height: 200px; height: ${this.$refs.TextInput.scrollHeight}px; overflow-y: hidden;`;
    })
    if (this.selectedConversation === null) {
      import("uuid").then(({ v4 }) => {
        this.selectedConversation = {
          id: v4(),
          name: "新对话",
          messages: [],
          model: OpenAIModels["gpt-3.5-turbo"],
          prompt: "",
          folderId: null,
        } as Conversation;
      });
    }
    this.conversations = await getCoversation()
  },
  watch: {
    content() {
      const input = this.$refs.TextInput;
      if (isInputEL(input)) {
        this.$nextTick(() => {
          input.style.height = "auto";
          input.style.height = `${input.scrollHeight}px`;
        });
      }
    },
  },
  methods: {
    handleKeyDown(e: KeyboardEvent) {
      if (this.showPrompt) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          this.activePromptIndex =
            this.activePromptIndex < this.prompts.length - 1
              ? this.activePromptIndex + 1
              : this.activePromptIndex;
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.activePromptIndex =
            this.activePromptIndex > 0
              ? this.activePromptIndex - 1
              : this.activePromptIndex;
        } else if (e.key === "Tab") {
          e.preventDefault();
          this.activePromptIndex < this.prompts.length - 1
            ? this.activePromptIndex + 1
            : 0;
        } else if (e.key === "Enter") {
          e.preventDefault();
          this.handleInitModal();
        } else if (e.key === "Escape") {
          e.preventDefault();
          this.showPrompt = false;
        } else {
          this.activePromptIndex = 0;
        }
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    },
    handleChange(e: InputEvent) {
      let value = "";
      if (isInputEL(e.target)) {
        value = e.target.value;
        this.content = e.target.value;
      }
      this.updatePromptListVisibility(value);
    },
    handleInitModal() {
      const selectedPrompt = this.prompts[this.activePromptIndex];
      if (selectedPrompt) {
        const newContent = this.content.replace(
          /\/\w*$/,
          selectedPrompt.content,
        );
        this.content = newContent;
      }
      this.showPrompt = false;
    },
    updatePromptListVisibility(text: string) {
      const match = text.match(/\/\w*$/);
      if (match) {
        this.showPrompt = true;
      } else {
        this.showPrompt = false;
      }
    },
    onMouseOver(index: number) {
      this.activePromptIndex = index;
    },
    handleSend() {
      if (this.content.trim().length === 0) {
        alert("请输入消息");
        return;
      }
      const message: Message = { role: "user", content: this.content };
      this.onSend(message);
      this.content = "";
      if (window.innerWidth < 640 && this.$refs.TextInput) {
        this.$refs.TextInput.blur();
      }
    },
    handleToggleChatbar() {
      this.showSidebar = !this.showSidebar;
    },
    async handleSelectConversation(conversation: Conversation) {
      if (conversation.id !== this.selectedConversation.id) {
        this.loadingHistory = true
        const messages = await getMessagesByConversationID(conversation.id as number)
        conversation.messages = messages
        this.selectedConversation = conversation
        this.loadingHistory = false
        if (window.innerWidth < 640) {
          this.showSidebar = false
        }
      }
    },
    handleNewConversation() {
      const lastConversation: Conversation =
        this.conversations[this.conversations.length - 1];
      import("uuid").then(({ v4 }) => {
        const newConversation: Conversation = {
          id: v4(),
          name: "新对话",
          messages: [],
          model: lastConversation?.model || OpenAIModels["gpt-3.5-turbo"],
          prompt: "",
          folderId: null,
        };
        this.selectedConversation = newConversation;
        this.conversations.unshift(newConversation);
        this.$refs.TextInput.focus();
      });
    },
    handleUpdatedConversation(
      conversation: Conversation,
      option: { key: string; value: any },
    ) {
      if (!option.value) {
        return;
      }
      //@ts-ignore
      conversation[option.key] = option.value;
      postConversation(conversation)
    },
    handleDeleteConversation(conversation: Conversation) {
      const index = this.conversations.indexOf(conversation);
      this.conversations.splice(index, 1);
      import("uuid").then(({ v4 }) => {
        this.selectedConversation = {
          id: v4(),
          name: "新对话",
          messages: [],
          model: OpenAIModels["gpt-3.5-turbo"],
          prompt: "",
          folderId: null,
        };
      });
    },
    async onSend(message: Message) {
      if (this.selectedConversation) {
        let updatedConversation: Conversation;
        updatedConversation = {
          ...this.selectedConversation,
          messages: [...this.selectedConversation.messages, message]
        }
        this.selectedConversation = updatedConversation
        this.loading = true
        const msglist: MesType[] = this.selectedConversation.messages.map((message: Message) => {
          return {
            MesType: message.role === "user" ? 0 : 1,
            MsgContent: message.content,
            Sort: 1,
          }
        })
        const res =  await getQuestionToken()
        console.log(res)
        if (res.status !== 200) {
          alert(res.msg)
          return;
        }

        const chatBody: SteamBody = {
          openapikey: "",
          userkey: res.token,
          msglist
        }

        const response = await fetch("https://api.wanmaapp.com/api/ChatGPT/Completionask/stream", {
          method: "POST",
          body: JSON.stringify(chatBody),
          headers: {
            "Content-type": "application/json"
          }
        })

        if (!response.ok) {
          this.loading = false;
          return
        }

        const data = response.body;

        if (!data) {
          this.loading = false;
          return;
        }
        if (updatedConversation.messages.length === 1) {
          const { content } = message
          const customName = content.length > 30 ? content.substring(0, 30) + '...' : content
          updatedConversation = {
            ...updatedConversation,
            name: customName
          }
        }

        this.loading = false;

        const render = data.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let isFirst = true;
        let text = '';

        while (!done) {
          const { done: doneReading, value } = await render.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          text += chunkValue

          if (isFirst) {
            isFirst = false;
            const updatedMessages: Message[] = [
              ...updatedConversation.messages,
              {role: "assistant", content: chunkValue}
            ];
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages
            }
            this.selectedConversation = updatedConversation
          } else {
            const updatedMessages: Message[] = updatedConversation.messages.map((message, index) => {
              if (index === updatedConversation.messages.length - 1) {
                return {
                  ...message,
                  content: text
                }
              }
              return message
            })
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages
            }
            this.selectedConversation = updatedConversation
          }

        }

        const updatedConversations: Conversation[] = this.conversations.map((conversation: Conversation) => {
          if (conversation.id === this.selectedConversation.id) {
            return updatedConversation
          }
          return conversation
        })

        if (updatedConversations.length === 0) {
          updatedConversations.push(updatedConversation)
        }
        this.conversations = updatedConversations

      }
    },
    handlestandardPrompts(e: any) {
      e.preventDefault();
      this.content = e.target.dataset.message
    }
  },
});

app.component("VueMarkdown", Markdown); 
app.component("Conversations", Conversations);
app.component("Chat", Chat);

app.mount("#app");

app.config.errorHandler = (err) => {
  console.log("错误", err);
};
