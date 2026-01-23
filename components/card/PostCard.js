import { useState } from "react";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import Image from "next/image";
import { formatNumber } from "@/util";
import { getBlogPostUrl, getCategoryUrl } from "@/util/urlHelpers";

const PostCard = ({ item }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (!item) {
    return (
      <div className="trending__post">
        <div className="trending__post-thumb tgImage__hover">
          <Skeleton height={200} />
        </div>
        <div className="trending__post-content">
          <ul className="tgbanner__content-meta list-wrap">
            <li className="category">
              <Skeleton width={100} />
            </li>
            <li>
              <Skeleton width={100} />
            </li>
          </ul>
          <h4 className="title tgcommon__hover">
            <Skeleton width={200} />
          </h4>
          <ul className="post__activity list-wrap">
            <li>
              <Skeleton width={50} />
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="trending__post animate-on-view">
      <div className="trending__post-thumb tgImage__hover">
        <Link href={getBlogPostUrl(item)}>
          {item?.bannerImageUrl && (
            <>
              {!imageLoaded && <Skeleton height={200} />}
              <Image
                height={200}
                width={300}
                src={item?.bannerImageUrl}
                className="trending__post-image"
                alt={item?.title}
                onLoad={handleImageLoad}
                quality={80}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                unoptimized={item?.bannerImageUrl?.startsWith('http://') || item?.bannerImageUrl?.startsWith('https://')}
              />
            </>
          )}
        </Link>
        {item?.isPublished && (
          <span className="is_trend">
            <i className="fas fa-bolt" />
          </span>
        )}
      </div>
      <div className="trending__post-content">
        <ul className="tgbanner__content-meta list-wrap">
          <li className="category">
            <Link href={getCategoryUrl(item?.Category)}>
              {item?.Category?.name}
            </Link>
          </li>
          <li>
            <span className="by">By</span>{" "}
            Mike Evans
          </li>
        </ul>
        <h4 className="title tgcommon__hover">
          <Link href={getBlogPostUrl(item)}>{item?.title}</Link>
        </h4>
        <ul className="post__activity list-wrap">
          <li>
            <i className="fal fa-eye" /> {formatNumber(item?.viewsCount || 0)}
          </li>
          <li>
            <i className="fal fa-share-alt" /> {formatNumber(item?.sharesCount || 0)}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PostCard;
