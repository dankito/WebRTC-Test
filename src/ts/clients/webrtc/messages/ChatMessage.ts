import { Message } from "./Message"
import { MessageType } from "./MessageType"

export class ChatMessage extends Message {

  constructor(readonly message: string, readonly sent: Date = new Date()) {
    super(MessageType.ChatMessage)
  }

}