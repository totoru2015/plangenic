import React, { useState } from "react";
import { X, Mail, Lock, Loader2, AlertCircle, CheckCircle, Compass, User, Briefcase } from "lucide-react";
import { supabase } from "./supabase";

const C = {
  paper: "#f3f6fb", ink: "#0b1220", accent: "#2563eb", accent2: "#0ea5e9",
  muted: "#5b6478", line: "#dde3ee", card: "#ffffff",
};

const inputStyle = {
  width: "100%",
  border: `1px solid ${C.line}`,
  background: C.paper,
  color: C.ink,
  borderRadius: 8,
  padding: "11px 14px 11px 40px",
  fontSize: 15,
  fontFamily: "'Hanken Grotesk',sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const QUALIFICATIONS = [
  "Diploma in Business or Management",
  "Bachelor's Degree (Business, Commerce or related)",
  "MBA",
  "Master's Degree or higher",
];

const MEMBERSHIPS = [
  "Institute of Management Consultants (IMC)",
  "Certified Management Consultant (CMC)",
  "Institute of Managers and Leaders ANZ (IML ANZ)",
  "Institute of Advisors",
  "Engagement Consultancy Membership",
  "Consult Australia",
  "Business Council of Australia",
  "Registered with a business consulting firm",
  "Own business consultancy (ABN/registered)",
];

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'reset'
  const [step, setStep] = useState(1); // signup steps: 1=credentials, 2=role, 3=consultant declarations
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // 'owner' | 'consultant'
  const [qualification, setQualification] = useState("");
  const [memberships, setMemberships] = useState([]);
  const [declarationsAgreed, setDeclarationsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function toggleMembership(m) {
    setMemberships((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  }

  function resetSignup() {
    setStep(1); setRole(""); setQualification(""); setMemberships([]); setDeclarationsAgreed(false);
    setError(""); setSuccess("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setSuccess("Password reset email sent — check your inbox.");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 1 → Step 2: validate credentials, move to role selection
  function handleCredentialsNext(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setStep(2);
  }

  // Step 2 → Step 3 or finish: role selected
  function handleRoleNext() {
    setError("");
    if (!role) { setError("Please select your account type."); return; }
    if (role === "consultant") { setStep(3); } else { handleCreateAccount(); }
  }

  // Step 3: consultant declarations → create account
  async function handleConsultantNext() {
    setError("");
    if (!qualification) { setError("Please select your highest qualification."); return; }
    if (memberships.length === 0) { setError("Please select at least one professional membership or registration."); return; }
    if (!declarationsAgreed) { setError("Please confirm that your declarations are true and correct."); return; }
    await handleCreateAccount();
  }

  async function handleCreateAccount() {
    setLoading(true); setError("");
    try {
      // Create auth account
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      const userId = data.user?.id;
      if (!userId) throw new Error("Account creation failed. Please try again.");

      // Save profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        role,
        qualification: role === "consultant" ? qualification : null,
        memberships: role === "consultant" ? memberships : [],
        declarations_agreed: role === "consultant" ? declarationsAgreed : false,
      });
      if (profileError) throw profileError;

      setSuccess("Account created! Check your email to confirm, then log in.");
      setMode("login");
      resetSignup();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";
  const isLogin = mode === "login";
  const isReset = mode === "reset";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(25,30,43,0.55)",
          zIndex: 999, backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        background: C.card, borderRadius: 18, padding: "36px 32px",
        width: "100%", maxWidth: isSignup && step === 3 ? 520 : 420,
        zIndex: 1000,
        boxShadow: "0 24px 60px rgba(25,30,43,0.22)",
        fontFamily: "'Hanken Grotesk',sans-serif",
        boxSizing: "border-box",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", cursor: "pointer", color: C.muted, padding: 4, borderRadius: 6 }}
        >
          <X size={20} />
        </button>

        {/* Logo + heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 24 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(145deg, ${C.accent2}, ${C.accent})`,
            boxShadow: "0 5px 12px -3px rgba(37,99,235,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
          }}>
            <Compass size={17} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 22, color: C.ink }}>Plangenic</span>
        </div>

        {/* Step indicator for signup */}
        {isSignup && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            {[1, 2, 3].map((s) => {
              const active = step === s;
              const done = step > s;
              const isConsultantOnly = s === 3;
              if (isConsultantOnly && role !== "consultant" && step < 3) return null;
              return (
                <React.Fragment key={s}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    background: done ? C.accent2 : active ? C.ink : C.paper,
                    color: done || active ? "#fff" : C.muted,
                    border: `1px solid ${done ? C.accent2 : active ? C.ink : C.line}`,
                    flexShrink: 0,
                  }}>
                    {done ? "✓" : s}
                  </div>
                  {s < (role === "consultant" ? 3 : 2) && <div style={{ flex: 1, height: 1, background: step > s ? C.accent2 : C.line }} />}
                </React.Fragment>
              );
            })}
            <span style={{ fontSize: 12, color: C.muted, marginLeft: 6 }}>
              {step === 1 ? "Account details" : step === 2 ? "Account type" : "Professional credentials"}
            </span>
          </div>
        )}

        <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 24, margin: "0 0 6px", color: C.ink }}>
          {isLogin ? "Welcome back" : isReset ? "Reset password" : step === 1 ? "Create your account" : step === 2 ? "What best describes you?" : "Professional credentials"}
        </h2>
        <p style={{ color: C.muted, fontSize: 14, margin: "0 0 26px", lineHeight: 1.5 }}>
          {isLogin ? "Log in to access your plans."
            : isReset ? "We'll email you a link to reset your password."
            : step === 1 ? "Free to get started. Your plans are saved securely."
            : step === 2 ? "Choose your account type. This determines which features you can access."
            : "Consultant access requires confirmation of your qualifications and professional membership."}
        </p>

        {error && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", background: "#fdecec", border: "1px solid #f3c2c2", borderRadius: 8, marginBottom: 16, fontSize: 13.5, color: "#9a3412" }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
          </div>
        )}
        {success && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", background: "#edf7f4", border: "1px solid #b7ddd4", borderRadius: 8, marginBottom: 16, fontSize: 13.5, color: "#1d5c4e" }}>
            <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {success}
          </div>
        )}

        {/* ── LOGIN ── */}
        {isLogin && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14, position: "relative" }}>
              <Mail size={16} color={C.muted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20, position: "relative" }}>
              <Lock size={16} color={C.muted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="password" required placeholder="Password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", border: "none", cursor: loading ? "wait" : "pointer", background: `linear-gradient(145deg, ${C.accent2}, ${C.accent})`, color: "#fff", padding: "13px 18px", borderRadius: 9, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 18px -6px rgba(37,99,235,0.55)" }}>
              {loading && <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} />} Log in
            </button>
          </form>
        )}

        {/* ── RESET ── */}
        {isReset && (
          <form onSubmit={handleReset}>
            <div style={{ marginBottom: 20, position: "relative" }}>
              <Mail size={16} color={C.muted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", border: "none", cursor: loading ? "wait" : "pointer", background: `linear-gradient(145deg, ${C.accent2}, ${C.accent})`, color: "#fff", padding: "13px 18px", borderRadius: 9, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 18px -6px rgba(37,99,235,0.55)" }}>
              {loading && <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} />} Send reset email
            </button>
          </form>
        )}

        {/* ── SIGNUP STEP 1: Credentials ── */}
        {isSignup && step === 1 && (
          <form onSubmit={handleCredentialsNext}>
            <div style={{ marginBottom: 14, position: "relative" }}>
              <Mail size={16} color={C.muted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20, position: "relative" }}>
              <Lock size={16} color={C.muted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input type="password" required placeholder="Choose a password (8+ chars)" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            </div>
            <button type="submit" style={{ width: "100%", border: "none", cursor: "pointer", background: `linear-gradient(145deg, ${C.accent2}, ${C.accent})`, color: "#fff", padding: "13px 18px", borderRadius: 9, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 18px -6px rgba(37,99,235,0.55)" }}>
              Continue →
            </button>
          </form>
        )}

        {/* ── SIGNUP STEP 2: Role selection ── */}
        {isSignup && step === 2 && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {/* Business Owner */}
              <button
                onClick={() => setRole("owner")}
                style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", border: `2px solid ${role === "owner" ? C.accent : C.line}`, borderRadius: 12, background: role === "owner" ? "#eef4ff" : C.paper, cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: role === "owner" ? C.accent : C.line, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={20} color={role === "owner" ? "#fff" : C.muted} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 3 }}>Business Owner</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>Generate strategic and business plans for your own organisation. Access to core plan generation and health check tools.</div>
                </div>
              </button>

              {/* Business Consultant */}
              <button
                onClick={() => setRole("consultant")}
                style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", border: `2px solid ${role === "consultant" ? C.accent2 : C.line}`, borderRadius: 12, background: role === "consultant" ? "#eef8ff" : C.paper, cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: role === "consultant" ? C.accent2 : C.line, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Briefcase size={20} color={role === "consultant" ? "#fff" : C.muted} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 3 }}>Business Consultant</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>Full access including compliance requirements, framework analysis, and multi-stakeholder outputs. Requires confirmation of professional qualifications and membership.</div>
                </div>
              </button>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, border: `1px solid ${C.line}`, background: C.paper, color: C.ink, padding: "12px 18px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                ← Back
              </button>
              <button onClick={handleRoleNext} disabled={!role} style={{ flex: 2, border: "none", cursor: role ? "pointer" : "not-allowed", background: role ? `linear-gradient(145deg, ${C.accent2}, ${C.accent})` : C.line, color: role ? "#fff" : C.muted, padding: "12px 18px", borderRadius: 9, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: role ? "0 8px 18px -6px rgba(37,99,235,0.55)" : "none" }}>
                {loading && <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} />}
                {role === "consultant" ? "Next — Add credentials →" : "Create account"}
              </button>
            </div>
          </div>
        )}

        {/* ── SIGNUP STEP 3: Consultant declarations ── */}
        {isSignup && step === 3 && (
          <div>
            {/* Qualification */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted, marginBottom: 10 }}>Highest qualification</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {QUALIFICATIONS.map((q) => (
                  <label key={q} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 13px", border: `1px solid ${qualification === q ? C.accent : C.line}`, borderRadius: 9, background: qualification === q ? "#eef4ff" : C.paper }}>
                    <input type="radio" name="qualification" checked={qualification === q} onChange={() => setQualification(q)} style={{ accentColor: C.accent, width: 16, height: 16, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: C.ink }}>{q}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Memberships */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted, marginBottom: 4 }}>Professional membership / registration</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10, lineHeight: 1.4 }}>Select all that apply — at least one required.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {MEMBERSHIPS.map((m) => {
                  const on = memberships.includes(m);
                  return (
                    <label key={m} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 13px", border: `1px solid ${on ? C.accent2 : C.line}`, borderRadius: 9, background: on ? "#eef8ff" : C.paper }}>
                      <input type="checkbox" checked={on} onChange={() => toggleMembership(m)} style={{ accentColor: C.accent2, width: 16, height: 16, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: C.ink }}>{m}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Declaration */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "12px 14px", border: `1px solid ${declarationsAgreed ? C.accent2 : C.line}`, borderRadius: 9, background: declarationsAgreed ? "#eef8ff" : C.paper }}>
                <input type="checkbox" checked={declarationsAgreed} onChange={(e) => setDeclarationsAgreed(e.target.checked)} style={{ accentColor: C.accent2, width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>
                  I declare that the qualifications and memberships I have selected above are true and correct. I understand that Plangenic reserves the right to verify these details and revoke consultant access if the information provided is found to be false or misleading.
                </span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, border: `1px solid ${C.line}`, background: C.paper, color: C.ink, padding: "12px 18px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                ← Back
              </button>
              <button onClick={handleConsultantNext} disabled={loading} style={{ flex: 2, border: "none", cursor: loading ? "wait" : "pointer", background: `linear-gradient(145deg, ${C.accent2}, ${C.accent})`, color: "#fff", padding: "12px 18px", borderRadius: 9, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 18px -6px rgba(37,99,235,0.55)" }}>
                {loading && <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} />}
                Create consultant account
              </button>
            </div>
          </div>
        )}

        {/* Mode switcher */}
        {(isLogin || isReset || (isSignup && step === 1)) && (
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13.5, color: C.muted }}>
            {isLogin && (
              <>
                <span>Don't have an account? </span>
                <button onClick={() => { setMode("signup"); setError(""); setSuccess(""); resetSignup(); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent2, fontWeight: 600, fontSize: 13.5 }}>Register here</button>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => { setMode("reset"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13 }}>Forgot password?</button>
                </div>
              </>
            )}
            {isSignup && step === 1 && (
              <>
                <span>Already have an account? </span>
                <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent2, fontWeight: 600, fontSize: 13.5 }}>Log in</button>
              </>
            )}
            {isReset && (
              <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent2, fontWeight: 600, fontSize: 13.5 }}>Back to log in</button>
            )}
          </div>
        )}

        {/* Trust note */}
        <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${C.line}`, fontSize: 12, color: C.muted, textAlign: "center", lineHeight: 1.5 }}>
          🔒 Your data is stored securely in Australia (Sydney).<br />
          Compliant with the Australian Privacy Act 1988 and NZ Privacy Act 2020.
        </div>
      </div>
    </>
  );
}
