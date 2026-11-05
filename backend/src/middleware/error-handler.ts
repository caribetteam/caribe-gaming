import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = 'request_error',
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  console.error('Unhandled backend error', error);
  response.status(500).json({
    error: {
      code: 'internal_error',
      message: 'Ocorreu um erro interno. Tente novamente.',
    },
  });
};
