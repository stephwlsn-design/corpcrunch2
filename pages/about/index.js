import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import WhoWeAre from '@/components/about/WhoWeAre';
import VisionMission from '@/components/about/VisionMission';
import NumbersThatMatter from '@/components/about/NumbersThatMatter';
import FAQs from '@/components/about/FAQs';
import axiosInstance from '@/util/axiosInstance';
import SocialShareRibbon from '@/components/elements/SocialShareRibbon';

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [contentRes, faqsRes, statsRes] = await Promise.all([
          axiosInstance.get('/api/about/content'),
          axiosInstance.get('/api/about/faqs'),
          axiosInstance.get('/api/about/stats'),
        ]);

        if (contentRes.data?.success) {
          // Organize content by section
          const contentMap = {};
          if (Array.isArray(contentRes.data.contents)) {
            contentRes.data.contents.forEach((item) => {
              contentMap[item.section] = item;
            });
          } else if (contentRes.data.content) {
            contentMap[contentRes.data.content.section] = contentRes.data.content;
          }
          setAboutContent(contentMap);
        }

        if (faqsRes.data?.success) {
          setFaqs(faqsRes.data.faqs || []);
        }

        if (statsRes.data?.success) {
          // Transform stats to match component format
          const formattedStats = (statsRes.data.stats || []).map((stat) => ({
            label: stat.label,
            value: stat.value,
            description: stat.description,
          }));
          setStats(formattedStats);
        }
      } catch (error) {
        console.error('Error fetching about page data:', error);
        // Use default data on error
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <Layout headTitle="About Us - CorpCrunch">
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #2551e7',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p>Loading...</p>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Layout>
    );
  }

  return (
    <Layout headTitle="About Us - CorpCrunch">
      <SocialShareRibbon />
      <style jsx global>{`
        .about-page-wrapper {
          margin-left: -15px;
          margin-right: -15px;
          width: calc(100% + 30px);
        }
        @media (min-width: 576px) {
          .about-page-wrapper {
            margin-left: -15px;
            margin-right: -15px;
          }
        }
        @media (min-width: 768px) {
          .about-page-wrapper {
            margin-left: -15px;
            margin-right: -15px;
          }
        }
        @media (min-width: 992px) {
          .about-page-wrapper {
            margin-left: -15px;
            margin-right: -15px;
          }
        }
      `}</style>
      <div className="about-page-wrapper">
        {/* Who We Are Section */}
        <WhoWeAre 
          content={aboutContent?.whoWeAre}
          teamImage={aboutContent?.whoWeAre?.imageUrl}
        />

        {/* Vision & Mission Section */}
        <VisionMission
          visionContent={aboutContent?.vision}
          missionContent={aboutContent?.mission}
        />

        {/* Numbers That Matter Section */}
        <NumbersThatMatter
          stats={stats}
          missionText={aboutContent?.numbers?.content}
        />

        {/* FAQs Section */}
        <FAQs faqs={faqs} />
      </div>
    </Layout>
  );
}

