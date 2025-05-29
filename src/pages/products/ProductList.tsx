import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, ShoppingCart, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  price: number;
  category: string;
  thuongHieu: string;
  chatLieu: string;
  kichThuoc: string[];
  mauSac: string[];
  rating: number;
  isFavorite: boolean;
  hot: boolean;
}

const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const ProductListing = () => {
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sortBy, setSortBy] = useState("name_asc");
  const [showFilters, setShowFilters] = useState(false);

  const location = useLocation();

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5261/api/SanPham/ListSanPham");
        if (!response.ok) {
          throw new Error("Không thể tải danh sách sản phẩm");
        }
        const data = await response.json();

        const mappedProducts = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.moTa || `Thương hiệu: ${product.thuongHieu} <br/> Chất liệu: ${product.chatLieu}`,
          imageSrc: product.hinh[0] ? `data:image/jpeg;base64,${product.hinh[0]}` : "/placeholder-image.jpg",
          price: product.donGia,
          category: product.loaiSanPham || "Không xác định",
          thuongHieu: product.thuongHieu || "Không xác định",
          chatLieu: product.chatLieu || "Không xác định",
          kichThuoc: product.kichThuoc || [],
          mauSac: product.mauSac || [],
          rating: 4 + Math.random() * 0.9, // Đánh giá ngẫu nhiên cho demo
          isFavorite: false,
          hot: product.hot || false,
        }));

        setOriginalProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
        toast({
          title: "Lỗi",
          description: "Không thể tải sản phẩm",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Xử lý tham số danh mục từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    if (categoryParam && !selectedCategories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
    }
  }, [location.search]);

  // Lấy danh sách màu sắc, kích thước, thương hiệu, danh mục duy nhất
  const uniqueColors = useMemo(
    () => [...new Set(originalProducts.flatMap((product) => product.mauSac))].sort(),
    [originalProducts]
  );

  const uniqueSizes = useMemo(
    () => [...new Set(originalProducts.flatMap((product) => product.kichThuoc))].sort(),
    [originalProducts]
  );

  const uniqueBrands = useMemo(
    () => [...new Set(originalProducts.map((product) => product.thuongHieu))].sort(),
    [originalProducts]
  );

  const uniqueCategories = useMemo(
    () => [...new Set(originalProducts.map((product) => product.category))].sort(),
    [originalProducts]
  );

  // Tính toán giá tối thiểu và tối đa
  const minPrice = useMemo(
    () => Math.floor(Math.min(...originalProducts.map((p) => p.price))),
    [originalProducts]
  );

  const maxPrice = useMemo(
    () => Math.ceil(Math.max(...originalProducts.map((p) => p.price))),
    [originalProducts]
  );

  // Lọc và sắp xếp sản phẩm
  useEffect(() => {
    let result = [...originalProducts];

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    // Lọc theo màu sắc
    if (selectedColors.length > 0) {
      result = result.filter((product) =>
        product.mauSac.some((color) => selectedColors.includes(color))
      );
    }

    // Lọc theo kích thước
    if (selectedSizes.length > 0) {
      result = result.filter((product) =>
        product.kichThuoc.some((size) => selectedSizes.includes(size))
      );
    }

    // Lọc theo thương hiệu
    if (selectedBrands.length > 0) {
      result = result.filter((product) => selectedBrands.includes(product.thuongHieu));
    }

    // Lọc theo danh mục
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category));
    }

    // Lọc theo khoảng giá
    if (priceRange[0] > 0 || priceRange[1] > 0) {
      result = result.filter(
        (product) =>
          (priceRange[0] === 0 || product.price >= priceRange[0]) &&
          (priceRange[1] === 0 || product.price <= priceRange[1])
      );
    }

    // Sắp xếp sản phẩm
    switch (sortBy) {
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating_desc":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [
    originalProducts,
    searchQuery,
    selectedColors,
    selectedSizes,
    selectedBrands,
    selectedCategories,
    priceRange,
    sortBy,
  ]);

  // Xử lý thay đổi bộ lọc
  const handleColorChange = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSizeChange = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Xóa bộ lọc
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPriceRange([0, 0]);
    setSortBy("name_asc");
    setShowFilters(false);
    toast({
      title: "Đã xóa bộ lọc",
      description: "Tất cả bộ lọc đã được đặt lại về mặc định.",
    });
  };

  // Áp dụng bộ lọc (cho mobile)
  const applyFilters = () => {
    setShowFilters(false);
    toast({
      title: "Đã áp dụng bộ lọc",
      description: "Bộ lọc sản phẩm của bạn đã được áp dụng.",
    });
  };

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Tìm kiếm",
      description: `Đã tìm kiếm: ${searchQuery}`,
    });
  };

  // Xử lý yêu thích
  const toggleFavorite = (productId: string) => {
    setFilteredProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, isFavorite: !product.isFavorite } : product
      )
    );
    setOriginalProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, isFavorite: !product.isFavorite } : product
      )
    );
    toast({
      title: "Đã cập nhật yêu thích",
      description: "Danh sách yêu thích của bạn đã được cập nhật.",
    });
  };

  // Xử lý mua ngay
  const handleBuyNow = (product: Product) => {
    const cartItem = {
      id: product.id,
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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl py-8">
          <h1 className="text-3xl font-bold mb-6 gradient-text">Tất Cả Sản Phẩm</h1>

          {/* Thanh tìm kiếm và nút bộ lọc */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm" className="ml-2">
                Tìm kiếm
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="ml-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Bộ lọc */}
          {showFilters && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Danh mục */}
                <div>
                  <Label className="text-lg font-medium mb-3 block">Danh Mục</Label>
                  <div className="space-y-2">
                    {uniqueCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryChange(category)}
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thương hiệu */}
                <div>
                  <Label className="text-lg font-medium mb-3 block">Thương Hiệu</Label>
                  <div className="space-y-2">
                    {uniqueBrands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => handleBrandChange(brand)}
                        />
                        <label
                          htmlFor={`brand-${brand}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Màu sắc */}
                <div>
                  <Label className="text-lg font-medium mb-3 block">Màu Sắc</Label>
                  <div className="space-y-2">
                    {uniqueColors.map((color) => (
                      <div key={color} className="flex items-center space-x-2">
                        <Checkbox
                          id={`color-${color}`}
                          checked={selectedColors.includes(color)}
                          onCheckedChange={() => handleColorChange(color)}
                        />
                        <label
                          htmlFor={`color-${color}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {color}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kích thước */}
                <div>
                  <Label className="text-lg font-medium mb-3 block">Kích Thước</Label>
                  <div className="space-y-2">
                    {uniqueSizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size}`}
                          checked={selectedSizes.includes(size)}
                          onCheckedChange={() => handleSizeChange(size)}
                        />
                        <label
                          htmlFor={`size-${size}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {size}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Khoảng giá */}
                <div>
                  <Label className="text-lg font-medium mb-3 block">Khoảng Giá</Label>
                  <Select
                    onValueChange={(value) => {
                      switch (value) {
                        case "all":
                          setPriceRange([0, 0]);
                          break;
                        case "under-100000":
                          setPriceRange([0, 100000]);
                          break;
                        case "100000-200000":
                          setPriceRange([100000, 200000]);
                          break;
                        case "200000-500000":
                          setPriceRange([200000, 500000]);
                          break;
                        case "over-500000":
                          setPriceRange([500000, maxPrice]);
                          break;
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn khoảng giá" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả giá</SelectItem>
                      <SelectItem value="under-100000">Dưới 100,000 VND</SelectItem>
                      <SelectItem value="100000-200000">100,000 - 200,000 VND</SelectItem>
                      <SelectItem value="200000-500000">200,000 - 500,000 VND</SelectItem>
                      <SelectItem value="over-500000">Trên 500,000 VND</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sắp xếp */}
                <div>
                  <Label className="text-lg font-medium mb-3 block">Sắp Xếp Theo</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn cách sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name_asc">Tên: A đến Z</SelectItem>
                      <SelectItem value="name_desc">Tên: Z đến A</SelectItem>
                      <SelectItem value="price_asc">Giá: Thấp đến Cao</SelectItem>
                      <SelectItem value="price_desc">Giá: Cao đến Thấp</SelectItem>
                      <SelectItem value="rating_desc">Đánh giá: Cao nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <Button variant="outline" onClick={clearFilters}>
                  Xóa Bộ Lọc
                </Button>
                <Button onClick={applyFilters}>Áp Dụng Bộ Lọc</Button>
              </div>
            </div>
          )}

          {/* Kết quả tìm kiếm */}
          {error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : isLoading ? (
            <div className="py-12 text-center">
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-600 mb-4">Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc</p>
              <Button onClick={clearFilters}>Xóa Tất Cả Bộ Lọc</Button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600">{filteredProducts.length} sản phẩm được tìm thấy</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden group">
                    <div className="relative aspect-square">
                      <Link to={`/product/${product.id}`}>
                        <img
                          src={product.imageSrc}
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
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
                      >
                        <Heart
                          className={`h-5 w-5 ${product.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                        />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-medium hover:text-crocus-600 transition-colors">
                          {product.name}
                        </h3>
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
                        {product.mauSac.slice(0, 3).map((color) => (
                          <span
                            key={color}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {product.kichThuoc.slice(0, 3).map((size) => (
                          <span
                            key={size}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Link to={`/product/${product.id}`}>
                            Chi tiết
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-crocus-500 hover:bg-crocus-600"
                          onClick={() => handleBuyNow(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Mua ngay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductListing;