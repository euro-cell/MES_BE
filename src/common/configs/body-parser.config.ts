import { RequestHandler, json } from 'express';

export function createDefaultJsonParser(): RequestHandler {
  return json();
}
