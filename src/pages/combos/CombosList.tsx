import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Search, SlidersHorizontal, DollarSign, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

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

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5261/api/Combo/ComboSanPhamView");
        if (!response.ok) throw new Error("Không thể tải danh sách combo");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Dữ liệu API không phải là mảng");

        const transformedCombos = data.map((item: ApiCombo) => ({
          id: item.maCombo,
          name: item.name || "Không có tên",
          description: item.moTa || "Không có mô tả",
          imageSrc: item.hinhAnh ? `data:image/jpeg;base64,${item.hinhAnh}` : "/placeholder-image.jpg",
          price: item.gia || 0,
          products: Array.isArray(item.sanPhams) ? item.sanPhams.map((p) => p.name || "Không có tên") : [],
          productCount: Array.isArray(item.sanPhams) ? item.sanPhams.length : 0,
          rating: 4 + Math.random() * 0.9,
          isFavorite: false,
          occasion: item.moTa?.includes("Casual") ? "Casual" : item.moTa?.includes("Office") ? "Office" : item.moTa?.includes("Evening") ? "Evening" : item.moTa?.includes("Athletic") ? "Athletic" : "Other",
        }));

        setCombos(transformedCombos);
        setFilteredCombos(transformedCombos);
        setError(null);
      } catch (err) {
        setError("Không thể tải combo. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCombos();
  }, []);

  const uniqueOccasions = useMemo(
    () => [...new Set(combos.map((combo) => combo.occasion))].sort(),
    [combos]
  );

  const minPrice = useMemo(
    () => (combos.length > 0 ? Math.floor(Math.min(...combos.map((c) => c.price))) : 0),
    [combos]
  );
  const maxPrice = useMemo(
    () => (combos.length > 0 ? Math.ceil(Math.max(...combos.map((c) => c.price))) : 0),
    [combos]
  );

  useEffect(() => {
    let result = [...combos];
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter((combo) => combo.name.toLowerCase().includes(query));
    }
    if (minItems) {
      result = result.filter((combo) => combo.productCount >= parseInt(minItems));
    }
    if (selectedOccasions.length > 0) {
      result = result.filter((combo) => selectedOccasions.includes(combo.occasion));
    }
    if (priceRange[0] > 0 || priceRange[1] > 0) {
      result = result.filter(
        (combo) =>
          (priceRange[0] === 0 || combo.price >= priceRange[0]) &&
          (priceRange[1] === 0 || combo.price <= priceRange[1])
      );
    }
    switch (sortBy) {
      case "name_asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name_desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "price_asc": result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "rating_desc": result.sort((a, b) => b.rating - a.rating); break;
      case "items_desc": result.sort((a, b) => b.productCount - a.productCount); break;
    }
    setFilteredCombos(result);
  }, [combos, searchTerm, minItems, selectedOccasions, priceRange, sortBy]);

  const handleOccasionChange = (occasion: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasion) ? prev.filter((o) => o !== occasion) : [...prev, occasion]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setMinItems("");
    setPriceRange([0, 0]);
    setSortBy("name_asc");
    setSelectedOccasions([]);
  };

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
  };

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
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl py-8">
          <h1 className="text-3xl font-bold mb-6 gradient-text">Combo Thời Trang</h1>
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-lg font-medium mb-3 block">Tìm Kiếm</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm combo..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Tìm kiếm combo"
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
                      case "all": setPriceRange([0, 0]); break;
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
                    <SelectItem value="items_desc">Số sản phẩm: Nhiều nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-end gap-2 justify-end">
              <Button variant="outline" onClick={resetFilters} aria-label="Xóa bộ lọc">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Xóa bộ lọc
              </Button>
            </div>
          </div>
          
          {error ? (
            <div className="py-12 text-center text-red-500" role="alert">{error}</div>
          ) : isLoading ? (
            <div className="py-12 text-center">
              <p>Đang tải combo...</p>
            </div>
          ) : filteredCombos.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy combo</h3>
              <p className="text-gray-600 mb-4">Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc</p>
              <Button onClick={resetFilters} aria-label="Xóa tất cả bộ lọc">
                Xóa Tất Cả Bộ Lọc
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {filteredCombos.map((combo) => (
                  <Card key={combo.id} className="overflow-hidden group">
                    <div className="relative aspect-square">
                      <Link to={`/combos/${combo.id}`} aria-label={`Xem chi tiết ${combo.name}`}>
                        <img
                          src={combo.imageSrc}
                          alt={combo.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>
                      <button
                        onClick={() => toggleFavorite(combo.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white"
                        aria-label={combo.isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
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
                      <Link to={`/combos/${combo.id}`} aria-label={`Xem chi tiết ${combo.name}`}>
                        <h3 className="text-lg font-semibold hover:text-crocus-600 transition-colors">
                          {combo.name}
                        </h3>
                      </Link>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-lg font-bold">{formatter.format(combo.price)}</p>
                        <div className="flex space-x-1" aria-label={`Đánh giá ${combo.rating} sao`}>
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
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Link to={`/combos/${combo.id}`} aria-label={`Xem chi tiết ${combo.name}`}>
                            Chi tiết
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-crocus-500 hover:bg-crocus-600"
                          onClick={() => handleBuyNow(combo)}
                          aria-label={`Mua ngay ${combo.name}`}
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

export default CombosList;