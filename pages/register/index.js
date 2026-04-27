import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Layout from "@/components/layout/Layout";
import Spinner from "@/components/elements/Spinner";
import axiosInstance from "@/util/axiosInstance";
import { notifyError, notifySuccess } from "@/util/toast";
import Link from "next/link";

const Register = () => {
  const router = useRouter();
  const [redirectUrl, setRedirectUrl] = useState("/");
  const [hasRedirect, setHasRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Parse query params only on client — avoids hydration mismatch
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("redirectUrl") || "/";
    setRedirectUrl(url);
    setHasRedirect(!!url && url !== "/");

    // If already logged in, redirect immediately
    if (localStorage.getItem("token")) {
      window.location.href = url;
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...payload } = data;
      const res = await axiosInstance.post("/auth/register", payload);

      if (res.success) {
        notifySuccess("Registered successfully. Logging you in...");
        if (res.token) localStorage.setItem("token", res.token);
        window.location.href = redirectUrl;
      } else {
        notifyError(res.message || "Failed to register");
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to register, please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <style jsx>{`
        .auth-container {
          position: relative;
          min-height: calc(100vh - 180px);
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
        }

        .video-bg {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          object-fit: cover;
          z-index: -3;
          background: black;
          pointer-events: none;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
          border-radius: 20px;
          padding: 2.5rem 2.25rem;
          width: 100%;
          max-width: 520px;
          z-index: 1;
        }

        :global(.dark-theme) .auth-card {
          background: rgba(22, 22, 38, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
        }
        :global(.dark-theme) .auth-card h1,
        :global(.dark-theme) .auth-card label {
          color: #f0f0f0 !important;
        }
        :global(.dark-theme) .hint-text { color: #aaa !important; }

        .auth-card h1 {
          text-align: center;
          margin-bottom: 0.3rem;
          font-weight: 800;
          font-size: 1.85rem;
          color: #111;
        }

        .hint-text {
          text-align: center;
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 1.5rem;
        }

        .redirect-banner {
          background: rgba(37,81,231,0.07);
          border: 1px solid rgba(37,81,231,0.18);
          border-radius: 10px;
          padding: 0.6rem 1rem;
          margin-bottom: 1.25rem;
          text-align: center;
          font-size: 0.85rem;
          color: #2551e7;
          font-weight: 500;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }
        @media (max-width: 480px) {
          .form-row { grid-template-columns: 1fr; }
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-size: 0.775rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #444;
          margin-bottom: 0.3rem;
        }

        .input-wrap {
          position: relative;
        }
        .input-wrap i {
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          color: #aaa;
          font-size: 0.82rem;
          pointer-events: none;
        }

        .form-control {
          width: 100%;
          padding: 0.68rem 0.9rem 0.68rem 2.4rem !important;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          font-size: 0.9rem;
          background: #f8f9ff;
          color: #111;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-control:focus {
          outline: none !important;
          border-color: #2551e7 !important;
          box-shadow: 0 0 0 3px rgba(37,81,231,0.12) !important;
          background: #fff !important;
        }

        :global(.dark-theme) .form-control {
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(255,255,255,0.12) !important;
          color: #f0f0f0 !important;
        }

        .err-msg {
          font-size: 0.775rem;
          color: #e53935;
          margin-top: 0.2rem;
        }

        .auth-btn {
          background: #2551e7;
          color: #fff;
          border: none;
          padding: 0.82rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.96rem;
          width: 100%;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
          box-shadow: 0 4px 18px rgba(37,81,231,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(37,81,231,0.4);
        }
        .auth-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .bottom-link {
          margin-top: 1.2rem;
          text-align: center;
          font-size: 0.88rem;
          color: #666;
        }
        :global(.dark-theme) .bottom-link { color: #aaa; }
        .bottom-link a {
          color: #2551e7;
          font-weight: 700;
          text-decoration: none;
        }
        .bottom-link a:hover { color: #ff0292; }

        .divider {
          height: 1px;
          background: rgba(0,0,0,0.07);
          margin: 1.1rem 0;
        }
        :global(.dark-theme) .divider { background: rgba(255,255,255,0.07); }
      `}</style>

      <video className="video-bg" src="/assets/video/ccbg.mp4" autoPlay muted loop playsInline />

      <div className="auth-container">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p className="hint-text">Join CorpCrunch to unlock full articles &amp; insights</p>

          {hasRedirect && (
            <div className="redirect-banner">
              <i className="fas fa-lock" style={{ marginRight: "0.4rem" }} />
              Register to continue reading the full article
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Name Row */}
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <div className="input-wrap">
                  <i className="far fa-user" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="First Name"
                    {...register("firstName", { required: "Required" })}
                  />
                </div>
                {errors.firstName && <p className="err-msg">{errors.firstName.message}</p>}
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <div className="input-wrap">
                  <i className="far fa-user" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Last Name"
                    {...register("lastName", { required: "Required" })}
                  />
                </div>
                {errors.lastName && <p className="err-msg">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrap">
                <i className="far fa-envelope" />
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    validate: (v) =>
                      !v.toLowerCase().endsWith("@gmail.com") ||
                      "Please use your company/work email",
                  })}
                />
              </div>
              {errors.email && <p className="err-msg">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-wrap">
                <i className="fas fa-phone" />
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  {...register("phoneNumber", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[+\d][\d\s\-().]{6,19}$/,
                      message: "Enter a valid phone number",
                    },
                  })}
                />
              </div>
              {errors.phoneNumber && <p className="err-msg">{errors.phoneNumber.message}</p>}
            </div>

            {/* Company + Location Row */}
            <div className="form-row">
              <div className="form-group">
                <label>Company Name</label>
                <div className="input-wrap">
                  <i className="fas fa-building" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your Company"
                    {...register("companyName", { required: "Required" })}
                  />
                </div>
                {errors.companyName && <p className="err-msg">{errors.companyName.message}</p>}
              </div>
              <div className="form-group">
                <label>Location</label>
                <div className="input-wrap">
                  <i className="fas fa-map-marker-alt" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="City, Country"
                    {...register("location", { required: "Required" })}
                  />
                </div>
                {errors.location && <p className="err-msg">{errors.location.message}</p>}
              </div>
            </div>

            <div className="divider" />

            {/* Password */}
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <i className="fas fa-key" />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min. 8 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Min. 8 characters" },
                  })}
                />
              </div>
              {errors.password && <p className="err-msg">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrap">
                <i className="fas fa-key" />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (v) =>
                      v === watch("password") || "Passwords do not match",
                  })}
                />
              </div>
              {errors.confirmPassword && <p className="err-msg">{errors.confirmPassword.message}</p>}
            </div>

            <button disabled={isLoading} type="submit" className="auth-btn">
              {isLoading
                ? <Spinner size="small" />
                : <><i className="fas fa-user-plus" /> Create Account</>}
            </button>

            <div className="bottom-link">
              Already have an account?{" "}
              <Link href={hasRedirect ? `/signin?redirectUrl=${encodeURIComponent(redirectUrl)}` : "/signin"}>
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
