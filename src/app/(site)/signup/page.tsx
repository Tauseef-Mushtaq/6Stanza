import type { Metadata } from 'next';
import { SignupForm } from '@/features/auth/sections/SignupForm';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your 6STANZA account.',
};

export default function SignupPage() {
  return <SignupForm />;
}
