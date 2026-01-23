import Link from "next/link"
import Image from "next/image"
import { Autoplay, Navigation, Pagination } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"

// Instagram images - using placeholder or actual images
const instagramImages = [
    "/assets/img/instagram/side_insta01.jpg",
    "/assets/img/instagram/side_insta02.jpg",
    "/assets/img/instagram/side_insta03.jpg",
    "/assets/img/instagram/side_insta04.jpg",
    "/assets/img/instagram/side_insta05.jpg",
    "/assets/img/instagram/side_insta06.jpg",
];

export default function InstagramSidebarSlider() {
    return (
        <>
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                slidesPerView={3}
                spaceBetween={0}
                loop={true}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                    el: '.block-gallery-pagination'
                }}
                breakpoints={{
                    320: {
                        slidesPerView: 2,
                    },
                    575: {
                        slidesPerView: 2,
                    },
                    767: {
                        slidesPerView: 3,
                    },
                    991: {
                        slidesPerView: 3,
                    },
                    1199: {
                        slidesPerView: 3,
                    },
                    1350: {
                        slidesPerView: 3,
                    },
                }}
                className="swiper-wrapper"
            >
                {instagramImages.map((img, index) => (
                    <SwiperSlide key={index}>
                        <Link 
                            target="_blank" 
                            href="https://www.instagram.com/corp.crunch/"
                            style={{ display: "block", width: "100%", height: "100%" }}
                        >
                            <Image
                                src={img}
                                alt={`Instagram post ${index + 1}`}
                                width={100}
                                height={100}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover"
                                }}
                                onError={(e) => {
                                    // Fallback to placeholder if image doesn't exist
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EInsta%3C/text%3E%3C/svg%3E";
                                }}
                            />
                        </Link>
                </SwiperSlide>
                ))}
            </Swiper>
        </>
    )
}
