import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import MagazineViewer from '@/components/elements/MagazineViewer';
import { magazines } from '@/util/magazineData';
import SocialShareRibbon from '@/components/elements/SocialShareRibbon';
import { buildMagazineSeo, buildPageSeo } from '@/lib/seoHelpers';

const magazineNotFoundSeo = buildPageSeo({
  title: 'Magazine Not Found',
  description: 'The requested Corp Crunch magazine edition could not be found.',
  path: '/e-magazine',
  robots: 'noindex, nofollow',
});

export default function MagazineViewerPage() {
  const router = useRouter();
  const { slug } = router.query;

  const magazine = magazines.find((mag) => {
    const magSlug = mag.title.toLowerCase().replace(/\s+/g, '-');
    return magSlug === slug;
  });

  if (!magazine && slug) {
    return (
      <Layout seo={magazineNotFoundSeo}>
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h1>Magazine Not Found</h1>
          <p>The magazine you&apos;re looking for doesn&apos;t exist.</p>
          <a href="/e-magazine" style={{ color: '#ff0292' }}>Back to E-Magazine Library</a>
        </div>
      </Layout>
    );
  }

  if (!slug || !magazine) {
    return (
      <Layout seo={magazineNotFoundSeo}>
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  const magazineSeo = buildMagazineSeo(magazine);

  return (
    <Layout seo={magazineSeo}>
      <SocialShareRibbon />
      <MagazineViewer
        pdfUrl={magazine.pdfUrl}
        title={magazine.title}
        imageUrl={magazine.imageUrl}
      />
    </Layout>
  );
}
