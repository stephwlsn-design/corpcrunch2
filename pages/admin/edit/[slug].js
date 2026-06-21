import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axiosInstance from "@/util/axiosInstance";
import { notifyError, notifySuccess } from "@/util/toast";
import useCategory from "@/hooks/useCategory";
import ToastContainer from "@/components/ToastContainer/ToastContainer";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminSeoFields from "@/components/admin/AdminSeoFields";
import { isAdminSessionValid, clearAdminSession } from "@/lib/adminSession";

export default function AdminEditPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Core Required Fields
  const [title, setTitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [authorFirstName, setAuthorFirstName] = useState("");
  const [authorLastName, setAuthorLastName] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [contentType, setContentType] = useState("article");

  // SEO & Metadata
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [imageAltText, setImageAltText] = useState("");

  // Publishing Settings
  const [publishStatus, setPublishStatus] = useState("published");
  const [publishDate, setPublishDate] = useState("");
  const [publishTime, setPublishTime] = useState("");
  const [visibility, setVisibility] = useState("public");

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
  const [whyThisMattersMultimediaType, setWhyThisMattersMultimediaType] = useState("graphic");
  const [whatsExpectedNext, setWhatsExpectedNext] = useState("");
  const [whatsExpectedNextMultimediaUrl, setWhatsExpectedNextMultimediaUrl] = useState("");
  const [whatsExpectedNextMultimediaType, setWhatsExpectedNextMultimediaType] = useState("graphic");

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

  const { data: categories, isLoading: categoriesLoading } = useCategory();

  useEffect(() => {
    if (typeof window !== "undefined" && !isAdminSessionValid()) {
      clearAdminSession();
      notifyError("Admin session expired. Please login again.");
      window.location.href = "/admin/login";
      return;
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/posts/${slug}`);

      // axiosInstance interceptor returns response.data directly
      // The response from /posts/[slug] returns the post object directly or wrapped in success
      let post = null;

      if (response.success && response.title) {
        // Response has success flag and post data
        post = response;
      } else if (response.title) {
        // Response is the post object directly
        post = response;
      } else if (response.data && response.data.title) {
        // Response is wrapped
        post = response.data;
      }

      if (post && post.title) {

        // Populate form fields
        setTitle(post.title || "");
        setPostSlug(post.slug || "");
        setAuthorFirstName(post.authorFirstName || "");
        setAuthorLastName(post.authorLastName || "");
        setContent(post.content || "");
        setCategoryId(post.categoryId?._id?.toString() || post.categoryId?.toString() || post.Category?.id?.toString() || "");
        setTags(Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "");
        setContentType(post.contentType || "article");
        setMetaTitle(post.metaTitle || "");
        setMetaDescription(post.metaDescription || "");
        setBannerImageUrl(post.bannerImageUrl || "");
        setImageAltText(post.imageAltText || "");
        setPublishStatus(post.publishStatus || "published");

        if (post.publishDate) {
          const pubDate = new Date(post.publishDate);
          setPublishDate(pubDate.toISOString().split("T")[0]);
          setPublishTime(pubDate.toTimeString().slice(0, 5));
        } else {
          const now = new Date();
          setPublishDate(now.toISOString().split("T")[0]);
          setPublishTime(now.toTimeString().slice(0, 5));
        }

        setVisibility(post.visibility || "public");
        setExcerpt(post.excerpt || "");
        setReadingTime(post.readingTime?.toString() || "");
        setCanonicalUrl(post.canonicalUrl || "");
        setRelatedArticles(Array.isArray(post.relatedArticles) ? post.relatedArticles.join(", ") : post.relatedArticles || "");
        setInlineImages(Array.isArray(post.inlineImages) ? post.inlineImages.join("\n") : post.inlineImages || "");
        setAttachments(Array.isArray(post.attachments) ? post.attachments.join("\n") : post.attachments || "");
        setInlineImageAltText(post.inlineImageAltText || "");
        setVideoUrl(post.videoUrl || "");
        setQuoteText(post.quoteText || "");
        setQuoteAuthorName(post.quoteAuthorName || "");
        setQuoteAuthorTitle(post.quoteAuthorTitle || "");
        setWhyThisMatters(post.whyThisMatters || "");
        setWhyThisMattersMultimediaUrl(post.whyThisMattersMultimediaUrl || "");
        setWhyThisMattersMultimediaType(post.whyThisMattersMultimediaType || "graphic");
        setWhatsExpectedNext(post.whatsExpectedNext || "");
        setWhatsExpectedNextMultimediaUrl(post.whatsExpectedNextMultimediaUrl || "");
        setWhatsExpectedNextMultimediaType(post.whatsExpectedNextMultimediaType || "graphic");
        setAllowIndexing(post.allowIndexing !== undefined ? post.allowIndexing : true);
        setAllowFollowing(post.allowFollowing !== undefined ? post.allowFollowing : true);
        setSchemaMarkupType(post.schemaMarkupType || "Article");
        setOgTitle(post.ogTitle || "");
        setOgDescription(post.ogDescription || "");
        setOgImage(post.ogImage || "");
        setSecondaryKeywords(Array.isArray(post.secondaryKeywords) ? post.secondaryKeywords.join(", ") : post.secondaryKeywords || "");
        setRedirectFrom(post.redirectFrom || "");
        setLanguage(post.language || "en");
        setRegion(post.region || "");
        setStructuredData(post.structuredData || "");
      } else {
        console.error("Failed to load post - response:", response);
        notifyError("Failed to load post data");
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      notifyError(error?.response?.data?.message || error?.message || "Failed to load post");
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title.trim() || !postSlug.trim() || !content.trim() || !bannerImageUrl.trim() || !categoryId) {
      notifyError("Please fill in all required fields");
      return;
    }

    if (canonicalUrl.trim() && !/^https?:\/\/.+/.test(canonicalUrl.trim())) {
      notifyError("Canonical URL must be a valid http:// or https:// URL");
      return;
    }

    if (structuredData.trim()) {
      try {
        JSON.parse(structuredData.trim());
      } catch {
        notifyError("Structured Data must be valid JSON");
        return;
      }
    }

    setIsUpdating(true);
    try {
      // Prepare publish date
      let publishDateValue = null;
      if (publishDate && publishTime) {
        const dateTime = new Date(`${publishDate}T${publishTime}`);
        publishDateValue = dateTime.toISOString();
      }

      // Prepare post data
      const postData = {
        title: title.trim(),
        slug: postSlug.trim().toLowerCase(),
        content: content.trim(),
        bannerImageUrl: bannerImageUrl.trim(),
        categoryId: categoryId,
        contentType: contentType,
        publishStatus: publishStatus,
        visibility: visibility,
        authorFirstName: authorFirstName.trim(),
        authorLastName: authorLastName.trim(),
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        imageAltText: imageAltText.trim(),
        excerpt: excerpt.trim(),
        readingTime: readingTime ? parseInt(readingTime) : null,
        canonicalUrl: canonicalUrl.trim(),
        relatedArticles: relatedArticles.split(",").map(a => a.trim()).filter(Boolean),
        inlineImages: inlineImages.split("\n").map(url => url.trim()).filter(Boolean),
        attachments: attachments.split("\n").map(url => url.trim()).filter(Boolean),
        inlineImageAltText: inlineImageAltText.trim(),
        videoUrl: videoUrl.trim(),
        quoteText: quoteText.trim(),
        quoteAuthorName: quoteAuthorName.trim(),
        quoteAuthorTitle: quoteAuthorTitle.trim(),
        whyThisMatters: whyThisMatters.trim(),
        whyThisMattersMultimediaUrl: whyThisMattersMultimediaUrl.trim(),
        whyThisMattersMultimediaType: whyThisMattersMultimediaType,
        whatsExpectedNext: whatsExpectedNext.trim(),
        whatsExpectedNextMultimediaUrl: whatsExpectedNextMultimediaUrl.trim(),
        whatsExpectedNextMultimediaType: whatsExpectedNextMultimediaType,
        allowIndexing: allowIndexing,
        allowFollowing: allowFollowing,
        schemaMarkupType: schemaMarkupType,
        ogTitle: ogTitle.trim(),
        ogDescription: ogDescription.trim(),
        ogImage: ogImage.trim(),
        secondaryKeywords: secondaryKeywords.split(",").map(k => k.trim()).filter(Boolean),
        redirectFrom: redirectFrom.trim(),
        language: language,
        region: region.trim(),
        structuredData: structuredData.trim(),
        publishDate: publishDateValue
      };

      const response = await axiosInstance.put(`/posts/${slug}`, postData);

      // axiosInstance interceptor returns response.data directly
      if (response && response.success) {
        notifySuccess("Post updated successfully!");
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1500);
      } else {
        notifyError(response?.message || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      notifyError(error?.response?.data?.message || "Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUrlChange = (e) => {
    let url = e.target.value;

    // Auto-convert Google Drive share links to direct image links
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    } else if (url.includes('drive.google.com/open?id=')) {
      const match = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }

    setBannerImageUrl(url);
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... - Admin Edit Post</title>
        </Head>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin | Edit Post - Corp Crunch</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout
        title="Edit Post"
        subtitle={`Edit post: ${title || slug}`}
        actions={
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="btn btn-outline-secondary"
            style={{ fontSize: "14px", padding: "8px 16px" }}
          >
            Back to Dashboard
          </button>
        }
      >
        <div className="container-fluid px-0">
          <div className="row">
            <div className="col-xl-10 col-lg-11">
              <form onSubmit={handleUpdate}>
                <div className="blog-details-wrap" style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                  <h2 className="title mb-4" style={{ fontSize: "28px", fontWeight: "600" }}>Edit Post</h2>

                  {/* Core Fields */}
                  <div className="mb-4">
                    <label className="form-label" style={{ fontWeight: "500" }}>Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label" style={{ fontWeight: "500" }}>Slug *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={postSlug}
                      onChange={(e) => setPostSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label" style={{ fontWeight: "500" }}>Content *</label>
                    <textarea
                      className="form-control"
                      rows="10"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label" style={{ fontWeight: "500" }}>Banner Image URL *</label>
                    <input
                      type="url"
                      className="form-control"
                      value={bannerImageUrl}
                      onChange={handleImageUrlChange}
                      required
                    />
                    <small className="text-muted" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>
                      💡 Paste a Google Drive share link and it will automatically convert to a direct image URL!
                    </small>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontWeight: "500" }}>Category *</label>
                      <select
                        className="form-select"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                        disabled={categoriesLoading}
                      >
                        <option value="">Select Category</option>
                        {categories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontWeight: "500" }}>Content Type</label>
                      <select
                        className="form-select"
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value)}
                      >
                        <option value="article">Article</option>
                        <option value="video">Video</option>
                        <option value="magazine">Magazine/News</option>
                      </select>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontWeight: "500" }}>Publish Status</label>
                      <select
                        className="form-select"
                        value={publishStatus}
                        onChange={(e) => setPublishStatus(e.target.value)}
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Review</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontWeight: "500" }}>Visibility</label>
                      <select
                        className="form-select"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="internal">Internal</option>
                        <option value="members-only">Members Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <div className="mb-4">
                    <label className="form-label" style={{ fontWeight: "500" }}>Excerpt</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                    />
                  </div>

                  {contentType === "video" && (
                    <div className="mb-4">
                      <label className="form-label" style={{ fontWeight: "500" }}>Video URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                      />
                    </div>
                  )}

                  <AdminSeoFields
                    title={title}
                    content={content}
                    postSlug={postSlug}
                    categoryId={categoryId}
                    categories={categories}
                    metaTitle={metaTitle}
                    setMetaTitle={setMetaTitle}
                    metaDescription={metaDescription}
                    setMetaDescription={setMetaDescription}
                    imageAltText={imageAltText}
                    setImageAltText={setImageAltText}
                    canonicalUrl={canonicalUrl}
                    setCanonicalUrl={setCanonicalUrl}
                    allowIndexing={allowIndexing}
                    setAllowIndexing={setAllowIndexing}
                    allowFollowing={allowFollowing}
                    setAllowFollowing={setAllowFollowing}
                    schemaMarkupType={schemaMarkupType}
                    setSchemaMarkupType={setSchemaMarkupType}
                    ogTitle={ogTitle}
                    setOgTitle={setOgTitle}
                    ogDescription={ogDescription}
                    setOgDescription={setOgDescription}
                    ogImage={ogImage}
                    setOgImage={setOgImage}
                    secondaryKeywords={secondaryKeywords}
                    setSecondaryKeywords={setSecondaryKeywords}
                    redirectFrom={redirectFrom}
                    setRedirectFrom={setRedirectFrom}
                    language={language}
                    setLanguage={setLanguage}
                    region={region}
                    setRegion={setRegion}
                    structuredData={structuredData}
                    setStructuredData={setStructuredData}
                    inlineImageAltText={inlineImageAltText}
                    setInlineImageAltText={setInlineImageAltText}
                  />

                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button
                      type="button"
                      onClick={() => router.push("/admin/dashboard")}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Update Post"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>

      <ToastContainer />
    </>
  );
}

