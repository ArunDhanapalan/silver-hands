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
  Download,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function SeniorEarningsPage() {
  const { user } = useAuth();
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEarningsData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get('/senior/earnings');
        setEarningsData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch personal earnings details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEarningsData();
  }, []);

  const totalEarnings = earningsData?.total_earnings || 0;
  const storeEarnings = earningsData?.store_earnings || 0;
  const serviceEarnings = earningsData?.service_earnings || 0;
  const pendingPayout = earningsData?.pending_payout || 0;
  const transactions = earningsData?.transactions || [];

  const handleDownloadStatement = () => {
    if (!transactions || transactions.length === 0) {
      alert('No transactions recorded to download.');
      return;
    }
    const csvRows = [
      ['Date', 'Activity / Item Description', 'Type', 'Status', 'Earnings (INR)'],
      ...transactions.map(t => [
        `"${t.date || ''}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${t.type === 'store_product' ? 'Store Product' : 'Tuition / Service'}"`,
        `"${t.status || 'Settled'}"`,
        `"${t.amount || 0}"`
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SilverHands_Earnings_Statement_${user?.full_name || 'Senior'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            Real-time tracking of {earningsData?.senior_name || user?.full_name || 'Senior'}'s verified store product sales, tuition fees, and settlements.
          </p>
        </div>

        <button 
          onClick={handleDownloadStatement}
          className="btn btn-outline btn-neutral btn-sm rounded-xl font-bold gap-1 text-xs self-start sm:self-auto hover:bg-neutral hover:text-white"
        >
          <Download className="w-3.5 h-3.5" /> Download Statement
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
              <div className="text-3xl font-black text-primary">
                ₹{totalEarnings.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-base-content/60 font-medium">
                Verified direct payout to linked bank account
              </p>
            </div>

            <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-xs space-y-2">
              <span className="text-xs font-bold text-base-content/70 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-secondary" /> Store Products Sales
              </span>
              <div className="text-2xl font-extrabold text-base-content">
                ₹{storeEarnings.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-base-content/60">
                {earningsData?.completed_orders_count || 0} completed product orders
              </p>
            </div>

            <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-xs space-y-2">
              <span className="text-xs font-bold text-base-content/70 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent" /> Managed Services & Tuition
              </span>
              <div className="text-2xl font-extrabold text-base-content">
                ₹{serviceEarnings.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-base-content/60">
                {earningsData?.completed_services_count || 0} online/offline sessions completed
              </p>
            </div>

          </div>

          {/* Settlement Status Banner */}
          <div className="bg-base-100 border border-success/30 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 text-success flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-xs font-bold text-base-content uppercase tracking-wider">Weekly Settlement Cycle</h4>
                <p className="text-xs text-base-content/70">
                  Direct NEFT/UPI transfer every Monday. Next batch: <span className="font-semibold text-primary">Coming Monday</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-base-content/60 uppercase font-bold block">Pending In-Flight</span>
              <span className="text-base font-extrabold text-warning">₹{pendingPayout.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Itemized Transactions Table */}
          <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-base-content flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Itemized Income Ledger
              </h3>
              <span className="text-xs text-base-content/60 font-semibold">
                {transactions.length} Transactions
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto text-base-content/40">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-base-content">No transactions recorded yet</h4>
                <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                  When customers purchase your handcrafted store items or book language tuition sessions, your itemized payouts will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar max-w-full">
                <table className="table table-zebra w-full text-xs">
                  <thead>
                    <tr className="text-base-content/70 font-bold border-b border-base-300">
                      <th className="whitespace-nowrap">Date</th>
                      <th>Activity / Item</th>
                      <th className="whitespace-nowrap">Type</th>
                      <th className="whitespace-nowrap">Status</th>
                      <th className="text-right whitespace-nowrap">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn, idx) => (
                      <tr key={idx} className="hover">
                        <td className="font-mono text-base-content/70 whitespace-nowrap">{txn.date}</td>
                        <td className="font-bold text-base-content max-w-[200px] truncate" title={txn.description}>{txn.description}</td>
                        <td className="whitespace-nowrap">
                          <span className={`badge badge-xs font-semibold whitespace-nowrap ${
                            txn.type === 'store_product' ? 'badge-secondary' : 'badge-accent'
                          }`}>
                            {txn.type === 'store_product' ? 'Product' : 'Service'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap">
                          <span className={`badge badge-xs font-bold whitespace-nowrap ${
                            txn.status === 'Settled' ? 'badge-success text-white' : 'badge-warning'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="text-right font-extrabold text-success text-sm whitespace-nowrap">
                          +₹{txn.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
