import { useEffect, useState, useRef } from"react";
import axios from"axios";
import Slider from"react-slick";
import { ChevronLeft, ChevronRight } from"lucide-react";
import url from"../../../url";

import"slick-carousel/slick/slick.css";
import"slick-carousel/slick/slick-theme.css";
import"./ProductBanner.css";

export default function ProductBanner() {
  const [banners, setBanners] = useState<any[]>([]);
  const sliderRef = useRef<any>(null);

  useEffect(() => {
    axios.get(`${url}/admin/banner/all?deviceType=web`)
      .then(res => {
        const validBanners = res.data.data.filter(
          (b: any) =>
            b.isActive &&
            b.imageUrl &&
            b.imageUrl !== "undefined" &&
            b.imageUrl !== "null"
        );
        setBanners(validBanners);
      })
      .catch(err => {
        console.error("Banner fetch error:", err);
      });
  }, []);

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return"";
    const fullUrl = imageUrl.startsWith("http")
      ? imageUrl
      : url + imageUrl;

    return encodeURI(fullUrl);
  };

  const settings = {
    dots: true,
    infinite: true,
    centerMode: true,
    centerPadding:"60px",
    slidesToShow: 1,
    speed: 800,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    dotsClass:"slick-dots product-dots",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          centerPadding:"40px",
        }
      },
      {
        breakpoint: 768,
        settings: {
          centerPadding:"0px",
          centerMode: false,
        }
      }
    ]
  };

  if (banners.length === 0) return null;

  return (
    <section className="product-banner-section">
      <div className="product-slider-wrapper">
        <Slider ref={sliderRef} {...settings}>
          {banners.map((b, i) => (
            <div key={i} className="product-slide">
              {b.link ? (
                <a
                  href={b.link}
                  className="banner-link-wrapper"
                >
                  <div className="banner-card-container">
                    <picture>
                      {b.mobileImageUrl && (
                        <source media="(max-width: 768px)" srcSet={getImageUrl(b.mobileImageUrl)} />
                      )}
                      <img
                        src={getImageUrl(b.imageUrl)}
                        alt={b.title && b.title !== "undefined" && b.title !== "null" ? b.title : "Banner"}
                        className="banner-inner-card"
                        onError={() => {
                          setBanners((prev) => prev.filter((item) => item._id !== b._id));
                        }}
                      />
                    </picture>
                  </div>
                </a>
              ) : (
                <div className="banner-card-container">
                  <picture>
                    {b.mobileImageUrl && (
                      <source media="(max-width: 768px)" srcSet={getImageUrl(b.mobileImageUrl)} />
                    )}
                    <img
                      src={getImageUrl(b.imageUrl)}
                      alt={b.title && b.title !== "undefined" && b.title !== "null" ? b.title : "Banner"}
                      className="banner-inner-card"
                      onError={() => {
                        setBanners((prev) => prev.filter((item) => item._id !== b._id));
                      }}
                    />
                  </picture>
                </div>
              )}
            </div>
          ))}
        </Slider>

        {/* Navigation Controls */}
        <div className="product-nav-controls">
          <button
            className="p-nav-btn"
            onClick={() => sliderRef.current?.slickPrev()}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <button
            className="p-nav-btn"
            onClick={() => sliderRef.current?.slickNext()}
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}