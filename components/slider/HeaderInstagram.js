import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation, Pagination } from "swiper"
import { useState } from "react"

export default function HeaderInstagram() {
    const [selectedImage, setSelectedImage] = useState(null)

    const instagramImages = [
        "/assets/img/instagram/insta01.jpg",
        "/assets/img/instagram/insta02.jpg",
        "/assets/img/instagram/insta03.jpg",
        "/assets/img/instagram/insta04.jpg",
        "/assets/img/instagram/insta05.jpg",
        "/assets/img/instagram/insta06.jpg",
    ]

    const handleImageClick = (imageSrc) => {
        setSelectedImage(imageSrc)
    }

    const closeLightbox = () => {
        setSelectedImage(null)
    }

    return (
        <>
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                slidesPerView={5}
                spaceBetween={0}
                loop={true}
                pagination={{
                    clickable: true,
                    el: '.block-gallery-pagination'
                }}
                breakpoints={{
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 0,
                    },
                    575: {
                        slidesPerView: 2,
                        spaceBetween: 0,
                    },
                    767: {
                        slidesPerView: 3,
                        spaceBetween: 0,
                    },
                    991: {
                        slidesPerView: 4,
                        spaceBetween: 0,
                    },
                    1199: {
                        slidesPerView: 4,
                        spaceBetween: 0,
                    },
                    1350: {
                        slidesPerView: 5,
                        spaceBetween: 0,
                    },
                }}
                className="swiper-wrapper"
            >
                {instagramImages.map((imageSrc, index) => (
                    <SwiperSlide key={index}>
                    <div className="header__instagram-item">
                            <button
                                type="button"
                                className="popup-image"
                                onClick={() => handleImageClick(imageSrc)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    width: '100%'
                                }}
                            >
                                <img src={imageSrc} alt={`Instagram ${index + 1}`} />
                            </button>
                    </div>
                </SwiperSlide>
                ))}
            </Swiper>

            {selectedImage && (
                <div
                    className="instagram-lightbox"
                    onClick={closeLightbox}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 0, 0, 0.9)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <button
                        onClick={closeLightbox}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            fontSize: '30px',
                            cursor: 'pointer',
                            zIndex: 10000,
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        aria-label="Close"
                    >
                        ×
                    </button>
                    <img
                        src={selectedImage}
                        alt="Instagram"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            )}
        </>
    )
}
