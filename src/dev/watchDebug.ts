// @ts-nocheck

import { watch as originalWatch } from 'vue'

export function watchDebug(source, cb, options = {}) {
  const startTime = new Date().getTime();
  const result = originalWatch(source, cb, options);
  const endTime = new Date().getTime();
  const duration = endTime - startTime;

  if (duration > 100) {
    console.log("Watch took more than 100ms!");
    console.log(source);
  }

  return result;
}
