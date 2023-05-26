export default class Server {
  static ping() {
    return { result: { pong: true } };
  }

  static checkUser() {
    return { result: { authorized: true } };
  }
}
