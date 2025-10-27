'use client'

import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { signUpStep1Schema, signUpStep2Schema } from '../../lib/validationSchemas'
import { useRegisterUserMutation } from '../../services/api/UserApi'
import GmailLoginButton from '../social/GmailLoginButton'
import FacebookLoginButton from '../social/FacebookLoginButton'

interface SignUpProps {
  onClose?: () => void
  onSwitchToLogin?: () => void
}

const SignUp: React.FC<SignUpProps> = ({ onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registerUser, { isLoading }]: any = useRegisterUserMutation()

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  }

  const handleStep1Submit = async () => setStep(2)

  const handleStep2Submit = async (values: typeof initialValues) => {
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      }).unwrap()
      onClose?.()
    } catch (e) {
      // Erreur affichée par mutation error (non bloquant ici)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md">
        <Card className="bg-white backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
          <div className="relative px-8 pt-6 pb-6 ">
            {step === 2 && (
              <Button size="sm" onClick={() => setStep(1)} className="absolute cursor-pointer left-4 top-4 bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-600 z-10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="relative text-center">
              <h2 className="text-2xl font-bold text-blue-600 mb-2 ">{step === 1 ? 'Créer un compte' : 'Sécurité'}</h2>
              <p className="text-gray-600 text-sm">{step === 1 ? 'Rejoignez-nous et commencez votre aventure' : 'Définissez votre mot de passe sécurisé'}</p>
            </div>
          </div>

          <div className="px-8 pb-8">
            <Formik
              initialValues={initialValues}
              validationSchema={step === 1 ? signUpStep1Schema : signUpStep2Schema}
              onSubmit={step === 1 ? handleStep1Submit : handleStep2Submit}
              validateOnChange={false}
              validateOnBlur={true}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  {step === 1 ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700 flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            Prénom
                          </label>
                          <Field name="firstName">
                            {({ field }: any) => (
                              <Input
                                {...field}
                                type="text"
                                placeholder="Ahmed"
                                className={`h-11 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${
                                  (errors as any).firstName && (touched as any).firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                }`}
                              />
                            )}
                          </Field>
                          <ErrorMessage name="firstName" component="p" className="text-xs text-red-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700 flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            Nom
                          </label>
                          <Field name="lastName">
                            {({ field }: any) => (
                              <Input
                                {...field}
                                type="text"
                                placeholder="Yassine"
                                className={`h-11 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${
                                  (errors as any).lastName && (touched as any).lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                }`}
                              />
                            )}
                          </Field>
                          <ErrorMessage name="lastName" component="p" className="text-xs text-red-500" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <Field name="email">
                            {({ field }: any) => (
                              <Input
                                {...field}
                                type="email"
                                placeholder="vous@exemple.com"
                                className={`pl-10 h-11 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${
                                  (errors as any).email && (touched as any).email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                }`}
                              />
                            )}
                          </Field>
                        </div>
                        <ErrorMessage name="email" component="p" className="text-xs text-red-500" />
                      </div>

                      <Button type="submit" disabled={false} className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6">
                        <div className="flex items-center justify-center">
                          Continuer
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      </Button>

                      <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">Ou inscrivez-vous avec</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <GmailLoginButton color="green" />
                        <FacebookLoginButton color="blue" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Lock className="w-4 h-4 mr-1" />
                          Mot de passe
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                          <Field name="password">
                            {({ field }: any) => (
                              <Input
                                {...field}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className={`pl-10 pr-10 h-11 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${
                                  (errors as any).password && (touched as any).password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                }`}
                              />
                            )}
                          </Field>
                          <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword((v) => !v)}>
                            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" /> : <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />}
                          </button>
                        </div>
                        <ErrorMessage name="password" component="p" className="text-xs text-red-500" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Lock className="w-4 h-4 mr-1" />
                          Confirmer le mot de passe
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                          <Field name="confirmPassword">
                            {({ field }: any) => (
                              <Input
                                {...field}
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className={`pl-10 pr-10 h-11 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${
                                  (errors as any).confirmPassword && (touched as any).confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                }`}
                              />
                            )}
                          </Field>
                          <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword((v) => !v)}>
                            {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" /> : <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />}
                          </button>
                        </div>
                        <ErrorMessage name="confirmPassword" component="p" className="text-xs text-red-500" />
                      </div>

                      <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6">
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Création...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            Finaliser
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </div>
                        )}
                      </Button>

                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          Déjà un compte ?{' '}
                          <button type="button" onClick={onSwitchToLogin} className="text-blue-600 hover:text-blue-700 font-medium underline">
                            Se connecter
                          </button>
                        </p>
                      </div>
                    </>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SignUp


