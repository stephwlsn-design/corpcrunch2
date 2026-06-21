import { useState } from "react";
import { generateMetaDescription, generateMetaTitle } from "@/lib/seoOptimizer";
import { buildArticlePath } from "@/lib/seoHelpers";
import { PRIMARY_SITE_URL } from "@/lib/siteConfig";

function isValidUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function SectionHeader({ title, expanded, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        backgroundColor: "#f8f9fa",
        borderRadius: "6px",
        cursor: "pointer",
        marginBottom: expanded ? "16px" : "24px",
        border: "1px solid #e9ecef",
      }}
    >
      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#333" }}>{title}</h3>
      <span style={{ fontSize: "20px", color: "#666", lineHeight: 1 }}>{expanded ? "−" : "+"}</span>
    </div>
  );
}

export default function AdminSeoFields({
  title = "",
  content = "",
  postSlug = "",
  categoryId = "",
  categories = [],
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  imageAltText,
  setImageAltText,
  canonicalUrl,
  setCanonicalUrl,
  allowIndexing,
  setAllowIndexing,
  allowFollowing,
  setAllowFollowing,
  schemaMarkupType,
  setSchemaMarkupType,
  ogTitle,
  setOgTitle,
  ogDescription,
  setOgDescription,
  ogImage,
  setOgImage,
  secondaryKeywords,
  setSecondaryKeywords,
  redirectFrom,
  setRedirectFrom,
  language,
  setLanguage,
  region,
  setRegion,
  structuredData,
  setStructuredData,
  inlineImageAltText,
  setInlineImageAltText,
}) {
  const [seoExpanded, setSeoExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const selectedCategory = categories?.find(
    (cat) => String(cat.id) === String(categoryId) || String(cat._id) === String(categoryId)
  );

  const autoCanonical =
    postSlug && selectedCategory
      ? `${PRIMARY_SITE_URL.replace(/\/$/, "")}${buildArticlePath({
          slug: postSlug,
          Category: {
            slug: selectedCategory.slug,
            name: selectedCategory.name,
          },
        })}`
      : null;

  const structuredDataStatus = (() => {
    if (!structuredData?.trim()) return null;
    try {
      JSON.parse(structuredData.trim());
      return { valid: true };
    } catch (e) {
      return { valid: false, message: e.message };
    }
  })();

  return (
    <div style={{ marginTop: "32px", borderTop: "1px solid #eee", paddingTop: "24px" }}>
      <SectionHeader
        title="SEO & Metadata"
        expanded={seoExpanded}
        onToggle={() => setSeoExpanded(!seoExpanded)}
      />

      {seoExpanded && (
        <div style={{ marginBottom: "24px" }}>
          {autoCanonical && (
            <div
              className="mb-4"
              style={{
                padding: "12px 16px",
                backgroundColor: "#f0f7ff",
                borderRadius: "6px",
                border: "1px solid #cce0ff",
                fontSize: "13px",
              }}
            >
              <strong>Auto canonical URL:</strong>
              <div style={{ marginTop: "4px", wordBreak: "break-all", color: "#2563eb" }}>
                {autoCanonical}
              </div>
              <small className="text-muted">
                Leave Canonical URL blank to use this automatically on the live site.
              </small>
            </div>
          )}

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500" }}>
              Meta Title
              <span className="ms-2 text-muted" style={{ fontSize: "12px", fontWeight: 400 }}>
                (defaults to post title if empty)
              </span>
            </label>
            <input
              type="text"
              className="form-control"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Custom SEO title for Google search results"
              maxLength={60}
            />
            <div className="d-flex justify-content-between align-items-center mt-1">
              <small className="text-muted">{metaTitle.length}/60 characters</small>
              {!metaTitle && title && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setMetaTitle(generateMetaTitle(title))}
                >
                  Generate from title
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500" }}>
              Meta Description
              <span className="ms-2 text-muted" style={{ fontSize: "12px", fontWeight: 400 }}>
                (defaults to excerpt or content snippet)
              </span>
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="120–160 character summary for search results"
              maxLength={160}
            />
            <div className="d-flex justify-content-between align-items-center mt-1">
              <small className="text-muted">{metaDescription.length}/160 characters</small>
              {!metaDescription && content && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setMetaDescription(generateMetaDescription(content))}
                >
                  Generate from content
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500" }}>Canonical URL</label>
            <input
              type="url"
              className="form-control"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="Leave blank to use auto canonical URL above"
            />
            {canonicalUrl && !isValidUrl(canonicalUrl) && (
              <small className="text-danger d-block mt-1">Invalid URL — must start with http:// or https://</small>
            )}
            {canonicalUrl && isValidUrl(canonicalUrl) && (
              <small className="text-success d-block mt-1">Valid URL format</small>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500" }}>Featured Image Alt Text</label>
            <input
              type="text"
              className="form-control"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
              placeholder="Describe the banner image for accessibility and SEO"
            />
          </div>
        </div>
      )}

      <SectionHeader
        title="Advanced SEO Optimization"
        expanded={advancedExpanded}
        onToggle={() => setAdvancedExpanded(!advancedExpanded)}
      />

      {advancedExpanded && (
        <div style={{ marginBottom: "24px" }}>
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label" style={{ fontWeight: "500" }}>Allow Indexing</label>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="allowIndexing"
                  checked={allowIndexing}
                  onChange={(e) => setAllowIndexing(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="allowIndexing">
                  Let Google index this page
                </label>
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label" style={{ fontWeight: "500" }}>Allow Following Links</label>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="allowFollowing"
                  checked={allowFollowing}
                  onChange={(e) => setAllowFollowing(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="allowFollowing">
                  Let Google follow links on this page
                </label>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500" }}>Schema Markup Type</label>
            <select
              className="form-select"
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
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500" }}>Open Graph Title</label>
            <input
              type="text"
              className="form-control"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              placeholder="Social share title (defaults to meta title)"
              maxLength={60}
            />
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500" }}>Open Graph Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder="Social share description"
              maxLength={200}
            />
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500" }}>Open Graph Image URL</label>
            <input
              type="url"
              className="form-control"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="1200x630 image for Facebook, LinkedIn, Twitter"
            />
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500" }}>Secondary Keywords</label>
            <input
              type="text"
              className="form-control"
              value={secondaryKeywords}
              onChange={(e) => setSecondaryKeywords(e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500" }}>Redirect From (301)</label>
            <input
              type="text"
              className="form-control"
              value={redirectFrom}
              onChange={(e) => setRedirectFrom(e.target.value)}
              placeholder="old-slug or /old/path"
            />
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label" style={{ fontWeight: "500" }}>Language</label>
              <select className="form-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
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
            <div className="col-md-6">
              <label className="form-label" style={{ fontWeight: "500" }}>Region (hreflang)</label>
              <input
                type="text"
                className="form-control"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="US, GB, CA, AU..."
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500" }}>Inline Image Alt Text</label>
            <textarea
              className="form-control"
              rows={3}
              value={inlineImageAltText}
              onChange={(e) => setInlineImageAltText(e.target.value)}
              placeholder="One alt text per line, matching inline images in content"
            />
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "500" }}>Structured Data (JSON-LD)</label>
            <textarea
              className="form-control"
              rows={6}
              style={{ fontFamily: "monospace", fontSize: "12px" }}
              value={structuredData}
              onChange={(e) => setStructuredData(e.target.value)}
              placeholder='Optional custom JSON-LD, e.g. FAQPage schema'
            />
            {structuredDataStatus?.valid === true && (
              <small className="text-success d-block mt-1">Valid JSON format</small>
            )}
            {structuredDataStatus?.valid === false && (
              <small className="text-danger d-block mt-1">
                Invalid JSON: {structuredDataStatus.message}
              </small>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
