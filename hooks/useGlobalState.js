import { getCategories } from "@/services/categories";
import { getAllCompaniesPost, getCompanyDetails } from "@/services/company";
import { subscribe } from "@/services/subscribe";
import { fetchIP, postIpForVisits } from "@/services/ipaddress";
import { notifyError, notifySuccess } from "@/util/toast";
import { useState } from "react";

const { getPost, getPostDetails } = require("@/services/blogs");

const useGlobalState = () => {
  const [email, setEmail] = useState("");

  const [companiesPosts, setCompaniesPosts] = useState(null);
  const [companyPostsDetails, setCompanyPostsDetails] = useState(null);
  const [postsDetails, setPostsDetails] = useState({});
  const [posts, setPosts] = useState({
    frontPagePosts: [],
    trendingPosts: [],
  });


  const [categories, setCategories] = useState([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await getPost();
      setPosts(response);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategory(true);
      const response = await getCategories();
      setCategories(response);
      setIsLoadingCategory(false);
    } catch (err) {
      setIsLoadingCategory(false);
      console.log("err: ", err);
    }
  };

  const fetchPostsDetails = async (id) => {
    setIsLoading(true);
    try {
      const response = await getPostDetails(id);
      setPostsDetails(response);
    } catch (err) {
      console.log("err: ", err);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchCompanyPostsDetails = async (id) => {
    setIsLoading(true);
    try {
      const response = await getCompanyDetails(id);
      setCompanyPostsDetails(response);
    } catch (err) {
      console.log("err: ", err);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchAllCompaniesPosts = async (id) => {
    setIsLoading(true);
    try {
      const response = await getAllCompaniesPost(id);
      console.log(response, "response of all companies posts");

      setCompaniesPosts(response);
    } catch (err) {
      console.log("err: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  //
  const handleSubscription = async (email) => {
    setIsSubscribing(true);
    let response;
    try {
      response = await subscribe(email);
      setIsSubscribing(false);
      if (response?.success) {
        notifySuccess("Successfully subscribed");
        setEmail("");
        return response?.success;
      }
    } catch (err) {
      notifyError(err?.response?.data?.message);
    } finally {
      setIsSubscribing(false);
    }
  };

  const fetchUserIPaddress = async () => {
    try {
      const response = await fetchIP();
      console.log("response of fetchIP ", response);
      await postIpForVisits(response?.data);
    } catch (error) {
      console.error("Failed to fetch IP:", error);
    }
  };

  return {
    posts,
    isLoading,
    isLoadingCategory,
    fetchPostsDetails,
    postsDetails,
    handleSubscription,
    isSubscribing,
    categories,
    fetchCompanyPostsDetails,
    fetchAllCompaniesPosts,
    companiesPosts,
    companyPostsDetails,
    setEmail,
    email,
    fetchPosts,
    fetchCategories,
    fetchUserIPaddress,
  };
};

export default useGlobalState;
