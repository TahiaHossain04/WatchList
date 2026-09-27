import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Field } from "../components/forms/Field";
import { Bubble } from "../components/ui/Bubble";
import { BubbleTitle } from "../components/ui/BubbleTitle";
import { CandyButton } from "../components/ui/CandyButton";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { LoginError } from "../services/authService";

/**
 * /login — for Tahia only. There's deliberately no "sign up":
 * the single admin account is created in the Supabase dashboard.
 */
export default function Login() {
  const { signIn, signOut, isAdmin, email: signedInEmail, loading: authLoading, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Already logged in as admin? Skip the form.
  useEffect(() => {
    if (!authLoading && isAdmin) navigate(from, { replace: true });
  }, [authLoading, isAdmin, from, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found: typeof errors = {};
    if (!email.trim()) found.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) found.email = "That email doesn’t look quite right.";
    if (!password) found.password = "Please enter your password.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      showToast("Welcome back ♡");
      // The effect above redirects once the server confirms admin access.
    } catch (err) {
      setErrors({ form: err instanceof LoginError ? err.message : "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // Logged in, but not as the admin account.
  const notAdmin = !authLoading && signedInEmail && !isAdmin;

  return (
    <div className="flex min-h-[70svh] items-center justify-center py-6">
      <div className="relative w-full max-w-md text-[3rem]">
        <Bubble tone="pink" size="1.1em" style={{ left: "-0.5em", top: "-0.4em" }} />
        <Bubble tone="cream" size="0.4em" style={{ right: "-0.2em", top: "0.4em" }} delay={0.1} />
        <Bubble tone="lavender" size="0.3em" style={{ right: "0.6em", bottom: "-0.35em" }} delay={0.2} />

        <div className="candy-panel relative px-6 py-9 text-base sm:px-10">
          <BubbleTitle text="Welcome back ♡" size="small" />

          {notAdmin ? (
            <div className="mt-6 text-center">
              <p className="text-ink-muted">
                You’re signed in as <strong className="text-ink">{signedInEmail}</strong>, which isn’t the admin
                account.
              </p>
              <CandyButton className="mt-5" onClick={signOut}>
                Log out
              </CandyButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-5">
              <Field label="Email" error={errors.email}>
                {(p) => (
                  <input
                    {...p}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field-input"
                  />
                )}
              </Field>
              <Field label="Password" error={errors.password}>
                {(p) => (
                  <input
                    {...p}
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field-input"
                  />
                )}
              </Field>

              {errors.form && (
                <p role="alert" className="rounded-2xl bg-page px-4 py-3 text-center font-bold text-gum-light">
                  {errors.form}
                </p>
              )}

              <CandyButton type="submit" variant="pink" disabled={submitting} className="mt-1 w-full text-xl">
                {submitting ? "Logging in…" : "Log in"}
              </CandyButton>

              {isDemo && (
                <p className="text-center text-sm text-ink-muted">
                  Demo mode (Supabase isn’t set up yet): any email, password <strong className="text-ink">demo</strong>.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
