import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/util/axiosInstance";
import { notifyError, notifySuccess } from "@/util/toast";
import Spinner from "@/components/elements/Spinner";
import styles from "./AuthModal.module.css";

const TAB_LOGIN = "login";
const TAB_REGISTER = "register";

export default function AuthModal() {
  const { isOpen, pendingUrl, closeModal, onAuthSuccess } = useAuth();
  const [activeTab, setActiveTab] = useState(TAB_LOGIN);
  const [isLoading, setIsLoading] = useState(false);

  // Separate form instances for each tab
  const loginForm = useForm();
  const registerForm = useForm();

  // Reset forms & go to login tab on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(TAB_LOGIN);
      loginForm.reset();
      registerForm.reset();
    }
  }, [isOpen]);

  // Trap ESC key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeModal]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleLogin = async (data) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/auth/login", data);
      if (res.success) {
        if (res.token) localStorage.setItem("token", res.token);
        notifySuccess("Logged in successfully!");
        onAuthSuccess(pendingUrl);
      } else {
        notifyError(res.message || "Failed to log in. Please check your credentials.");
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to log in, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data) => {
    if (data.email?.toLowerCase().endsWith("@gmail.com")) {
      notifyError("Registration with @gmail.com is not allowed. Please use your company email.");
      return;
    }
    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/auth/register", data);
      if (res.success) {
        if (res.token) localStorage.setItem("token", res.token);
        notifySuccess("Registered successfully! Logging you in…");
        onAuthSuccess(pendingUrl);
      } else {
        notifyError(res.message || "Failed to register.");
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to register, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeModal} role="dialog" aria-modal="true" aria-label="Authentication">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className={styles.closeBtn} onClick={closeModal} aria-label="Close">
          <i className="fas fa-times" />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoMark}>
            <i className="fas fa-lock" />
          </div>
          <h2 className={styles.title}>
            {activeTab === TAB_LOGIN ? "Welcome Back" : "Join CorpCrunch"}
          </h2>
          <p className={styles.subtitle}>
            {activeTab === TAB_LOGIN
              ? "Sign in to unlock full articles and exclusive content."
              : "Create a free account to access all articles and insights."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === TAB_LOGIN ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(TAB_LOGIN)}
          >
            Sign In
          </button>
          <button
            className={`${styles.tab} ${activeTab === TAB_REGISTER ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(TAB_REGISTER)}
          >
            Register
          </button>
          <div
            className={styles.tabIndicator}
            style={{ transform: activeTab === TAB_REGISTER ? "translateX(100%)" : "translateX(0)" }}
          />
        </div>

        {/* ── LOGIN FORM ── */}
        {activeTab === TAB_LOGIN && (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <div className={styles.inputWrap}>
                <i className="far fa-envelope" />
                <input
                  type="email"
                  placeholder="your@company.com"
                  className={styles.input}
                  {...loginForm.register("email", { required: "Email is required" })}
                />
              </div>
              {loginForm.formState.errors.email && (
                <span className={styles.error}>{loginForm.formState.errors.email.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-key" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className={styles.input}
                  {...loginForm.register("password", { required: "Password is required" })}
                />
              </div>
              {loginForm.formState.errors.password && (
                <span className={styles.error}>{loginForm.formState.errors.password.message}</span>
              )}
            </div>

            <button type="submit" disabled={isLoading} className={styles.submitBtn}>
              {isLoading ? <Spinner size="small" /> : (
                <><i className="fas fa-sign-in-alt" /> Sign In</>
              )}
            </button>

            <p className={styles.switchText}>
              Don't have an account?{" "}
              <button type="button" className={styles.switchLink} onClick={() => setActiveTab(TAB_REGISTER)}>
                Register here
              </button>
            </p>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {activeTab === TAB_REGISTER && (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className={styles.form} noValidate>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>First Name</label>
                <div className={styles.inputWrap}>
                  <i className="far fa-user" />
                  <input
                    type="text"
                    placeholder="First Name"
                    className={styles.input}
                    {...registerForm.register("firstName", { required: "Required" })}
                  />
                </div>
                {registerForm.formState.errors.firstName && (
                  <span className={styles.error}>{registerForm.formState.errors.firstName.message}</span>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Last Name</label>
                <div className={styles.inputWrap}>
                  <i className="far fa-user" />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className={styles.input}
                    {...registerForm.register("lastName", { required: "Required" })}
                  />
                </div>
                {registerForm.formState.errors.lastName && (
                  <span className={styles.error}>{registerForm.formState.errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Company Email</label>
              <div className={styles.inputWrap}>
                <i className="far fa-envelope" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  className={styles.input}
                  {...registerForm.register("email", {
                    required: "Company email is required",
                    validate: (v) => !v.toLowerCase().endsWith("@gmail.com") || "Gmail is not allowed",
                  })}
                />
              </div>
              {registerForm.formState.errors.email && (
                <span className={styles.error}>{registerForm.formState.errors.email.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Company Name</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-building" />
                <input
                  type="text"
                  placeholder="Your Company"
                  className={styles.input}
                  {...registerForm.register("companyName", { required: "Company name is required" })}
                />
              </div>
              {registerForm.formState.errors.companyName && (
                <span className={styles.error}>{registerForm.formState.errors.companyName.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Location</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-map-marker-alt" />
                <input
                  type="text"
                  placeholder="City, Country"
                  className={styles.input}
                  {...registerForm.register("location", { required: "Location is required" })}
                />
              </div>
              {registerForm.formState.errors.location && (
                <span className={styles.error}>{registerForm.formState.errors.location.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-key" />
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  className={styles.input}
                  {...registerForm.register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Min. 8 characters" },
                  })}
                />
              </div>
              {registerForm.formState.errors.password && (
                <span className={styles.error}>{registerForm.formState.errors.password.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-key" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  className={styles.input}
                  {...registerForm.register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (v) =>
                      v === registerForm.watch("password") || "Passwords do not match",
                  })}
                />
              </div>
              {registerForm.formState.errors.confirmPassword && (
                <span className={styles.error}>{registerForm.formState.errors.confirmPassword.message}</span>
              )}
            </div>

            <button type="submit" disabled={isLoading} className={styles.submitBtn}>
              {isLoading ? <Spinner size="small" /> : (
                <><i className="fas fa-user-plus" /> Create Account</>
              )}
            </button>

            <p className={styles.switchText}>
              Already have an account?{" "}
              <button type="button" className={styles.switchLink} onClick={() => setActiveTab(TAB_LOGIN)}>
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
