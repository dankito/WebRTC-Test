import { Message } from "./Message"
import { MessageType } from "./MessageType"

export class UserInfo extends Message {

  constructor(readonly displayName: string) {
    super(MessageType.UserInfo)
  }

}