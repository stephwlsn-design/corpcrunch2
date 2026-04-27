import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Layout from "@/components/layout/Layout";
import Spinner from "@/components/elements/Spinner";
import axiosInstance from "@/util/axiosInstance";
import { notifyError, notifySuccess } from "@/util/toast";
import Link from "next/link";

const SignIn = () => {
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
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/auth/login", data);
      if (res.success) {
        notifySuccess("Logged in successfully");
        if (res.token) localStorage.setItem("token", res.token);
        window.location.href = redirectUrl;
      } else {
        notifyError(res.message || "Failed to log in. Please check your credentials.");
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to log in, please try again");
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
          padding: 2rem 1rem;
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
          padding: 2.75rem 2.25rem;
          width: 100%;
          max-width: 460px;
          z-index: 1;
        }

        :global(.dark-theme) .auth-card {
          background: rgba(22, 22, 38, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
        }
        :global(.dark-theme) .auth-card h1,
        :global(.dark-theme) .auth-card label,
        :global(.dark-theme) .auth-card .hint-text {
          color: #f0f0f0 !important;
        }

        .auth-card h1 {
          text-align: center;
          margin-bottom: 0.35rem;
          font-weight: 800;
          font-size: 1.9rem;
          color: #111;
        }

        .hint-text {
          text-align: center;
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 1.75rem;
        }

        .form-group {
          margin-bottom: 1.1rem;
        }

        .form-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #444;
          margin-bottom: 0.35rem;
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
          font-size: 0.85rem;
          pointer-events: none;
        }

        .form-control {
          width: 100%;
          padding: 0.7rem 0.9rem 0.7rem 2.4rem !important;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          font-size: 0.92rem;
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
          margin-top: 1.25rem;
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

        .redirect-banner {
          background: rgba(37,81,231,0.07);
          border: 1px solid rgba(37,81,231,0.18);
          border-radius: 10px;
          padding: 0.6rem 1rem;
          margin-bottom: 1.4rem;
          text-align: center;
          font-size: 0.85rem;
          color: #2551e7;
          font-weight: 500;
        }
      `}</style>

      <video className="video-bg" src="/assets/video/ccbg.mp4" autoPlay muted loop playsInline />

      <div className="auth-container">
        <div className="auth-card">
          <h1>Log In</h1>
          <p className="hint-text">Welcome back — sign in to your account</p>

          {hasRedirect && (
            <div className="redirect-banner">
              <i className="fas fa-lock" style={{ marginRight: "0.4rem" }} />
              Sign in to continue reading the full article
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrap">
                <i className="far fa-envelope" />
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  {...register("email", { required: "Email is required" })}
                />
              </div>
              {errors.email && <p className="text-danger mt-1 mb-0" style={{ fontSize: "0.8rem" }}>{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <i className="fas fa-key" />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  {...register("password", { required: "Password is required" })}
                />
              </div>
              {errors.password && <p className="text-danger mt-1 mb-0" style={{ fontSize: "0.8rem" }}>{errors.password.message}</p>}
            </div>

            <button disabled={isLoading} type="submit" className="auth-btn">
              {isLoading ? <Spinner size="small" /> : <><i className="fas fa-sign-in-alt" /> Sign In</>}
            </button>

            <div className="bottom-link">
              Don&apos;t have an account?{" "}
              <Link href={hasRedirect ? `/register?redirectUrl=${encodeURIComponent(redirectUrl)}` : "/register"}>
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
