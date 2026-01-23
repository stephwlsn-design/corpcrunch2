import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axiosInstance from "@/util/axiosInstance";
import { notifyError, notifySuccess } from "@/util/toast";
import useCategory from "@/hooks/useCategory";
import ToastContainer from "@/components/ToastContainer/ToastContainer";

export default function AdminCreatePost() {
  // Core Required Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [authorFirstName, setAuthorFirstName] = useState("");
  const [authorLastName, setAuthorLastName] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [contentType, setContentType] = useState("article"); // article, video, magazine

  // SEO & Metadata
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [imageAltText, setImageAltText] = useState("");

  // Publishing Settings
  const [publishStatus, setPublishStatus] = useState("published"); // draft, review, scheduled, published
  const [publishDate, setPublishDate] = useState("");
  const [publishTime, setPublishTime] = useState("");
  const [visibility, setVisibility] = useState("public"); // public, private, internal, members-only

  // Content Controls
  const [excerpt, setExcerpt] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [relatedArticles, setRelatedArticles] = useState("");
  
  // Quote Fields
  const [quoteText, setQuoteText] = useState("");
  const [quoteAuthorName, setQuoteAuthorName] = useState("");
  const [quoteAuthorTitle, setQuoteAuthorTitle] = useState("");
  
  // Additional Content Fields
  const [whyThisMatters, setWhyThisMatters] = useState("");
  const [whyThisMattersMultimediaUrl, setWhyThisMattersMultimediaUrl] = useState("");
  const [whyThisMattersMultimediaType, setWhyThisMattersMultimediaType] = useState("graphic"); // graphic or video
  const [whatsExpectedNext, setWhatsExpectedNext] = useState("");
  const [whatsExpectedNextMultimediaUrl, setWhatsExpectedNextMultimediaUrl] = useState("");
  const [whatsExpectedNextMultimediaType, setWhatsExpectedNextMultimediaType] = useState("graphic"); // graphic or video

  // Media & Assets
  const [inlineImages, setInlineImages] = useState("");
  const [attachments, setAttachments] = useState("");
  const [inlineImageAltText, setInlineImageAltText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Advanced SEO Fields
  const [allowIndexing, setAllowIndexing] = useState(true);
  const [allowFollowing, setAllowFollowing] = useState(true);
  const [schemaMarkupType, setSchemaMarkupType] = useState("Article");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [redirectFrom, setRedirectFrom] = useState("");
  const [language, setLanguage] = useState("en");
  const [region, setRegion] = useState("");
  const [structuredData, setStructuredData] = useState("");

  // UI State
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState(false);
  const contentTextareaRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    core: true,
    seo: false,
    advancedSeo: false,
    publishing: false,
    content: false,
    media: false,
  });

  const { data: categories, isLoading: categoriesLoading } = useCategory();
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined" && localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) {
      notifyError(
        "You must be signed in with an admin account to access the admin panel."
      );
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }
    // Set default publish date/time to now
    const now = new Date();
    setPublishDate(now.toISOString().split("T")[0]);
    setPublishTime(now.toTimeString().slice(0, 5));
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const generateSlugFromTitle = (titleText) => {
    return titleText
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const generateMetaDescription = (contentText) => {
    // Remove HTML tags if any
    const plainText = contentText.replace(/<[^>]*>/g, "").replace(/\n/g, " ");
    // Take first 155 characters and add ellipsis
    const truncated = plainText.trim().substring(0, 155);
    return truncated.length < plainText.length ? truncated + "..." : truncated;
  };

  const handleGenerateSlug = (value) => {
    setTitle(value);
    
    // Auto-generate slug if empty or if it matches the previous title's slug
    const previousSlug = title
      ? generateSlugFromTitle(title)
      : "";
    
    if (!slug || slug === previousSlug) {
      const generated = generateSlugFromTitle(value);
      setSlug(generated);
    }
    
    // Auto-generate meta title if empty (limit to 60 chars for SEO)
    if (!metaTitle) {
      const metaTitleValue = value.length > 60 ? value.substring(0, 57) + "..." : value;
      setMetaTitle(metaTitleValue);
    }
    
    // Auto-generate OG title if empty
    if (!ogTitle) {
      const ogTitleValue = value.length > 60 ? value.substring(0, 57) + "..." : value;
      setOgTitle(ogTitleValue);
    }
    
    // Auto-generate meta description from content if content exists and metaDescription is empty
    if (!metaDescription && content) {
      const generatedDesc = generateMetaDescription(content);
      setMetaDescription(generatedDesc);
    }
  };

  // Auto-generate meta description when content changes
  useEffect(() => {
    if (content && !metaDescription && content.length > 50) {
      const generatedDesc = generateMetaDescription(content);
      setMetaDescription(generatedDesc);
    }
  }, [content]);

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  useEffect(() => {
    // Auto-calculate reading time when content changes
    if (content) {
      const time = calculateReadingTime(content);
      // Only update if readingTime is empty or if content changed significantly
      if (!readingTime || Math.abs(Number(readingTime) - time) > 1) {
        setReadingTime(time.toString());
      }
    }
  }, [content]);

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setBannerImageUrl(url);
    setImageError(false);
    
    // Warn if user enters iStock page URL instead of direct image URL
    if (url.includes('istockphoto.com/photo/') && !url.includes('media.istockphoto.com')) {
      // This is a page URL, not a direct image URL
      // The preview will fail, but we'll show a helpful message
      console.warn('iStock page URL detected. Use direct image URL for preview to work.');
    }
  };

  const validateForm = () => {
    if (!title || title.trim().length < 5) {
      notifyError("Title must be at least 5 characters long.");
      return false;
    }
    if (!slug || slug.trim().length < 3) {
      notifyError("Slug must be at least 3 characters long.");
      return false;
    }
    if (!bannerImageUrl || !isValidUrl(bannerImageUrl)) {
      notifyError("Please provide a valid banner image URL.");
      return false;
    }
    // For video content, also require a valid video URL
    if (contentType === "video") {
      if (!videoUrl || !isValidUrl(videoUrl)) {
        notifyError("Please provide a valid video URL for video content.");
        return false;
      }
    }
    if (!content || content.trim().length < 50) {
      notifyError("Content must be at least 50 characters long.");
      return false;
    }
    if (!categoryId) {
      notifyError("Please select a category.");
      return false;
    }
    return true;
  };

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const resetForm = (skipConfirmation = false) => {
    // Confirm before clearing if form has content (unless skipConfirmation is true)
    if (!skipConfirmation) {
    const hasContent = title || content || slug;
    if (hasContent && typeof window !== "undefined" && !window.confirm("Are you sure you want to clear the form? All unsaved changes will be lost.")) {
      return;
      }
    }
    
    setTitle("");
    setSlug("");
    setAuthorFirstName("");
    setAuthorLastName("");
    setContent("");
    setCategoryId("");
    setTags("");
    setMetaTitle("");
    setMetaDescription("");
    setBannerImageUrl("");
    setImageAltText("");
    setPublishStatus("published");
    const now = new Date();
    setPublishDate(now.toISOString().split("T")[0]);
    setPublishTime(now.toTimeString().slice(0, 5));
    setVisibility("public");
    setExcerpt("");
    setReadingTime("");
    setCanonicalUrl("");
    setRelatedArticles("");
    setInlineImages("");
    setAttachments("");
    setInlineImageAltText("");
    setAllowIndexing(true);
    setAllowFollowing(true);
    setSchemaMarkupType("Article");
    setOgTitle("");
    setOgDescription("");
    setOgImage("");
    setSecondaryKeywords("");
    setRedirectFrom("");
    setLanguage("en");
    setRegion("");
    setStructuredData("");
    setQuoteText("");
    setQuoteAuthorName("");
    setQuoteAuthorTitle("");
    setContentType("article");
    setWhyThisMatters("");
    setWhyThisMattersMultimediaUrl("");
    setWhyThisMattersMultimediaType("graphic");
    setWhatsExpectedNext("");
    setWhatsExpectedNextMultimediaUrl("");
    setWhatsExpectedNextMultimediaType("graphic");
    setVideoUrl("");
    setImageError(false);
    setShowPreview(false);
    
    // Show success message
    notifySuccess("Form cleared successfully");
  };

  const handlePublish = async (e, statusOverride = null) => {
    if (e) {
      e.preventDefault();
    }

    // For draft saves, only validate required fields
    const isDraft = statusOverride === 'draft' || publishStatus === 'draft';
    
    if (!isDraft && !validateForm()) {
      return;
    }

    // Basic validation even for drafts
    if (!title || title.trim().length < 3) {
      notifyError("Title must be at least 3 characters long.");
      return;
    }
    if (!slug || slug.trim().length < 3) {
      notifyError("Slug must be at least 3 characters long.");
      return;
    }
    if (!content || content.trim().length < 10) {
      notifyError("Content must be at least 10 characters long.");
      return;
    }
    if (!categoryId) {
      notifyError("Please select a category.");
      return;
    }

    setIsPublishing(true);
    try {
      // Check slug uniqueness before saving
      try {
        const checkResponse = await axiosInstance.get(`/posts?slug=${encodeURIComponent(slug.trim())}`);
        // If we get posts back, check if any have this slug
        // Note: This is a basic check - the backend will also validate
      } catch (checkError) {
        // Ignore check errors, backend will handle uniqueness
      }

      // Combine publish date and time
      let publishDateTime = null;
      if (publishDate && publishTime) {
        try {
          // Create date from date and time strings
          const dateTimeString = `${publishDate}T${publishTime}`;
          publishDateTime = new Date(dateTimeString).toISOString();
          
          // Validate the date is valid
          if (isNaN(new Date(dateTimeString).getTime())) {
            notifyError("Invalid publish date or time. Please check the format.");
            setIsPublishing(false);
            return;
          }
          
          // If status is "scheduled", validate that the date is in the future
          const finalStatus = statusOverride || publishStatus;
          if (finalStatus === 'scheduled') {
            const scheduledDate = new Date(dateTimeString);
            const now = new Date();
            if (scheduledDate <= now) {
              notifyError("Scheduled posts must have a publish date/time in the future.");
              setIsPublishing(false);
              return;
            }
          }
        } catch (error) {
          notifyError("Error processing publish date/time. Please check the format.");
          setIsPublishing(false);
          return;
        }
      } else if (publishStatus === 'scheduled' || statusOverride === 'scheduled') {
        // If status is scheduled but no date/time provided
        notifyError("Scheduled posts require both a publish date and time.");
        setIsPublishing(false);
        return;
      }

      // Get category ObjectId - try to find category first
      let categoryObjectId = categoryId;
      try {
        // If categoryId is a number, we need to find the actual category
        // The useCategory hook should provide the full category object
        const selectedCat = categories?.find((cat) => cat.id === Number(categoryId) || cat._id === categoryId);
        if (selectedCat?._id) {
          categoryObjectId = selectedCat._id;
        } else if (selectedCat?.id) {
          // If it's a numeric ID, we'll let the backend handle conversion
          categoryObjectId = selectedCat.id;
        }
      } catch (e) {
        // Fallback to original value
        console.warn('Could not resolve category ID:', e);
      }

      const payload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        content: content.trim(),
        bannerImageUrl: bannerImageUrl.trim(),
        categoryId: categoryObjectId,
        // Additional fields - API may not support all, but we'll send what we can
        ...(authorFirstName && { authorFirstName: authorFirstName.trim() }),
        ...(authorLastName && { authorLastName: authorLastName.trim() }),
        ...(tags && { tags: tags.split(",").map((t) => t.trim()).filter(Boolean) }),
        ...(metaTitle && { metaTitle: metaTitle.trim() }),
        ...(metaDescription && { metaDescription: metaDescription.trim() }),
        ...(imageAltText && { imageAltText: imageAltText.trim() }),
        ...(publishStatus && { publishStatus }),
        ...(publishDateTime && { publishDate: publishDateTime }),
        ...(visibility && { visibility }),
        ...(excerpt && { excerpt: excerpt.trim() }),
        ...(readingTime && { readingTime: Number(readingTime) }),
        ...(canonicalUrl && isValidUrl(canonicalUrl) && { canonicalUrl: canonicalUrl.trim() }),
        // Related Articles - convert comma-separated string to array
        ...(relatedArticles && { 
          relatedArticles: relatedArticles.split(",").map((a) => a.trim()).filter(Boolean) 
        }),
        // Inline Images - convert newline-separated string to array, validate URLs
        ...(inlineImages && { 
          inlineImages: inlineImages.split("\n")
            .map(url => url.trim())
            .filter(url => url && isValidUrl(url))
        }),
        // Attachments - convert newline-separated string to array, validate URLs
        ...(attachments && { 
          attachments: attachments.split("\n")
            .map(url => url.trim())
            .filter(url => url && isValidUrl(url))
        }),
        ...(inlineImageAltText && { inlineImageAltText: inlineImageAltText.trim() }),
        // Advanced SEO Fields - Always include boolean values
        allowIndexing: allowIndexing !== undefined ? allowIndexing : true,
        allowFollowing: allowFollowing !== undefined ? allowFollowing : true,
        ...(schemaMarkupType && { schemaMarkupType }),
        ...(ogTitle && { ogTitle: ogTitle.trim() }),
        ...(ogDescription && { ogDescription: ogDescription.trim() }),
        ...(ogImage && isValidUrl(ogImage) && { ogImage: ogImage.trim() }),
        ...(secondaryKeywords && { secondaryKeywords: secondaryKeywords.split(",").map((k) => k.trim()).filter(Boolean) }),
        ...(redirectFrom && { redirectFrom: redirectFrom.trim() }),
        ...(language && { language }),
        ...(region && { region: region.trim() }),
        ...(structuredData && structuredData.trim() && { 
          structuredData: structuredData.trim()
        }),
        ...(quoteText && { quoteText: quoteText.trim() }),
        ...(quoteAuthorName && { quoteAuthorName: quoteAuthorName.trim() }),
        ...(quoteAuthorTitle && { quoteAuthorTitle: quoteAuthorTitle.trim() }),
        ...(contentType && { contentType }),
        ...(whyThisMatters && { whyThisMatters: whyThisMatters.trim() }),
        ...(whyThisMattersMultimediaUrl && isValidUrl(whyThisMattersMultimediaUrl) && { whyThisMattersMultimediaUrl: whyThisMattersMultimediaUrl.trim() }),
        ...(whyThisMattersMultimediaType && { whyThisMattersMultimediaType }),
        ...(whatsExpectedNext && { whatsExpectedNext: whatsExpectedNext.trim() }),
        ...(whatsExpectedNextMultimediaUrl && isValidUrl(whatsExpectedNextMultimediaUrl) && { whatsExpectedNextMultimediaUrl: whatsExpectedNextMultimediaUrl.trim() }),
        ...(whatsExpectedNextMultimediaType && { whatsExpectedNextMultimediaType }),
        ...(videoUrl && isValidUrl(videoUrl) && { videoUrl: videoUrl.trim() }),
      };

      // Override status if provided (for Save as Draft)
      if (statusOverride) {
        payload.publishStatus = statusOverride;
      }

      // Validate structuredData JSON before sending
      if (structuredData && structuredData.trim()) {
        try {
          JSON.parse(structuredData.trim());
        } catch (e) {
          notifyError("Structured Data must be valid JSON. Please check the format.");
          setIsPublishing(false);
          return;
        }
      }

      await axiosInstance.post("/posts", payload);
      const statusMessage = statusOverride === 'draft' 
        ? "Post saved as draft successfully!" 
        : "Post published successfully!";
      notifySuccess(statusMessage);

      // Only reset form if published, not if saved as draft
      // Skip confirmation dialog when auto-clearing after successful publish
      if (statusOverride !== 'draft' && publishStatus !== 'draft') {
        resetForm(true); // Pass true to skip confirmation
      }
    } catch (error) {
      console.error("Failed to publish post", error);
      
      // Auto-handle errors with centralized error handler
      try {
        const { handleApiError } = await import('@/lib/errorHandler');
        handleApiError(error, notifyError);
      } catch (importError) {
        // Fallback to manual error handling if import fails
        // Handle specific error cases
        if (error?.response?.status === 401) {
          notifyError("Authentication required. Please log in again.");
          if (typeof window !== "undefined") {
            setTimeout(() => {
              window.location.href = "/admin/login";
            }, 2000);
          }
        } else if (error?.response?.status === 409) {
          notifyError(error?.response?.data?.message || "A post with this slug already exists. Please use a different slug.");
        } else if (error?.response?.status === 400) {
          notifyError(error?.response?.data?.message || "Invalid data. Please check all required fields.");
        } else if (error?.response?.status === 429) {
          const retryAfter = error?.response?.data?.retryAfter || 60;
          notifyError(`Rate limit exceeded. Please try again after ${retryAfter} seconds.`);
        } else if (error?.response?.status === 500) {
          notifyError("Server error. Please try again later or contact support.");
        } else if (!error?.response) {
          notifyError("Network error. Please check your internet connection and try again.");
        } else {
          notifyError(
            error?.response?.data?.message ||
              "Failed to publish post. Please check the data and try again."
          );
        }
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedCategory = categories?.find((cat) => cat.id === Number(categoryId));

  const SectionHeader = ({ title, section, icon }) => (
    <div
      className="d-flex justify-content-between align-items-center p-3"
      style={{
        backgroundColor: "#f8f9fa",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        cursor: "pointer",
        marginBottom: "15px",
      }}
      onClick={() => toggleSection(section)}
    >
      <h4 className="mb-0" style={{ fontSize: "18px", fontWeight: "600" }}>
        {title}
      </h4>
      <span style={{ fontSize: "20px" }}>
        {expandedSections[section] ? "−" : "+"}
      </span>
    </div>
  );

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      // Clear all tokens
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      
      // Show success message
      notifySuccess("Logged out successfully");
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 500);
    }
  };

  return (
    <>
      <Head>
        <title>Admin | Create Post - Corp Crunch</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      {/* Admin-only layout - no header, footer, navbar */}
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: "#f5f5f5",
        paddingTop: "20px",
        paddingBottom: "40px"
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-11">
              {/* Admin Header Bar */}
              <div style={{
                backgroundColor: "#fff",
                padding: "15px 20px",
                borderRadius: "8px",
                marginBottom: "20px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <h2 className="mb-0" style={{ fontSize: "24px", fontWeight: "600", color: "#333" }}>
                    Admin Panel - Create New Post
                  </h2>
                  <small style={{ color: "#666", fontSize: "12px" }}>
                    Create, edit, and manage posts, articles, and news
                  </small>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/dashboard")}
                    className="btn"
                    style={{ 
                      minWidth: "100px",
                      backgroundColor: "#17a2b8",
                      borderColor: "#17a2b8",
                      borderRadius: "50px",
                      color: "#fff",
                      padding: "10px 20px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="btn"
                    style={{ 
                      minWidth: "100px",
                      backgroundColor: "#ff0292",
                      borderColor: "#ff0292",
                      borderRadius: "50px",
                      color: "#fff",
                      padding: "10px 20px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    {showPreview ? "Edit" : "Preview"}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn"
                    style={{ 
                      minWidth: "100px",
                      backgroundColor: "#dc3545",
                      borderColor: "#dc3545",
                      borderRadius: "50px",
                      color: "#fff",
                      padding: "10px 20px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>

              <div className="blog-details-wrap" style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="title mb-0" style={{ fontSize: "28px", fontWeight: "600" }}>Create New Post / Article / News</h2>
                </div>

                {showPreview ? (
                  <div
                    className="preview-container"
                    style={{
                      border: "1px solid #e8e8e8",
                      borderRadius: "8px",
                      padding: "20px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <h3 className="mb-3">Preview</h3>
                    {bannerImageUrl && (
                      <div
                        className="mb-3"
                        style={{
                          width: "100%",
                          height: "400px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <img
                          src={bannerImageUrl}
                          alt={imageAltText || title || "Preview"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={() => setImageError(true)}
                        />
                      </div>
                    )}
                    <div className="mb-2">
                      <span
                        className="category"
                        style={{
                          color: "var(--tg-theme-primary)",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          fontSize: "14px",
                        }}
                      >
                        {selectedCategory?.name || "Category"}
                      </span>
                      <span className="ms-3" style={{ fontSize: "12px", color: "#666", textTransform: "capitalize" }}>
                        Type: {contentType}
                      </span>
                      {tags && (
                        <span className="ms-3" style={{ fontSize: "12px", color: "#777" }}>
                          Tags: {tags}
                        </span>
                      )}
                    </div>
                    <h1 className="title mb-3">{title || "Post Title"}</h1>
                    {(authorFirstName || authorLastName) && (
                      <p className="mb-2" style={{ color: "#777" }}>
                        By {authorFirstName} {authorLastName}
                      </p>
                    )}
                    {excerpt && (
                      <div
                        className="mb-3 p-3"
                        style={{
                          backgroundColor: "#f8f9fa",
                          borderRadius: "4px",
                          fontStyle: "italic",
                          color: "#555",
                        }}
                      >
                        {excerpt}
                      </div>
                    )}
                    {readingTime && (
                      <p className="mb-2" style={{ fontSize: "14px", color: "#777" }}>
                        Reading time: {readingTime} minute{readingTime !== "1" ? "s" : ""}
                      </p>
                    )}
                    {quoteText && (
                      <div
                        className="mb-4 p-4"
                        style={{
                          borderLeft: "4px solid #ff0292",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "4px",
                          fontStyle: "italic",
                          position: "relative",
                        }}
                      >
                        <div style={{ fontSize: "18px", color: "#333", marginBottom: "10px" }}>
                          "{quoteText}"
                        </div>
                        {(quoteAuthorName || quoteAuthorTitle) && (
                          <div style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
                            — {quoteAuthorName}
                            {quoteAuthorTitle && `, ${quoteAuthorTitle}`}
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className="content-preview"
                      style={{
                        lineHeight: "1.8",
                        color: "#777777",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: content.replace(/\n/g, "<br />"),
                      }}
                    />
                    {whyThisMatters && (
                      <div className="mt-4 p-4" style={{ backgroundColor: "#f0f8ff", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px", color: "#333" }}>
                          Why This Matters?
                        </h3>
                        <p style={{ color: "#555", lineHeight: "1.6" }}>{whyThisMatters}</p>
                        {whyThisMattersMultimediaUrl && (
                          <div className="mt-3">
                            {whyThisMattersMultimediaType === "graphic" ? (
                              <img
                                src={whyThisMattersMultimediaUrl}
                                alt="Why This Matters"
                                style={{ maxWidth: "100%", borderRadius: "4px" }}
                              />
                            ) : (
                              <video src={whyThisMattersMultimediaUrl} controls style={{ maxWidth: "100%", borderRadius: "4px" }}>
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {whatsExpectedNext && (
                      <div className="mt-4 p-4" style={{ backgroundColor: "#fff8f0", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px", color: "#333" }}>
                          What's Expected Next?
                        </h3>
                        <p style={{ color: "#555", lineHeight: "1.6" }}>{whatsExpectedNext}</p>
                        {whatsExpectedNextMultimediaUrl && (
                          <div className="mt-3">
                            {whatsExpectedNextMultimediaType === "graphic" ? (
                              <img
                                src={whatsExpectedNextMultimediaUrl}
                                alt="What's Expected Next"
                                style={{ maxWidth: "100%", borderRadius: "4px" }}
                              />
                            ) : (
                              <video src={whatsExpectedNextMultimediaUrl} controls style={{ maxWidth: "100%", borderRadius: "4px" }}>
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                <form onSubmit={handlePublish}>
                    {/* Core Required Fields */}
                    <SectionHeader
                      title="Core Required Fields"
                      section="core"
                    />
                    {expandedSections.core && (
                      <div style={{ marginBottom: "30px", padding: "0 15px" }}>
                  <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">
                            Title <span style={{ color: "red" }}>*</span>
                          </label>
                    <input
                      className="form-control articleInput"
                      type="text"
                      value={title}
                      onChange={(e) => handleGenerateSlug(e.target.value)}
                            placeholder="Enter post title"
                            required
                            minLength={5}
                          />
                          {title && (
                            <small
                              className="text-muted"
                              style={{
                                fontSize: "12px",
                                marginTop: "5px",
                                display: "block",
                              }}
                            >
                              {title.length} characters
                            </small>
                          )}
                  </div>

                  <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">
                            Slug (URL-friendly) <span style={{ color: "red" }}>*</span>
                            <span className="ms-2" style={{ fontSize: "12px", color: "#666" }}>
                              (Auto-generated from title)
                            </span>
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <span className="me-2" style={{ color: "#777" }}>
                              /blog/
                            </span>
                    <input
                      className="form-control articleInput"
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        // Only allow valid slug characters
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                        setSlug(value);
                      }}
                      placeholder="unique-url-slug"
                              required
                              minLength={3}
                              pattern="[a-z0-9-]+"
                              style={{ flex: 1 }}
                            />
                            {title && (
                              <button
                                type="button"
                                onClick={() => {
                                  const generated = generateSlugFromTitle(title);
                                  setSlug(generated);
                                }}
                                className="btn btn-sm"
                                style={{
                                  backgroundColor: "#f0f0f0",
                                  border: "1px solid #ddd",
                                  padding: "6px 12px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap"
                                }}
                                title="Regenerate slug from title"
                              >
                                Regenerate
                              </button>
                            )}
                          </div>
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            Only lowercase letters, numbers, and hyphens allowed. 
                            {slug && slug.length < 3 && (
                              <span style={{ color: "#f44336" }}> ⚠ Slug must be at least 3 characters</span>
                            )}
                            {slug && slug.length >= 3 && (
                              <span style={{ color: "#4caf50" }}> ✓ Valid format</span>
                            )}
                          </small>
                  </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="input-group-meta position-relative mb-25">
                              <label className="form-label">Author First Name</label>
                              <input
                                className="form-control articleInput"
                                type="text"
                                value={authorFirstName}
                                onChange={(e) =>
                                  setAuthorFirstName(e.target.value)
                                }
                                placeholder="First name"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                  <div className="input-group-meta position-relative mb-25">
                              <label className="form-label">Author Last Name</label>
                    <input
                      className="form-control articleInput"
                      type="text"
                                value={authorLastName}
                                onChange={(e) => setAuthorLastName(e.target.value)}
                                placeholder="Last name"
                    />
                            </div>
                          </div>
                  </div>

                  <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">
                            Category <span style={{ color: "red" }}>*</span>
                          </label>
                    <select
                            className="form-control articleInput"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                            required
                            disabled={categoriesLoading}
                    >
                            <option value="">
                              {categoriesLoading
                                ? "Loading categories..."
                                : "Select category"}
                            </option>
                      {categories &&
                        categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">
                            Content Type <span style={{ color: "red" }}>*</span>
                          </label>
                    <select
                            className="form-control articleInput"
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                            required
                    >
                            <option value="article">Article</option>
                            <option value="video">Video</option>
                            <option value="magazine">Magazine</option>
                    </select>
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            Select the type of content: Article (text-based), Video (video content), or Magazine (digital magazine)
                          </small>
                  </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Tags</label>
                          <input
                            className="form-control articleInput"
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="tag1, tag2, tag3 (comma-separated)"
                          />
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            Separate multiple tags with commas
                          </small>
                  </div>

                  <div className="input-group-meta position-relative mb-25">
                    <label className="form-label">
                            Article Body / Content{" "}
                            <span style={{ color: "red" }}>*</span>
                    </label>
                    <textarea
                      ref={contentTextareaRef}
                      className="form-control articleInput"
                            style={{
                              minHeight: "400px",
                              fontFamily: "monospace",
                            }}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                            placeholder="Write the full article content here... You can use HTML or Markdown formatting. Use H2/H3 tags for subheadings to improve SEO structure."
                            required
                            minLength={50}
                          />
                          {content && (
                            <small
                              className="text-muted"
                              style={{
                                fontSize: "12px",
                                marginTop: "5px",
                                display: "block",
                              }}
                            >
                              {content.length} characters |{" "}
                              {content.split(/\s+/).filter(Boolean).length} words
                            </small>
                          )}
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                              fontStyle: "italic",
                            }}
                          >
                            💡 Tip: Use H2 and H3 subheadings in your content to help Google understand article hierarchy and improve SEO.
                          </small>
                        </div>

                        {contentType === "video" && (
                          <div className="input-group-meta position-relative mb-25">
                            <label className="form-label">
                              Video URL <span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                              className="form-control articleInput"
                              type="url"
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=..."
                              required
                            />
                            <small
                              className="text-muted"
                              style={{
                                fontSize: "12px",
                                marginTop: "5px",
                                display: "block",
                              }}
                            >
                              Paste the full video URL (YouTube, Vimeo, etc.) for this video story.
                            </small>
                          </div>
                        )}

                        {/* Featured Quote */}
                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label" style={{ fontSize: "16px", fontWeight: "600", marginBottom: "15px" }}>
                            Featured Quote
                          </label>
                          <div style={{ border: "1px solid #e8e8e8", borderRadius: "8px", padding: "20px", backgroundColor: "#f8f9fa" }}>
                            <div className="input-group-meta position-relative mb-25">
                              <label className="form-label">Quote Text</label>
                              <textarea
                                className="form-control articleInput"
                                style={{ minHeight: "100px" }}
                                value={quoteText}
                                onChange={(e) => setQuoteText(e.target.value)}
                                placeholder="Enter the quote text (e.g., In a milestone moment for the cryptocurrency world, the global stablecoin market has soared past a $270 billion valuation...)"
                              />
                              {quoteText && (
                                <small className="text-muted" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>
                                  {quoteText.length} characters
                                </small>
                              )}
                            </div>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="input-group-meta position-relative mb-25">
                                  <label className="form-label">Author Name</label>
                                  <input
                                    className="form-control articleInput"
                                    type="text"
                                    value={quoteAuthorName}
                                    onChange={(e) => setQuoteAuthorName(e.target.value)}
                                    placeholder="e.g., James Thompson"
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="input-group-meta position-relative mb-25">
                                  <label className="form-label">Author Title</label>
                                  <input
                                    className="form-control articleInput"
                                    type="text"
                                    value={quoteAuthorTitle}
                                    onChange={(e) => setQuoteAuthorTitle(e.target.value)}
                                    placeholder="e.g., Digital Expert"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="d-flex gap-2 mt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!quoteText) {
                                    notifyError("Please enter quote text first");
                                    return;
                                  }
                                  if (!quoteAuthorName) {
                                    notifyError("Please enter author name");
                                    return;
                                  }
                                  
                                  const textarea = contentTextareaRef.current;
                                  if (textarea) {
                                    const start = textarea.selectionStart || content.length;
                                    const end = textarea.selectionEnd || content.length;
                                    const beforeText = content.substring(0, start);
                                    const afterText = content.substring(end);
                                    // Insert a placeholder that will be replaced with the quote
                                    const quoteMarker = `\n\n[QUOTE_PLACEHOLDER]\n\n`;
                                    const newContent = beforeText + quoteMarker + afterText;
                                    setContent(newContent);
                                    
                                    // Update cursor position after state update
                                    setTimeout(() => {
                                      const newCursorPos = start + quoteMarker.length;
                                      textarea.setSelectionRange(newCursorPos, newCursorPos);
                                      textarea.focus();
                                    }, 0);
                                    
                                    notifySuccess("Quote placeholder inserted. The quote will automatically appear in the blog post when published.");
                                  } else {
                                    // Fallback: append to content
                                    setContent(content + `\n\n[QUOTE_PLACEHOLDER]\n\n`);
                                    notifySuccess("Quote placeholder added to content. The quote will automatically appear in the blog post when published.");
                                  }
                                }}
                                className="btn"
                                style={{
                                  backgroundColor: "#ff0292",
                                  color: "#fff",
                                  border: "none",
                                  padding: "10px 25px",
                                  borderRadius: "50px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "8px"
                                }}
                              >
                                Insert Quote into Content
                              </button>
                            </div>
                            <small className="text-muted" style={{ fontSize: "12px", display: "block", fontStyle: "italic", marginTop: "10px" }}>
                              💡 Fill in the quote details above, then click "Insert Quote into Content" to add it to your article. The quote will be displayed with wavy lines, pink avatar with initials, and author information in the blog post.
                            </small>
                          </div>
                        </div>

                        {/* Why This Matters */}
                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label" style={{ fontSize: "16px", fontWeight: "600", marginBottom: "15px" }}>
                            Why This Matters?
                          </label>
                          <div style={{ border: "1px solid #e8e8e8", borderRadius: "8px", padding: "20px", backgroundColor: "#f8f9fa" }}>
                            <div className="input-group-meta position-relative mb-25">
                              <label className="form-label">Description</label>
                              <textarea
                                className="form-control articleInput"
                                style={{ minHeight: "120px" }}
                                value={whyThisMatters}
                                onChange={(e) => setWhyThisMatters(e.target.value)}
                                placeholder="Explain why this content matters to the reader. What is the significance or impact?"
                              />
                              {whyThisMatters && (
                                <small className="text-muted" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>
                                  {whyThisMatters.length} characters
                                </small>
                              )}
                            </div>
                            
                            <div className="input-group-meta position-relative mb-25">
                              <label className="form-label">Multimedia (Graphic or Video)</label>
                              <div className="row mb-3">
                                <div className="col-md-4">
                                  <select
                                    className="form-control articleInput"
                                    value={whyThisMattersMultimediaType}
                                    onChange={(e) => setWhyThisMattersMultimediaType(e.target.value)}
                                  >
                                    <option value="graphic">Graphic</option>
                                    <option value="video">Video</option>
                                  </select>
                                </div>
                                <div className="col-md-8">
                                  <input
                                    className="form-control articleInput"
                                    type="url"
                                    value={whyThisMattersMultimediaUrl}
                                    onChange={(e) => setWhyThisMattersMultimediaUrl(e.target.value)}
                                    placeholder={`Enter ${whyThisMattersMultimediaType === "graphic" ? "image" : "video"} URL`}
                                  />
                                </div>
                              </div>
                              {whyThisMattersMultimediaUrl && isValidUrl(whyThisMattersMultimediaUrl) && (
                                <div className="mt-3" style={{
                                  width: "100%",
                                  maxWidth: "600px",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  border: "1px solid #e8e8e8",
                                }}>
                                  {whyThisMattersMultimediaType === "graphic" ? (
                                    <img
                                      src={whyThisMattersMultimediaUrl}
                                      alt="Why This Matters multimedia preview"
                                      style={{
                                        width: "100%",
                                        height: "auto",
                                        display: "block"
                                      }}
                                      onError={() => setImageError(true)}
                                    />
                                  ) : (
                                    <video
                                      src={whyThisMattersMultimediaUrl}
                                      controls
                                      style={{
                                        width: "100%",
                                        height: "auto",
                                        display: "block"
                                      }}
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                  )}
                                </div>
                              )}
                              <small className="text-muted" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>
                                Add a graphic (image) or video to supplement the "Why This Matters" section.
                              </small>
                            </div>
                          </div>
                        </div>

                        {/* What's Expected Next */}
                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label" style={{ fontSize: "16px", fontWeight: "600", marginBottom: "15px" }}>
                            What's Expected Next?
                          </label>
                          <div style={{ border: "1px solid #e8e8e8", borderRadius: "8px", padding: "20px", backgroundColor: "#f8f9fa" }}>
                            <div className="input-group-meta position-relative mb-25">
                              <label className="form-label">Description</label>
                              <textarea
                                className="form-control articleInput"
                                style={{ minHeight: "120px" }}
                                value={whatsExpectedNext}
                                onChange={(e) => setWhatsExpectedNext(e.target.value)}
                                placeholder="Describe what readers can expect next. What are the future implications, trends, or developments?"
                              />
                              {whatsExpectedNext && (
                                <small className="text-muted" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>
                                  {whatsExpectedNext.length} characters
                                </small>
                              )}
                            </div>
                            
                            <div className="input-group-meta position-relative mb-25">
                              <label className="form-label">Multimedia (Graphic or Video)</label>
                              <div className="row mb-3">
                                <div className="col-md-4">
                                  <select
                                    className="form-control articleInput"
                                    value={whatsExpectedNextMultimediaType}
                                    onChange={(e) => setWhatsExpectedNextMultimediaType(e.target.value)}
                                  >
                                    <option value="graphic">Graphic</option>
                                    <option value="video">Video</option>
                                  </select>
                                </div>
                                <div className="col-md-8">
                                  <input
                                    className="form-control articleInput"
                                    type="url"
                                    value={whatsExpectedNextMultimediaUrl}
                                    onChange={(e) => setWhatsExpectedNextMultimediaUrl(e.target.value)}
                                    placeholder={`Enter ${whatsExpectedNextMultimediaType === "graphic" ? "image" : "video"} URL`}
                                  />
                                </div>
                              </div>
                              {whatsExpectedNextMultimediaUrl && isValidUrl(whatsExpectedNextMultimediaUrl) && (
                                <div className="mt-3" style={{
                                  width: "100%",
                                  maxWidth: "600px",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  border: "1px solid #e8e8e8",
                                }}>
                                  {whatsExpectedNextMultimediaType === "graphic" ? (
                                    <img
                                      src={whatsExpectedNextMultimediaUrl}
                                      alt="What's Expected Next multimedia preview"
                                      style={{
                                        width: "100%",
                                        height: "auto",
                                        display: "block"
                                      }}
                                      onError={() => setImageError(true)}
                                    />
                                  ) : (
                                    <video
                                      src={whatsExpectedNextMultimediaUrl}
                                      controls
                                      style={{
                                        width: "100%",
                                        height: "auto",
                                        display: "block"
                                      }}
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                  )}
                                </div>
                              )}
                              <small className="text-muted" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>
                                Add a graphic (image) or video to supplement the "What's Expected Next" section.
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SEO & Metadata */}
                    <SectionHeader
                      title="SEO & Metadata"
                      section="seo"
                    />
                    {expandedSections.seo && (
                      <div style={{ marginBottom: "30px", padding: "0 15px" }}>
                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">
                            Meta Title
                            <span className="ms-2" style={{ fontSize: "12px", color: "#666" }}>
                              (Auto-generated from title if empty)
                            </span>
                          </label>
                          <input
                            className="form-control articleInput"
                            type="text"
                            value={metaTitle}
                            onChange={(e) => {
                              const value = e.target.value;
                              setMetaTitle(value);
                            }}
                            placeholder="Custom SEO title (defaults to post title)"
                            maxLength={60}
                          />
                          {metaTitle && (
                            <small
                              className="text-muted"
                              style={{
                                fontSize: "12px",
                                marginTop: "5px",
                                display: "block",
                              }}
                            >
                              {metaTitle.length}/60 characters 
                              {metaTitle.length < 50 && (
                                <span style={{ color: "#ff9800" }}> ⚠ Recommended: 50-60 characters</span>
                              )}
                              {metaTitle.length >= 50 && metaTitle.length <= 60 && (
                                <span style={{ color: "#4caf50" }}> ✓ Optimal length</span>
                              )}
                              {metaTitle.length > 60 && (
                                <span style={{ color: "#f44336" }}> ⚠ Too long, may be truncated in search results</span>
                              )}
                            </small>
                          )}
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">
                            Meta Description
                            <span className="ms-2" style={{ fontSize: "12px", color: "#666" }}>
                              (Auto-generated from content if empty)
                            </span>
                          </label>
                          <textarea
                            className="form-control articleInput"
                            style={{ minHeight: "80px" }}
                            value={metaDescription}
                            onChange={(e) => {
                              const value = e.target.value;
                              setMetaDescription(value);
                            }}
                            placeholder="Short description for search engines (150-160 characters recommended)"
                            maxLength={160}
                          />
                          {metaDescription && (
                            <small
                              className="text-muted"
                              style={{
                                fontSize: "12px",
                                marginTop: "5px",
                                display: "block",
                              }}
                            >
                              {metaDescription.length}/160 characters
                              {metaDescription.length < 120 && (
                                <span style={{ color: "#ff9800" }}> ⚠ Recommended: 120-160 characters</span>
                              )}
                              {metaDescription.length >= 120 && metaDescription.length <= 160 && (
                                <span style={{ color: "#4caf50" }}> ✓ Optimal length</span>
                              )}
                              {metaDescription.length > 160 && (
                                <span style={{ color: "#f44336" }}> ⚠ Too long, will be truncated</span>
                              )}
                            </small>
                          )}
                          {!metaDescription && content && (
                            <button
                              type="button"
                              onClick={() => {
                                const generated = generateMetaDescription(content);
                                setMetaDescription(generated);
                              }}
                              className="btn btn-sm mt-2"
                              style={{
                                backgroundColor: "#f0f0f0",
                                border: "1px solid #ddd",
                                padding: "4px 12px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                cursor: "pointer"
                              }}
                            >
                              Generate from Content
                            </button>
                          )}
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">
                            Featured Image URL{" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            className="form-control articleInput"
                            type="url"
                            value={bannerImageUrl}
                            onChange={handleImageUrlChange}
                            placeholder="https://example.com/banner.jpg"
                            required
                          />
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            💡 Recommended: 1200x630px for optimal social media sharing and SEO
                            <br />
                            <span style={{ color: "#ff6b6b" }}>
                              ⚠️ For iStock: Use direct image URL (right-click image → "Copy image address"), not the page URL
                            </span>
                            <br />
                            <span style={{ color: "#4CAF50" }}>
                              ✓ Unsplash: Use direct image URLs (e.g., https://images.unsplash.com/photo-...)
                            </span>
                          </small>
                          {bannerImageUrl &&
                            isValidUrl(bannerImageUrl) && (
                              <div
                                className="mt-3"
                                style={{
                                  width: "100%",
                                  maxWidth: "600px",
                                  height: "200px",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  border: "1px solid #e8e8e8",
                                  position: "relative",
                                  backgroundColor: "#f5f5f5",
                                }}
                              >
                                {!imageError ? (
                                <img
                                  src={bannerImageUrl}
                                  alt="Banner preview"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                    onError={(e) => {
                                      console.error('Image load error:', bannerImageUrl);
                                      setImageError(true);
                                    }}
                                  onLoad={(e) => {
                                      setImageError(false);
                                    const img = e.target;
                                    const naturalWidth = img.naturalWidth;
                                    const naturalHeight = img.naturalHeight;
                                      console.log('Image loaded successfully:', { width: naturalWidth, height: naturalHeight });
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      padding: "20px",
                                      textAlign: "center",
                                      color: "#666",
                                    }}
                                  >
                                    <i className="fas fa-exclamation-triangle" style={{ fontSize: "24px", marginBottom: "10px", color: "#ffc107" }}></i>
                                    <div style={{ fontSize: "12px" }}>
                                      <strong>Unable to load image preview</strong>
                                      <br />
                                      {bannerImageUrl.includes('istockphoto.com/photo/') ? (
                                        <>
                                          <span style={{ color: "#ff6b6b", marginTop: "5px", display: "block" }}>
                                            ⚠️ iStock page URLs cannot be previewed directly.
                                          </span>
                                          <span style={{ fontSize: "11px", marginTop: "5px", display: "block" }}>
                                            Please use the direct image URL. Right-click the image on iStock and select "Copy image address" or use the download link.
                                          </span>
                                        </>
                                      ) : (
                                        <span style={{ fontSize: "11px", marginTop: "5px", display: "block" }}>
                                          The URL may be incorrect, require authentication, or be blocked by CORS.
                                          <br />
                                          Try using a direct image URL (ending in .jpg, .png, etc.)
                                        </span>
                                      )}
                                    </div>
                              </div>
                            )}
                              </div>
                            )}
                          {imageError && bannerImageUrl && isValidUrl(bannerImageUrl) && (
                            <small
                              className="text-warning"
                              style={{
                                fontSize: "12px",
                                marginTop: "5px",
                                display: "block",
                                color: "#ff6b6b",
                              }}
                            >
                              ⚠️ Image preview failed, but you can still save the URL. The image may load correctly on the published page.
                            </small>
                          )}
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Featured Image Alt Text</label>
                          <input
                            className="form-control articleInput"
                            type="text"
                            value={imageAltText}
                            onChange={(e) => setImageAltText(e.target.value)}
                            placeholder="Descriptive text for accessibility and SEO"
                          />
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            Describe the featured image for screen readers and Google
                          </small>
                        </div>
                      </div>
                    )}

                    {/* Advanced SEO */}
                    <SectionHeader
                      title="Advanced SEO Optimization"
                      section="advancedSeo"
                    />
                    {expandedSections.advancedSeo && (
                      <div style={{ marginBottom: "30px", padding: "0 15px" }}>
                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Inline Image Alt Text</label>
                          <textarea
                            className="form-control articleInput"
                            style={{ minHeight: "100px" }}
                            value={inlineImageAltText}
                            onChange={(e) => setInlineImageAltText(e.target.value)}
                            placeholder="Alt text for all inline images, one per line (in order of appearance)"
                          />
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            One alt text per line, matching the order of inline images in your content
                          </small>
                        </div>

                        <div className="row mb-25">
                          <div className="col-md-6">
                            <div className="input-group-meta position-relative">
                              <label className="form-label">Indexing Control</label>
                              <div className="d-flex align-items-center">
                                <input
                                  type="checkbox"
                                  checked={allowIndexing}
                                  onChange={(e) => setAllowIndexing(e.target.checked)}
                                  style={{ marginRight: "8px", width: "18px", height: "18px" }}
                                />
                                <span>Allow search engines to index this page</span>
                              </div>
                              <small
                                className="text-muted"
                                style={{
                                  fontSize: "12px",
                                  marginTop: "5px",
                                  display: "block",
                                }}
                              >
                                {allowIndexing ? "Page will be indexed" : "Page will be no-index"}
                              </small>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group-meta position-relative">
                              <label className="form-label">Link Following</label>
                              <div className="d-flex align-items-center">
                                <input
                                  type="checkbox"
                                  checked={allowFollowing}
                                  onChange={(e) => setAllowFollowing(e.target.checked)}
                                  style={{ marginRight: "8px", width: "18px", height: "18px" }}
                                />
                                <span>Allow search engines to follow links</span>
                              </div>
                              <small
                                className="text-muted"
                                style={{
                                  fontSize: "12px",
                                  marginTop: "5px",
                                  display: "block",
                                }}
                              >
                                {allowFollowing ? "Links will be followed" : "Links will be no-follow"}
                              </small>
                            </div>
                          </div>
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Schema Markup Type</label>
                          <select
                            className="form-control articleInput"
                            value={schemaMarkupType}
                            onChange={(e) => setSchemaMarkupType(e.target.value)}
                          >
                            <option value="Article">Article</option>
                            <option value="NewsArticle">NewsArticle</option>
                            <option value="BlogPosting">BlogPosting</option>
                            <option value="TechArticle">TechArticle</option>
                            <option value="ScholarlyArticle">ScholarlyArticle</option>
                            <option value="Report">Report</option>
                            <option value="Review">Review</option>
                          </select>
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            Structured data type for search engines
                          </small>
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Open Graph Title (Social Media)</label>
                          <input
                            className="form-control articleInput"
                            type="text"
                            value={ogTitle}
                            onChange={(e) => setOgTitle(e.target.value)}
                            placeholder="Title for social media sharing (defaults to post title)"
                            maxLength={60}
                          />
                          {ogTitle && (
                            <small
                              className="text-muted"
                              style={{
                                fontSize: "12px",
                                marginTop: "5px",
                                display: "block",
                              }}
                            >
                              {ogTitle.length}/60 characters
                            </small>
                          )}
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Open Graph Description</label>
                          <textarea
                            className="form-control articleInput"
                            style={{ minHeight: "80px" }}
                            value={ogDescription}
                            onChange={(e) => setOgDescription(e.target.value)}
                            placeholder="Description for social media sharing (Facebook, Twitter, LinkedIn)"
                            maxLength={200}
                          />
                          {ogDescription && (
                            <small
                              className="text-muted"
                              style={{
                                fontSize: "12px",
                                marginTop: "5px",
                                display: "block",
                              }}
                            >
                              {ogDescription.length}/200 characters
                            </small>
                          )}
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Open Graph Image URL</label>
                          <input
                            className="form-control articleInput"
                            type="url"
                            value={ogImage}
                            onChange={(e) => setOgImage(e.target.value)}
                            placeholder="https://example.com/og-image.jpg (for social media preview)"
                          />
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            Recommended size: 1200x630px. If empty, featured image will be used.
                          </small>
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Secondary Keywords / LSI Keywords</label>
                          <input
                            className="form-control articleInput"
                            type="text"
                            value={secondaryKeywords}
                            onChange={(e) => setSecondaryKeywords(e.target.value)}
                            placeholder="keyword1, keyword2, keyword3 (comma-separated)"
                          />
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            Latent Semantic Indexing keywords to help search engines understand context
                          </small>
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Redirect From (301 Redirect)</label>
                          <input
                            className="form-control articleInput"
                            type="text"
                            value={redirectFrom}
                            onChange={(e) => setRedirectFrom(e.target.value)}
                            placeholder="old-article-slug or /old/path"
                          />
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            Old URL slug or path that should redirect to this article (301 redirect)
                          </small>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="input-group-meta position-relative mb-25">
                              <label className="form-label">Language</label>
                              <select
                                className="form-control articleInput"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                              >
                                <option value="en">English (en)</option>
                                <option value="es">Spanish (es)</option>
                                <option value="fr">French (fr)</option>
                                <option value="de">German (de)</option>
                                <option value="it">Italian (it)</option>
                                <option value="pt">Portuguese (pt)</option>
                                <option value="zh">Chinese (zh)</option>
                                <option value="ja">Japanese (ja)</option>
                                <option value="ko">Korean (ko)</option>
                                <option value="ar">Arabic (ar)</option>
                                <option value="ru">Russian (ru)</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group-meta position-relative mb-25">
                              <label className="form-label">Region (hreflang)</label>
                              <input
                                className="form-control articleInput"
                                type="text"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                placeholder="US, GB, CA, AU, etc."
                              />
                              <small
                                className="text-muted"
                                style={{
                                  fontSize: "12px",
                                  marginTop: "5px",
                                  display: "block",
                                }}
                              >
                                ISO 3166-1 alpha-2 country code (optional)
                              </small>
                            </div>
                          </div>
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Structured Data (JSON-LD)</label>
                          <textarea
                            className="form-control articleInput"
                            style={{ minHeight: "150px", fontFamily: "monospace", fontSize: "12px" }}
                            value={structuredData}
                            onChange={(e) => {
                              const value = e.target.value;
                              setStructuredData(value);
                              // Validate JSON in real-time (non-blocking)
                              if (value.trim()) {
                                try {
                                  JSON.parse(value.trim());
                                  // Valid JSON - no error shown
                                } catch (e) {
                                  // Invalid JSON - error will be shown on submit
                                }
                              }
                            }}
                            placeholder='Optional: Custom JSON-LD structured data (e.g., FAQ, HowTo, Product, etc.)&#10;Example:&#10;{&#10;  "@type": "FAQPage",&#10;  "mainEntity": [...]&#10;}'
                          />
                          {structuredData && (() => {
                            try {
                              JSON.parse(structuredData.trim());
                              return (
                                <small
                                  className="text-success"
                                  style={{
                                    fontSize: "12px",
                                    marginTop: "5px",
                                    display: "block",
                                  }}
                                >
                                  ✓ Valid JSON format
                                </small>
                              );
                            } catch (e) {
                              return (
                                <small
                                  className="text-danger"
                                  style={{
                                    fontSize: "12px",
                                    marginTop: "5px",
                                    display: "block",
                                  }}
                                >
                                  ⚠ Invalid JSON: {e.message}
                                </small>
                              );
                            }
                          })()}
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            Advanced: Add custom structured data for FAQ, HowTo, Product, Author details, etc. (JSON-LD format)
                          </small>
                        </div>
                      </div>
                    )}

                    {/* Publishing Settings */}
                    <SectionHeader
                      title="Publishing Settings"
                      section="publishing"
                    />
                    {expandedSections.publishing && (
                      <div style={{ marginBottom: "30px", padding: "0 15px" }}>
                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Publish Status</label>
                          <select
                            className="form-control articleInput"
                            value={publishStatus}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              setPublishStatus(newStatus);
                              
                              // If changing to scheduled, ensure date/time is set
                              if (newStatus === 'scheduled' && (!publishDate || !publishTime)) {
                                const now = new Date();
                                setPublishDate(now.toISOString().split("T")[0]);
                                setPublishTime(now.toTimeString().slice(0, 5));
                              }
                            }}
                          >
                            <option value="draft">Draft</option>
                            <option value="review">Review</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="published">Published</option>
                          </select>
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            {publishStatus === 'draft' && "Post will be saved as draft and not visible to public"}
                            {publishStatus === 'review' && "Post is pending review before publication"}
                            {publishStatus === 'scheduled' && "Post will be automatically published at the scheduled date/time"}
                            {publishStatus === 'published' && "Post will be published immediately"}
                          </small>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="input-group-meta position-relative mb-25">
                              <label className="form-label">
                                Publish Date
                                {publishStatus === 'scheduled' && <span style={{ color: "red" }}> *</span>}
                              </label>
                              <input
                                className="form-control articleInput"
                                type="date"
                                value={publishDate}
                                onChange={(e) => setPublishDate(e.target.value)}
                                min={publishStatus === 'scheduled' ? new Date().toISOString().split("T")[0] : undefined}
                                required={publishStatus === 'scheduled'}
                              />
                              {publishDate && publishStatus === 'scheduled' && (() => {
                                const selectedDate = new Date(`${publishDate}T${publishTime || '00:00'}`);
                                const now = new Date();
                                if (selectedDate <= now) {
                                  return (
                                    <small className="text-danger" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>
                                      ⚠ Scheduled date must be in the future
                                    </small>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group-meta position-relative mb-25">
                              <label className="form-label">
                                Publish Time
                                {publishStatus === 'scheduled' && <span style={{ color: "red" }}> *</span>}
                              </label>
                              <input
                                className="form-control articleInput"
                                type="time"
                                value={publishTime}
                                onChange={(e) => setPublishTime(e.target.value)}
                                required={publishStatus === 'scheduled'}
                              />
                              {publishDate && publishTime && publishStatus === 'scheduled' && (() => {
                                const scheduledDateTime = new Date(`${publishDate}T${publishTime}`);
                                const now = new Date();
                                if (scheduledDateTime > now) {
                                  const timeUntil = Math.round((scheduledDateTime - now) / (1000 * 60)); // minutes
                                  return (
                                    <small className="text-success" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>
                                      ✓ Will publish in {timeUntil} minute{timeUntil !== 1 ? 's' : ''}
                                    </small>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Visibility</label>
                          <select
                            className="form-control articleInput"
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="internal">Internal</option>
                            <option value="members-only">Members Only</option>
                          </select>
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            {visibility === 'public' && "Visible to everyone"}
                            {visibility === 'private' && "Only visible to admins"}
                            {visibility === 'internal' && "Visible to internal team members"}
                            {visibility === 'members-only' && "Visible only to registered members"}
                          </small>
                        </div>
                      </div>
                    )}

                    {/* Content Controls */}
                    <SectionHeader
                      title="Content Controls"
                      section="content"
                    />
                    {expandedSections.content && (
                      <div style={{ marginBottom: "30px", padding: "0 15px" }}>
                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Excerpt / Summary</label>
                          <textarea
                            className="form-control articleInput"
                            style={{ minHeight: "100px" }}
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Short overview shown in article listings or emails"
                            maxLength={300}
                          />
                          {excerpt && (
                            <small
                              className="text-muted"
                              style={{
                                fontSize: "12px",
                                marginTop: "5px",
                                display: "block",
                              }}
                            >
                              {excerpt.length}/300 characters
                            </small>
                          )}
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">
                            Reading Time (minutes)
                            <span className="ms-2" style={{ fontSize: "12px", color: "#666" }}>
                              (Auto-calculated)
                            </span>
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <input
                              className="form-control articleInput"
                              type="number"
                              value={readingTime}
                              onChange={(e) => setReadingTime(e.target.value)}
                              placeholder="Auto-calculated from content"
                              min="1"
                              style={{ flex: 1 }}
                            />
                            {content && (
                              <button
                                type="button"
                                onClick={() => {
                                  const time = calculateReadingTime(content);
                                  setReadingTime(time.toString());
                                }}
                                className="btn btn-sm"
                                style={{
                                  backgroundColor: "#f0f0f0",
                                  border: "1px solid #ddd",
                                  padding: "6px 12px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap"
                                }}
                                title="Recalculate reading time"
                              >
                                Recalculate
                              </button>
                            )}
                          </div>
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            Automatically calculated from content length (200 words/min)
                            {content && (
                              <span className="ms-2">
                                • {content.split(/\s+/).filter(Boolean).length} words
                              </span>
                            )}
                          </small>
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Canonical URL</label>
                          <input
                            className="form-control articleInput"
                            type="url"
                            value={canonicalUrl}
                            onChange={(e) => setCanonicalUrl(e.target.value)}
                            placeholder="https://example.com/original-article"
                          />
                          {canonicalUrl && !isValidUrl(canonicalUrl) && (
                            <small
                              className="text-danger"
                              style={{
                                fontSize: "12px",
                                marginTop: "5px",
                                display: "block",
                              }}
                            >
                              ⚠ Invalid URL format. Must start with http:// or https://
                            </small>
                          )}
                          {canonicalUrl && isValidUrl(canonicalUrl) && (
                            <small
                              className="text-success"
                              style={{
                                fontSize: "12px",
                                marginTop: "5px",
                                display: "block",
                              }}
                            >
                              ✓ Valid URL format
                            </small>
                          )}
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            For syndicated or republished content. Tells search engines which URL is the original.
                          </small>
                        </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Related Articles</label>
                          <input
                            className="form-control articleInput"
                            type="text"
                            value={relatedArticles}
                            onChange={(e) => setRelatedArticles(e.target.value)}
                            placeholder="Article slugs: article-1, article-2, article-3"
                          />
                          {relatedArticles && (
                            <small
                              className="text-muted"
                              style={{
                                fontSize: "12px",
                                marginTop: "5px",
                                display: "block",
                              }}
                            >
                              {relatedArticles.split(",").filter(s => s.trim()).length} article{relatedArticles.split(",").filter(s => s.trim()).length !== 1 ? 's' : ''} specified
                            </small>
                          )}
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            Comma-separated list of related article slugs (e.g., article-1, article-2, article-3)
                          </small>
                        </div>
                      </div>
                    )}

                    {/* Media & Assets */}
                    <SectionHeader
                      title="Media & Assets"
                      section="media"
                    />
                    {expandedSections.media && (
                      <div style={{ marginBottom: "30px", padding: "0 15px" }}>
                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">Inline Images / Video URLs</label>
                          <textarea
                            className="form-control articleInput"
                            style={{ minHeight: "120px" }}
                            value={inlineImages}
                            onChange={(e) => setInlineImages(e.target.value)}
                            placeholder="Enter image/video URLs, one per line:&#10;https://example.com/image1.jpg&#10;https://example.com/video1.mp4"
                          />
                          {inlineImages && (() => {
                            const urls = inlineImages.split("\n").filter(url => url.trim());
                            const validUrls = urls.filter(url => isValidUrl(url.trim()));
                            const invalidUrls = urls.filter(url => !isValidUrl(url.trim()));
                            
                            return (
                              <div style={{ marginTop: "5px" }}>
                                {urls.length > 0 && (
                                  <small
                                    className="text-muted"
                                    style={{
                                      fontSize: "12px",
                                      display: "block",
                                    }}
                                  >
                                    {urls.length} URL{urls.length !== 1 ? 's' : ''} entered
                                    {validUrls.length > 0 && (
                                      <span className="ms-2 text-success">
                                        • {validUrls.length} valid
                                      </span>
                                    )}
                                    {invalidUrls.length > 0 && (
                                      <span className="ms-2 text-danger">
                                        • {invalidUrls.length} invalid
                                      </span>
                                    )}
                                  </small>
                                )}
                                {invalidUrls.length > 0 && (
                                  <small
                                    className="text-danger"
                                    style={{
                                      fontSize: "12px",
                                      marginTop: "5px",
                                      display: "block",
                                    }}
                                  >
                                    ⚠ Invalid URLs will be filtered out. URLs must start with http:// or https://
                                  </small>
                                )}
                              </div>
                            );
                          })()}
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            One URL per line for images or videos to embed in the article. Add alt text in the Advanced SEO section.
                          </small>
                  </div>

                        <div className="input-group-meta position-relative mb-25">
                          <label className="form-label">
                            Attachments / Downloadable Files
                          </label>
                          <textarea
                            className="form-control articleInput"
                            style={{ minHeight: "120px" }}
                            value={attachments}
                            onChange={(e) => setAttachments(e.target.value)}
                            placeholder="Enter file URLs, one per line:&#10;https://example.com/document.pdf&#10;https://example.com/whitepaper.pdf"
                          />
                          {attachments && (() => {
                            const urls = attachments.split("\n").filter(url => url.trim());
                            const validUrls = urls.filter(url => isValidUrl(url.trim()));
                            const invalidUrls = urls.filter(url => !isValidUrl(url.trim()));
                            
                            return (
                              <div style={{ marginTop: "5px" }}>
                                {urls.length > 0 && (
                                  <small
                                    className="text-muted"
                                    style={{
                                      fontSize: "12px",
                                      display: "block",
                                    }}
                                  >
                                    {urls.length} file{urls.length !== 1 ? 's' : ''} specified
                                    {validUrls.length > 0 && (
                                      <span className="ms-2 text-success">
                                        • {validUrls.length} valid
                                      </span>
                                    )}
                                    {invalidUrls.length > 0 && (
                                      <span className="ms-2 text-danger">
                                        • {invalidUrls.length} invalid
                                      </span>
                                    )}
                                  </small>
                                )}
                                {invalidUrls.length > 0 && (
                                  <small
                                    className="text-danger"
                                    style={{
                                      fontSize: "12px",
                                      marginTop: "5px",
                                      display: "block",
                                    }}
                                  >
                                    ⚠ Invalid URLs will be filtered out. URLs must start with http:// or https://
                                  </small>
                                )}
                              </div>
                            );
                          })()}
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              display: "block",
                            }}
                          >
                            One URL per line for PDFs, case studies, whitepapers, etc.
                          </small>
                        </div>
                      </div>
                    )}

                    <div className="d-flex gap-3 mt-4">
                  <button
                    type="submit"
                    onClick={() => {
                      // If status is currently draft, set it to published for the main button
                      if (publishStatus === 'draft') {
                        setPublishStatus('published');
                      }
                    }}
                    disabled={isPublishing}
                        className="btn-eleven fw-500 tran3s"
                        style={{ 
                          minWidth: "150px",
                          backgroundColor: "#ff0292",
                          borderColor: "#ff0292",
                          borderRadius: "50px",
                          color: "#fff",
                          padding: "12px 30px",
                          border: "none",
                          cursor: isPublishing ? "not-allowed" : "pointer",
                          opacity: isPublishing ? 0.6 : 1
                        }}
                      >
                        {isPublishing ? "Publishing..." : "Publish Post"}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="btn-eleven fw-500 tran3s"
                        style={{
                          minWidth: "120px",
                          backgroundColor: "#ff0292",
                          borderColor: "#ff0292",
                          borderRadius: "50px",
                          color: "#fff",
                          padding: "12px 30px",
                          border: "none",
                          cursor: isPublishing ? "not-allowed" : "pointer",
                          opacity: isPublishing ? 0.6 : 1
                        }}
                        disabled={isPublishing}
                      >
                        Clear Form
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          setPublishStatus("draft");
                          handlePublish(e, "draft");
                        }}
                        className="btn-eleven fw-500 tran3s"
                        style={{
                          minWidth: "120px",
                          backgroundColor: "#ff0292",
                          borderColor: "#ff0292",
                          borderRadius: "50px",
                          color: "#fff",
                          padding: "12px 30px",
                          border: "none",
                          cursor: isPublishing ? "not-allowed" : "pointer",
                          opacity: isPublishing ? 0.6 : 1
                        }}
                        disabled={isPublishing}
                      >
                        {isPublishing ? "Saving..." : "Save as Draft"}
                  </button>
                    </div>
                </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Container for notifications */}
      <ToastContainer />
    </>
  );
}
