import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import Restricted from "./Restricted";
import UnAuthorized from "./UnAuthorized";

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
        `${import.meta.env.VITE_BACKEND_URL}/api/siteData/getSiteData`
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
        `${import.meta.env.VITE_BACKEND_URL}/api/category/homePageData`
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

  // Create an array of refs for each carousel
  const carouselRefs = useRef([]);
  const [currentSlide, setCurrentSlide] = useState({});

  // Scroll to section function
  const handleScroll = (type) => {
    const element = document.getElementById(type);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getCardWidth = () => {
    if (window.innerWidth >= 1024) return 320; // lg screens
    if (window.innerWidth >= 768) return 280;  // md screens
    return 260; // sm screens
  };

  const scrollLeft = (index) => {
    if (carouselRefs.current[index]) {
      const cardWidth = getCardWidth();
      const gap = 16; // space-x-4 = 16px
      const scrollAmount = cardWidth + gap;
      carouselRefs.current[index].scrollLeft -= scrollAmount;
      
      // Update current slide indicator
      const newSlide = Math.max(0, (currentSlide[index] || 0) - 1);
      setCurrentSlide(prev => ({ ...prev, [index]: newSlide }));
    }
  };

  const scrollRight = (index) => {
    if (carouselRefs.current[index]) {
      const cardWidth = getCardWidth();
      const gap = 16; // space-x-4 = 16px
      const scrollAmount = cardWidth + gap;
      carouselRefs.current[index].scrollLeft += scrollAmount;
      
      // Update current slide indicator
      const maxSlides = allData[index]?.subCategoriesData?.length || 0;
      const newSlide = Math.min(maxSlides - 1, (currentSlide[index] || 0) + 1);
      setCurrentSlide(prev => ({ ...prev, [index]: newSlide }));
    }
  };

  const goToSlide = (carouselIndex, slideIndex) => {
    if (carouselRefs.current[carouselIndex]) {
      const cardWidth = getCardWidth();
      const gap = 16;
      const scrollAmount = (cardWidth + gap) * slideIndex;
      carouselRefs.current[carouselIndex].scrollLeft = scrollAmount;
      setCurrentSlide(prev => ({ ...prev, [carouselIndex]: slideIndex }));
    }
  };

  const renderCarousel = (item, index) => {
    const subCategories = allData[index]?.subCategoriesData || [];
    const maxVisibleSlides = Math.ceil(subCategories.length / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1));
    
    return (
      <div key={index} className="w-full max-w-7xl mx-auto pt-16 md:pt-32 px-4 md:px-6" id={item?._doc?.name}>
        {/* Category Title */}
        <div className="pb-8 md:pb-12">
          <Link to={`category/${item?._doc?._id}`} className="group">
            <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-center text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
              {allData[index]?._doc?.name}
            </h3>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-3 rounded-full transform transition-all duration-300 group-hover:w-32"></div>
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Navigation Arrows - Hidden on mobile, visible on hover on desktop */}
          <button
            onClick={() => scrollLeft(index)}
            className="nav-button absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="text-gray-600 text-sm md:text-lg" />
          </button>
          
          <button
            onClick={() => scrollRight(index)}
            className="nav-button absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next slide"
          >
            <FaChevronRight className="text-gray-600 text-sm md:text-lg" />
          </button>

          {/* Carousel Track */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 md:p-8 rounded-2xl shadow-xl overflow-hidden">
            <div
              ref={(el) => (carouselRefs.current[index] = el)}
              className="flex space-x-4 md:space-x-6 overflow-x-auto scrollbar-hide carousel-scroll snap-x"
            >
              {subCategories.map((subCat, itemIndex) => (
                <Link key={itemIndex} to={`/subCategory/${subCat?._id}`} className="snap-start">
                  <div className="relative flex-shrink-0 w-[260px] md:w-[280px] lg:w-[320px] group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    {/* Image */}
                    <div className="overflow-hidden rounded-xl">
                      <img
                        className="w-full h-[300px] md:h-[350px] lg:h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
                        src={subCat?.subCategoryThumbnail}
                        alt={subCat?.name}
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Gradient Overlay */}
                    <div className="gradient-overlay absolute inset-0 rounded-xl"></div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-all duration-400 group-hover:opacity-100 rounded-xl">
                      <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
                        <h3 className="text-white text-xl md:text-2xl font-bold mb-3 px-4">
                          {subCat?.name}
                        </h3>
                        <div className="px-6 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-black transition-all duration-300 text-sm md:text-base">
                          Explore Collection
                        </div>
                      </div>
                    </div>
                    
                    {/* Name Badge - Always Visible */}
                    <div className="absolute bottom-4 left-4 right-4 transition-opacity duration-400 group-hover:opacity-0">
                      <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                        <h3 className="text-gray-800 text-lg md:text-xl font-semibold text-center truncate">
                          {subCat?.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          {subCategories.length > 3 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.min(maxVisibleSlides, 8) }).map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  onClick={() => goToSlide(index, dotIndex)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    (currentSlide[index] || 0) === dotIndex
                      ? 'bg-blue-500 scale-110'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${dotIndex + 1}`}
                />
              ))}
            </div>
          )}
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

      <div className="bg-[url('aboutusbg.jpg')] md:p-20">
        <h1 className="text-center font-sans font-semibold text-3xl md:text-6xl pb-10">
          Our Top Categories
        </h1>
        <div className="flex flex-col md:flex-row lg:flex-row">
          {topData.map((item, index) => (
            <div
              key={index}
              className="relative flex-1 h-96 overflow-hidden transform transition-all duration-500 hover:flex-[2] group"
            >
              <img
                src={item._doc.categoryThumbnail}
                alt={item._doc.name}
                className="w-full h-full object-cover"
              />
              {/* Hover Section */}
              <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex flex-col justify-center items-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <h3 className="text-white text-2xl font-bold my-6">
                  {item._doc.name}
                </h3>
                {/* <p className="text-white text-center mb-4">{item.description}</p> */}
                <button
                  className="px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-colors duration-300"
                  onClick={() => handleScroll(item._doc.name)}
                >
                  See Category
                </button>
              </div>
              {/* Non-Hover Section */}
              <div className="absolute inset-0 flex flex-col justify-center items-center opacity-100 transition-opacity duration-500 group-hover:opacity-0">
                <h3 className="text-white bg-black bg-opacity-70 text-3xl font-bold w-56 text-center py-2">
                  {item._doc.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render each carousel section */}
      {allData.map((item, index) => renderCarousel(item, index))}
    </div>
  );
};

export default Home;
