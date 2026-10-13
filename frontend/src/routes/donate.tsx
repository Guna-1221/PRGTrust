import { createFileRoute } from "@tanstack/react-router";
import { useSubmitDonation } from "@/hooks/use-donation-payments";
import { useState } from "react";
import { HeartHandshake, IndianRupee, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — PRG Social Welfare Trust" },
      { name: "description", content: "Support PRG Social Welfare Trust with your donation." },
      { property: "og:title", content: "Donate — PRG Social Welfare Trust" },
    ],
  }),
  component: DonatePage,
});

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

function DonatePage() {
  const { submit, isSubmitting } = useSubmitDonation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [amount, setAmount] = useState<number | "custom">(1000);
  const [customAmount, setCustomAmount] = useState<string>("");

  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    message: "",
  });

  const handleAmountSelect = (val: number | "custom") => {
    setAmount(val);
    if (val !== "custom") {
      setCustomAmount("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = amount === "custom" ? Number(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) return;
    if (!formData.donorName.trim()) return;

    try {
      await submit({
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone,
        message: formData.message,
        amount: finalAmount,
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Donation submission failed:", error);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setAmount(1000);
    setCustomAmount("");
    setFormData({
      donorName: "",
      donorEmail: "",
      donorPhone: "",
      message: "",
    });
  };

  return (
    <>
      <section className="bg-brand-blue-deep text-white">
        <div className="container-x py-20 md:py-24">
          <div className="accent-bar" />
          <h1 className="mt-4 text-4xl md:text-5xl">Make a Donation</h1>
          <p className="mt-4 max-w-2xl text-white/85 text-lg">
            Your support helps us bring education, healthcare, and sustainable development to those
            who need it most.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x max-w-4xl">
          {isSuccess ? (
            <div className="card-soft p-10 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-green/15 text-brand-green mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-display mb-4">Thank you for your generosity!</h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto mb-8">
                Your donation request has been recorded. Our team will contact you shortly with
                payment details.
              </p>
              <button
                onClick={resetForm}
                className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
              >
                Make another donation
              </button>
            </div>
          ) : (
            <div className="grid gap-10 md:grid-cols-12">
              <div className="md:col-span-5 space-y-6">
                <div>
                  <h2 className="text-2xl font-display flex items-center gap-2">
                    <HeartHandshake className="text-brand-orange-deep" />
                    Why Donate?
                  </h2>
                  <p className="mt-3 text-foreground/75 leading-relaxed">
                    Every rupee goes towards empowering underprivileged communities in Anantapur
                    through our various initiatives in education, health, and environment.
                  </p>
                </div>

                <div className="card-soft p-6 bg-brand-blue/5 border-none">
                  <h3 className="font-semibold mb-2">Impact</h3>
                  <ul className="space-y-3 text-sm text-foreground/75">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-orange-deep mt-0.5">•</span>
                      ₹1,000 provides school supplies for a child
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-orange-deep mt-0.5">•</span>
                      ₹2,500 supports medical relief for a family
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-orange-deep mt-0.5">•</span>
                      ₹5,000 funds a small community workshop
                    </li>
                  </ul>
                </div>
              </div>

              <div className="md:col-span-7">
                <form onSubmit={handleSubmit} className="card-soft p-6 sm:p-8">
                  <div className="mb-8">
                    <label className="text-sm font-semibold uppercase tracking-widest text-foreground/70 block mb-3">
                      Select Amount
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {PRESET_AMOUNTS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleAmountSelect(preset)}
                          className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                            amount === preset
                              ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                              : "border-input hover:border-brand-blue/50 text-foreground"
                          }`}
                        >
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          }).format(preset)}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAmountSelect("custom")}
                        className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                          amount === "custom"
                            ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                            : "border-input hover:border-brand-blue/50 text-foreground"
                        }`}
                      >
                        Custom
                      </button>
                    </div>

                    {amount === "custom" && (
                      <div className="mt-4 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/50">
                          <IndianRupee size={18} />
                        </div>
                        <input
                          type="number"
                          min="1"
                          required
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-foreground/70 mb-1.5 block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="donorName"
                        required
                        value={formData.donorName}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-foreground/70 mb-1.5 block">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          name="donorEmail"
                          value={formData.donorEmail}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-foreground/70 mb-1.5 block">
                          Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          name="donorPhone"
                          value={formData.donorPhone}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-foreground/70 mb-1.5 block">
                        Message (Optional)
                      </label>
                      <textarea
                        name="message"
                        rows={3}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition"
                        placeholder="Any message for us?"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      (!customAmount && amount === "custom") ||
                      !formData.donorName.trim()
                    }
                    className="w-full mt-8 inline-flex justify-center items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold btn-primary disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        Donate{" "}
                        {amount !== "custom"
                          ? new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            }).format(amount)
                          : customAmount
                            ? new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 0,
                              }).format(Number(customAmount))
                            : ""}
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-foreground/50 mt-4">
                    Your donation will be recorded as pending. We will contact you for payment.
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
