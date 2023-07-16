import type { OpenAIModel } from "./openai";

export interface Message {
  role: Role;
  content: string;
}

export type Role = "assistant" | "user";

export interface ChatBody {
  model: OpenAIModel;
  messages: Message[];
  key: string;
  prompt: string;
}

export interface Conversation {
  id: string | number;
  name: string;
  messages: Message[];
  model: OpenAIModel;
  prompt: string;
  folderId: string | null;
}

export interface Prompt {
  title: string;
  content: string;
}

export interface SteamBody {
  msglist: MesType[];
  openapikey: string;
  userkey: string
}

export interface MesType {
  MesType: 0 | 1;
  MsgContent: string;
  Sort: number
}


export interface ConversationResponse {
  AutoID: number;
  AutoTimeStamp: string;
  Title: string;
}


export interface MessageResponse {
  AutoID: string;
  AutoTimeStamp: string;
  ChatID: string;
  Content: string;
}