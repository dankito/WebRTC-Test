export class ConnectedPeer {

  constructor(readonly id: string, public displayName: string) { }


  toString(): string {
    return this.displayName
  }

}