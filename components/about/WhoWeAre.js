import Image from 'next/image';
import styles from './WhoWeAre.module.css';

export default function WhoWeAre({ content, teamImage }) {
  const defaultContent = {
    title: 'Who We Are?',
    description: `What if you could see around corners?

Every day, beneath the surface of mainstream headlines, extraordinary transformations are unfolding. A regulation change in Singapore ripples through global supply chains. A cultural shift in Lagos predicts consumer behavior in London. A technological breakthrough in Seoul rewrites the rules for industries worldwide. These aren't isolated incidents; they're threads in a vast, interconnected tapestry that most people never see until it's too late.

Corp Crunch exists for those who refuse to be caught off guard.

The Problem We're Solving

We live in a paradox: infinite information, minimal understanding. You're either overwhelmed by the fire hose of content from a thousand sources, or you're trapped in a filter bubble seeing only what algorithms think you want. Traditional media gives you yesterday's news. Social platforms give you manufactured outrage. Industry reports give you dry statistics without the story.

What you actually need? The why behind the what. The connections nobody else is drawing. The trends that will matter in six months, delivered today with the emotional resonance that makes them impossible to ignore.`,
    metadata: {
      since: '2012',
      people: '09',
      location: 'USA',
    },
  };

  const data = content || defaultContent;

  return (
    <section className={styles.whoWeAre}>
      <div className={styles.contentWrapper}>
        {/* Left Section - Text */}
        <div className={styles.textSection}>
          <div className={styles.textContent}>
            <h1 className={styles.title}>
              {data.title || 'Who We Are?'}
            </h1>

            <div className={styles.description}>
              {(data.description || defaultContent.description)
                .split('\n')
                .map((paragraph, index) =>
                  paragraph.trim() ? <p key={index}>{paragraph}</p> : null
                )}
            </div>
          </div>
        </div>

        {/* Right Section - Image */}
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <Image
              src={teamImage || '/assets/img/bg/CC website about image.png'}
              alt="About CorpCrunch"
              fill
              className={styles.teamImage}
              style={{ objectFit: 'cover' }}
              priority
              quality={100}
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}
