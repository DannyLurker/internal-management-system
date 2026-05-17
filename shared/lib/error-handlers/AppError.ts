export default class AppError extends Error {
  statusCode: number;

  constructor(_message: string, _statusCode: number) {
    super(_message);
    this.statusCode = _statusCode;
  }
}
