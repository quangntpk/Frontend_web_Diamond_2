import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

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

// Interface cho Combo
interface Combo {
  id: number;
  name: string;
  description: string;
  imageSrc: string;
  price: number;
  products: string[];
  productCount: number;
  rating: number;
  isFavorite: boolean;
  occasion: string;
}

const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const CombosList = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [filteredCombos, setFilteredCombos] = useState<Combo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minItems, setMinItems] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sortBy, setSortBy] = useState("name_asc");
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Lấy danh sách combo từ API
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5261/api/Combo/ComboSanPhamView");
        if (!response.ok) {
          console.log("Error rồi")
          throw new Error("Không thể tải danh sách combo");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Dữ liệu API không phải là mảng");
        }

        const transformedCombos = data.map((item: ApiCombo) => ({
          id: item.maCombo,
          name: item.name || "Không có tên",
          description: item.moTa || "Không có mô tả",
          imageSrc:
            item.hinhAnh
              ? `data:image/jpeg;base64,${item.hinhAnh}`
              : "/placeholder-image.jpg",
          price: item.gia || 0,
          products: Array.isArray(item.sanPhams)
            ? item.sanPhams.map((p) => p.name || "Không có tên")
            : [],
          productCount: Array.isArray(item.sanPhams) ? item.sanPhams.length : 0,
          rating: 4 + Math.random() * 0.9, // Đánh giá ngẫu nhiên cho demo
          isFavorite: false,
          occasion: item.moTa?.includes("Casual")
            ? "Casual"
            : item.moTa?.includes("Office")
            ? "Office"
            : item.moTa?.includes("Evening")
            ? "Evening"
            : item.moTa?.includes("Athletic")
            ? "Athletic"
            : "Other", // Gán dịp sử dụng dựa trên mô tả (có thể cần điều chỉnh)
        }));

        setCombos(transformedCombos);
        setFilteredCombos(transformedCombos);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy combo:", err);
        setError("Không thể tải combo. Vui lòng thử lại sau.");
        toast({
          title: "Lỗi",
          description: "Không thể tải combo",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCombos();
  }, []);

  // Lấy danh sách dịp sử dụng duy nhất
  const uniqueOccasions = useMemo(
    () => [...new Set(combos.map((combo) => combo.occasion))].sort(),
    [combos]
  );

  // Tính toán giá tối thiểu và tối đa
  const minPrice = useMemo(
    () => (combos.length > 0 ? Math.floor(Math.min(...combos.map((c) => c.price))) : 0),
    [combos]
  );
  const maxPrice = useMemo(
    () => (combos.length > 0 ? Math.ceil(Math.max(...combos.map((c) => c.price))) : 0),
    [combos]
  );

  // Lọc và sắp xếp combo
  useEffect(() => {
    let result = [...combos];

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter((combo) => combo.name.toLowerCase().includes(query));
    }

    // Lọc theo số lượng sản phẩm tối thiểu
    if (minItems) {
      result = result.filter((combo) => combo.productCount >= parseInt(minItems));
    }

    // Lọc theo dịp sử dụng
    if (selectedOccasions.length > 0) {
      result = result.filter((combo) => selectedOccasions.includes(combo.occasion));
    }

    // Lọc theo khoảng giá
    if (priceRange[0] > 0 || priceRange[1] > 0) {
      result = result.filter(
        (combo) =>
          (priceRange[0] === 0 || combo.price >= priceRange[0]) &&
          (priceRange[1] === 0 || combo.price <= priceRange[1])
      );
    }

    // Sắp xếp combo
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
      case "items_desc":
        result.sort((a, b) => b.productCount - a.productCount);
        break;
      default:
        break;
    }

    setFilteredCombos(result);
  }, [combos, searchTerm, minItems, selectedOccasions, priceRange, sortBy]);

  // Xử lý thay đổi bộ lọc
  const handleOccasionChange = (occasion: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasion) ? prev.filter((o) => o !== occasion) : [...prev, occasion]
    );
  };

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Tìm kiếm",
      description: `Đã tìm kiếm: ${searchTerm}`,
    });
  };

  // Xóa bộ lọc
  const resetFilters = () => {
    setSearchTerm("");
    setMinItems("");
    setPriceRange([0, 0]);
    setSortBy("name_asc");
    setSelectedOccasions([]);
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
      description: "Bộ lọc combo của bạn đã được áp dụng.",
    });
  };

  // Xử lý yêu thích
  const toggleFavorite = (comboId: number) => {
    setFilteredCombos((prev) =>
      prev.map((combo) =>
        combo.id === comboId ? { ...combo, isFavorite: !combo.isFavorite } : combo
      )
    );
    setCombos((prev) =>
      prev.map((combo) =>
        combo.id === comboId ? { ...combo, isFavorite: !combo.isFavorite } : combo
      )
    );
    toast({
      title: "Đã cập nhật yêu thích",
      description: "Danh sách yêu thích của bạn đã được cập nhật.",
    });
  };

  // Xử lý mua ngay
  const handleBuyNow = (combo: Combo) => {
    const cartItem = {
      id: combo.id,
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Combo Thời Trang</h1>
      {/* <p className="text-gray-600 mb-8">
        Khám phá các bộ sưu tập thời trang được tuyển chọn kỹ lưỡng của chúng tôi, giúp bạn dễ dàng
        phối đồ với giá ưu đãi đặc biệt.
      </p> */}

      {/* Thanh tìm kiếm và nút bộ lọc */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <form onSubmit={handleSearch} className="flex w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm combo..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dịp sử dụng */}
            <div>
              <Label className="text-lg font-medium mb-3 block">Dịp Sử Dụng</Label>
              <div className="space-y-2">
                {uniqueOccasions.map((occasion) => (
                  <div key={occasion} className="flex items-center space-x-2">
                    <Checkbox
                      id={`occasion-${occasion}`}
                      checked={selectedOccasions.includes(occasion)}
                      onCheckedChange={() => handleOccasionChange(occasion)}
                    />
                    <label
                      htmlFor={`occasion-${occasion}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {occasion}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Số lượng sản phẩm tối thiểu */}
            <div>
              <Label className="text-lg font-medium mb-3 block">Số Lượng Sản Phẩm Tối Thiểu</Label>
              <Select value={minItems} onValueChange={setMinItems}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn số lượng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  <SelectItem value="2">2 sản phẩm trở lên</SelectItem>
                  <SelectItem value="3">3 sản phẩm trở lên</SelectItem>
                  <SelectItem value="4">4 sản phẩm trở lên</SelectItem>
                  <SelectItem value="5">5 sản phẩm trở lên</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="items_desc">Số sản phẩm: Nhiều nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={resetFilters}>
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
          <p>Đang tải combo...</p>
        </div>
      ) : filteredCombos.length === 0 ? (
        <div className="py-12 text-center">
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy combo</h3>
          <p className="text-gray-600 mb-4">Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc</p>
          <Button onClick={resetFilters}>Xóa Tất Cả Bộ Lọc</Button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600">{filteredCombos.length} combo được tìm thấy</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCombos.map((combo) => (
              <Card key={combo.id} className="overflow-hidden group">
                <div className="relative aspect-video">
                  <Link to={`/combos/${combo.id}`}>
                    <img
                      src={combo.imageSrc}
                      alt={combo.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                  <button
                    onClick={() => toggleFavorite(combo.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${combo.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                    />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <span className="inline-block bg-crocus-500 text-white px-2 py-1 rounded text-xs font-medium">
                      {combo.productCount} Sản phẩm
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <Link to={`/combos/${combo.id}`}>
                    <h3 className="font-medium hover:text-crocus-600 transition-colors text-lg">
                      {combo.name}
                    </h3>
                  </Link>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <p className="font-semibold text-lg">{formatter.format(combo.price)}</p>
                      <p className="text-sm text-green-600">Tiết kiệm 15%</p>
                    </div>
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
                      onClick={() => handleBuyNow(combo)}
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
  );
};

export default CombosList;