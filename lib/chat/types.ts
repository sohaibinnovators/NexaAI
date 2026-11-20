export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export type ChatApiMessage = {
  role: ChatRole;
  content: string;
};

export type ChatApiRequest = {
  message: string;
  history?: ChatApiMessage[];
};

export type ChatApiSuccess = {
  ok: true;
  reply: string;
  model: string;
};

export type ChatApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "RATE_LIMIT"
  | "QUOTA_EXCEEDED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "MODEL_ERROR"
  | "SERVER_ERROR";

export type ChatApiError = {
  ok: false;
  error: {
    code: ChatApiErrorCode;
    message: string;
  };
};

export type ChatApiResponse = ChatApiSuccess | ChatApiError;
