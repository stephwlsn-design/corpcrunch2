import { postPayableAmount } from "@/services/payment";
import { PAYMENT_STATUS, planIDs, CALENDLY_URL } from "@/config/constants";
import useCategory from "@/hooks/useCategory";
import useRequestBlog, { getPaymentStatus } from "@/hooks/useRequestBlog";
import { notifyError, notifyMessage, notifySuccess } from "@/util/toast";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PaymentStatusModal from "../Modals/PaymentStatusModal";
import styles from './RequestBlogForm.module.css';
import axios from 'axios';

const RequestBlogForm = () => {
  const { mutateAsync: submitPostRequest } = useRequestBlog();
  const { data: categoryData } = useCategory();
  const [isLoading, setIsLoading] = useState(false);
  const { query } = useRouter();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.PENDING);
  const [orderId, setOrderId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const handlePaymentStatus = async () => {
      let postId = localStorage.getItem("postId");
      if (query.payment_redirect === "true" && postId) {
        try {
          let res = await getPaymentStatus(postId);
          setPaymentStatus(res?.post?.PaymentOrder?.status);
          setOrderId(res?.post?.orderId);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Payment status check failed:", error);
          }
        }
      }
    };

    if (query.payment_redirect === "true") {
      setShowStatusModal(true);
      const interval = setInterval(() => {
        if (paymentStatus === PAYMENT_STATUS.PENDING) {
          handlePaymentStatus();
        }
      }, 3000);

      if (paymentStatus === PAYMENT_STATUS.PAID) {
        notifyMessage("Your payment is received. Redirecting to schedule your meeting...");
        setTimeout(() => (window.location.href = CALENDLY_URL), 5000);
        clearInterval(interval);
      }

      if (paymentStatus === PAYMENT_STATUS.FAILED) {
        clearInterval(interval);
      }

      return () => clearInterval(interval);
    }
  }, [query.payment_redirect, paymentStatus]);

  const sendEmail = async (formData, categoryName) => {
    try {
      const emailData = {
        submitterName: formData.name,
        submitterEmail: formData.email,
        submitterPhone: formData.contactNo,
        companyName: formData.company,
        submitterAddress: formData.location,
        categoryName: categoryName,
        description: formData.content,
      };

      const response = await axios.post('/api/post-requests/send-article-request-email', emailData);
      
      if (response.data.success) {
        console.log('Email sent successfully:', response.data.messageId);
        return true;
      } else {
        console.error('Email sending failed:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't fail the entire submission if email fails
      return false;
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    // Get the selected category name for the email
    const selectedCategory = categoryData?.find(cat => cat.id === data.blogCategory);
    const categoryName = selectedCategory?.name || 'Unknown Category';

    const postData = {
      submitterName: data.name?.trim(),
      submitterEmail: data.email?.trim(),
      submitterPhone: data.contactNo?.trim(),
      companyName: data.company?.trim(),
      submitterAddress: data.location?.trim(),
      categoryID: data.blogCategory, 
      description: data.content?.trim(),
      title: `[Article Request] ${data.company} - ${Date.now()}`,
    };

    // Manual Validation
    const missingFields = [];
    if (!postData.submitterName) missingFields.push('Name');
    if (!postData.submitterEmail) missingFields.push('Email');
    if (!postData.submitterPhone) missingFields.push('Phone');
    if (!postData.companyName) missingFields.push('Company');
    if (!postData.submitterAddress) missingFields.push('Location');
    if (!postData.categoryID) missingFields.push('Category');
    if (!postData.description) missingFields.push('Content Description');

    if (missingFields.length > 0) {
      setIsLoading(false);
      notifyError(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // Send email first
      const emailSent = await sendEmail(data, categoryName);
      
      if (emailSent) {
        notifySuccess("Article request email sent successfully!");
      } else {
        notifyMessage("Note: Email notification could not be sent, but your request will be processed.");
      }

      // Then submit the post request
      const post = await submitPostRequest(postData);
      
      if (post && post.id) {
        let token = localStorage.getItem("token");
        localStorage.setItem("postId", post.id);
        
        let checkoutPlan = { postID: post.id, planID: planIDs.THREE_MONTH };

        if (!token) {
          delete checkoutPlan.planID;
        }

        const res = await postPayableAmount(checkoutPlan);
        
        if (res?.payment_url) {
          notifyMessage("Redirecting to payment gateway...");
          setTimeout(() => {
            window.location.href = res.payment_url;
          }, 1500);
        } else {
          throw new Error('Payment URL not generated.');
        }
      }
    } catch (error) {
      setIsLoading(false);
      // Detailed error reporting to identify schema issues
      const errorMessage = error?.response?.data?.message || error.message || "Submission failed";
      notifyError(errorMessage);
      console.error("Submission Error Details:", error?.response?.data);
    }
  };

  return (
    <>
      <section className={styles.articleRequestSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.mainTitle}>Welcome to Corp Crunch!</h1>
            <p className={styles.subtitle}>
              We'd love to learn a little more about you to craft your article:
            </p>
          </div>

          <div className={styles.formCard}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Your name</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder="John Doe"
                    {...register("name", { required: "Name is required!" })}
                  />
                  {errors.name && <div className={styles.errorMessage}>⚠ {errors.name.message}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone number</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder="Your phone number"
                    {...register("contactNo", { required: "Phone number is required!" })}
                  />
                  {errors.contactNo && <div className={styles.errorMessage}>⚠ {errors.contactNo.message}</div>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Company</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder="Company Name"
                    {...register("company", { required: "Company is required!" })}
                  />
                  {errors.company && <div className={styles.errorMessage}>⚠ {errors.company.message}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Location</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder="City, Country"
                    {...register("location", { required: "Location is required!" })}
                  />
                  {errors.location && <div className={styles.errorMessage}>⚠ {errors.location.message}</div>}
                </div>
              </div>

              <div className={styles.formGroupFull}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    className={styles.formInput}
                    type="email"
                    placeholder="james@example.com"
                    {...register("email", { 
                      required: "Email is required!",
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
                    })}
                  />
                  {errors.email && <div className={styles.errorMessage}>⚠ {errors.email.message}</div>}
                </div>
              </div>

              <div className={styles.formGroupFull}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Blog category</label>
                  <select
                    className={styles.formSelect}
                    {...register("blogCategory", { required: "Category is required!" })}
                  >
                    <option value="">Select category</option>
                    {categoryData?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.blogCategory && <div className={styles.errorMessage}>⚠ {errors.blogCategory.message}</div>}
                </div>
              </div>

              <div className={styles.contentSection}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Content description</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="Brief summary of your content"
                    {...register("content", { required: "Description is required!" })}
                  />
                  {errors.content && <div className={styles.errorMessage}>⚠ {errors.content.message}</div>}
                </div>
              </div>

              <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {showStatusModal && (
        <PaymentStatusModal
          orderId={orderId}
          paymentAmount={1050}
          status={paymentStatus}
          setShowStatusModal={setShowStatusModal}
        />
      )}
    </>
  );
};

export default RequestBlogForm;