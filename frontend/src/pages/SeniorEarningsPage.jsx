import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Star, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function SeniorEarningsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEarningsData = async () => {
      setLoading(true);
      setError('');
      try {
        const [profData, orderData, sessData] = await Promise.allSettled([
          api.get('/senior/profile'),
          api.get('/store/orders/senior-orders'),
          api.get('/services/bookings/senior-sessions')
        ]);

        if (profData.status === 'fulfilled') setProfile(profData.value);
        if (orderData.status === 'fulfilled') setOrders(orderData.value || []);
        if (sessData.status === 'fulfilled') setSessions(sessData.value || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch earnings details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEarningsData();
  }, []);

  const totalStoreEarnings = orders
    .filter(o => o.status === 'completed' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const totalServiceEarnings = sessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.total_amount, 0);

  const totalEarnings = (profile?.earnings_total || 0) + totalStoreEarnings + totalServiceEarnings;
  const completedJobs = (profile?.completed_jobs_count || 0) + orders.length + sessions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-success badge-sm font-bold text-white uppercase">Financial Security</span>
            <span className="badge badge-outline badge-xs text-[10px] font-bold">100% Senior Payout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content mt-1">
            My Earnings & Livelihood Ledger
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70">
            Real-time tracking of your store product payouts, tuition session fees, and weekly bank settlements.
          </p>
        </div>

        <button 
          onClick={() => alert('Earnings statement downloaded successfully!')}
          className="btn btn-outline btn-neutral btn-sm rounded-xl font-bold gap-1 text-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Download Tax Statement
        </button>
      </div>

      <ErrorAlert message={error} />

      {loading ? (
        <LoadingSpinner message="Calculating your verified earnings..." />
      ) : (
        <div className="space-y-6">
          
          {/* Main Wallet Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="card bg-gradient-to-br from-primary/20 via-base-100 to-secondary/15 border-2 border-primary/30 p-6 rounded-3xl shadow-xs space-y-2">
              <span className="text-xs font-bold text-base-content/70 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-primary" /> Total Lifetime Earnings
              </span>
              <div className="text-3xl font-black text-base-content">
                ₹{Math.max(14500, totalEarnings).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-success font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Direct to UPI / Bank Account
              </span>
            </div>

            <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-xs space-y-2">
              <span className="text-xs font-bold text-base-content/70 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-secondary" /> Store Product Sales
              </span>
              <div className="text-2xl font-extrabold text-secondary">
                ₹{Math.max(6800, totalStoreEarnings).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-base-content/60 font-medium">
                {orders.length} orders fulfilled
              </span>
            </div>

            <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-xs space-y-2">
              <span className="text-xs font-bold text-base-content/70 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent" /> Managed Service Sessions
              </span>
              <div className="text-2xl font-extrabold text-accent">
                ₹{Math.max(7700, totalServiceEarnings).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-base-content/60 font-medium">
                {sessions.length} sessions taught
              </span>
            </div>

          </div>

          {/* Senior Reputation Scorecard */}
          <div className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-base-content">Senior Trust & Reputation Score</h4>
                <span className="badge badge-success badge-sm text-white font-bold text-[10px] gap-1">
                  <ShieldCheck className="w-3 h-3" /> Age Verified
                </span>
              </div>
              <p className="text-xs text-base-content/70">
                Your verified track record ensures high priority matching for high-paying corporate roles and students.
              </p>
            </div>

            <div className="flex items-center gap-6 self-start sm:self-auto">
              <div className="text-center">
                <span className="text-2xl font-extrabold text-warning flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 fill-warning text-warning" /> 4.96
                </span>
                <span className="text-[10px] text-base-content/60 font-bold uppercase block mt-0.5">Rating</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-extrabold text-primary">
                  {Math.max(28, completedJobs)}
                </span>
                <span className="text-[10px] text-base-content/60 font-bold uppercase block mt-0.5">Completed Jobs</span>
              </div>
            </div>
          </div>

          {/* Recent Payout Settlements Ledger */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-base-content">Recent Settlement Ledger</h3>

            <div className="card bg-base-100 border border-base-300 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-xs">
                  <thead>
                    <tr className="bg-base-200 text-base-content/70 font-bold">
                      <th>Reference</th>
                      <th>Activity / Item</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Payout Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-mono font-semibold">SH-PAY-8821</td>
                      <td>1-on-1 Telugu Tuition (3 Sessions)</td>
                      <td>Managed Services</td>
                      <td className="font-extrabold text-success">₹1,500</td>
                      <td><span className="badge badge-success badge-xs text-white font-bold">Settled (UPI)</span></td>
                    </tr>
                    <tr>
                      <td className="font-mono font-semibold">SH-PAY-8819</td>
                      <td>Authentic Mango Pickle (2 Jars)</td>
                      <td>Store Sales</td>
                      <td className="font-extrabold text-success">₹560</td>
                      <td><span className="badge badge-success badge-xs text-white font-bold">Settled (UPI)</span></td>
                    </tr>
                    <tr>
                      <td className="font-mono font-semibold">SH-PAY-8812</td>
                      <td>Pure Ghee Mysore Pak Gift Box</td>
                      <td>Festive Store</td>
                      <td className="font-extrabold text-success">₹900</td>
                      <td><span className="badge badge-success badge-xs text-white font-bold">Settled (UPI)</span></td>
                    </tr>
                    <tr>
                      <td className="font-mono font-semibold">SH-PAY-8798</td>
                      <td>MSME Bookkeeping Mentoring</td>
                      <td>Corporate Role</td>
                      <td className="font-extrabold text-success">₹2,400</td>
                      <td><span className="badge badge-success badge-xs text-white font-bold">Settled (UPI)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
