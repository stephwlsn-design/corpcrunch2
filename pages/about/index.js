import Layout from '@/components/layout/Layout';
import WhoWeAre from '@/components/about/WhoWeAre';
import VisionMission from '@/components/about/VisionMission';
import NumbersThatMatter from '@/components/about/NumbersThatMatter';
import SocialShareRibbon from '@/components/elements/SocialShareRibbon';
import TeamMembers from '@/components/about/TeamMembers';
import { buildAboutSeo } from '@/lib/seoHelpers';
import connectDB from '@/lib/mongoose';
import AboutContent from '@/models/AboutContent';
import AboutStats from '@/models/AboutStats';

const aboutSeo = buildAboutSeo();

function mapAboutContent(contents = []) {
  const contentMap = {};
  contents.forEach((item) => {
    if (!item?.section) return;
    contentMap[item.section] = {
      title: item.title,
      description: item.content || item.description,
      content: item.content,
      subtitle: item.subtitle,
      imageUrl: item.imageUrl,
      metadata: item.metadata || null,
    };
  });
  return contentMap;
}

export default function AboutPage({ aboutContent = {}, stats = [] }) {
  const whoWeAre = aboutContent.whoWeAre || {};

  return (
    <Layout seo={aboutSeo}>
      <SocialShareRibbon />
      <style jsx global>{`
        .about-page-wrapper {
          margin-left: -15px;
          margin-right: -15px;
          width: calc(100% + 30px);
        }
      `}</style>
      <div className="about-page-wrapper">
        <WhoWeAre
          content={{
            title: whoWeAre.title || 'Who We Are?',
            description: whoWeAre.description,
            metadata: whoWeAre.metadata,
          }}
          teamImage={whoWeAre.imageUrl}
        />

        <VisionMission
          visionContent={aboutContent.vision}
          missionContent={aboutContent.mission}
        />

        <TeamMembers />

        <NumbersThatMatter
          stats={stats}
          missionText={aboutContent.numbers?.content}
        />
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    await connectDB();
    const [contents, stats] = await Promise.all([
      AboutContent.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
      AboutStats.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
    ]);

    return {
      props: {
        aboutContent: JSON.parse(JSON.stringify(mapAboutContent(contents))),
        stats: JSON.parse(
          JSON.stringify(
            (stats || []).map((stat) => ({
              label: stat.label,
              value: stat.value,
              description: stat.description,
            }))
          )
        ),
      },
    };
  } catch (error) {
    console.error('[about] Failed to fetch about page data:', error.message);
    return {
      props: {
        aboutContent: {},
        stats: [],
      },
    };
  }
}
