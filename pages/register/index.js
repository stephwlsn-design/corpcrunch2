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
    const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const redirectUrl = urlParams.get("redirectUrl") || "/";

    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        if (data.email.toLowerCase().endsWith("@gmail.com")) {
            notifyError("Registration with @gmail.com is not allowed. Please use your company email.");
            return;
        }

        try {
            setIsLoading(true);
            const res = await axiosInstance.post("/auth/register", data);

            if (res.success) {
                notifySuccess("Registered successfully. Logging you in...");
                if (res.token) {
                    localStorage.setItem("token", res.token);
                }
                window.location.href = redirectUrl;
            } else {
                notifyError(res.message || "Failed to register");
            }
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to register, please try again";
            notifyError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("token")) {
            router.push(redirectUrl);
        }
    }, [router, redirectUrl]);

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
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    border-radius: 16px;
                    padding: 2.5rem 2rem;
                    width: 100%;
                    max-width: 500px;
                    z-index: 1;
                    margin-top: 2rem;
                    margin-bottom: 2rem;
                }
                
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
                    font-size: 1.8rem;
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

                .scrollable-form {
                    max-height: 60vh;
                    overflow-y: auto;
                    padding-right: 10px;
                }
                
                .scrollable-form::-webkit-scrollbar {
                    width: 6px;
                }
                
                .scrollable-form::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.05);
                    border-radius: 8px;
                }
                
                .scrollable-form::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.2);
                    border-radius: 8px;
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
                        <h1>Create an Account</h1>

                        <div className="scrollable-form">
                            <div className="mb-3">
                                <label className="form-label">First Name</label>
                                <input type="text" className="form-control" placeholder="First Name"
                                    {...register("firstName", { required: "First Name is required" })} />
                                {errors.firstName && <p className="text-danger mt-1 mb-0">{errors.firstName.message}</p>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Last Name</label>
                                <input type="text" className="form-control" placeholder="Last Name"
                                    {...register("lastName", { required: "Last Name is required" })} />
                                {errors.lastName && <p className="text-danger mt-1 mb-0">{errors.lastName.message}</p>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Company Email</label>
                                <input type="email" className="form-control" placeholder="Company Email"
                                    {...register("email", {
                                        required: "Company Email is required",
                                        validate: value => !value.toLowerCase().endsWith('@gmail.com') || "Gmail is not allowed"
                                    })} />
                                {errors.email && <p className="text-danger mt-1 mb-0">{errors.email.message}</p>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Company Name</label>
                                <input type="text" className="form-control" placeholder="Company Name"
                                    {...register("companyName", { required: "Company Name is required" })} />
                                {errors.companyName && <p className="text-danger mt-1 mb-0">{errors.companyName.message}</p>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Location</label>
                                <input type="text" className="form-control" placeholder="Location"
                                    {...register("location", { required: "Location is required" })} />
                                {errors.location && <p className="text-danger mt-1 mb-0">{errors.location.message}</p>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input type="password" className="form-control" placeholder="Password (Min 8 characters)"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 8, message: "Password must be at least 8 characters" }
                                    })} />
                                {errors.password && <p className="text-danger mt-1 mb-0">{errors.password.message}</p>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Re-enter Password</label>
                                <input type="password" className="form-control" placeholder="Confirm Password"
                                    {...register("confirmPassword", {
                                        required: "Please re-enter your password",
                                        validate: value => value === watch('password') || "Passwords do not match"
                                    })} />
                                {errors.confirmPassword && <p className="text-danger mt-1 mb-0">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <button disabled={isLoading} type="submit" className="auth-btn">
                            {isLoading ? <Spinner size="small" /> : "Register"}
                        </button>

                        <div className="mt-4 text-center">
                            <span style={{ color: "var(--tg-heading-color, #111)", fontSize: "1rem" }}>Already have an account? </span>
                            <Link href="/signin" style={{ color: "var(--tg-theme-secondary, #2551e7)", textDecoration: "none", fontWeight: "600" }}>Sign In</Link>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Register;
