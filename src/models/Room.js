/**
 * Room model
 */
class Room {
  constructor(data = {}) {
    this.id = null;
    this.roomOwnerId = null;
    this.roomPlayersList = null;
    this.theme = null;
    this.status = null;
    this.maxPlayersNum = null;
    this.alivePlayersList = null;
    this.currentPlayerIndex = null;
    this.playToOuted = null;
    Object.assign(this, data);
  }
}

export default Room;