import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const Category = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState(null);

  const fetchCategory = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/category/` + id
      );
      if (!response.ok) throw new Error("Failed to fetch Category");
      const data = await response.json();
      setCategory(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/subCategory/getSubCategoriesByCategoryId/` + id
      );
      if (!response.ok) throw new Error("Failed to fetch Category");
      const data = await response.json();
      setSubCategories(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  useEffect(() => {
    if (category) {
      fetchSubCategories();
      console.log("Category:", category);
    }
  }, [category]);

  useEffect(() => {
    if (subCategories) {
      console.log("SubCategories:", subCategories);
    }
  }, [subCategories]);

  const [searchTerm, setSearchTerm] = useState(""); // State for the search term
  // Filter products based on the search term
  const filteredProducts = subCategories?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const { user } = useAuthContext();
  if (!user) {
    return (
      <div className="h-[100vh] flex flex-col justify-center  bg-slate-300 gap-10">
        <div className="md:text-5xl text-3xl text-center">You are Not Logged in.!.</div>
        <div className="md:text-3xl text-2xl text-center">Please Sign Up</div>
        <div className="flex justify-center gap-3">
          <Link to={'/login'} className="px-3 py-2 bg-emerald-700 rounded-md text-xl text-white">
            <button>Login</button>
          </Link>
          <Link to={'/signup'} className="px-3 py-2 bg-slate-700 rounded-md text-xl text-white">
            <button>SignUp</button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.user?.permission === false) {
    return (
      <div className="h-[100vh] flex flex-col justify-center">
        <div className="md:text-5xl text-3xl text-center">
          Please Wait Until Admin gives you Access to the Site
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className="bg-fixed bg-cover bg-center w-full relative"
        style={{
          backgroundImage: `url(${category?.bannerImage || ""})`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div>
          <div className="relative z-10 py-[200px] text-center">
            <h1 className="text-8xl text-white pb-5">{category?.name}</h1>
            <h3 className="text-3xl text-slate-300">
              {category?.slogan||""}
            </h3>
          </div>
        </div>
      </div>
      <div className="w-3/4 mx-auto pt-32">
        <div className="mb-20 flex justify-center gap-2">
        <label className="input input-bordered flex items-center gap-2 w-1/3">
            <input
              type="text"
              className="grow"
              placeholder="Search"
              value={searchTerm} // Bind searchTerm to the input
              onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on change
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
          <button className="bg-[#212121] text-white w-32 rounded-lg">
            Filter
          </button>
        </div>
        <div className="grid grid-cols-4 gap-16">
          {filteredProducts?.map((sc) => (
            <Link key={sc.id} to={`/subCategory/${sc._id}`}>
              <Card subCategory={sc} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// New Card component for each subCategory
const Card = ({ subCategory }) => {
  const [isHovered, setIsHovered] = useState(false); // Local hover state for each card

  return (
    <div
      className="border rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative min-w-full h-[350px]">
        <img
          className="w-full rounded-lg h-[350px] object-cover"
          src={subCategory?.subCategoryThumbnail}
          alt=""
        />
        <div className="overlay h-full hover-effect z-40 absolute inset-0 flex items-center justify-center">
          <div
            className={`text-white z-50 text-lg transition-opacity ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {subCategory?.name}
          </div>
        </div>
      </div>
      <div className="p-2">
        <h3 className="text-2xl text-center">{subCategory?.name}</h3>
      </div>
    </div>
  );
};

export default Category;
