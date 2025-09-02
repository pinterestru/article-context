# State Management

## Store Structure

```plaintext
src/
├── providers/
│   ├── cloak-provider.tsx      # Cloaking state context
│   ├── query-provider.tsx      # React Query setup
│   └── intl-provider.tsx       # Internationalization
└── lib/
    ├── hooks/
    │   ├── use-cloak.ts        # Cloak state hook
    │   └── use-promocode.ts    # Promocode interaction hook
    └── store/
        └── cloak-store.ts      # Cloak state logic
```

## State Management Template

```typescript
// src/lib/store/cloak-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CloakState {
  mode: 'white' | 'black'
  verificationToken: string | null
  isVerified: boolean
  userId: string | null
  fingerprint: string | null
  firstVisitAt: number | null
  isBlacklisted: boolean
  
  // Actions
  setMode: (mode: 'white' | 'black') => void
  setVerificationData: (data: { token: string; userId: string }) => void
  setFingerprint: (fingerprint: string) => void
  markAsVerified: () => void
  markAsBlacklisted: () => void
  resetState: () => void
}

const FIVE_MINUTES = 5 * 60 * 1000

export const useCloakStore = create<CloakState>()(
  persist(
    (set, get) => ({
      // Initial state
      mode: 'white',
      verificationToken: null,
      isVerified: false,
      userId: null,
      fingerprint: null,
      firstVisitAt: null,
      isBlacklisted: false,

      // Actions
      setMode: (mode) => {
        const state = get()
        const now = Date.now()
        
        // Enforce 5-minute window
        if (state.firstVisitAt && now - state.firstVisitAt > FIVE_MINUTES) {
          set({ mode: 'white', isBlacklisted: true })
          return
        }
        
        set({ 
          mode,
          firstVisitAt: state.firstVisitAt || now
        })
      },

      setVerificationData: ({ token, userId }) => {
        set({ 
          verificationToken: token,
          userId 
        })
      },

      setFingerprint: (fingerprint) => {
        const state = get()
        
        // Check for fingerprint reuse
        if (state.fingerprint && state.fingerprint !== fingerprint) {
          set({ 
            mode: 'white',
            isBlacklisted: true,
            fingerprint 
          })
          return
        }
        
        set({ fingerprint })
      },

      markAsVerified: () => set({ isVerified: true }),
      
      markAsBlacklisted: () => {
        set({ 
          mode: 'white',
          isBlacklisted: true 
        })
      },

      resetState: () => {
        set({
          mode: 'white',
          verificationToken: null,
          isVerified: false,
          userId: null,
          fingerprint: null,
          firstVisitAt: null,
          isBlacklisted: false
        })
      }
    }),
    {
      name: 'cloak-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userId: state.userId,
        isBlacklisted: state.isBlacklisted,
        fingerprint: state.fingerprint
      })
    }
  )
)
```
