import axios from 'axios';

export type AppErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export interface ApiErrorDetail {
  code?: number;
  message: string;
  field?: string;
  resource?: string;
}

export class AppError extends Error {
  public readonly errorCode: AppErrorCode;
  public readonly status: number;
  public readonly details: ApiErrorDetail[];

  constructor(
    errorCode: AppErrorCode,
    message: string,
    status: number = 0,
    details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'AppError';
    this.errorCode = errorCode;
    this.status = status;
    this.details = details;
  }
}

export interface ParseFormErrorOptions {
  fieldAliases?: Record<string, string>;
}

export interface ParsedFormError {
  appError: AppError;
  fieldErrors: Record<string, string>;
  formMessage: string | null;
}

const DEFAULT_UNKNOWN_MESSAGE = 'An unexpected error occurred.';
const DEFAULT_NETWORK_MESSAGE =
  'Cannot connect to server. Please check your network.';
const DEFAULT_TIMEOUT_MESSAGE = 'Request timed out.';
const DEFAULT_ABORT_MESSAGE = 'Request was canceled.';

function statusToCode(status: number): AppErrorCode {
  switch (status) {
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 422:
      return 'VALIDATION_ERROR';
    default:
      if (status >= 500) return 'SERVER_ERROR';
      return 'UNKNOWN';
  }
}

function toErrorDetail(raw: unknown): ApiErrorDetail | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const source = raw as Record<string, unknown>;
  if (typeof source.message !== 'string' || !source.message.trim()) {
    return null;
  }

  return {
    code: typeof source.code === 'number' ? source.code : undefined,
    message: source.message.trim(),
    field:
      typeof source.field === 'string' && source.field.trim()
        ? source.field.trim()
        : undefined,
    resource:
      typeof source.resource === 'string' && source.resource.trim()
        ? source.resource.trim()
        : undefined,
  };
}

function getErrorDetails(payload: unknown): ApiErrorDetail[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const rawErrors = (payload as { errors?: unknown }).errors;
  if (!Array.isArray(rawErrors)) {
    return [];
  }

  return rawErrors
    .map(toErrorDetail)
    .filter((detail): detail is ApiErrorDetail => detail !== null);
}

function getPayloadMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const body = payload as {
    message?: unknown;
    errors?: unknown;
  };

  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message.trim();
  }

  if (!Array.isArray(body.errors)) {
    return null;
  }

  for (const item of body.errors) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const message = (item as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }

  return null;
}

export function parseResponseError(
  status: number,
  statusText: string,
  payload: unknown,
): AppError {
  const details = getErrorDetails(payload);
  const payloadMessage = getPayloadMessage(payload);
  const fallbackStatusMessage = `HTTP ${status}: ${statusText || 'Request failed'}`;
  const message = details[0]?.message ?? payloadMessage ?? fallbackStatusMessage;

  return new AppError(statusToCode(status), message, status, details);
}

export function toAppError(
  error: unknown,
  fallbackMessage: string = DEFAULT_UNKNOWN_MESSAGE,
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return new AppError('TIMEOUT', DEFAULT_TIMEOUT_MESSAGE);
      }
      if (error.code === 'ERR_CANCELED') {
        return new AppError('TIMEOUT', DEFAULT_ABORT_MESSAGE);
      }
      return new AppError('NETWORK_ERROR', DEFAULT_NETWORK_MESSAGE);
    }

    return parseResponseError(
      error.response.status,
      error.response.statusText ?? '',
      error.response.data,
    );
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return new AppError('NETWORK_ERROR', DEFAULT_NETWORK_MESSAGE);
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new AppError('TIMEOUT', DEFAULT_ABORT_MESSAGE);
  }

  if (error && typeof error === 'object') {
    const source = error as Record<string, unknown>;
    const details = getErrorDetails(source);
    const messageFromPayload = getPayloadMessage(source);
    const messageFromError =
      typeof source.message === 'string' && source.message.trim()
        ? source.message.trim()
        : null;

    const message =
      details[0]?.message ??
      messageFromPayload ??
      messageFromError ??
      fallbackMessage;

    const status = typeof source.status === 'number' ? source.status : 0;
    return new AppError('UNKNOWN', message, status, details);
  }

  if (error instanceof Error && error.message.trim()) {
    return new AppError('UNKNOWN', error.message.trim());
  }

  if (typeof error === 'string' && error.trim()) {
    return new AppError('UNKNOWN', error.trim());
  }

  return new AppError('UNKNOWN', fallbackMessage || DEFAULT_UNKNOWN_MESSAGE);
}

export function parseErrorForForm(
  error: unknown,
  fallbackMessage: string,
  options: ParseFormErrorOptions = {},
): ParsedFormError {
  const appError = toAppError(error, fallbackMessage);
  const fieldAliases = options.fieldAliases ?? {};

  const fieldErrors: Record<string, string> = {};
  let formMessage: string | null = null;

  for (const detail of appError.details) {
    if (!detail.message) {
      continue;
    }

    if (detail.field) {
      const mappedField = fieldAliases[detail.field] ?? detail.field;
      if (!fieldErrors[mappedField]) {
        fieldErrors[mappedField] = detail.message;
      }
      continue;
    }

    if (!formMessage) {
      formMessage = detail.message;
    }
  }

  if (!formMessage && Object.keys(fieldErrors).length === 0) {
    formMessage = appError.message || fallbackMessage;
  }

  return {
    appError,
    fieldErrors,
    formMessage,
  };
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return toAppError(error, fallback).message;
}
