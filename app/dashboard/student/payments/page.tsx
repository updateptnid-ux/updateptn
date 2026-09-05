import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PaymentsClient from './payments-client';

export const metadata: Metadata = {
  title: 'Riwayat Pembayaran | UpdatePTN',
  description: 'Lihat riwayat pembayaran dan lanjutkan pembayaran pending'
};

export default async function PaymentsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return <PaymentsClient />;
}
