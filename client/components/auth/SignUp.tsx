'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useDispatch } from 'react-redux';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User as UserIcon, Phone } from 'lucide-react';
import GmailLoginButton from '@/components/social/GmailLoginButton';
import FacebookLoginButton from '@/components/social/FacebookLoginButton';

// Logic & API
import { signUpSchema } from '@/lib/validationSchemas';
import { useRegisterUserMutation, useProviderRegisterMutation } from '@/services/api/UserApi';

interface SignUpProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onClose, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const t = useTranslations('SignUp');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerUser, { isLoading, error }] = useRegisterUserMutation();
  const [providerRegister] = useProviderRegisterMutation();

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  };

  const handleSignUpSubmit = async (values: typeof initialValues) => {
    try {
      const { confirmPassword, ...payload } = values;
      const finalPayload = {
        ...payload,
        email: payload.email?.trim() || undefined,
        phone: payload.phone?.trim() || undefined,
      };

      await registerUser(finalPayload).unwrap();
      toast.success(t('success'));
      onSwitchToLogin?.();
    } catch (err: any) {
      const errorMessage = err?.data?.message || t('error');
      toast.error(errorMessage);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const googleData = {
        provider: 'google',
        id: 'google-id-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@gmail.com',
      };
      await providerRegister(googleData).unwrap();
      toast.success(t('success'));
      onSwitchToLogin?.();
    } catch (err: any) {
      toast.error(err?.data?.message || t('error'));
    }
  };

  const handleFacebookSignup = async () => {
    try {
      const facebookData = {
        provider: 'facebook',
        id: 'facebook-id-456',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@facebook.com',
        phone: '+212600000000',
      };
      await providerRegister(facebookData).unwrap();
      toast.success(t('success'));
      onSwitchToLogin?.();
    } catch (err: any) {
      toast.error(err?.data?.message || t('error'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md">
        <Card className="bg-white backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
          <div className="relative px-8 pt-8 pb-6 text-center">
            <h2 className="text-2xl font-bold text-emerald-600 mb-2">{t('title')}</h2>
            <p className="text-gray-600 text-sm">{t('description')}</p>
          </div>

          <div className="px-8 pb-8">
            <Formik
              initialValues={initialValues}
              validationSchema={signUpSchema}
              onSubmit={handleSignUpSubmit}
              validateOnChange={false}
              validateOnBlur={true}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  {/* First & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field name="firstName">
                      {({ field }: any) => (
                        <Input {...field} placeholder={t('firstNamePlaceholder')} className={`h-11 ${errors.firstName && touched.firstName ? 'border-red-500' : ''}`} />
                      )}
                    </Field>
                    <Field name="lastName">
                      {({ field }: any) => (
                        <Input {...field} placeholder={t('lastNamePlaceholder')} className={`h-11 ${errors.lastName && touched.lastName ? 'border-red-500' : ''}`} />
                      )}
                    </Field>
                  </div>
                  <ErrorMessage name="firstName" component="p" className="text-xs text-red-500" />
                  <ErrorMessage name="lastName" component="p" className="text-xs text-red-500" />

                  {/* Email */}
                  <Field name="email">
                    {({ field }: any) => (
                      <Input {...field} type="email" placeholder="name@example.com" className={`h-11 ${errors.email && touched.email ? 'border-red-500' : ''}`} />
                    )}
                  </Field>
                  <ErrorMessage name="email" component="p" className="text-xs text-red-500" />

                  {/* Phone */}
                  <Field name="phone">
                    {({ field }: any) => (
                      <Input {...field} type="tel" placeholder="+212 6 00 00 00 00" className={`h-11 ${errors.phone && touched.phone ? 'border-red-500' : ''}`} />
                    )}
                  </Field>
                  <ErrorMessage name="phone" component="p" className="text-xs text-red-500" />

                  {/* Password */}
                  <Field name="password">
                    {({ field }: any) => (
                      <Input {...field} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={`h-11 ${errors.password && touched.password ? 'border-red-500' : ''}`} />
                    )}
                  </Field>
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-xs text-gray-500 underline">
                    {showPassword ? t('hidePassword') : t('showPassword')}
                  </button>
                  <ErrorMessage name="password" component="p" className="text-xs text-red-500" />

                  {/* Confirm Password */}
                  <Field name="confirmPassword">
                    {({ field }: any) => (
                      <Input {...field} type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" className={`h-11 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`} />
                    )}
                  </Field>
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="text-xs text-gray-500 underline">
                    {showConfirmPassword ? t('hidePassword') : t('showPassword')}
                  </button>
                  <ErrorMessage name="confirmPassword" component="p" className="text-xs text-red-500" />

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">{error?.data?.message || t('error')}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <Button type="submit" disabled={isLoading} className="w-full h-12">
                    {isLoading ? t('loading') : (
                      <div className="flex items-center justify-center">
                        <UserIcon className="w-5 h-5 mr-2" />
                        {t('submit')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>

                  {/* Switch to login */}
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      {t('alreadyAccount')}{' '}
                      <button type="button" onClick={onSwitchToLogin} className="text-emerald-600 underline">
                        {t('login')}
                      </button>
                    </p>
                  </div>

                  {/* Social Signup */}
                  <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">{t('orSignUpWith')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                                        <GmailLoginButton onClick={handleGoogleSignup} color="emerald" />
                    <FacebookLoginButton onClick={handleFacebookSignup} color="blue" />
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
