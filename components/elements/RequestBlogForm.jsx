import { postPayableAmount } from "@/api/payment";
import { PAYMENT_STATUS, planIDs,CALENDLY_URL } from "@/config/constants";
import useCategory from "@/hooks/useCategory";
import { PAYMENT_TYPE } from "@/hooks/useClientToken";
import useRequestBlog, { getPaymentStatus } from "@/hooks/useRequestBlog";
import { notifyError, notifyMessage } from "@/util/toast";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PaymentStatusModal from "../Modals/PaymentStatusModal";
import Spinner from "./Spinner";
import styles from './RequestBlogForm.module.css';

const RequestBlogForm = () => {

  const { mutateAsync: submitPostRequest } = useRequestBlog();
  const { data: categoryData } = useCategory();
  const [isLoading, setIsLoading] = useState(false);
  const { query } = useRouter();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.PENDING);
  const [orderId, setOrderId] = useState('')

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
          setOrderId(res?.post?.orderId)
        } catch (error) {
          // Error logged to console in development only
          if (process.env.NODE_ENV === 'development') {
            console.error("Request blog form error: ", error);
          }
        }
      }
    };
    
    const startInterval = () => {
      const interval = setInterval(() => {
          handlePaymentStatus();
      }, 3000); 
      return () => clearInterval(interval);
    };

    handlePaymentStatus();
    if (query.payment_redirect === "true") {
      setShowStatusModal(true);
      let intervalFunc;
      if (paymentStatus === PAYMENT_STATUS.PENDING) {
        intervalFunc = startInterval();
        return intervalFunc;
      } else if (paymentStatus === PAYMENT_STATUS.FAILED) {
        intervalFunc && intervalFunc()
        return 
      }
    }

    if (paymentStatus === PAYMENT_STATUS.PAID) {
      notifyMessage("Your payment is received, Thank you.  We are redirecting you to schedule the meeting to discuss your query in detail.");
      
      setTimeout(() => window.location.href = CALENDLY_URL, 5000);
    }
  }, [ query.payment_redirect]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    // Prepare post data with all required fields
    const postData = {
      submitterName: data.name?.trim(),
      submitterEmail: data.email?.trim(),
      submitterPhone: data.contactNo?.trim(),
      companyName: data.company?.trim(),
      submitterAddress: data.location?.trim(),
      categoryID: Number(data.blogCategory),
      description: data.content?.trim(),
      title: `[Article Request] ${data.company} - ${Date.now()}`,
    };

    console.log('Form data collected:', {
      ...postData,
      description: postData.description?.substring(0, 50) + '...'
    });

    // Validate all fields are filled before submitting
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
      console.error('Client validation failed:', missingFields);
      return;
    }

    try {
      console.log('Submitting article request to API...');
      const post = await submitPostRequest(postData);
      console.log('✅ Article request response:', post);
      
      if (post && post.id) {
        let token = localStorage.getItem("token");
        localStorage.setItem("postId", post.id);
        let checkoutPlan = { postID: post.id, planID: planIDs.THREE_MONTH };

        const filterPlanIDIfNotToken = token
          ? checkoutPlan
          : (delete checkoutPlan.planID, checkoutPlan);
        
        console.log('Initiating payment checkout...');
        const res = await postPayableAmount(filterPlanIDIfNotToken);
        console.log('✅ Payment response:', res);
        
        notifyMessage(
          "We're redirecting you to our payment gateway for payment"
        );
        
        if (res?.payment_url) {
          setTimeout(() => {
            window.location.href = res.payment_url;
          }, 1500);
        } else {
          throw new Error('No payment URL received from server');
        }
      } else {
        throw new Error('No post ID received from server');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('❌ Form submission error:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      // Show detailed error message
      let errorMessage = "Failed to submit request, please try again";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.missingFields) {
        const missing = Object.keys(error.response.data.missingFields)
          .filter(key => error.response.data.missingFields[key])
          .join(', ');
        errorMessage = `Missing required fields: ${missing}`;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      notifyError(errorMessage);
    }
  };

  return (
    <>
      <section className={styles.articleRequestSection}>
        <div className={styles.container}>
          {/* Header Section */}
          <div className={styles.header}>
            <h1 className={styles.mainTitle}>Welcome to Corp Crunch!</h1>
            <p className={styles.subtitle}>
              We're thrilled to have you on board! At Corp Crunch, your story
              has the potential to reach millions, amplifying your brand's
              message. To get started on crafting a captivating article, we'd
              love to learn a little more about you:
            </p>
          </div>

          {/* Form Card */}
          <div className={styles.formCard}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Name and Phone Row */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Your name</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder="John doe"
                    {...register("name", { required: "Name is required!" })}
                  />
                  {errors.name?.message && (
                    <div className={styles.errorMessage}>
                      ⚠ {errors.name.message}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone number</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder="Your phone number"
                    {...register("contactNo", {
                      required: "Phone number is required!",
                    })}
                  />
                  {errors.contactNo?.message && (
                    <div className={styles.errorMessage}>
                      ⚠ {errors.contactNo.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Company and Location Row */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Company</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder="Reliance"
                    {...register("company", {
                      required: "Company is required!",
                    })}
                  />
                  {errors.company?.message && (
                    <div className={styles.errorMessage}>
                      ⚠ {errors.company.message}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Location</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder="Xyz street, state, country"
                    {...register("location", {
                      required: "Location is required!",
                    })}
                  />
                  {errors.location?.message && (
                    <div className={styles.errorMessage}>
                      ⚠ {errors.location.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Email (Full Width) */}
              <div className={styles.formGroupFull}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    className={styles.formInput}
                    type="email"
                    placeholder="james@example.com"
                    {...register("email", {
                      required: "Email is required!",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email?.message && (
                    <div className={styles.errorMessage}>
                      ⚠ {errors.email.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Blog Category (Full Width) */}
              <div className={styles.formGroupFull}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Blog category</label>
                  <select
                    {...register("blogCategory", {
                      required: "Blog category is required!",
                    })}
                    className={styles.formSelect}
                  >
                    <option value="">Select category</option>
                    {categoryData &&
                      categoryData.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                  {errors.blogCategory?.message && (
                    <div className={styles.errorMessage}>
                      ⚠ {errors.blogCategory.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Content Description Section */}
              <div className={styles.contentSection}>
                <p className={styles.contentDescription}>
                  Finally, to truly capture your story's essence, please
                  provide a brief summary of the content you have in mind.
                  This will help us canvas a compelling blurb that resonates
                  with your audience. We can't wait to collaborate with you
                  and shine the spotlight on your brand!
                </p>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Content description</label>
                  <textarea
                    className={styles.formTextarea}
                    {...register("content", {
                      required: "Content description is required!",
                    })}
                    placeholder="Enter content description"
                  />
                  {errors.content?.message && (
                    <div className={styles.errorMessage}>
                      ⚠ {errors.content.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? (
                  <>
                    <div className={styles.spinner}></div>
                    Processing...
                  </>
                ) : (
                  "Next →"
                )}
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
