import Link from "next/link";
import { Autoplay, Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import PostCard from "../card/PostCard";

export default function TrendingSlider({ showItem, data, isLoading }) {
  return (
    <>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={showItem}
        spaceBetween={30}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: ".block-gallery-pagination",
        }}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 30,
          },
          575: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          767: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          991: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1199: {
            slidesPerView: showItem,
            spaceBetween: 30,
          },
          1350: {
            slidesPerView: showItem,
            spaceBetween: 30,
          },
        }}
        className="swiper-wrapper"
      >
        {isLoading && (
          <>
            <SwiperSlide key="skeleton-1">
              <PostCard />
            </SwiperSlide>
            <SwiperSlide key="skeleton-2">
              <PostCard />
            </SwiperSlide>
            <SwiperSlide key="skeleton-3">
              <PostCard />
            </SwiperSlide>
            <SwiperSlide key="skeleton-4">
              <PostCard />
            </SwiperSlide>
          </>
        )}

        {!isLoading &&
          data?.map((item, index) => (
            <SwiperSlide key={item?._id || item?.id || item?.slug || `trending-${index}`} className="trending-slide">
              <PostCard item={item} />
            </SwiperSlide>
          ))}
      </Swiper>
    </>
  );
}
