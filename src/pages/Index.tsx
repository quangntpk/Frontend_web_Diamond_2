import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/default/HeroSection";
import Newsletter from "@/components/default/Newsletter";
import Features from "@/components/default/Features";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CartItem } from "@/types/cart";

// Định nghĩa interface cho dữ liệu từ API (Products)
interface ApiProduct {
  id: string;
  name: string;
  thuongHieu: string;
  loaiSanPham: string;
  kichThuoc: string[];
  soLuong: number;
  donGia: number;
  moTa: string | null;
  chatLieu: string;
  mauSac: string[];
  hinh: string[];
  ngayTao: string;
  trangThai: number;
  soLuongDaBan: number;
  hot: boolean;
}

// Định nghĩa interface cho dữ liệu từ API (Combos)
interface ApiComboSanPham {
  idSanPham: string;
  name: string;
  thuongHieu: string;
  loaiSanPham: string;
  kichThuoc: string[];
  soLuong: number;
  donGia: number;
  moTa: string | null;
  chatLieu: string;
  mauSac: string[];
  hinh: string[];
  ngayTao: string;
  trangThai: number;
}

interface ApiCombo {
  maCombo: number;
  name: string;
  hinhAnh: string;
  ngayTao: string;
  trangThai: number;
  sanPhams: ApiComboSanPham[];
  moTa: string;
  gia: number;
  soLuong: number;
}

// Interface cho Product
interface Product {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  price: number;
  sizes: string[];
  colors: string[];
  rating: number;
  isFavorite: boolean;
  hot: boolean;
}

// Interface cho Combo
interface Combo {
  id: number;
  name: string;
  description: string;
  imageSrc: string;
  price: number;
  products: string[];
  rating: number;
  isFavorite: boolean;
}

const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

// Component cho ProductCard
const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(product.isFavorite);
  const ref = useRef<HTMLDivElement>(null);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích",
      description: `${product.name} đã được ${isFavorite ? "xóa khỏi" : "thêm vào"} danh sách yêu thích.`,
    });
  };

  const handleBuyNow = () => {
    const cartItem: CartItem = {
      id: parseInt(product.id), // Convert string ID to number
      name: product.name,
      image: product.imageSrc,
      price: product.price,
      quantity: 1,
      type: "product",
    };
    console.log("Đã thêm vào giỏ hàng:", cartItem);
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} đã được thêm vào giỏ hàng của bạn.`,
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <Card className="overflow-hidden group">
        <div className="relative aspect-square">
          <Link to={`/products/${product.id}`}>
            <img
              src={
                product.imageSrc
                  ? `data:image/jpeg;base64,${product.imageSrc}`
                  : "/placeholder-image.jpg"
              }
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          {product.hot && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              Đang bán chạy
            </Badge>
          )}
          <button
            onClick={toggleFavorite}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </button>
        </div>
        <CardContent className="p-4">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-medium hover:text-crocus-600 transition-colors">{product.name}</h3>
          </Link>
          <div className="flex justify-between items-center mt-2">
            <p className="font-semibold">{formatter.format(product.price)}</p>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                  stroke={i < Math.floor(product.rating) ? "none" : "currentColor"}
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {product.colors.slice(0, 3).map((color) => (
              <span key={color} className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full">
                {color}
              </span>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {product.sizes.slice(0, 3).map((size) => (
              <span key={size} className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full">
                {size}
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link to={`/products/${product.id}`}>Chi tiết</Link>
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-crocus-500 hover:bg-crocus-600"
              onClick={handleBuyNow}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Mua ngay
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Component cho ComboCard
const ComboCard = ({ combo, index }: { combo: Combo; index: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(combo.isFavorite);
  const ref = useRef<HTMLDivElement>(null);

  const handleBuyNow = () => {
    const cartItem: CartItem = {
      id: combo.id, // Already a number
      name: combo.name,
      image: combo.imageSrc,
      price: combo.price,
      quantity: 1,
      type: "combo",
    };
    console.log("Đã thêm vào giỏ hàng:", cartItem);
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${combo.name} đã được thêm vào giỏ hàng của bạn.`,
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích",
      description: `${combo.name} đã được ${isFavorite ? "xóa khỏi" : "thêm vào"} danh sách yêu thích.`,
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <Card className="overflow-hidden group">
        <div className="relative aspect-video bg-gray-100">
          <Link to={`/combos/${combo.id}`}>
            <img
              src={
                combo.imageSrc
                  ? `data:image/jpeg;base64,${combo.imageSrc}`
                  : "/placeholder-image.jpg"
              }
              alt={combo.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <button
            onClick={toggleFavorite}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </button>
        </div>
        <CardContent className="p-4">
          <Link to={`/combos/${combo.id}`}>
            <h3 className="font-medium hover:text-crocus-600 transition-colors">{combo.name}</h3>
          </Link>
          <div className="flex justify-between items-center mt-1">
            <p className="font-semibold">{formatter.format(combo.price)}</p>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={i < Math.floor(combo.rating) ? "currentColor" : "none"}
                  stroke={i < Math.floor(combo.rating) ? "none" : "currentColor"}
                  className={`w-4 h-4 ${i < Math.floor(combo.rating) ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link to={`/combos/${combo.id}`}>Chi tiết</Link>
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-crocus-500 hover:bg-crocus-600"
              onClick={handleBuyNow}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Mua ngay
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Blog data (unchanged)
const featuredBlogs = [
  {
    id: "1",
    title: "Bộ sưu tập Hè 2025",
    excerpt: "Khám phá bộ sưu tập hè mới với xu hướng thời trang hot nhất cùng màu Pantone 2025.",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&h=450",
    date: "15 tháng 4, 2025",
    author: "Emma Johnson",
    authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&h=60",
    category: "sản phẩm",
  },
  {
    id: "2",
    title: "Cách phối đồ với màu Tím Crocus",
    excerpt: "Học cách kết hợp màu Tím Crocus thịnh hành vào tủ quần áo của bạn trong mùa này.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&h=450",
    date: "10 tháng 4, 2025",
    author: "Michael Chen",
    authorImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=60&h=60",
    category: "sản phẩm",
  },
  {
    id: "3",
    title: "Kết hợp trang phục hoàn hảo",
    excerpt: "Khám phá các kết hợp trang phục được tuyển chọn để nâng tầm phong cách của bạn.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&h=450",
    date: "5 tháng 4, 2025",
    author: "Sophia Rodriguez",
    authorImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=60&h=60",
    category: "combo",
  },
];

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCombos, setLoadingCombos] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [errorCombos, setErrorCombos] = useState<string | null>(null);

  const transformProductApiData = (apiData: ApiProduct[]): Product[] => {
    return apiData.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.moTa || `Thương hiệu: ${item.thuongHieu} <br/> Chất liệu: ${item.chatLieu}`,
      imageSrc: item.hinh[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3C/svg%3E",
      price: item.donGia,
      sizes: item.kichThuoc,
      colors: item.mauSac,
      rating: 4 + Math.random() * 0.9, // Random rating for demo
      isFavorite: false,
      hot: item.hot,
    }));
  };

  const transformComboApiData = (apiData: ApiCombo[]): Combo[] => {
    return apiData.map((item) => ({
      id: item.maCombo,
      name: item.name || "Không có tên",
      description: item.moTa || "Không có mô tả",
      imageSrc: item.hinhAnh || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3C/svg%3E",
      price: item.gia || 0,
      products: Array.isArray(item.sanPhams) ? item.sanPhams.map((p) => p.name || "Không có tên") : [],
      rating: 4 + Math.random() * 0.9, // Random rating for demo
      isFavorite: false,
    }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch("http://localhost:5261/api/SanPham/ListSanPham");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data: ApiProduct[] = await response.json();
        const transformedProducts = transformProductApiData(data);
        setProducts(transformedProducts);
      } catch (err) {
        setErrorProducts(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoadingProducts(false);
      }
    };

    const fetchCombos = async () => {
      try {
        setLoadingCombos(true);
        const response = await fetch("http://localhost:5261/api/Combo/ComboSanPhamView");
        if (!response.ok) {
          throw new Error("Failed to fetch combos");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("API response is not an array");
        }
        const transformedCombos = transformComboApiData(data);
        setCombos(transformedCombos);
      } catch (err) {
        setErrorCombos(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoadingCombos(false);
      }
    };

    fetchProducts();
    fetchCombos();
  }, []);

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <HeroSection />

      {/* Features */}
      <Features />

      {/* Featured Products */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Sản phẩm</h2>
          <Button asChild variant="link" className="text-crocus-600">
            <Link to="/products">
              Xem tất cả <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>

        {loadingProducts ? (
          <div className="text-center">Đang tải sản phẩm...</div>
        ) : errorProducts ? (
          <div className="text-center text-red-500">Lỗi: {errorProducts}</div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent>
              {products.map((product, index) => (
                <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4">
                  <ProductCard product={product} index={index} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}
      </section>

      {/* Trending Combos */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Combo</h2>
          <Button asChild variant="link" className="text-crocus-600">
            <Link to="/combos">
              Xem tất cả <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>

        {loadingCombos ? (
          <div className="text-center">Đang tải combo...</div>
        ) : errorCombos ? (
          <div className="text-center text-red-500">Lỗi: {errorCombos}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {combos.map((combo, index) => (
              <ComboCard key={combo.id} combo={combo} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Blog Posts
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Bài viết</h2>
          <Button asChild variant="link" className="text-crocus-600">
            <Link to="/blogs">
              Xem tất cả <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredBlogs.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section> */}

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
};

export default Index;