import Layout from "@/components/layout/Layout";
import Head from "next/head";
import Link from "next/link";
import axiosInstance from "@/util/axiosInstance";
import { formatDate } from "@/util";
import Image from "next/image";

export default function AIXPage({ posts }) {
  const aixPosts = posts || [];

  const getExcerpt = (content) => {
    if (!content) return "";
    const text = content.replace(/[#*\[\]()]/g, "").replace(/\n/g, " ");
    return text.length > 200 ? text.substring(0, 200) + "..." : text;
  };

  return (
    <Layout>
      <Head>
        <title>AIX | Events | CorpCrunch</title>
        <meta name="description" content="AIX events and content from Corp Crunch" />
      </Head>

      <section className="blog-details-area pt-80 pb-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <div className="mb-30">
                <Link href="/events" style={{ 
                  color: '#ff0292', 
                  textDecoration: 'none',
                  fontSize: '14px',
                  marginBottom: '20px',
                  display: 'inline-block'
                }}>
                  ← Back to Events
                </Link>
                <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '20px' }}>AIX</h1>
                <p style={{ fontSize: '18px', color: '#666', marginTop: '10px' }}>
                  Explore AIX events and content
                </p>
              </div>

              {aixPosts.length > 0 ? (
                <div className="blog-post-wrapper">
                  {aixPosts.map((item, index) => (
                    <div className="latest__post-item" key={item.id || index} style={{ marginBottom: '40px' }}>
                      <div className="latest__post-thumb tgImage__hover">
                        <Link href={`/blog/${item.slug}`}>
                          {item.bannerImageUrl ? (
                            <Image
                              src={item.bannerImageUrl}
                              alt={item.title}
                              width={800}
                              height={500}
                              style={{
                                width: "100%",
                                height: "auto",
                                objectFit: "cover",
                                borderRadius: '8px'
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "400px",
                                backgroundColor: "#f0f0f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: '8px'
                              }}
                            >
                              <i className="fas fa-image" style={{ fontSize: "48px", color: "#ccc" }} />
                            </div>
                          )}
                        </Link>
                      </div>
                      <div className="latest__post-content">
                        <ul className="tgbanner__content-meta list-wrap">
                          <li className="category">
                            <span style={{ textTransform: 'uppercase' }}>AIX</span>
                          </li>
                          <li>
                            <span className="by">By</span>{" "}
                            <span style={{ color: 'inherit' }}>Mike Evans</span>
                          </li>
                          <li>{formatDate(item.createdAt)}</li>
                        </ul>
                        <h3 className="title tgcommon__hover">
                          <Link href={`/blog/${item.slug}`}>{item.title}</Link>
                        </h3>
                        <p>{getExcerpt(item.content)}</p>
                        <div className="latest__post-read-more">
                          <Link href={`/blog/${item.slug}`}>
                            Read More <i className="far fa-long-arrow-right" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center" style={{ padding: "60px 20px" }}>
                  <h3>No AIX posts found</h3>
                  <p style={{ color: "#777", marginTop: "10px" }}>
                    Check back later for new AIX content.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps = async ({ req }) => {
  try {
    const language = req?.cookies?.language || 'en';
    const response = await axiosInstance.get('/posts', {
      params: { lang: language }
    });
    
    const allPosts = [...(response?.frontPagePosts || []), ...(response?.trendingPosts || [])];
    const aixPosts = allPosts.filter(post => 
      post.tags?.some(tag => tag.toLowerCase().includes('aix')) ||
      post.title?.toLowerCase().includes('aix')
    ) || [];
    
    return { props: { posts: aixPosts } };
  } catch (error) {
    console.error("Error fetching AIX posts:", error);
    return { props: { posts: [] } };
  }
};
