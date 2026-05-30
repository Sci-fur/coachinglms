import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { useToast } from "../../components/Toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Loader2, Search, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";

const statusOptions = ["", "active", "cancelled"];
const paymentOptions = ["", "unpaid", "partial", "paid"];

const paymentStyles = {
  unpaid: "bg-red-50 text-red-700 border-red-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const statusStyles = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function AdminEnrollments() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-enrollments", statusFilter, paymentFilter, page],
    queryFn: async () => {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      const { data: res } = await client.get("/admin/enrollments", { params });
      return res;
    },
  });

  const enrollments = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 };

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }) => client.patch(`/admin/enrollments/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
      setEditingId(null);
      toast("Enrollment updated", "success");
    },
    onError: (err) => {
      toast(err.response?.data?.message || "Update failed", "error");
    },
  });

  const startEdit = (enrollment) => {
    setEditingId(enrollment._id);
    setEditForm({
      status: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
      amountPaid: enrollment.amountPaid,
    });
  };

  const saveEdit = () => {
    const payload = {};
    if (editForm.status !== undefined) payload.status = editForm.status;
    if (editForm.paymentStatus !== undefined) payload.paymentStatus = editForm.paymentStatus;
    if (editForm.amountPaid !== undefined) payload.amountPaid = Number(editForm.amountPaid);
    updateMutation.mutate({ id: editingId, ...payload });
  };

  const filtered = search
    ? enrollments.filter((e) => {
        const name = e.user?.name?.toLowerCase() || "";
        const email = e.user?.email?.toLowerCase() || "";
        const phone = e.user?.phone || "";
        const q = search.toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q);
      })
    : enrollments;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-slate-800 shrink-0">Enrollments</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="pl-9 bg-white border-slate-200 h-9" placeholder="Search by name, email or phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors">
          <option value="">All payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <CreditCard className="h-6 w-6 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600">No enrollments found</p>
          <p className="text-sm text-slate-400 mt-1">{search ? "Try a different search term" : "Students will appear here once they enroll"}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Student</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Course</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Status</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Payment</th>
                  <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Fee / Paid / Due</th>
                  <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((enrollment) => {
                  const isEditing = editingId === enrollment._id;
                  const due = enrollment.totalFee - (isEditing ? Number(editForm.amountPaid || 0) : enrollment.amountPaid);
                  return (
                    <tr key={enrollment._id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium text-slate-800">{enrollment.user?.name || "—"}</span>
                        <div className="text-xs text-slate-400">{enrollment.user?.email || enrollment.user?.phone || "—"}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-slate-700">{enrollment.course?.name || "—"}</span>
                        <div className="text-xs text-slate-400">৳{enrollment.totalFee?.toLocaleString()}</div>
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:border-primary">
                            {statusOptions.filter(Boolean).map((o) => (<option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[enrollment.status] || ""}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${enrollment.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {enrollment.status === "active" ? "Active" : "Cancelled"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <select value={editForm.paymentStatus} onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })} className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:border-primary">
                            {paymentOptions.filter(Boolean).map((o) => (<option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${paymentStyles[enrollment.paymentStatus] || ""}`}>
                            {enrollment.paymentStatus === "paid" ? "Paid" : enrollment.paymentStatus === "partial" ? "Partial" : "Unpaid"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-xs text-slate-400">৳</span>
                            <input
                              type="number"
                              min={0}
                              value={editForm.amountPaid}
                              onChange={(e) => setEditForm({ ...editForm, amountPaid: e.target.value })}
                              className="w-20 h-8 px-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 text-right outline-none focus:border-primary"
                            />
                          </div>
                        ) : (
                          <div className="text-sm">
                            <span className="text-slate-500">৳{enrollment.totalFee?.toLocaleString()}</span>
                            <span className="text-slate-300 mx-1">/</span>
                            <span className="text-emerald-600 font-medium">৳{enrollment.amountPaid?.toLocaleString()}</span>
                            <span className="text-slate-300 mx-1">/</span>
                            <span className={`font-medium ${due > 0 ? "text-red-500" : "text-emerald-600"}`}>৳{due.toLocaleString()}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="text-xs text-slate-400">
                          {new Date(enrollment.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {editingId && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
              <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Save
              </Button>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      p === page
                        ? "bg-primary text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
