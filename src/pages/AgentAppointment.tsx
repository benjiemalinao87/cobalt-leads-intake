import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Confetti from '@/components/Confetti';

const WEBHOOK_URL = 'https://app.channelautomation.com/api/iwh/a309c73c378d461ab434e03485564884';

const AgentAppointment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const agent_email = searchParams.get('email') || '';
  const firstname = searchParams.get('firstname') || '';
  const lastname = searchParams.get('lastname') || '';
  const lead_id = searchParams.get('lead_id') || '';
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (status: 'completed' | 'not_happen') => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const url = `${WEBHOOK_URL}?agent_email=${encodeURIComponent(agent_email)}&phone=${encodeURIComponent(phone)}&firstname=${encodeURIComponent(firstname)}&lastname=${encodeURIComponent(lastname)}&lead_id=${encodeURIComponent(lead_id)}`;
      const payload: Record<string, string> = {
        status: status === 'completed' ? 'Appointment Completed' : 'Did Not Happen',
      };
      if (status === 'not_happen') {
        payload.reason = reason;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to send confirmation.');
      if (status === 'completed') {
        setSuccess(`Thank you${firstname ? ' ' + firstname : ''} for confirming!`);
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
          <div className="flex flex-col gap-4">
            <button
              className="w-full py-4 text-lg font-semibold rounded-xl bg-green-500 text-white shadow-md active:bg-green-600 transition"
              onClick={() => handleSubmit('completed')}
              disabled={loading}
            >
              Appointment Completed
            </button>
            <button
              className="w-full py-4 text-lg font-semibold rounded-xl bg-red-500 text-white shadow-md active:bg-red-600 transition"
              onClick={() => setShowReason(true)}
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
                handleSubmit('not_happen');
              }}
            >
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-base min-h-[80px] focus:ring-2 focus:ring-blue-400"
                placeholder="Enter reason..."
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
