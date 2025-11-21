export class ConnectedPeer {

  constructor(readonly id: string) { }


  toString(): string {
    return this.id
  }

}