import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Confetti from '@/components/Confetti';

const WEBHOOK_URL = 'https://app.channelautomation.com/api/iwh/a309c73c378d461ab434e03485564884';

const AgentAppointment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const agent_email = searchParams.get('email') || '';
  const sales_rep_name = searchParams.get('sales_rep_name') || '';
  const lead_id = searchParams.get('lead_id') || '';
  const sales_rep_id = searchParams.get('sales_rep_id') || '';
  const adate = searchParams.get('adate') || '';
  const atime = searchParams.get('atime') || '';
  const customerName = searchParams.get('customerName') || '';
  const [showReason, setShowReason] = useState<false | 'not_happen' | 'no_show'>(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (status: 'completed' | 'not_happen' | 'no_show') => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const url = `${WEBHOOK_URL}?agent_email=${encodeURIComponent(agent_email)}&phone=${encodeURIComponent(phone)}&sales_rep_name=${encodeURIComponent(sales_rep_name)}&lead_id=${encodeURIComponent(lead_id)}&sales_rep_id=${encodeURIComponent(sales_rep_id)}&adate=${encodeURIComponent(adate)}&atime=${encodeURIComponent(atime)}&customerName=${encodeURIComponent(customerName)}`;
      const payload: Record<string, string> = {
        status:
          status === 'completed'
            ? 'Appointment Completed'
            : status === 'no_show'
            ? 'No Show'
            : 'Did Not Happen',
        agent_email,
        phone,
        sales_rep_name,
        lead_id,
        sales_rep_id,
        adate,
        atime,
        customerName,
      };
      if (status === 'not_happen' || status === 'no_show') {
        payload.reason = reason;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to send confirmation.');
      if (status === 'completed') {
        setSuccess(`Thank you${sales_rep_name ? ' ' + sales_rep_name : ''} for confirming!`);
      } else if (status === 'no_show') {
        setSuccess('No Show reason submitted! Thank you.');
      } else {
        setSuccess('Submitted! Thank you.');
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-blue-100 px-4 py-8">
      {success ? (
        <div className="w-full max-w-sm flex flex-col items-center justify-center">
          <Confetti />
          <div className="text-green-600 text-center font-bold text-3xl md:text-4xl py-20">
            {success}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-center text-blue-700 mb-2">Agent Appointment Confirmation</h1>
          <div className="text-center text-base md:text-lg font-semibold mb-4 text-gray-800">
            {`Hello ${sales_rep_name}, your appointment with ${customerName} at ${adate} ${atime} has passed. Please select option:`}
          </div>
          <div className="flex flex-col gap-4">
            <button
              className="w-full py-4 text-lg font-semibold rounded-xl bg-green-500 text-white shadow-md active:bg-green-600 transition"
              onClick={() => handleSubmit('completed')}
              disabled={loading}
            >
              Appointment Completed
            </button>
            <button
              className="w-full py-4 text-lg font-semibold rounded-xl bg-yellow-500 text-white shadow-md active:bg-yellow-600 transition"
              onClick={() => setShowReason('no_show')}
              disabled={loading}
            >
              No Show
            </button>
            <button
              className="w-full py-4 text-lg font-semibold rounded-xl bg-red-500 text-white shadow-md active:bg-red-600 transition"
              onClick={() => setShowReason('not_happen')}
              disabled={loading}
            >
              Did Not Happen
            </button>
          </div>
          {showReason && (
            <form
              className="flex flex-col gap-3 mt-2"
              onSubmit={e => {
                e.preventDefault();
                handleSubmit(showReason);
              }}
            >
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-base min-h-[80px] focus:ring-2 focus:ring-blue-400 text-gray-900"
                placeholder={showReason === 'no_show' ? 'Enter reason for no show...' : 'Enter reason...'}
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="submit"
                className="w-full py-3 text-base font-semibold rounded-xl bg-blue-600 text-white shadow active:bg-blue-700 transition"
                disabled={loading || !reason.trim()}
              >
                Submit Reason
              </button>
              <button
                type="button"
                className="w-full py-2 text-xs text-gray-500 underline"
                onClick={() => setShowReason(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </form>
          )}
          {error && <div className="text-red-600 text-center font-medium">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default AgentAppointment;
