import Spinner from "@/components/elements/Spinner";
import Layout from "@/components/layout/Layout";
import AuthAndSubscriptionProtected from "@/components/providers/AuthAndSubscriptionProtected";
import useProfile, { useEditProfile } from "@/hooks/useProfile";
import { notifyError, notifySuccess } from "@/util/notification";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";

const ProfilePage = () => {
  const [isEditingProfileLoading, setIsEditingProfileLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [editedUser, setEditedUser] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    bio: "",
  });

  const router = useRouter();
  const { refetch: fetchUserProfile } = useProfile();
  const { mutateAsync: patchUser } = useEditProfile();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          typeof window !== "undefined" &&
          window?.localStorage?.getItem("token");
        if (token) {
          const { data } = await fetchUserProfile();
          setUserData(data);
          setEditedUser({
            id: data?.id,
            firstName: data?.firstName,
            lastName: data?.lastName,
            email: data?.email,
            phoneNumber: data?.phoneNumber,
            address: data?.address,
            city: data?.city,
            state: data?.state,
            bio: data?.bio,
          });

          setIsLoading(false);
        } else {
          router.push(`/signin?redirectUrl=${router.pathname}`);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchData();
  }, []);

  // const subscriptionBtnText = useMemo(
  //   () =>
  //     userData?.manageSubscriptionUrl === null
  //       ? "Choose Subscription"
  //       : userData?.manageSubscriptionUrl !== null &&
  //         userData?.isSubscriptionValid === true
  //       ? "Manage Subscription"
  //       : "Renew Subscription",
  //   [userData]
  // );

  const isInputDisable = isLoading && !userData;
  const handleUserInputs = (name, value) => {
    if (name === "bio") {
      setEditedUser({ ...editedUser, [name]: value.slice(0, 150) });
    } else {
      setEditedUser({ ...editedUser, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsEditingProfileLoading(true);

      const filterObject = Object.keys(editedUser).reduce((acc, key) => {
        if (editedUser[key]) {
          acc[key] = editedUser[key];
        }
        return acc;
      }, {});

      const response = await patchUser(filterObject);
      response && notifySuccess("Profile updated successfully");
      setIsEditingProfileLoading(false);
      const { data } = await fetchUserProfile();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      notifyError("Error updating profile");
    } finally {
      setIsEditingProfileLoading(false);
    }
  };
  // const handleSubscription = () => {
  //   if (userData?.manageSubscriptionUrl === null) {
  //     router.push("/subscribe");
  //   } else {
  //     window.location.href = userData?.manageSubscriptionUrl;
  //   }
  // };
  // console.log("userData: ", userData);
  const handleLogout = () => {
    localStorage.clear();
    router.push("/signin");
  };
  return (
    <AuthAndSubscriptionProtected needSubscription={false}>
      <Layout>
        <style jsx>{`
          .profile-container {
            padding: 2rem 0;
          }
          .profile-title {
            margin-bottom: 2rem;
            color: var(--tg-heading-color, #111);
          }
          :global(.dark-theme) .profile-title {
            color: #fff;
          }
          .profile-card {
            background: var(--tg-common-color-white, #ffffff);
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-bottom: 1.5rem;
          }
          :global(.dark-theme) .profile-card {
            background: var(--tg-dark-color-2, #222);
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
          .profile-card-body {
            padding: 1.5rem;
          }
          .profile-card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--tg-heading-color, #111);
          }
          :global(.dark-theme) .profile-card-title {
            color: #fff;
          }
          .profile-list-item {
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            color: var(--tg-body-color, #666);
          }
          :global(.dark-theme) .profile-list-item {
            border-bottom-color: rgba(255, 255, 255, 0.1);
            color: #aaa;
          }
          .profile-list-item:last-child {
            border-bottom: none;
          }
          .profile-label {
            color: var(--tg-body-color, #666);
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          :global(.dark-theme) .profile-label {
            color: #aaa;
          }
          .profile-input {
            background: var(--tg-common-color-white, #ffffff);
            border: 1px solid rgba(0, 0, 0, 0.1);
            color: var(--tg-heading-color, #111);
            padding: 0.75rem;
            border-radius: 8px;
            width: 100%;
          }
          :global(.dark-theme) .profile-input {
            background: var(--tg-dark-color-1, #181818);
            border-color: rgba(255, 255, 255, 0.1);
            color: #fff;
          }
          .profile-input:focus {
            border-color: var(--tg-theme-secondary, #2551e7);
            outline: none;
            box-shadow: 0 0 0 3px rgba(37, 81, 231, 0.1);
          }
          .profile-input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          .profile-btn-primary {
            background: var(--tg-theme-secondary, #2551e7);
            color: #fff;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          .profile-btn-primary:hover {
            background: var(--tg-theme-primary, #ff0292);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(37, 81, 231, 0.3);
          }
          .profile-btn-logout {
            background: var(--tg-heading-color, #111);
            color: #fff;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            width: 100%;
          }
          :global(.dark-theme) .profile-btn-logout {
            background: #ff0292;
          }
          .profile-btn-logout:hover {
            background: #ff0292;
            transform: translateY(-2px);
          }
          .profile-email-text {
            font-family: monospace;
            color: var(--tg-theme-secondary, #2551e7);
            font-size: 0.875rem;
          }
          :global(.dark-theme) .profile-email-text {
            color: #2551e7;
          }
        `}</style>
        <div className="container profile-container">
          <h2 className="profile-title">Profile</h2>
          <div className="row">
            <div className="col-md-4">
              <div className="profile-card">
                <div className="profile-card-body">
                  <h5 className="profile-card-title">Account Information</h5>
                  <ul className="list-group list-group-flush flex-column">
                    <li className="profile-list-item d-flex flex-lg-row flex-column gap-3 align-items-lg-end align-items-center">
                      {isLoading ? (
                        <Skeleton circle={true} height={100} width={100} />
                      ) : (
                        <img
                          src={
                            userData?.profilePicture ??
                            "/assets/img/others/defaultAvatarProfile.jpg"
                          }
                          width={100}
                          alt="Profile"
                          className="img-fluid rounded-circle"
                        />
                      )}
                      <div className="d-flex flex-column justify-content-evenly align-items-start">
                        {isLoading ? (
                          <Skeleton width={150} />
                        ) : (
                          <div className="d-flex justify-content-between text-muted   align-items-center">
                            <span>
                              {userData?.firstName !== null ||
                                (userData?.firstName !== null &&
                                  userData?.firstName +
                                    " " +
                                    userData?.lastName)}
                            </span>
                          </div>
                        )}
                        {isLoading ? (
                          <Skeleton width={200} />
                        ) : (
                          <div className="flex-column d-flex justify-content-between align-items-center">
                            <code className="profile-email-text">
                              {userData?.email}
                            </code>
                          </div>
                        )}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="profile-card">
                <div className="profile-card-body">
                  <h5 className="profile-card-title">Subscription Details</h5>
                  <ul className="list-group list-group-flush flex-column">
                    {/* {userData?.isSubscriptionValid ? (
                      <>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Status:</strong>
                          <span>
                            {userData?.isSubscriptionValid
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          {isLoading ? (
                            <Skeleton width={100} />
                          ) : (
                            <span>No subscription data available</span>
                          )}
                        </li>
                        {!isLoading && (
                          <>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              <strong>Status:</strong>
                              <span>Inactive</span>
                            </li>
                          </>
                        )}
                      </>
                    )} */}
                    {/* <li className="list-group-item d-flex justify-content-between align-items-center">
                      <button
                        style={{ width: "100%" }}
                        className="btn  btn-primary mt-3 btn-block"
                        onClick={handleSubscription}
                      >
                        {subscriptionBtnText}
                      </button>
                    </li> */}
                    <li className="profile-list-item d-flex flex-column align-items-center">
                      <button
                        className="profile-btn-logout"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div className="profile-card">
                <div className="profile-card-body form-wrapper">
                  <h5
                    className="profile-card-title"
                    style={{
                      marginBottom: "2rem",
                    }}
                  >
                    Settings
                  </h5>
                  <form
                    className="p-4"
                    onSubmit={isInputDisable ? null : (e) => handleSubmit(e)}
                  >
                    <div className="row">
                      <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                        <div className="mb-3">
                          <label htmlFor="firstName" className="profile-label">
                            First Name
                          </label>
                          <input
                            type="text"
                            disabled={isInputDisable}
                            className="profile-input"
                            id="firstName"
                            placeholder="Enter your first name"
                            onChange={(e) =>
                              handleUserInputs("firstName", e.target.value)
                            }
                            value={editedUser.firstName || ''}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                        <div className="mb-3">
                          <label htmlFor="lastName" className="profile-label">
                            Last Name
                          </label>
                          <input
                            type="text"
                            disabled={isInputDisable}
                            className="profile-input"
                            id="lastName"
                            placeholder="Enter your last name"
                            onChange={(e) =>
                              handleUserInputs("lastName", e.target.value)
                            }
                            value={editedUser.lastName || ''}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                        <div className="mb-3">
                          <label htmlFor="email" className="profile-label">
                            Email
                          </label>
                          <input
                            type="email"
                            onChange={(e) =>
                              handleUserInputs("email", e.target.value)
                            }
                            className="profile-input"
                            id="email"
                            placeholder="Enter your email"
                            disabled={isInputDisable}
                            value={editedUser.email || ''}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                        <div className="mb-3">
                          <label htmlFor="phoneNumber" className="profile-label">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="profile-input"
                            id="phoneNumber"
                            placeholder="Enter your phone number"
                            disabled={isInputDisable}
                            onChange={(e) =>
                              handleUserInputs("phoneNumber", e.target.value)
                            }
                            value={editedUser.phoneNumber || ''}
                          />
                        </div>
                      </div>
                      <div className="col-12 mb-3">
                        <label htmlFor="address" className="profile-label">
                          Address
                        </label>
                        <input
                          type="text"
                          disabled={isInputDisable}
                          className="profile-input"
                          id="address"
                          placeholder="Enter your address"
                          onChange={(e) =>
                            handleUserInputs("address", e.target.value)
                          }
                          value={editedUser.address || ''}
                        />
                      </div>
                      <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                        <div className="mb-3">
                          <label htmlFor="city" className="profile-label">
                            City
                          </label>
                          <input
                            type="text"
                            disabled={isInputDisable}
                            onChange={(e) =>
                              handleUserInputs("city", e.target.value)
                            }
                            value={editedUser.city || ''}
                            className="profile-input"
                            id="city"
                            placeholder="Enter your city"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-12 col-md-6 col-lg-6">
                        <div className="mb-3">
                          <label htmlFor="state" className="profile-label">
                            State
                          </label>
                          <input
                            type="text"
                            disabled={isInputDisable}
                            onChange={(e) =>
                              handleUserInputs("state", e.target.value)
                            }
                            value={editedUser.state || ''}
                            className="profile-input"
                            id="state"
                            placeholder="Enter your state"
                          />
                        </div>
                      </div>
                      <div className="col-12 mb-3">
                        <label htmlFor="bio" className="profile-label">Bio</label>
                        <textarea
                          style={{ maxHeight: "150px", minHeight: "100px" }}
                          rows={5}
                          className="profile-input"
                          onChange={(e) =>
                            handleUserInputs("bio", e.target.value)
                          }
                          value={
                            editedUser?.bio?.length > 150
                              ? editedUser.bio.substring(0, 150)
                              : editedUser.bio || ''
                          }
                          id="bio"
                          name="bio"
                          placeholder="Add bio"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="profile-btn-primary"
                      disabled={isInputDisable || isEditingProfileLoading}
                      style={{
                        cursor: isInputDisable ? "not-allowed" : "pointer",
                      }}
                    >
                      {isEditingProfileLoading ? <Spinner /> : "Save Changes"}
                    </button>
                  </form>
                </div>
              </div>
              {/* <div className="card mt-3">
                <div className="card-body">
                  <h5 className="card-title">Blog Posts</h5>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </Layout>
    </AuthAndSubscriptionProtected>
  );
};

export default ProfilePage;
