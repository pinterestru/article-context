// Components
export { PromocodeDialogClient } from './components/PromocodeDialog.client'
export { PromocodeDialogWrapper } from './components/PromocodeDialogWrapper.client'
export { PromocodeErrorBoundary } from './components/PromocodeErrorBoundary.client'
export { DialogSkeleton } from './components/DialogSkeleton'

// Types
export type { 
  PromocodeData
} from './types'

// Utils
export { copyToClipboard } from './utils/clipboard'
export { triggerHapticFeedback } from './utils/haptic'

// Constants (client-safe)
export { PROMOCODE_CONFIG, FEATURE_FLAGS } from './constants'

// Schemas
export { PromocodeApiResponseSchema } from './schemas/api'
export type { PromocodeApiResponse } from './schemas/api'

// Transformers
export { 
  transformToPromocodeData,
} from './transformers'