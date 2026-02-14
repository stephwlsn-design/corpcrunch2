import Image from 'next/image';
import styles from './TeamMembers.module.css';

export default function TeamMembers() {
  const teamMembers = [
    { 
      name: 'Steph Wilson', 
      role: 'Founder, CEO & Director, Middle East, India', 
      image: '/assets/img/others/Professional photo (28).png',
      desc: '"The industry doesn\'t need another option. It needs a better standard." Steph Wilson is a visionary leader combining over 12 years of experience in MarComm, branding, and product development with hands-on expertise in AI-driven systems since 2016. Rooted in venture capital and tech, she has led GTM strategies for portfolio companies and driven brand and marketing initiatives at Black Dragon Capital, Compass, METRO, and Ericsson. Steph thrives at the intersection of human insight and technology, spotting the gaps where innovation lags behind opportunity and building solutions that leave a real-world impact. This venture isn\'t just another project; it\'s momentum and joining now means being on the winning side.' 
    },
   
  ];

  const advisors = [
    { 
      name: 'Malay Kumar', 
      role: 'Director, Sponsorship Sales & Revenue, Middle East', 
      image: '/assets/img/others/Malay Kumar.jpeg',
      desc: 'Malay Kumar brings 25+ years of expertise in events, sponsorship sales, and revenue strategy across media, advertising, and MarTech. His career spans leading organizations such as Filmfare ME, Viacom18, Mid-Day, and The Times of India.' 
    },
    { 
      name: 'Amit Singh', 
      role: 'Fractional CFO', 
      image: '/assets/img/others/Amit Singh.png',
      desc: 'Amit Singh is an accomplished corporate strategy, M&A, and investment banking professional with 13+ years driving inorganic growth, private equity fundraising, structured finance, and GCC-focused global strategies. He is an alumnus of EY and Deloitte.' 
    },
  ];

  const TechTeam = [
    { 
      name: 'Aditya Telsinge', 
      role: 'Full Stack Developer', 
      image: '/assets/img/others/Professional Aditya Photo.png',
      desc: 'Aditya brings deep technical expertise and exceptional problem-solving skills, backed by an impressive academic background. He excels at executing large-scale enterprise projects while maintaining a keen eye for UI/UX and design. As a true asset to the team, Aditya combines precision with creativity to deliver impactful solutions.' 
    },
  ];

  const renderSection = (title, label, blueRole, blueDesc, members) => (
    <div className={styles.sectionBlock}>
      <div className={styles.sectionHeader}>
        <span className={styles.label}>{label}</span>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.grid}>
        <div className={styles.blueCard}>
          <p className={styles.blueRole}>{blueRole}</p>
          <p className={styles.blueDesc}>{blueDesc}</p>
        </div>
        {members.map((member, index) => (
          <div key={index} className={styles.flipContainer}>
            <div className={styles.flipInner}>
              {/* FRONT SIDE */}
              <div className={styles.flipFront}>
                <div className={styles.memberCard}>
                  <div className={styles.imageContainer}>
                    <Image 
                      src={member.image} 
                      alt={member.name} 
                      fill 
                      className={styles.memberImage} 
                    />
                    <div className={styles.imageOverlay}></div>
                    <div className={styles.nameOverlay}>
                      <h4 className={styles.nameText}>{member.name}</h4>
                      <span className={styles.roleText}>{member.role}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BACK SIDE */}
              <div className={styles.flipBack}>
                <div className={styles.backCard}>
                  <div className={styles.backHeader}>
                    <h3 className={styles.backName}>{member.name}</h3>
                    <p className={styles.backRole}>{member.role}</p>
                  </div>
                  <div 
                    className={styles.backBody}
                    onWheel={(e) => {
                      const element = e.currentTarget;
                      const isScrollable = element.scrollHeight > element.clientHeight;
                      if (isScrollable) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <p className={styles.backDesc}>{member.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className={styles.teamSection}>
      <div className={styles.container}>
        {renderSection(
          'Explore our comprehensive team', 
          'EXPERTISE', 
          'Our Leadership Team', 
          'Corp Crunch™ is led by a team of innovators committed to bringing genuine integrity and strategic foresight to the intersection of Media, Martech, and AdTech.', 
          teamMembers
        )}
        {renderSection(
          'Industry Advisors', 
          'STRATEGY', 
          'Strategic Council', 
          'Our Advisors being deep-rooted experience in global media, events, and finance, they provide strategic oversight essential to our long-term growth and vision.', 
          advisors
        )}
        {renderSection(
          'Tech Team', 
          'TECH', 
          'Tech Team', 
          'The Tech team at Corp Crunch™ is the engine behind our innovation, building the proprietary tools poised to redefine the industry’s trillion-dollar status quo.', 
          TechTeam
        )}
      </div>
    </section>
  );
}