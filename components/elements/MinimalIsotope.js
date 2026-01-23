import data from "@/util/blogData"
import Isotope from "isotope-layout"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export default function MinimalIsotope() {
    const isotope = useRef()
    const [displayCount, setDisplayCount] = useState(9)
    const totalItems = data.length
    const itemsToShow = data.slice(114, 114 + displayCount)

    useEffect(() => {
        setTimeout(() => {
            if (isotope.current) {
                isotope.current.destroy()
            }
            isotope.current = new Isotope(".minimal__post-wrapper", {
                itemSelector: ".minimal__post-item",
                percentPosition: true,
                masonry: {
                    columnWidth: ".minimal__post-item",
                },
                animationOptions: {
                    duration: 750,
                    easing: "linear",
                    queue: false,
                },
            })
        }, 100)

        return () => {
            if (isotope.current) {
                isotope.current.destroy()
            }
        }
    }, [displayCount])

    const handleLoadMore = () => {
        setDisplayCount(prev => Math.min(prev + 9, totalItems))
    }

    return (
        <>
            <section className="minimal__post-area pt-80 pb-80">
                <div className="container">
                    <div className="minimal__post-wrapper">
                        {itemsToShow.map((item, i) => (
                            <div className="minimal__post-item grid-item" key={i}>
                                <div className="minimal__post-thumb tgImage__hover">
                                    <div className="minimal__post-tags">
                                        <Link href={`/category/${item.categoryId || 1}`}>{item.category}</Link>
                                    </div>
                                    <Link href={`/blog/${item.id || item.slug || '1'}`}>
                                        <img src={`/assets/img/${item.group}/${item.img}`} alt="img" />
                                    </Link>
                                </div>
                                <div className="minimal__post-content">
                                    <ul className="tgbanner__content-meta list-wrap">
                                        <li><span className="by">By</span> <Link href="/blog">miranda h.</Link></li>
                                        <li>nov 21, 2022</li>
                                    </ul>
                                    <h4 className="title tgcommon__hover">
                                        <Link href={`/blog/${item.id || item.slug || '1'}`}>{item.title}</Link>
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                    {displayCount < totalItems && (
                    <div className="minimal__post-more text-center">
                            <button 
                                onClick={handleLoadMore}
                                className="btn"
                                type="button"
                            >
                                <span className="text">Load More</span> 
                                <i className="far fa-plus" />
                            </button>
                    </div>
                    )}
                </div>
            </section>
        </>
    )
}