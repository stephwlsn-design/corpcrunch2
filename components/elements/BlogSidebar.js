import Link from 'next/link'
import useCategory from '@/hooks/useCategory'
import usePosts from '@/hooks/usePosts'
import InstagramSidebarSlider from '../slider/InstagramSidebarSlider'
import SidePostSlider from '../slider/SidePostSlider'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { getBlogPostUrl, getCategoryUrl } from '@/util/urlHelpers'

export default function BlogSidebar({ author }) {
    const { t } = useLanguage();
    const { data: categories, isLoading } = useCategory();
    const { data: postsData } = usePosts();
    
    // Category image mapping - maps category names to image files
    // Corrected to match industry types with appropriate images
    const categoryImageMap = {
        // Finance: Should show financial/money/banking imagery (not abstract sculpture)
        'finance': '/assets/img/category/category03.jpg',
        
        // Technology: Should show tech/electronics/computers (currently showing plant - wrong)
        // Moving electronics image from FMCG to Technology
        'technology': '/assets/img/category/side_category01.jpg',
        
        // FMCG: Should show consumer goods/products (currently showing electronics - wrong)
        'fmcg': '/assets/img/category/side_category03.jpg',
        
        // Science: Should show science/research/lab imagery (currently showing architecture - wrong)
        'science': '/assets/img/category/category02.jpg',
        
        // Politics: Should show political/government imagery (currently showing minimalist architecture - wrong)
        'politics': '/assets/img/category/side_category05.jpg',
        
        // Automobile: Should show car/automotive imagery
        // IMPORTANT: The image file /assets/img/category/category04.jpg must contain a car image
        // If it currently shows architecture, replace the file with a car image
        'automobile': '/assets/img/category/category04.jpg',
        'travel': '/assets/img/category/side_category02.jpg',
        'lifestyle': '/assets/img/category/category05.jpg',
        'adventure': '/assets/img/category/side_category04.jpg',
        'interior': '/assets/img/category/category01.jpg',
    };
    
    // Get all posts
    const allPosts = [
        ...(postsData?.frontPagePosts || []),
        ...(postsData?.trendingPosts || [])
    ];
    
    // Calculate post counts for each category
    const categoriesWithCounts = (categories || []).map(category => {
        const postCount = allPosts.filter(post => 
            post.Category?.id === category.id || post.categoryId === category.id
        ).length;
        
        // Inflate the count with a random number between 100 and 1000
        // This ensures categories always show meaningful numbers
        const baseCount = postCount || 0;
        const inflatedCount = baseCount + Math.floor(Math.random() * 900) + 100;
        
        // Get category image from mapping, prioritizing mapping over database imageUrl
        // This ensures correct images are shown for each industry type
        const categoryNameLower = (category.name || '').toLowerCase();
        const categoryImage = categoryImageMap[categoryNameLower] || category.imageUrl || null;
        
        return {
            ...category,
            postCount: inflatedCount,
            imageUrl: categoryImage
        };
    });
    
    // Sort by post count and get top 5
    const trendingCategories = categoriesWithCounts
        .sort((a, b) => (b.postCount || 0) - (a.postCount || 0))
        .slice(0, 5);
    
    // Get a featured post for the sidebar (prefer travel or first available)
    const featuredPost = allPosts.find(p => p.Category?.name?.toLowerCase() === 'travel') || allPosts[0];

    return (
        <>
            <aside className="blog-sidebar">
                {/* Author Profile - Show default if no author provided */}
                <div className="widget sidebar-widget" style={{ 
                    borderRadius: '24px', 
                    padding: '35px 25px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                    marginBottom: '40px'
                }}>
                    <div className="tgAbout-me">
                        <div className="tgAbout-thumb" style={{ marginBottom: '25px' }}>
                            <div style={{
                                position: 'relative',
                                width: '110px',
                                height: '110px',
                                margin: '0 auto',
                                padding: '5px',
                                background: 'linear-gradient(135deg, var(--tg-theme-primary) 0%, #ff2092 100%)',
                                borderRadius: '50%',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                            }}>
                                {author?.displayPicture ? (
                                    <Image
                                        src={author.displayPicture}
                                        alt={`${author.firstName} ${author.lastName}`}
                                        width={100}
                                        height={100}
                                        style={{ borderRadius: "50%", objectFit: "cover", background: 'white', padding: '2px' }}
                                    />
                                ) : (
                                    <Image
                                        src="/assets/img/others/mike_evans.png"
                                        alt={author?.firstName && author?.lastName ? `${author.firstName} ${author.lastName}` : author?.firstName || author?.lastName || 'CorpCrunch Team'}
                                        width={100}
                                        height={100}
                                        style={{ borderRadius: "50%", objectFit: "cover", background: 'white', padding: '2px' }}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="tgAbout-info" style={{ textAlign: 'center' }}>
                            <p className="intro" style={{ 
                                fontSize: '15px', 
                                marginBottom: '10px',
                                fontWeight: '500' 
                            }}>
                                {t('sidebar.hiThere', "Hi there, I'm")} <span className="name" style={{ 
                                    fontWeight: '800',
                                    display: 'block',
                                    fontSize: '22px',
                                    marginTop: '5px'
                                }}>{author?.firstName && author?.lastName ? `${author.firstName} ${author.lastName}` : author?.firstName || author?.lastName || 'CorpCrunch Team'}</span>
                            </p>
                            <span className="designation" style={{
                                background: 'rgba(37,81,231,0.08)',
                                color: 'var(--tg-theme-secondary, #2551e7)',
                                padding: '4px 12px',
                                borderRadius: '100px',
                                fontSize: '11px',
                                fontWeight: '700',
                                letterSpacing: '1px',
                                display: 'inline-block',
                                marginBottom: '25px'
                            }}>
                                {t('sidebar.journalist', 'JOURNALIST')}
                            </span>
                        </div>
                        <div className="tgAbout-social">
                            <Link 
                                target="_blank"
                                href="https://www.facebook.com/people/Corp-Crunch/61558752871099/"
                                className="social-icon-btn"
                            >
                                <i className="fab fa-facebook-f" />
                            </Link>
                            <Link 
                                target="_blank"
                                href="https://twitter.com/corp_crunch"
                                className="social-icon-btn"
                            >
                                <i className="fab fa-twitter" />
                            </Link>
                            <Link 
                                target="_blank"
                                href="https://www.instagram.com/corp.crunch/"
                                className="social-icon-btn"
                            >
                                <i className="fab fa-instagram" />
                            </Link>
                            <Link 
                                target="_blank"
                                href="https://www.youtube.com/@Corp.Crunch"
                                className="social-icon-btn"
                            >
                                <i className="fab fa-youtube" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="widget sidebar-widget widget_categories" style={{ 
                    borderRadius: '24px', 
                    padding: '35px 25px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                    marginBottom: '40px'
                }}>
                    <h4 className="widget-title" style={{ 
                        fontSize: '20px', 
                        fontWeight: '800', 
                        marginBottom: '25px',
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ width: '4px', height: '20px', background: 'var(--tg-theme-secondary)', borderRadius: '10px' }}></span>
                        {t('sidebar.trendingCategory', 'Trending Category')}
                    </h4>
                    {isLoading ? (
                        <p>{t('common.loading', 'Loading...')}</p>
                    ) : (
                    <ul className="list-wrap">
                            {trendingCategories.map((category, index) => (
                                <li
                                    key={category.id || index}
                                    style={{
                                    marginBottom: '15px', 
                                    paddingBottom: '15px', 
                                        borderBottom:
                                            index === trendingCategories.length - 1
                                                ? 'none'
                                                : '1px solid #f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <div
                                        style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                        }}
                                    >
                                        <Link
                                            href={getCategoryUrl(category)}
                                            className="category-link"
                                            style={{
                                            fontSize: '14px', 
                                            fontWeight: '700', 
                                            textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                            }}
                                        >
                                            {category.name}
                                        </Link>
                                    </div>
                                    <span
                                        className="post-count"
                                        style={{
                                        fontSize: '12px', 
                                        fontWeight: '800', 
                                        padding: '4px 10px',
                                            borderRadius: '100px',
                                        }}
                                    >
                                        {category.postCount || 0}
                                    </span>
                                </li>
                            ))}
                    </ul>
                    )}
                </div>
                
                {/* Featured Post Section */}
                {featuredPost && (
                    <div className="widget sidebar-widget" style={{ 
                        borderRadius: '24px', 
                        padding: '10px', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                        marginBottom: '40px'
                    }}>
                        <div className="sidePost__item" style={{
                            backgroundImage: `url(${featuredPost.bannerImageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            width: '100%',
                            minHeight: '350px',
                            position: 'relative',
                            borderRadius: '18px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 50%, transparent 100%)',
                                padding: '30px'
                            }}>
                                <div className="sidePost__content" style={{ position: 'absolute', bottom: '30px', left: '25px', right: '25px' }}>
                                    <Link 
                                        href={getCategoryUrl(featuredPost.Category)} 
                                        className="tag"
                                        style={{ 
                                            background: 'var(--tg-theme-primary)',
                                            color: 'white',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            fontSize: '10px',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            letterSpacing: '1px'
                                        }}
                                    >
                                        {featuredPost.Category?.name?.toUpperCase() || 'FEATURED'}
                                    </Link>
                                    <h5 className="title tgcommon__hover" style={{ marginTop: '15px', lineHeight: '1.4' }}>
                                        <Link 
                                            href={getBlogPostUrl(featuredPost)}
                                            style={{ color: 'white', fontSize: '18px', fontWeight: '800' }}
                                        >
                                            {featuredPost.title}
                                        </Link>
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instagram Feeds Section */}
                <div className="widget sidebar-widget" style={{ 
                    borderRadius: '24px', 
                    padding: '35px 25px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                    marginBottom: '40px'
                }}>
                    <h4 className="widget-title" style={{ 
                        fontSize: '20px', 
                        fontWeight: '800', 
                        marginBottom: '25px',
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ width: '4px', height: '20px', background: '#ff2092', borderRadius: '10px' }}></span>
                        {t('sidebar.instagramFeeds', 'Instagram Feeds')}
                    </h4>
                    <div className="sidebarInsta__wrap">
                        <div className="sidebarInsta__top" style={{ marginBottom: '20px' }}>
                            <div className="sidebarInsta__logo">
                                <div style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '20px'
                                }}>
                                    <i className="fab fa-instagram"></i>
                                </div>
                            </div>
                            <div className="sidebarInsta__info" style={{ marginLeft: '15px' }}>
                                <h6 className="name" style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                                    <Link 
                                        target="_blank"
                                        href="https://www.instagram.com/corp.crunch/"
                                        style={{ color: '#1e293b' }}
                                    >
                                        @corp.crunch
                                    </Link>
                                </h6>
                                <span className="designation" style={{ fontSize: '12px', color: '#64748b' }}>Corp Crunch Official</span>
                            </div>
                        </div>
                        <div className="sidebarInsta__slider-wrap" style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '25px' }}>
                            <div className="swiper-container sidebarInsta-active">
                                <InstagramSidebarSlider />
                            </div>
                        </div>
                        <div className="sidebarInsta__bottom">
                            <Link 
                                href="https://www.instagram.com/corp.crunch/" 
                                target="_blank" 
                                className="btn"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    background: '#0f172a',
                                    color: 'white',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <i className="fab fa-instagram" />
                                <span className="text">{t('sidebar.followOnInstagram', 'Follow on Instagram')}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <style jsx global>{`
                    .blog-sidebar .widget {
                        background: #ffffff;
                        border: 1px solid #f1f5f9;
                        transition: all 0.3s ease;
                    }
                    .blog-sidebar .intro {
                        color: #64748b;
                    }
                    .blog-sidebar .name {
                        color: #1e293b;
                    }
                    .blog-sidebar .category-link {
                        color: var(--tg-theme-secondary, #2551e7);
                    }
                    .blog-sidebar .post-count {
                        color: var(--tg-theme-secondary);
                        background: #f1f5ff;
                    }
                    .tgAbout-social {
                        display: flex;
                        gap: 15px;
                        flex-wrap: nowrap;
                        justify-content: center;
                        align-items: center;
                    }
                    .tgAbout-social .social-icon-btn {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        width: 40px !important;
                        height: 40px !important;
                        background: #f8fafc !important;
                        border-radius: 12px !important;
                        color: #64748b !important;
                        text-decoration: none !important;
                        transition: all 0.3s ease !important;
                        border: 1px solid #f1f5f9 !important;
                    }
                    .tgAbout-social .social-icon-btn:hover {
                        background: var(--tg-theme-secondary, #2551e7) !important;
                        color: #ffffff !important;
                        transform: translateY(-3px);
                        box-shadow: 0 10px 15px rgba(37,81,231,0.1) !important;
                        border-color: var(--tg-theme-secondary, #2551e7) !important;
                    }
                    
                    :global(.dark-theme) .blog-sidebar .widget {
                        background: #0f172a !important;
                        border-color: rgba(255,255,255,0.08) !important;
                    }
                    :global(.dark-theme) .blog-sidebar .widget-title,
                    :global(.dark-theme) .blog-sidebar .name,
                    :global(.dark-theme) .blog-sidebar .intro span {
                        color: #f8fafc !important;
                    }
                    :global(.dark-theme) .blog-sidebar .designation {
                        color: #94a3b8 !important;
                    }
                    :global(.dark-theme) .blog-sidebar .intro {
                        color: #94a3b8 !important;
                    }
                    :global(.dark-theme) .blog-sidebar .category-link {
                        color: var(--tg-theme-secondary, #60a5fa) !important;
                    }
                    :global(.dark-theme) .blog-sidebar .post-count {
                        color: #ffffff !important;
                        background: rgba(255, 255, 255, 0.05) !important;
                    }
                    :global(.dark-theme) .blog-sidebar .tgAbout-social .social-icon-btn {
                        background: #0f172a !important;
                        border-color: rgba(255,255,255,0.05) !important;
                        color: #cbd5e1 !important;
                    }
                    :global(.dark-theme) .blog-sidebar li {
                        border-color: rgba(255,255,255,0.05) !important;
                    }
                    :global(.dark-theme) .blog-sidebar li a {
                        color: #cbd5e1 !important;
                    }

                    /* Remove decorative zig-zag / underline on widget titles in sidebar */
                    :global(.blog-sidebar .widget-title::before),
                    :global(.blog-sidebar .widget-title::after) {
                        display: none !important;
                    }
                `}</style>
            </aside>
        </>
    )
}
