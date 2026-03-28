import { getRequestContext } from '@cloudflare/next-on-pages';

export function getDB() {
  return getRequestContext().env.DB;
}

export function getKV() {
  return getRequestContext().env.KV;
}

export function getR2() {
  return getRequestContext().env.R2;
}
