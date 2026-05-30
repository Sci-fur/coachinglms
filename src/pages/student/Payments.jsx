import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import {
  Loader2, CreditCard, CheckCircle, AlertCircle, Clock,
  XCircle, Smartphone, Landmark, X,
} from "lucide-react";

const statusStyles = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  unpaid: "bg-red-50 text-red-700 border-red-200",
};

const statusIcons = {
  paid: CheckCircle,
  partial: Clock,
  unpaid: AlertCircle,
};

const statusLabels = {
  paid: "Paid",
  partial: "Partial",
  unpaid: "Unpaid",
};

const gateways = [
  { id: "bkash", label: "bKash", icon: Smartphone, color: "from-pink-600 to-rose-600", border: "border-pink-200", bg: "bg-pink-50", text: "text-pink-700" },
  { id: "nagad", label: "Nagad", icon: Smartphone, color: "from-orange-500 to-orange-600", border: "border-orange-200", bg: "bg-orange-50", text: "text-orange-700" },
  { id: "rocket", label: "Rocket", icon: Smartphone, color: "from-purple-600 to-red-600", border: "border-purple-200", bg: "bg-purple-50", text: "text-purple-700" },
  { id: "card", label: "Debit/Credit Card", icon: CreditCard, color: "from-blue-600 to-blue-700", border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700" },
  { id: "bank", label: "Bank Transfer", icon: Landmark, color: "from-teal-600 to-cyan-700", border: "border-teal-200", bg: "bg-teal-50", text: "text-teal-700" },
];

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payingId, setPayingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalEnrollment, setModalEnrollment] = useState(null);

  const bkashStatus = searchParams.get("bkash_status");
  const trxID = searchParams.get("trxID");

  useEffect(() => {
    if (bkashStatus === "success") {
      setToast({ type: "success", message: `Payment successful${trxID ? ` (TRX: ${trxID})` : ""}!` });
      setSearchParams({}, { replace: true });
    } else if (bkashStatus === "cancelled") {
      setToast({ type: "info", message: "Payment was cancelled." });
      setSearchParams({}, { replace: true });
    } else if (bkashStatus === "failed") {
      setToast({ type: "error", message: "Payment failed. Please try again." });
      setSearchParams({}, { replace: true });
    }
  }, [bkashStatus, trxID, setSearchParams]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ["student-payments"],
    queryFn: async () => {
      const { data } = await client.get("/student/payments");
      return data.data;
    },
  });

  const totalDue =
    payments?.reduce((sum, p) => sum + (p.dueAmount || 0), 0) || 0;

  const openPayModal = (p) => {
    setModalEnrollment(p);
    setShowModal(true);
  };

  const handlePayWithGateway = async (gateway) => {
    if (!modalEnrollment) return;
    setPayingId(modalEnrollment._id);
    setShowModal(false);
    try {
      const { data } = await client.post("/payment/create", {
        enrollmentId: modalEnrollment._id,
        gateway,
      });

      if (data.data?._demo) {
        setToast({ type: "success", message: data.data.message || "Demo payment recorded!" });
        refetch();
      } else if (data.data?.redirectURL) {
        window.location.href = data.data.redirectURL;
      }
    } catch {
      setToast({ type: "error", message: "Failed to initiate payment. Try again." });
    } finally {
      setPayingId(null);
      setModalEnrollment(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium animate-in ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : toast.type === "error" ? (
            <XCircle className="h-4 w-4 shrink-0" />
          ) : (
            <Clock className="h-4 w-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Due Payment</h1>
          <p className="text-sm text-slate-500">View pending fees and choose a payment method</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total due</p>
          <p className="text-xl font-bold text-red-600">৳{totalDue.toLocaleString()}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !payments?.length ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          </div>
          <p className="font-semibold text-slate-600">No pending payments</p>
          <p className="text-sm text-slate-400 mt-1">All your courses are paid up</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Course</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Total</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Paid</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Due</th>
                <th className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Status</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments?.map((p) => {
                const SafeIcon = statusIcons[p.paymentStatus] || Clock;
                const style = statusStyles[p.paymentStatus] || "";
                const isPending = payingId === p._id;
                return (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-slate-800">{p.courseName}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-slate-700">৳{p.totalFee?.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-slate-700">৳{p.amountPaid?.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-sm font-semibold text-red-600">৳{p.dueAmount?.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${style}`}>
                        <SafeIcon className="h-3 w-3" />
                        {statusLabels[p.paymentStatus] || p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {p.paymentStatus !== "paid" && (
                        <button
                          onClick={() => openPayModal(p)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                          {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CreditCard className="h-3.5 w-3.5" />
                          )}
                          {isPending ? "Processing..." : "Pay Now"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment method modal */}
      {showModal && modalEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowModal(false); setModalEnrollment(null); }}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-800">Choose Payment Method</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {modalEnrollment.courseName} — ৳{modalEnrollment.dueAmount?.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => { setShowModal(false); setModalEnrollment(null); }}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="px-5 pb-5 grid gap-2.5">
              {gateways.map((g) => {
                const GWIcon = g.icon;
                return (
                  <button
                    key={g.id}
                    onClick={() => handlePayWithGateway(g.id)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${g.color} shadow-sm`}>
                      <GWIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">{g.label}</p>
                      <p className="text-xs text-slate-400">
                        {g.id === "bkash" || g.id === "nagad" || g.id === "rocket" ? "Mobile Banking" : g.id === "card" ? "Visa, Mastercard, Amex" : "All major banks"}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">Pay &rarr;</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info bar */}
      {payments?.some((p) => p.paymentStatus !== "paid") && (
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg px-4 py-2.5">
          <CreditCard className="h-3.5 w-3.5 shrink-0" />
          <span>
            All payments are processed in <strong>demo mode</strong>. No real money is transferred.
          </span>
        </div>
      )}
    </div>
  );
}
