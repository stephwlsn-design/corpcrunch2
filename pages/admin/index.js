import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { isAdminSessionValid } from "@/lib/adminSession";

/**
 * Admin entry point - redirects to login or dashboard
 * Never shows content directly; always requires auth first
 */
export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isAdminSessionValid()) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Admin - Corp Crunch</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  );
}
