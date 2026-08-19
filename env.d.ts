/// <reference types="vite/client" />
/// <reference types="element-plus/global" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
declare module '@element-plus/icons-vue' {
  export const HomeFilled: any
  export const Calendar: any
  export const Document: any
  export const DataAnalysis: any
  export const Setting: any
  export const Bell: any
  export const Fold: any
  export const Expand: any
  export const User: any
  export const CaretBottom: any
  export const SwitchButton: any
  export const Lock: any
  export const Timer: any
  export const Check: any
  export const List: any
}
