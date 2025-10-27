'use client'

import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useDispatch } from 'react-redux'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { CountrySelector } from '../ui/country-selector'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react'
import countriesData from '../../data/countries.json'
import { loginStep1Schema } from '../../lib/validationSchemas'
import { useLoginUserMutation } from '../../services/api/UserApi'
import GmailLoginButton from '../social/GmailLoginButton'
import FacebookLoginButton from '../social/FacebookLoginButton'

interface LoginProps {
  onClose?: () => void
  onSwitchToSignUp?: () => void
  onSwitchToForgotPassword?: () => void
}

const Login: React.FC<LoginProps> = ({ onClose, onSwitchToSignUp, onSwitchToForgotPassword }) => {
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [loginUser, { isLoading, error }]: any = useLoginUserMutation()

  const initialValues = {
    email: '',
    password: '',
  }

  const handleLoginSubmit = async (values: typeof initialValues) => {
    try {
      const payload = { identifier: values.email, password: values.password }
      await loginUser(payload).unwrap()
      onClose?.()
    } catch (e) {
      // Erreurs gérées dans l'UI via `error`
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md">
        <Card className="bg-white backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
          <div className="relative px-8 pt-8 pb-6 ">
            <div className="relative text-center">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">Connexion</h2>
              <p className="text-gray-600 text-sm">Connectez-vous à votre compte</p>
            </div>
          </div>

          <div className="px-8 pb-8">
            <Formik
              initialValues={initialValues}
              validationSchema={loginStep1Schema}
              onSubmit={handleLoginSubmit}
              validateOnChange={false}
              validateOnBlur={true}
            >
              {({ errors, touched }) => (
                <Form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
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

                  <div className=" mt-4">
                    <button type="button" onClick={onSwitchToForgotPassword} className="text-sm text-blue-600 hover:text-blue-700 font-medium underline">
                      Mot de passe oublié ?
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">{(error as any)?.data?.message || (error as any)?.error || 'Erreur de connexion'}</p>
                    </div>
                  )}

                  <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Connexion...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Se connecter
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Pas encore de compte ?{' '}
                        <button type="button" onClick={onSwitchToSignUp} className="text-blue-600 hover:text-blue-700 font-medium underline">
                          Créer un compte
                        </button>
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Ou continuez avec</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <GmailLoginButton color="green" />
                    <FacebookLoginButton color="blue" />
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login


