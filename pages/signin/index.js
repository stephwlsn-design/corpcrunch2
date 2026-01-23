import Spinner from "@/components/elements/Spinner";
import Layout from "@/components/layout/Layout";
import axiosInstance from "@/util/axiosInstance";
import { notifyError, notifySuccess } from "@/util/toast";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { CSSTransition } from "react-transition-group";

const SignIn = () => {
  // email and phone number validation pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneNumberPattern =
    /^\+(?:\d{1,3})?[ -]?\(?\d{1,4}\)?[ -]?\d{1,4}[ -]?\d{1,4}[ -]?\d{1,4}$/;

  const router = useRouter();

  const urlParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const redirectUrl = urlParams.get("redirectUrl") || "/";

  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerUserInput,
    handleSubmit: handleSubmitUserInput,
    formState: { errors: errorsUserInput },
    getValues,
    setError: setIdentifierError,
  } = useForm();

  const {
    register: registerOtpInput,
    handleSubmit: handleSubmitOtpInput,
    formState: { errors: errorsOtpInput },
  } = useForm();

  const [showOtpInput, setShowOtpInput] = useState(false);

  const validateIdentifier = (identifier) => {
    const isEmail = emailPattern.test(identifier);
    const isPhoneNumber = phoneNumberPattern.test(identifier);

    const authData = {};

    if (!isEmail && !isPhoneNumber) {
      return false;
    } else if (isEmail) {
      authData.email = identifier;
    } else if (isPhoneNumber) {
      authData.phone = identifier;
    }

    return authData;
  };

  const onSubmitUserInput = async (data) => {
    try {
      setIsLoading(true);
      const authData = validateIdentifier(data.identifier);

      if (!authData) {
        setIdentifierError("identifier", {
          message:
            "Please enter a valid email address or phone number (with country code i.e +11234567890)",
        });
        return;
      }

      const res = await axiosInstance.post(
        "/authentication?userType=BLOG_USER",
        authData
      );

      if (res.success) {
        notifySuccess("OTP sent successfully");
        setShowOtpInput(true);
      } else {
        // Prefer backend-provided error message when available
        const message =
          res.message || "Failed to send OTP. Please check your details and try again.";
        notifyError(message);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (err instanceof Error ? err.message : null) ||
        "Something went wrong, please try again";
      notifyError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitOtpInput = async ({ otp }) => {
    try {
      setIsLoading(true);

      const { identifier } = getValues();
      const authData = validateIdentifier(identifier);

      if (!authData) {
        notifyError(
          "Your session seems invalid. Please go back and re-enter your email or phone number."
        );
        return;
      }

      const res = await axiosInstance.post(
        "/authentication?userType=BLOG_USER",
        {
          ...(authData || {}),
          otp,
        }
      );

      if (res.success) {
        notifySuccess("Logged in successfully");
        if (res.token) {
          localStorage.setItem("token", res.token);
        }
        if (/\/blog\/\w+/.test(redirectUrl)) {
          router.push(`/subscribe?redirectUrl=${redirectUrl}`);
        } else {
          router.push(redirectUrl);
        }
      } else {
        const message =
          res.message || "Failed to verify OTP, please try again";
        notifyError(message);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to verify OTP, please try again";
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
      <div
        id="videoLoader"
        style={{
          position: "absolute",
          width: "80%",
          height: "100%",
          transform: "translate(-55%, -50%)",
          top: "54%",
          left: "45%",
          zIndex: "-3",
          borderRadius: "12px",
          overflow: "hidden",
          background: "black",
        }}
        className="full-width"
      >
        <video
          className={"w-[100vw] h-[100vh]"}
          src="/assets/video/ccbg.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
        >
          <source src="/assets/video/ccbg.mp4" type="video/mp4" />
        </video>
      </div>
      <div style={{ marginTop: "0px" }} className=" 	full-width signin-form">
        {!showOtpInput && (
          <form
            style={{
              boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
              padding: "1.5rem",
              borderRadius: "5px",
              margin: "2rem 0",
            }}
            onSubmit={handleSubmitUserInput(onSubmitUserInput)}
            className="mt-3 full-width signInForm "
          >
            <h1>Single Sign-On</h1>
            <div className={`mb-3 full-width`}>
              <label htmlFor="content" className="form-label">
                Phone Number or Email
              </label>
              <input
                type="text"
                className="form-control full-width"
                placeholder="Enter Phone Number or Email"
                {...registerUserInput("identifier", {
                  required: "Phone Number or Email is required",
                })}
              />
              <p className="text-danger" style={{ height: "auto" }}>
                {errorsUserInput.identifier && (
                  <>{errorsUserInput.identifier.message}</>
                )}
              </p>
            </div>
            <button
              disabled={isLoading}
              type="submit"
              className="submitBtn me-2 full-width"
            >
              {isLoading ? <Spinner size="small" /> : "Next"}
            </button>
          </form>
        )}

        <CSSTransition
          in={showOtpInput}
          timeout={300}
          classNames="fade"
          unmountOnExit
        >
          <form
            onSubmit={handleSubmitOtpInput(onSubmitOtpInput)}
            style={{
              boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
              padding: "1.5rem",
              borderRadius: "5px",
              margin: "2rem 0",
            }}
            className=" full-width signInForm"
          >
            <div className="mb-3 full-width">
              <p>
                You will receive a code via SMS or Email. Please enter it below.
              </p>
            </div>
            <div className="mb-3 full-width">
              <label htmlFor="content" className="form-label">
                OTP (One-Time Password)
              </label>
              <input
                type="text"
                className="form-control full-width"
                placeholder="Enter OTP"
                {...registerOtpInput("otp", { required: true })}
              />
              <p className="text-danger">
                {errorsOtpInput.otp && <>OTP is required</>}
              </p>
            </div>
            <button
              disabled={isLoading}
              type="submit"
              className="submitBtn me-2 full-width"
            >
              {isLoading ? <Spinner size="small" /> : "Submit"}
            </button>
          </form>
        </CSSTransition>
      </div>
    </Layout>
  );
};

export default SignIn;
