import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import Restricted from "./Restricted";
import UnAuthorized from "./UnAuthorized";
import { BACKEND_URL } from "@/config";

const Home = () => {
  const { user } = useAuthContext();

  const [allData, setAllData] = useState([]);
  const [topData, setTopData] = useState([]);

  const [logo, setLogo] = useState("");
  const [homeBanner, setHomeBanner] = useState("");
  const [homeSlogan, setHomeSlogan] = useState("");
  const [homeSmallText, setHomeSmallText] = useState("");
  // Fetch current site data on component mount
  useEffect(() => {
    const fetchSiteData = async () => {
      const response = await fetch(
        `${BACKEND_URL}/api/siteData/getSiteData`
      );
      const data = await response.json();
      setLogo(data.logo);
      setHomeBanner(data.homeBanner);
      setHomeSlogan(data.homeSlogan);
      setHomeSmallText(data.homeSmallText);
    };
    fetchSiteData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/category/homePageData`
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setAllData(data);
      let dex = [];
      if (data.length < 4) {
        dex = data;
      } else {
        for (let i = 0; i < 4; i++) {
          dex.push(data[i]);
        }
      }
      setTopData(dex);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allData.length > 0) {
      console.log("ERERERER", allData);
    }
  }, [allData]);

  // Ref + scroll handler for the "Our Top Categories" carousel
  const topCategoriesRef = useRef(null);

  const scrollTopCategories = (direction) => {
    if (topCategoriesRef.current) {
      const track = topCategoriesRef.current;
      const firstCard = track.querySelector("[data-category-card]");
      // Scroll by one card width + gap so each step lands with the next card peeking
      const scrollAmount = firstCard
        ? firstCard.offsetWidth + 24
        : track.clientWidth / 3 + 24;
      track.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Scroll to section function
  const handleScroll = (type) => {
    const element = document.getElementById(type);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderCategorySection = (item, index) => {
    // Show at most 8 products: 2 rows × 4 cards
    const products = (allData[index]?.productsData || []).slice(0, 8);

    return (
      <div
        key={index}
        className="w-full max-w-7xl mx-auto pt-16 md:pt-24 px-4 md:px-6 bg-white"
        id={item?.name}
      >
        {/* Category Title — left aligned, no underline */}
        <div className="pb-6 md:pb-8">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-left text-gray-800">
            {allData[index]?.name}
          </h3>
        </div>

        {/* Product grid — 2 rows of 4 on desktop; 2 cols on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product, itemIndex) => (
            <Link
              key={itemIndex}
              to={`/productDetails/${product?.slug || product?._id}`}
              className="block"
            >
              <div className="relative w-full aspect-square group overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={product?.productThumbnail}
                  alt={product?.name}
                  loading="lazy"
                />
                <div className="gradient-overlay absolute inset-0"></div>
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-all duration-400 group-hover:opacity-100">
                  <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
                    <h3 className="text-white text-base md:text-lg font-bold mb-2 px-3">
                      {product?.name}
                    </h3>
                    <div className="inline-block px-4 py-2 border border-white text-white font-semibold hover:bg-white hover:text-black transition-all duration-300 text-xs md:text-sm whitespace-nowrap">
                      View Product
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 transition-opacity duration-400 group-hover:opacity-0">
                  <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5">
                    <h3 className="text-gray-800 text-sm md:text-base font-semibold text-center truncate">
                      {product?.name}
                    </h3>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All — centered, goes to category page */}
        <div className="flex justify-center mt-8 md:mt-10 pb-4">
          <Link
            to={`/category/${item?.slug || item?._id}`}
            className="px-8 py-2.5 bg-gray-900 border border-gray-900 text-white font-medium hover:bg-white hover:text-gray-900 transition-colors duration-300"
          >
            View All
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Background Image */}
      <div
        className={`bg-fixed bg-cover bg-center w-full relative`}
        style={{ backgroundImage: `url(${homeBanner})` }} // Use dynamic banner image
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div>
          <div className="relative z-10 py-[300px] text-center">
            <h1 className="md:text-8xl text-4xl  text-white pb-5">{homeSlogan}</h1>
            <h3 className="md:text-3xl text-3xl w-3/4 mx-auto text-slate-300">{homeSmallText}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white md:p-20 py-12">
        <h1 className="text-center font-sans font-semibold text-3xl md:text-6xl pb-10">
          Our Top Categories
        </h1>
        <div className="relative max-w-[1700px] mx-auto px-4 md:px-8">
          {/* Left Arrow */}
          <button
            onClick={() => scrollTopCategories("left")}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-[60] w-11 h-11 md:w-14 md:h-14 bg-white/70 backdrop-blur-md border border-white/60 text-gray-700 shadow-md hover:shadow-xl hover:bg-white hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 ease-out"
            aria-label="Previous categories"
          >
            <FaChevronLeft className="text-base md:text-xl" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollTopCategories("right")}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-[60] w-11 h-11 md:w-14 md:h-14 bg-white/70 backdrop-blur-md border border-white/60 text-gray-700 shadow-md hover:shadow-xl hover:bg-white hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 ease-out"
            aria-label="Next categories"
          >
            <FaChevronRight className="text-base md:text-xl" />
          </button>

          {/* Scrollable Track — mobile shows ~82% of a card so the next peeks ~10–15% */}
          <div
            ref={topCategoriesRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide carousel-scroll snap-x snap-mandatory px-1"
          >
            {allData.map((item, index) => (
            <div
              key={index}
              data-category-card
              className="snap-start relative flex-shrink-0 w-[82%] md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] lg:hover:w-[calc((100%-3rem)/3+90px)] h-[420px] overflow-hidden rounded-2xl transform transition-all duration-500 group"
            >
              <img
                src={item.categoryThumbnail}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex flex-col justify-center items-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <h3 className="text-white text-2xl font-bold my-6">
                  {item.name}
                </h3>
                <button
                  className="px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-colors duration-300"
                  onClick={() => handleScroll(item.name)}
                >
                  See Category
                </button>
              </div>
              <div className="absolute inset-0 flex flex-col justify-center items-center opacity-100 transition-opacity duration-500 group-hover:opacity-0">
                <h3 className="text-white bg-black bg-opacity-70 text-3xl font-bold w-56 text-center py-2">
                  {item.name}
                </h3>
              </div>
            </div>
            ))}
          </div>
        </div>
      </div>

      {/* Render each category product section */}
      {allData.map((item, index) => renderCategorySection(item, index))}
    </div>
  );
};

export default Home;
