import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import MagazineViewer from '@/components/elements/MagazineViewer';
import { magazines } from '@/util/magazineData';
import SocialShareRibbon from '@/components/elements/SocialShareRibbon';

export default function MagazineViewerPage() {
  const router = useRouter();
  const { slug } = router.query;

  // Find the magazine by slug (convert title to slug)
  const magazine = magazines.find(mag => {
    const magSlug = mag.title.toLowerCase().replace(/\s+/g, '-');
    return magSlug === slug;
  });

  if (!magazine && slug) {
    return (
      <Layout headTitle="Magazine Not Found">
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h1>Magazine Not Found</h1>
          <p>The magazine you're looking for doesn't exist.</p>
          <a href="/" style={{ color: '#ff0292' }}>Return to Home</a>
        </div>
      </Layout>
    );
  }

  if (!slug) {
    return (
      <Layout headTitle="Loading Magazine">
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headTitle={`${magazine.title} - Digital Magazine`}>
      <SocialShareRibbon />
      <MagazineViewer
        pdfUrl={magazine.pdfUrl}
        title={magazine.title}
        imageUrl={magazine.imageUrl}
      />
    </Layout>
  );
}
