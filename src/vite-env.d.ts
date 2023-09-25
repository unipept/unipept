/* eslint-disable @typescript-eslint/ban-types */
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare const APP_VERSION: string;
declare const TASK_QUEUE_SIZE: number;
