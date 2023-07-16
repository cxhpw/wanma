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
      // prompts: Object.freeze(window.site_config.prompts),
      prompts: [
        {
          title: "作为广告商",
          content:
            "1我想让你充当广告商。您将创建一个活动来推广您选择的产品或服务。您将选择目标受众，制定关键信息和口号，选择宣传媒体渠道，并决定实现目标所需的任何其他活动。我的第一个建议请求是“我需要帮助针对18-30岁的年轻人制作一种新型能量饮料的广告活动。”",
        },
        {
          title: "作为广告商",
          content:
            "2我想让你充当广告商。您将创建一个活动来推广您选择的产品或服务。您将选择目标受众，制定关键信息和口号，选择宣传媒体渠道，并决定实现目标所需的任何其他活动。我的第一个建议请求是“我需要帮助针对18-30岁的年轻人制作一种新型能量饮料的广告活动。”",
        },
      ],
      conversations: [
        // {
        //   id: "f8115a5d-4c50-4bfa-851d-70d57d33ad51",
        //   name: "TailwindCSS 截断文本",
        //   messages: [
        //     {
        //       role: "user",
        //       content: "tailwindcss 文本长度溢出显示...是那个class",
        //     },
        //     {
        //       role: "assistant",
        //       content:
        //         '在Tailwind CSS中，用于处理文本长度溢出的类是`truncate`。通过将此类应用于元素，可以使文本在超出容器宽度时截断并以省略号显示。\n\n以下是示例代码：\n\n```html\n<div class="truncate">\n  <!-- Your text here -->\n</div>\n```\n\n在上面的示例中，`truncate`类应用于一个`<div>`元素，可以根据需要将其应用于任何其他类型的元素。请注意，文本必须在元素内部才能被截断。\n\n如果希望在溢出时显示省略号，并且还希望显示工具提示，以显示完整的文本，可以使用`truncate-tooltip`类。示例如下：\n\n```html\n<div class="truncate truncate-tooltip">\n  <!-- Your text here -->\n</div>\n```\n\n在这种情况下，当鼠标悬停在截断的文本上时，将显示一个工具提示，其中包含完整的文本内容。\n\n请记住，为了使这些类正常工作，您需要使用Tailwind CSS的完整样式表，并确保已正确配置和安装它。',
        //     },
        //   ],
        //   model: "gpt-3.5-turbo",
        //   prompt:
        //     "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
        //   folderId: null,
        // },
        // {
        //   id: "f8115a5d-4c50-4bfa-851d-70d57d33ad52",
        //   name: "导入模块错误",
        //   messages: [
        //     {
        //       role: "user",
        //       content: `我有两个文件，一个chat.ts和openai.ts ，在chat.ts使用import { OpenAIModel } from "./openai";\n OpenAIModele是一个ts类型，export interface OpenAIModel {\n  id: string;\n  name: string;\n  maxLength: number; // maximum length of a message\n  tokenLimit: number;\n}\n为什么会报openai.ts”不是模块错误`,
        //     },
        //     {
        //       role: "assistant",
        //       content:
        //         "当您在 TypeScript 中导入一个模块时，确保导入的文件是一个有效的模块，并且已经在您的项目中正确设置了模块解析规则。根据您提供的信息，报错可能有以下几个原因：\n\n1. 文件路径错误：确保您在 `import` 语句中提供的路径 `./openai` 是正确的，以确保它指向正确的文件。\n\n2. 缺少模块声明：如果 `openai.ts` 文件没有明确地声明自己是一个模块，TypeScript 将无法识别它作为一个有效的模块。请确保在 `openai.ts` 文件的顶部添加以下声明：\n\n```typescript\nexport {}; // Add an empty export declaration to make it a module\n```\n\n3. 缺少导出：确保在 `openai.ts` 文件中导出了 `OpenAIModel` 接口。请确保在 `openai.ts` 文件中添加以下导出语句：\n\n```typescript\nexport interface OpenAIModel {\n  id: string;\n  name: string;\n  maxLength: number;\n  tokenLimit: number;\n}\n```\n\n4. TypeScript 配置错误：如果以上步骤都正确，并且您仍然收到错误，可能是 TypeScript 配置文件中的问题。请确保您的 `tsconfig.json` 文件中正确配置了模块解析规则和编译选项。\n\n请检查上述步骤，以确保您的代码正确导入和使用 `OpenAIModel` 接口。如果问题仍然存在，请提供更多关于您的项目结构和配置的详细信息，以便我能够更好地帮助您解决问题。",
        //     },
        //     {
        //       role: "user",
        //       content:
        //         'openai.ts 有到出\nexport interface OpenAIModel {\n  id: string;\n  name: string;\n  maxLength: number;\n  tokenLimit: number;\n}语句，\ntsconfig.json配置如下\n{\n  "include": ["**/*.ts", "src/**/*.vue", "src/types/*.d.ts"],\n  "exclude": ["node_modules"],\n  "compilerOptions": {\n    "allowJs": true,\n    "skipLibCheck": true,\n    "strict": true,\n    "isolatedModules": true,\n    "composite": true,\n    "baseUrl": ".",\n    "paths": {\n      "@/*": ["./src/*"]\n    }\n  }\n}\n',
        //     },
        //     {
        //       role: "assistant",
        //       content:
        //         "根据您提供的信息，您的 TypeScript 配置文件 `tsconfig.json` 看起来是正确的，而且您的 `openai.ts` 文件中也有正确的导出语句。\n\n在这种情况下，我建议您尝试执行以下步骤来解决问题：\n\n1. 清除 TypeScript 缓存：有时 TypeScript 缓存可能会导致奇怪的问题。您可以尝试删除 TypeScript 缓存，方法是删除项目根目录下的 `.tsbuildinfo` 文件。\n\n2. 检查编译过程：确认您在编译过程中没有遇到任何错误或警告。您可以尝试在终端或命令提示符下手动执行 TypeScript 编译命令来进行检查，例如：\n\n```shell\ntsc\n```\n\n这将编译您的整个项目，并在编译过程中显示任何错误或警告。请确保在运行该命令之前，您的当前工作目录是项目根目录。\n\n3. 检查导入语句：在您的 `chat.ts` 文件中，确保您使用了正确的导入语句，并且路径和文件名的大小写与实际文件匹配。另外，请确保 `chat.ts` 和 `openai.ts` 文件位于同一级目录下，或者您已经正确指定了相对路径。\n\n如果您仍然遇到问题，请提供更多关于您的项目结构的详细信息，以及完整的错误消息，这样我就可以更好地帮助您解决问题。",
        //     },
        //     {
        //       role: "user",
        //       content:
        //         "vite 项目怎么在导入模块的时候省略markdown.vue  .vue后缀",
        //     },
        //     {
        //       role: "assistant",
        //       content:
        //         "在 Vite 项目中，您可以通过配置 Vite 的 `resolve.extensions` 选项来省略导入模块时的文件后缀。以下是在 Vite 2.x 中进行配置的示例：\n\n1. 打开项目根目录下的 `vite.config.js` 文件（如果不存在，请创建一个）。\n\n2. 在 `vite.config.js` 文件中，添加以下配置：\n\n```javascript\nexport default {\n  // 其他配置项...\n  resolve: {\n    extensions: ['.js', '.ts', '.vue', '.json'], // 添加或更新extensions字段\n  },\n};\n```\n\n在上述配置中，我们将 `.vue` 添加到 `extensions` 数组中，这样您就可以在导入模块时省略 `.vue` 后缀。\n\n例如，假设您有一个名为 `MyComponent.vue` 的 Vue 组件，在其他文件中导入该组件时，可以这样写：\n\n```javascript\nimport MyComponent from './MyComponent';\n```\n\nVite 将自动解析并找到对应的 `.vue` 文件。\n\n请注意，修改完配置后，您可能需要重新启动 Vite 服务器，以使配置生效。\n\n这是一个基本的配置示例，您还可以根据需要进行更高级的配置。有关 Vite 配置选项的更多信息，请参阅 Vite 文档：https://vitejs.dev/config/",
        //     },
        //   ],
        //   model: "gpt-3.5-turbo",
        //   prompt:
        //     "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
        //   folderId: null,
        // },
      ] as unknown as Conversation[],
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
      console.log(111)
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
      this.showSidebar = false
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
  },
});

app.component("VueMarkdown", Markdown); 
app.component("Conversations", Conversations);
app.component("Chat", Chat);

app.mount("#app");

app.config.errorHandler = (err) => {
  console.log("错误", err);
};
