'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (sessionId) {
      setTimeout(() => {
        setStatus('success');
      }, 1500);
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-xl">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md text-center p-8">
          <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
          <p className="text-slate-600 mb-6">We couldn't confirm your payment. Please contact support.</p>
          <a href="/#pricing" className="text-teal-600 hover:underline">Back to Pricing</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md text-center p-8 bg-white rounded-3xl shadow-xl">
        <div className="text-6xl mb-6">⚓</div>
        <h1 className="text-4xl font-bold text-[#0A2540] mb-4">Welcome to the Harbor!</h1>
        <p className="text-xl text-slate-600 mb-8">
          Your subscription is now active. A concierge has been assigned to your account and will reach out shortly.
        </p>
        
        <div className="space-y-4">
          <a 
            href="/#dashboards" 
            className="block w-full bg-[#0A2540] text-white py-4 rounded-2xl font-semibold hover:bg-teal-600 transition"
          >
            Go to Your Portal
          </a>
          <a 
            href="/#pricing" 
            className="block w-full border py-4 rounded-2xl font-semibold hover:bg-slate-50 transition"
          >
            Manage Subscription
          </a>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Check your email for your welcome packet and concierge introduction.
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
