import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import styles from '../../public/assets/css/CrunchEventPage.module.css'

const speakers = [
    {
        name: 'Robyn Brown',
        title: 'Lead Speaker, Data Convention',
        profession: 'Data Analyst',
        img: 'https://static.wixstatic.com/media/4951af_aaca23b991a34d4db1ab4ebf800a5378~mv2.png/v1/fill/w_220,h_375,al_c,lg_1,q_85,enc_avif,quality_auto/shutterstock_725291137%20_new.png',
        desc: 'Simone shares his cutting-edge ideas on modern cloud infrastructures and scaling systems.',
        socials: { website: '#', linkedin: '#' },
    },
    {
        name: 'Simon Powell',
        title: 'Tech Evangelist, Cloud Hub',
        profession: 'Cloud Architec',
        img: 'https://static.wixstatic.com/media/4951af_d0a49fb7f33f4cc19cb89aa97c953dc1~mv2.png/v1/fill/w_215,h_360,al_c,q_85,enc_avif,quality_auto/shutterstock_725291137%20copy%2012.png',
        desc: 'Simone shares his cutting-edge ideas on modern cloud infrastructures and scaling systems.',
        socials: { website: '#', linkedin: '#' },
    },
    {
        name: 'Matthew Lyons',
        title: 'Data Architect, Big Insights Group',
        profession: 'Product Designer',

        img: 'https://static.wixstatic.com/media/4951af_17c33fba6250421ba7ada3669b194f44~mv2.png/v1/fill/w_220,h_375,al_c,lg_1,q_85,enc_avif,quality_auto/shutterstock_725291137%20copy%209.png',
        desc: 'Architecting the future with big data strategies that are scalable and resilient.',
        socials: { website: '#', linkedin: '#' },
    },
    {
        name: 'Britney Swanson',
        title: 'Leading Innovator, Future Tech',
        profession: 'HR Specialis',

        img: 'https://static.wixstatic.com/media/4951af_a75001bf8ac94c0ea356b5200d61d5d5~mv2.png/v1/fill/w_219,h_375,al_c,lg_1,q_85,enc_avif,quality_auto/shutterstock_725291137%20copy%2011.png',
        desc: 'Exploring the intersection of technology and human experience in the digital age.',
        socials: { website: '#', linkedin: '#' },
    },
]

const agendaItems = [
    { time: "8:00 AM - 9:00 AM", title: "Badge collection" },
    { time: "9:00 AM - 9:30 AM", title: 'AI with a Conscience" Visionary talk by a global AI ethics thought leader' },
    { time: "9:30 AM - 10:00 AM", title: "Governance in the Age of AI" },
    { time: "10:00 AM - 10:30 AM", title: "Coffee Break & Ethical Tech Expo Preview" },
    { time: "10:30 AM - 11:15 AM", title: "Bias & Beyond Focus: Tackling bias in training data, models" },
    { time: "", title: "Tech Deep Dive: Explainability in Black Box Model" },
    { time: "12:00 AM - 1:00 PM", title: "Networking Lunch & Roundtable Conversations" },
    { time: "1:30 PM - 2:15 PM", title: "Leadership & Ethics at the Executive Table" },
    { time: "2:15 PM - 3:00 PM", title: "Breakout - Corporate AI Ethics Playbook" },
    { time: "3:00 PM - 3:15 PM", title: "Afternoon Recharge Break" },
    { time: "4:00 PM - 4:45 PM", title: "Panel 3: Ethics at Scale: Building Ethical AI in Enterprise Pipelines" },
    { time: "4:45 PM - 5:15 PM", title: "Lightning Talks" },
    { time: "5:15 PM - 6:30 PM", title: "Evening Mixer & Ethical Tech Expo" },
];

const CrunchEventPage = () => {
    const [showMap, setShowMap] = useState(false)
    const handleToggleMap = () => setShowMap(!showMap)
    const [showFullAgenda, setShowFullAgenda] = useState(false)
    const agendaPreviewCount = 4

    const agendaItemsToShow = showFullAgenda ? agendaItems : agendaItems.slice(0, agendaPreviewCount)

    return (
        <Layout seo={{
            title: "Corp Crunch Connect Events",
            description:
                "Join Corp Crunch at the 'Crunch The Miles Marathon' — a high-energy, ethical AI event for tech leaders.",
            url: "https://www.corpcrunch.io/crunch-the-miles-marathon-by-corp-crunch",
            image: "https://www.corpcrunch.io/assets/img/technology/banner_1.jpg",
        }}>


            <Link
                href="#register"

            >
                <div className={`position-relative w-100 ${styles.bannerWrapper}`}></div>
            </Link>


            <div>
                <h2 className="text-center my-5">Meet the Speakers</h2>
            </div>
            <div className="container py-5 white-bg">
                {speakers.map((speaker, index) => (
                    <div className="row align-items-center mb-5 justify-content-center text-center text-md-start" key={index}>
                        {/* Rotated Label */}
                        <div
                            className={`col-12 p-0 col-md-1 d-flex justify-content-center align-items-center rotate-text ${index % 2 !== 0 ? 'order-md-3' : ''
                                }`}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    transform: index % 2 === 0 ? 'rotate(-90deg)' : 'rotate(90deg)',
                                    marginRight: index % 2 === 0 && 'auto',
                                    marginLeft: index % 2 === 1 && 'auto ',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <span style={{ fontSize: '0.8rem', color: '#a020f0' }}>
                                    0{index + 1}
                                </span>
                                <hr
                                    style={{
                                        width: '30px',
                                        border: 'none',
                                        borderTop: '1px solid #ccc',
                                        margin: '4px 0',
                                    }}
                                />
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#a020f0' }}>
                                    {speaker.profession}
                                </p>
                            </div>
                        </div>


                        {/* Image */}
                        <div
                            className={`col-12 col-md-3 mb-3 mb-md-0 ${index % 2 === 0 ? 'order-md-1' : 'order-md-2'} 
                        animate__animated animate__fadeInLeft d-flex justify-content-center`}
                        >
                            <img
                                src={speaker.img}
                                alt={speaker.name}
                                className="img-fluid rounded shadow"
                                style={{ maxHeight: '375px', objectFit: 'cover' }}
                            />
                        </div>

                        {/* Text + Buttons */}
                        <div
                            className={`col-12 col-md-7 ${index % 2 === 0 ? 'order-md-2' : 'order-md-1'} 
                        animate__animated animate__fadeInRight`}
                        >
                            <h4 className="mt-3 mt-md-0">{speaker.name}</h4>
                            <h6 className="text-muted">{speaker.title}</h6>
                            <p>{speaker.desc}</p>

                            <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
                                <a href={speaker.socials.website} className="btn btn-outline-primary btn-sm">
                                    Website
                                </a>
                                <a href={speaker.socials.linkedin} className="btn btn-outline-secondary btn-sm">
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>

                ))}
            </div>

            <div className="white-bg my-5">
                <div className="bg_change rounded shadow-sm p-4 d-flex flex-column align-items-center gap-4">
                    <div className="w-100">
                        <h2 className={`fw-bold mb-3 ${styles.font_h2}`}>About this Event</h2>
                        <p><strong>CORP CRUNCH CONNECT</strong> presents <strong>CONSCIENCE - An ETHICAL AI EVENT</strong> for AI LEADERS!</p>
                        <p>Join us at the stunning Atlantis - The Palm for a day filled with insightful discussions, networking opportunities, and innovative ideas.</p>
                        <p>Don't miss this opportunity to connect with like-minded individuals and stay ahead in the world of AI. <strong>Secure your spot now!</strong></p>
                    </div>
                </div>

                <Link
                    href="#register"

                >
                    <div className={`position-relative ${styles.imageBanner}`}></div>
                </Link>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">Agenda</h4>
                <button
                    onClick={() => setShowFullAgenda(!showFullAgenda)}
                    className="btn btn-outline-primary btn-sm"
                >
                    {showFullAgenda ? 'Show Less' : 'Show Full Agenda'}
                </button>
            </div>

            <div className="agenda-list d-flex flex-column gap-3">
                {agendaItemsToShow.map((item, idx) => (
                    <div
                        key={idx}
                        className="agenda-item  shadow-sm p-3 white-bg rounded border-start border-3 border-primary"
                    >
                        {item.time && (
                            <small className="text-muted fw-semibold">{item.time}</small>
                        )}
                        <p className="mb-0">{item.title}</p>
                    </div>
                ))}
            </div>
            <section className="py-4">
                <div className={`${styles.event_detail} p-4 rounded shadow-sm mb-4 white-bg`}>
                    <h2 className="fw-medium mb-3">Conference Details</h2>
                    <p className="mb-1"><strong>Date & Time:</strong> Sunday, January 25, 2026 · 10:00 AM – 11:30 PM (GMT+4)</p>
                    <p className="mb-1"><strong>Location:</strong> Atlantis - The Palm, Crescent Road, Dubai, UAE</p>

                    <div
                        className="map_btn mb-3"
                        onClick={handleToggleMap}
                        aria-expanded={showMap}
                        style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        📍 {showMap ? 'Hide Map' : 'Show Map'}
                    </div>

                    {showMap && (
                        <div className="border rounded shadow-sm overflow-hidden" style={{ height: '250px', width: '40%' }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.291841410618!2d55.12026721538758!3d25.13037718393665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6b1f7e3b91a9%3A0x6b2f76dd7e99c0b3!2sAtlantis%20The%20Palm!5e0!3m2!1sen!2sae!4v1718717472993!5m2!1sen!2sae"
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                style={{ border: 0, width: '100%', height: '100%' }}
                            ></iframe>
                        </div>
                    )}
                </div>
            </section>



            <div className="container my-5" id='register'>
                <div className="row align-items-stretch g-4">
                    <div className="col-md-6 d-flex flex-column justify-content-between p-4 white-bg rounded">
                        <div className={`p-4 rounded ${styles.eventHighlight} eventDetail`}>
                            <h3 className="fw-bold mb-3">Get Ready for the Ride of a Lifetime</h3>
                            <p className="mb-2">We're coming to 3 cities across India to celebrate ethical AI:</p>
                            <ul className="list-unstyled mb-3">
                                <li><strong>Hyderabad:</strong> 26 October 2025</li>
                                <li><strong>Pune:</strong> 14 September 2025</li>
                                <li><strong>Bangalore:</strong> 5 October 2025</li>
                            </ul>

                            <p className="mb-3">Cash prizes for top participants:</p>
                            <ul className="list-unstyled mb-3">
                                <li><strong>Crunch Supreme:</strong> ₹100,000</li>
                                <li><strong>Crunch Sprinter:</strong> ₹75,000</li>
                                <li><strong>Crunch Strider:</strong> ₹50,000</li>
                            </ul>

                            <p className="mb-3">Choose your style: <strong>Go Solo</strong> or with your <strong>Ride or Die</strong>.</p>
                            <p className="mb-4 fw-semibold">
                                Tickets on <a href="https://www.eventbrite.com/e/corp-crunch-connect-conscience-an-ethical-ai-event-for-ai-tech-leaders-tickets-1410499123849" target="_blank" className={styles.ctaLink}>Eventbrite</a>.
                            </p>

                            <Link
                                target="_blank"
                                href="https://www.eventbrite.com/e/corp-crunch-connect-conscience-an-ethical-ai-event-for-ai-tech-leaders-tickets-1410499123849"
                                className={`btn btn-warning fw-bold px-4 py-2 ${styles.ctaButton}`}
                            >
                                Get Your Ticket Now
                            </Link>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className={`${styles.mobileVideoWrapper} rounded shadow-sm`}>
                            <video autoPlay muted loop controls className="w-100 h-100">
                                <source src="/assets/video/corp_event.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default CrunchEventPage
