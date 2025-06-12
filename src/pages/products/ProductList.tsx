import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, ShoppingCart, SlidersHorizontal, Search, DollarSign, SortAsc, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity]);
  const [sortBy, setSortBy] = useState("name_asc");
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(16);

  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5261/api/SanPham/ListSanPham", {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`Lỗi ${response.status}`);
        const data = await response.json();
        const mappedProducts: Product[] = data.map((product: {
          id: string; name: string; moTa?: string; hinh: string[]; donGia: number;
          loaiSanPham?: string; thuongHieu?: string; chatLieu?: string; kichThuoc: string[];
          mauSac: string[]; hot?: boolean;
        }) => ({
          id: product.id,
          name: product.name,
          description: product.moTa || `Thương hiệu: ${product.thuongHieu || "Không xác định"} <br/> Chất liệu: ${product.chatLieu || "Không xác định"}`,
          imageSrc: product.hinh[0] ? `data:image/jpeg;base64,${product.hinh[0]}` : "https://via.placeholder.com/300",
          price: product.donGia,
          category: product.loaiSanPham || "Không xác định",
          thuongHieu: product.thuongHieu || "Không xác định",
          chatLieu: product.chatLieu || "Không xác định",
          kichThuoc: product.kichThuoc || [],
          mauSac: product.mauSac || [],
          rating: 4 + Math.random() * 0.9,
          isFavorite: false,
          hot: product.hot || false,
        }));
        setOriginalProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
        setPriceRange([
          Math.floor(Math.min(...mappedProducts.map((p) => p.price))),
          Math.ceil(Math.max(...mappedProducts.map((p) => p.price))),
        ]);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
        setError("Không thể tải sản phẩm.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    if (categoryParam && !selectedCategories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
    } else if (!categoryParam && selectedCategories.length > 0) {
      setSelectedCategories([]);
    }
  }, [location.search]);

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

  const minPrice = useMemo(
    () => Math.floor(Math.min(...originalProducts.map((p) => p.price)) || 0),
    [originalProducts]
  );

  const maxPrice = useMemo(
    () => Math.ceil(Math.max(...originalProducts.map((p) => p.price)) || Infinity),
    [originalProducts]
  );

  useEffect(() => {
    let result = [...originalProducts];
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }
    if (selectedColors.length > 0) {
      result = result.filter((product) =>
        selectedColors.some((color) => product.mauSac.includes(color))
      );
    }
    if (selectedSizes.length > 0) {
      result = result.filter((product) =>
        selectedSizes.some((size) => product.kichThuoc.includes(size))
      );
    }
    if (selectedBrands.length > 0) {
      result = result.filter((product) => selectedBrands.includes(product.thuongHieu));
    }
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category));
    }
    result = result.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    result.sort((a, b) => {
      switch (sortBy) {
        case "name_asc": return a.name.localeCompare(b.name);
        case "name_desc": return b.name.localeCompare(a.name);
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "rating_desc": return b.rating - a.rating;
        default: return 0;
      }
    });
    setFilteredProducts(result);
  }, [originalProducts, searchQuery, selectedColors, selectedSizes, selectedBrands, selectedCategories, priceRange, sortBy]);

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

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPriceRange([minPrice, maxPrice]);
    setSortBy("name_asc");
  };

  const toggleFavorite = (productId: string) => {
    setOriginalProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, isFavorite: !product.isFavorite } : product
      )
    );
    setFilteredProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, isFavorite: !product.isFavorite } : product
      )
    );
  };

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
  };

  const loadMore = () => {
    setDisplayCount((prev) => prev + 16);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl py-8">
          <h1 className="text-3xl font-bold mb-6 gradient-text">Tất Cả Sản Phẩm</h1>
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-lg font-medium mb-3 block">Tìm Kiếm</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Tìm kiếm sản phẩm"
                />
              </div>
            </div>
            <div>
              <Label className="text-lg font-medium mb-3 block">Khoảng Giá</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Select
                  onValueChange={(value) => {
                    switch (value) {
                      case "all": setPriceRange([minPrice, maxPrice]); break;
                      case "under-100000": setPriceRange([0, 100000]); break;
                      case "100000-200000": setPriceRange([100000, 200000]); break;
                      case "200000-500000": setPriceRange([200000, 500000]); break;
                      case "over-500000": setPriceRange([500000, maxPrice]); break;
                    }
                  }}
                >
                  <SelectTrigger className="w-full pl-8" aria-label="Chọn khoảng giá">
                    <SelectValue placeholder="Khoảng giá" />
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
            </div>
            <div>
              <Label className="text-lg font-medium mb-3 block">Thứ Tự</Label>
              <div className="relative">
                <SortAsc className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy} aria-label="Chọn cách sắp xếp">
                  <SelectTrigger className="w-full pl-8">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name_asc">Tên: A-Z</SelectItem>
                    <SelectItem value="name_desc">Tên: Z-A</SelectItem>
                    <SelectItem value="price_asc">Giá: Thấp-Cao</SelectItem>
                    <SelectItem value="price_desc">Giá: Cao-Thấp</SelectItem>
                    <SelectItem value="rating_desc">Đánh giá: Cao nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-end gap-2 justify-end">
              <Button variant="outline" onClick={clearFilters} aria-label="Xóa bộ lọc">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Xóa bộ lọc
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                aria-label="Tắt/mở bộ lọc"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {showFilters && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label className="text-lg font-medium mb-3 block">Danh Mục</Label>
                  <div className="space-y-2">
                    {uniqueCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryChange(category)}
                          aria-label={`Chọn danh mục ${category}`}
                        />
                        <label htmlFor={`category-${category}`} className="text-sm font-medium">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-lg font-medium mb-3 block">Thương Hiệu</Label>
                  <div className="space-y-2">
                    {uniqueBrands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => handleBrandChange(brand)}
                          aria-label={`Chọn thương hiệu ${brand}`}
                        />
                        <label htmlFor={`brand-${brand}`} className="text-sm font-medium">
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-lg font-medium mb-3 block">Màu Sắc</Label>
                  <div className="space-y-2">
                    {uniqueColors.map((color) => (
                      <div key={color} className="flex items-center space-x-2">
                        <Checkbox
                          id={`color-${color}`}
                          checked={selectedColors.includes(color)}
                          onCheckedChange={() => handleColorChange(color)}
                          aria-label={`Chọn màu ${color}`}
                        />
                        <label htmlFor={`color-${color}`} className="text-sm font-medium">
                          <span
                            className="inline-block w-6 h-6 mr-2 rounded-full"
                            style={{ backgroundColor: `#${color}` }}
                          ></span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-lg font-medium mb-3 block">Kích Thước</Label>
                  <div className="space-y-2">
                    {uniqueSizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size}`}
                          checked={selectedSizes.includes(size)}
                          onCheckedChange={() => handleSizeChange(size)}
                          aria-label={`Chọn kích thước ${size}`}
                        />
                        <label htmlFor={`size-${size}`} className="text-sm font-medium">
                          {size}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {error ? (
            <div className="py-12 text-center text-red-500" role="alert">{error}</div>
          ) : isLoading ? (
            <div className="py-12 text-center">
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-600 mb-4">Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc</p>
              <Button onClick={clearFilters} aria-label="Xóa tất cả bộ lọc">
                Xóa Tất Cả Bộ Lọc
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {filteredProducts.slice(0, displayCount).map((product) => (
                  <Card key={product.id} className="overflow-hidden group">
                    <div className="relative aspect-square">
                      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
                        <img
                          src={product.imageSrc}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>
                      {product.hot && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white rounded-lg flex items-center gap-1 px-3 py-1.5">
                          <Flame className="w-4 h-4" aria-hidden="true" />
                          Đang bán chạy
                        </Badge>
                      )}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white"
                        aria-label={product.isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                      >
                        <Heart
                          className={`h-5 w-5 ${product.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                        />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
                        <h3 className="text-lg font-semibold hover:text-crocus-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-lg font-bold">{formatter.format(product.price)}</p>
                        <div className="flex space-x-1" aria-label={`Đánh giá ${product.rating} sao`}>
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
                            className="inline-block w-6 h-6 rounded-full"
                            style={{ backgroundColor: `#${color}` }}
                          ></span>
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
                          <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
                            Chi tiết
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-crocus-500 hover:bg-crocus-600"
                          onClick={() => handleBuyNow(product)}
                          aria-label={`Mua ngay ${product.name}`}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Mua ngay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {displayCount < filteredProducts.length && (
                <div className="mt-8 text-center">
                  <Button onClick={loadMore} aria-label="Xem thêm sản phẩm">
                    Xem Thêm
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductListing;