export class ConnectedPeer {

  constructor(readonly id: string, readonly displayName: string) { }


  toString(): string {
    return this.displayName
  }

}