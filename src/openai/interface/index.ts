export interface OpenAiChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}