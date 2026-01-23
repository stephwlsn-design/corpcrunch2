import Layout from "@/components/layout/Layout";
import useCompanyPosts from "@/hooks/useCompanyPosts";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { formatNumber } from "@/util";

export default function BlogDetails() {
  let Router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { id } = Router.query;

  const { data: companyDetails, isLoading } = useCompanyPosts(id, {
    enabled: !!id,
  });

  const companiesPosts = companyDetails?.posts || [];
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  useEffect(() => {
    if (!companyDetails?.logoUrl) {
      setImageLoaded(true);
    }
  }, [companyDetails?.logoUrl]);
  // console.log(companyDetails, 'det');

  return (
    <Layout
      breadcrumbCategory={companyDetails?.name}
      breadcrumbPostTitle={companyDetails?.name}
    >
      <>
        <section className="blog-details-area pt-80 pb-100">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-1">
                <div className="blog-details-social">
                  <ul className="list-wrap">
                    {isLoading ? (
                      Array(4)
                        ?.fill(0)
                        ?.map((_, i) => (
                          <li>
                            <Skeleton width={24} height={24} />
                          </li>
                        ))
                    ) : (
                      <>
                        <li>
                          {companyDetails?.fbLink && (
                            <Link
                              target="_blank"
                              href={companyDetails?.fbLink}
                              className="company-social-btn"
                            >
                              <i className="fab fa-facebook-f" />
                            </Link>
                          )}
                        </li>
                        <li>
                          {companyDetails?.twitterLink && (
                            <Link
                              target="_blank"
                              href={companyDetails?.twitterLink}
                              className="company-social-btn"
                            >
                              <i className="fab fa-twitter" />
                            </Link>
                          )}
                        </li>
                        <li>
                          {companyDetails?.twitterLink && (
                            <Link
                              target="_blank"
                              href={companyDetails?.instagramLink}
                              className="company-social-btn"
                            >
                              <i className="fab fa-instagram" />
                            </Link>
                          )}
                        </li>
                        <li>
                          {companyDetails?.linkedinLink && (
                            <Link
                              target="_blank"
                              href={companyDetails?.linkedinLink}
                              className="company-social-btn"
                            >
                              <i className="fab fa-linkedin" />
                            </Link>
                          )}
                        </li>
                        <style jsx global>{`
                          .company-social-btn {
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                            width: 50px !important;
                            height: 50px !important;
                            box-shadow: 0px 16px 32px 0px rgba(0, 0, 0, 0.06) !important;
                            background: #ffffff !important;
                            border-radius: 50% !important;
                            color: #333 !important;
                            text-decoration: none !important;
                            transition: all 0.3s ease !important;
                          }
                          .company-social-btn:hover {
                            background: var(--tg-theme-primary) !important;
                            color: #ffffff !important;
                          }
                          .company-social-btn i {
                            font-size: 18px !important;
                          }
                        `}</style>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              <div className="col-lg-11">
                <div className="company-card ">
                  <div
                    className="company-thumb"
                    style={{ position: "relative" }}
                  >
                    {!isLoading && !companyDetails?.logoUrl && (
                      <img
                        src="/assets/img/others/notFoundImage.jpg"
                        alt="me"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    {(isLoading || !imageLoaded) && (
                      <Skeleton
                        width={150}
                        style={{ borderRadius: "50%" }}
                        height={150}
                      />
                    )}
                    <img
                      style={{
                        display:
                          !imageLoaded ||
                            isLoading ||
                            !companyDetails?.logoUrl
                            ? "none"
                            : "block",
                      }}
                      src={companyDetails?.logoUrl}
                      alt="me"
                      onLoad={handleImageLoad}
                    />
                  </div>
                  <div>
                    <div className="company-card-header-wrapper">
                      {/* <div className="company-thumb-mobile">
                          {isLoading ? (
                            <Skeleton width={50} height={50} />
                          ) : (
                            <img
                              src={
                                companyDetails?.logoUrl ??
                                "https://s3-symbol-logo.tradingview.com/intel--600.png"
                              }
                              alt="me"
                            />
                          )}
                        </div> */}
                      <div>
                        <div className="company-card-header">
                          {isLoading ? (
                            <Skeleton width={200} height={20} />
                          ) : (
                            <h5>{companyDetails?.name}</h5>
                          )}
                        </div>
                      </div>
                    </div>

                    <p style={{ minHeight: "100px" }}>
                      {isLoading ? (
                        <Skeleton count={3} />
                      ) : (
                        companyDetails?.description ??
                        "No description provided"
                      )}
                    </p>
                  </div>
                </div>
                <div className="company-blogs">
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                      <div className="trending__post" key={i}>
                        <div className="trending__post-thumb tgImage__hover">
                          <Skeleton width="100%" height={200} />
                        </div>
                        <div className="trending__post-content">
                          <Skeleton width="60%" height={20} />
                          <Skeleton width="80%" height={20} />
                          <Skeleton width="40%" height={20} />
                        </div>
                      </div>
                    ))
                    : companiesPosts?.map((item, i) => (
                      <div className="trending__post" key={i}>
                        <div className="trending__post-thumb tgImage__hover">
                          <Link href={`/blog/${item?.id}`}>
                            <img
                              src={
                                item?.bannerImageUrl ??
                                "/assets/img/blog/blog01.jpg"
                              }
                              alt="img"
                            />
                          </Link>
                        </div>
                        <div className="trending__post-content">
                          <ul className="tgbanner__content-meta list-wrap">
                            <li>
                              <span className="by">By</span>{" "}
                              <Link href="/blog">
                                {item?.author?.firstName +
                                  " " +
                                  item?.author?.lastName}
                              </Link>
                            </li>
                            <li className="category">
                              <Link
                                href={`/category/${item?.Category?.id}`}
                              >
                                {item?.Category?.name}
                              </Link>
                            </li>
                          </ul>
                          <h4 className="title tgcommon__hover">
                            <Link href={`/blog/${item?.id}`}>
                              {item?.content?.substring(0, 100) + "..."}
                            </Link>
                          </h4>
                          <ul className="post__activity list-wrap">
                            <li>
                              <i className="fal fa-share-alt" />{" "}
                              {formatNumber(item?.sharesCount || 0)}
                            </li>
                          </ul>
                        </div>
                      </div>
                    ))}
                  {companiesPosts?.length === 0 && !isLoading && (
                    <div>
                      <h2>No posts found</h2>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    </Layout>
  );
}
