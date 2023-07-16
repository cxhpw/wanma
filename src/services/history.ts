import { Conversation, ConversationResponse, Message, MessageResponse } from "@/types/chat"
import { OpenAIModels } from "@/types/openai"

export async function getCoversation(): Promise<Conversation[]> {
  const res: ConversationResponse[] = await (await fetch("/Include/Ajax/AjaxMethod.aspx?t=getchatlist")).json()
  const data:Conversation[] = res.map((conversation: ConversationResponse) => {
    return {
      id: conversation.AutoID,
      messages: [],
      folderId: null,
      name: conversation.Title,
      model: OpenAIModels["gpt-3.5-turbo"],
      prompt: "" 
    }
  })
  // console.log("历史记录", res)
  return data
}

export async function getMessagesByConversationID(id: number): Promise<Message[]> {
  const res: MessageResponse[] = await (await fetch(`/Include/Ajax/AjaxMethod.aspx?t=getchatmsglist&cid=${id}`)).json()
  const data:Message[] =  res.map((message:MessageResponse, index) => {
    return {  
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: message.Content
    }
  })
  return data
}

export async function postConversation(conversation: Conversation) {
  const question = JSON.stringify({
    cid: conversation.id,
    msglist: conversation.messages.map((message, index) => message.content)
  })
  const formData = new URLSearchParams();
  formData.append('t', 'savechat');
  formData.append('question', question);
  const res = await (await fetch("/Include/Ajax/AjaxMethod.aspx", {
    method: "POST",
    body: formData.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  })).json()
  console.log("保存记录响应", res)
  return res
}