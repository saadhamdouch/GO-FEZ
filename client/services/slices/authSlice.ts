import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AuthModalState {
  isLoginOpen: boolean
  isSignUpOpen: boolean
  isForgotPasswordOpen: boolean
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
  currentStep: number
}

const initialState: AuthModalState = {
  isLoginOpen: false,
  isSignUpOpen: false,
  isForgotPasswordOpen: false,
  status: 'idle',
  error: null,
  currentStep: 1,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.isLoginOpen = true
      state.isSignUpOpen = false
      state.isForgotPasswordOpen = false
      state.error = null
    },
    openSignUpModal: (state) => {
      state.isSignUpOpen = true
      state.isLoginOpen = false
      state.isForgotPasswordOpen = false
      state.error = null
    },
    openForgotPasswordModal: (state) => {
      state.isForgotPasswordOpen = true
      state.isLoginOpen = false
      state.isSignUpOpen = false
      state.error = null
    },

    closeLoginModal: (state) => {
      state.isLoginOpen = false
      state.error = null
    },
    closeSignUpModal: (state) => {
      state.isSignUpOpen = false
      state.error = null
    },
    closeForgotPasswordModal: (state) => {
      state.isForgotPasswordOpen = false
      state.error = null
    },

    closeAllModals: (state) => {
      state.isLoginOpen = false
      state.isSignUpOpen = false
      state.isForgotPasswordOpen = false
      state.error = null
    },

    switchToSignUp: (state) => {
      state.isLoginOpen = false
      state.isSignUpOpen = true
      state.isForgotPasswordOpen = false
      state.error = null
    },
    switchToLogin: (state) => {
      state.isSignUpOpen = false
      state.isLoginOpen = true
      state.isForgotPasswordOpen = false
      state.error = null
    },
    switchToForgotPassword: (state) => {
      state.isLoginOpen = false
      state.isSignUpOpen = false
      state.isForgotPasswordOpen = true
      state.error = null
    },

    setAuthStatus: (state, action: PayloadAction<'idle' | 'loading' | 'success' | 'error'>) => {
      state.status = action.payload
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.status = 'error'
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },
    resetAuthState: (state) => {
      state.isLoginOpen = false
      state.isSignUpOpen = false
      state.isForgotPasswordOpen = false
      state.status = 'idle'
      state.error = null
      state.currentStep = 1
    },
  },
})

export const {
  openLoginModal,
  openSignUpModal,
  openForgotPasswordModal,
  closeLoginModal,
  closeSignUpModal,
  closeForgotPasswordModal,
  closeAllModals,
  switchToSignUp,
  switchToLogin,
  switchToForgotPassword,
  setAuthStatus,
  setAuthError,
  setCurrentStep,
  resetAuthState,
} = authSlice.actions

export default authSlice.reducer


