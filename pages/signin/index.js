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
  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const redirectUrl = urlParams.get("redirectUrl") || "/";

  const [isLoading, setIsLoading] = useState(false);

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
        if (res.token) {
          localStorage.setItem("token", res.token);
        }
        window.location.href = redirectUrl;
      } else {
        notifyError(res.message || "Failed to log in. Please check your credentials.");
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to log in, please try again";
      notifyError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push(redirectUrl);
    }
  }, [router]);

  return (
    <Layout>
      <style jsx>{`
        .auth-container {
          position: relative;
          min-height: calc(100vh - 180px); /* Fill space between header and footer */
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .video-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          z-index: -3;
          background: black;
          pointer-events: none;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.85); /* Glass effect */
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          border-radius: 16px;
          padding: 2.5rem 2rem;
          width: 100%;
          max-width: 450px;
          z-index: 1;
        }
        
        /* Dark mode adjustments if needed */
        :global(.dark-theme) .auth-card {
            background: rgba(30, 30, 30, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
        }
        
        :global(.dark-theme) .auth-card h1, 
        :global(.dark-theme) .auth-card label, 
        :global(.dark-theme) .auth-card span {
            color: #fff !important;
        }

        .auth-card input:focus {
            outline: none !important;
            border-color: #ccc !important;
            box-shadow: 0 0 5px rgba(0,0,0,0.1) !important;
        }

        .auth-card h1 {
          text-align: center;
          margin-bottom: 1.5rem;
          font-weight: 700;
        }

        .auth-btn {
          background-color: var(--tg-theme-secondary, #2551e7);
          color: #fff;
          border: none;
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 600;
          width: 100%;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .auth-btn:hover {
          background-color: var(--tg-theme-primary, #ff0292);
          transform: translateY(-2px);
        }
      `}</style>

      <video
        className="video-bg"
        src="/assets/video/ccbg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="auth-container">
        <div className="auth-card">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1>Log In</h1>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="Email Address"
                {...register("email", { required: "Email is required" })} />
              {errors.email && <p className="text-danger mt-1 mb-0">{errors.email.message}</p>}
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="Password"
                {...register("password", { required: "Password is required" })} />
              {errors.password && <p className="text-danger mt-1 mb-0">{errors.password.message}</p>}
            </div>

            <button disabled={isLoading} type="submit" className="auth-btn">
              {isLoading ? <Spinner size="small" /> : "Sign In"}
            </button>

            <div className="mt-4 text-center">
              <span style={{ color: "var(--tg-heading-color, #111)", fontSize: "1rem" }}>Don't have an account? </span>
              <Link href="/register" style={{ color: "var(--tg-theme-secondary, #2551e7)", textDecoration: "none", fontWeight: "600" }}>Register here</Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
