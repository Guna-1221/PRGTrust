import { useState } from "react";
import { useDonationPayments, type DonationPayment } from "@/hooks/use-donation-payments";
import { DollarSign, Loader2 } from "lucide-react";

type PaymentStatus = DonationPayment["paymentStatus"];

export function PaymentsManager() {
  const [activeTab, setActiveTab] = useState<PaymentStatus | "all">("all");
  const { items, isLoading, updateStatus } = useDonationPayments(
    activeTab === "all" ? undefined : activeTab,
  );

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "successful":
        return "bg-brand-green/10 text-brand-green border-brand-green/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "cancelled":
        return "bg-foreground/10 text-foreground border-foreground/20";
    }
  };

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign size={20} className="text-brand-orange-deep" />
        <h2 className="text-xl font-semibold">Donation Payments</h2>
      </div>

      <div className="mb-6 inline-flex rounded-full border border-border p-1 overflow-x-auto w-full md:w-auto hide-scrollbar">
        {(["all", "pending", "successful", "failed", "cancelled"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
              activeTab === t ? "btn-primary" : "text-foreground/70 hover:bg-secondary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-12 flex justify-center items-center gap-2 text-foreground/60">
          <Loader2 className="animate-spin text-brand-blue" size={24} />
          <p className="text-sm">Loading payments…</p>
        </div>
      ) : (
        <div className="card-soft overflow-x-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center text-foreground/60">
              No payments found matching the selected filter.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="p-4 font-semibold text-foreground/80">Donor</th>
                  <th className="p-4 font-semibold text-foreground/80">Amount</th>
                  <th className="p-4 font-semibold text-foreground/80">Status</th>
                  <th className="p-4 font-semibold text-foreground/80">Date</th>
                  <th className="p-4 font-semibold text-foreground/80">Transaction ID</th>
                  <th className="p-4 font-semibold text-foreground/80">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/20">
                    <td className="p-4">
                      <p className="font-medium">{p.donorName}</p>
                      <p className="text-xs text-foreground/60 mt-1">
                        {p.donorEmail} {p.donorEmail && p.donorPhone && "·"} {p.donorPhone}
                      </p>
                    </td>
                    <td className="p-4 font-medium">₹{p.amount.toLocaleString("en-IN")}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStatusColor(p.paymentStatus)}`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-foreground/70">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-xs text-foreground/70 font-mono">
                      {p.transactionId || "-"}
                    </td>
                    <td className="p-4">
                      <select
                        value={p.paymentStatus}
                        onChange={(e) => updateStatus(p.id, e.target.value as PaymentStatus)}
                        className="text-xs rounded border border-border bg-background px-2 py-1 outline-none focus:ring-1 focus:ring-brand-blue"
                      >
                        <option value="pending">Pending</option>
                        <option value="successful">Successful</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
}
