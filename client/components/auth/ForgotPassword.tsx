'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react'
import { useForgotPasswordStartMutation, useForgotPasswordVerifyMutation, useResetPasswordMutation } from '../../services/api/UserApi'

interface ForgotPasswordProps {
  onClose?: () => void
  onSwitchToLogin?: () => void
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ email: '', otpCode: '', newPassword: '', confirmPassword: '' })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [startForgot, { isLoading: isStarting }] = useForgotPasswordStartMutation()
  const [verifyForgot, { isLoading: isVerifying }] = useForgotPasswordVerifyMutation()
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.email.trim()) newErrors.email = "L'email est obligatoire"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Format d'email invalide"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.otpCode.trim()) newErrors.otpCode = 'Le code de vérification est obligatoire'
    else if (formData.otpCode.length !== 6) newErrors.otpCode = 'Le code doit contenir 6 chiffres'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.newPassword) newErrors.newPassword = 'Le nouveau mot de passe est obligatoire'
    else if (formData.newPassword.length < 8) newErrors.newPassword = '8 caractères minimum'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'La confirmation est obligatoire'
    else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendOTP = async () => {
    if (!validateStep1()) return
    try {
      await startForgot({ email: formData.email }).unwrap()
      setStep(2)
    } catch (e: any) {
      setErrors({ email: e?.data?.message || e?.message || 'Erreur lors de l’envoi du code' })
    }
  }

  const handleVerifyOTP = async () => {
    if (!validateStep2()) return
    try {
      await verifyForgot({ email: formData.email, otpCode: formData.otpCode }).unwrap()
      setStep(3)
    } catch (e: any) {
      setErrors({ otpCode: e?.data?.message || e?.message || 'Code invalide' })
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return
    try {
      await resetPassword({ email: formData.email, newPassword: formData.newPassword }).unwrap()
      onClose?.()
    } catch (e: any) {
      setErrors({ confirmPassword: e?.data?.message || e?.message || 'Erreur de réinitialisation' })
    }
  }

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleResendOTP = async () => {
    try {
      await startForgot({ email: formData.email }).unwrap()
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md">
        <Card className="bg-white backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
          <div className="relative px-8 pt-6 pb-6 ">
            {(step === 2 || step === 3) && (
              <Button variant="ghost" size="sm" onClick={handlePrevStep} className="absolute cursor-pointer left-4 top-4 bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-600 z-10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="relative text-center">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">{step === 1 ? 'Mot de passe oublié' : step === 2 ? 'Vérification' : 'Nouveau mot de passe'}</h2>
              <p className="text-gray-600 text-sm">{step === 1 ? 'Entrez votre email pour recevoir un code' : step === 2 ? 'Vérifiez votre email' : 'Définissez votre nouveau mot de passe'}</p>
            </div>
          </div>

          <div className="px-8 pb-8">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input type="email" name="email" placeholder="vous@exemple.com" value={formData.email} onChange={handleInputChange} className={`pl-10 h-11 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`} required />
                  </div>
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                <Button type="button" onClick={handleSendOTP} disabled={isStarting} className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6">
                  {isStarting ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Envoi en cours...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Envoyer le code
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </Button>
              </div>
            ) : step === 2 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 text-center block">Code de vérification</label>
                  <div className="relative">
                    <Input type="text" name="otpCode" placeholder="123456" value={formData.otpCode} onChange={handleInputChange} className="h-12 text-center text-lg font-mono tracking-widest bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20" maxLength={6} required />
                  </div>
                  <p className="text-xs text-gray-500 text-center">Code envoyé à {formData.email}</p>
                  {errors.otpCode && <p className="text-xs text-red-500 text-center">{errors.otpCode}</p>}
                </div>

                <div className="text-center">
                  <button type="button" onClick={handleResendOTP} disabled={isStarting} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    <RefreshCw className={`w-4 h-4 inline mr-1 ${isStarting ? 'animate-spin' : ''}`} />
                    Renvoyer le code
                  </button>
                </div>

                <Button type="button" onClick={handleVerifyOTP} disabled={isVerifying} className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6">
                  {isVerifying ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Vérification...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Vérifier le code
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Lock className="w-4 h-4 mr-1" />
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input type={showNewPassword ? 'text' : 'password'} name="newPassword" placeholder="••••••••" value={formData.newPassword} onChange={handleInputChange} className={`pl-10 pr-10 h-11 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`} required />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowNewPassword((v) => !v)}>
                      {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" /> : <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Lock className="w-4 h-4 mr-1" />
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} className={`pl-10 pr-10 h-11 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`} required />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword((v) => !v)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" /> : <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" disabled={isResetting} className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6">
                  {isResetting ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Réinitialisation...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Réinitialiser le mot de passe
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </Button>
              </form>
            )}

            {step === 1 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Vous vous souvenez de votre mot de passe ?{' '}
                    <button type="button" onClick={onSwitchToLogin} className="text-blue-600 hover:text-blue-700 font-medium underline">
                      Se connecter
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword


