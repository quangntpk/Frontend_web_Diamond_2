import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Testing from "@/components/default/Testing";
import SelectSize from "@/components/default/SelectSize";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ProductDetail {
  kichThuoc: string;
  soLuong: number;
  gia: number;
}

interface Product {
  id: string;
  tenSanPham: string;
  maThuongHieu: string;
  loaiSanPham: string;
  mauSac: string;
  moTa: string | null;
  chatLieu: string;
  details: ProductDetail[];
  hinhAnhs: string[];
}

const mockReviews = [
  { id: 1, user: "Emma S.", date: "March 15, 2025", rating: 5, comment: "Absolutely love this product! The quality is amazing." },
  { id: 2, user: "Sophia T.", date: "March 10, 2025", rating: 4, comment: "Great fit, very comfortable." },
  { id: 3, user: "Olivia R.", date: "March 5, 2025", rating: 5, comment: "Perfect for my needs, highly recommend!" },
];

const mockRelatedProducts = [
  {
    id: "A00002",
    name: "Áo thun S Đen",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    rating: 4.8,
    isFavorite: true,
  },
  {
    id: "A00003",
    name: "Áo thun M Trắng",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    rating: 4.2,
    isFavorite: false,
  },
  {
    id: "A00004",
    name: "Áo thun L Đen",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b",
    rating: 4.9,
    isFavorite: false,
  },
];

const showNotification = (message: string, type: "success" | "error") => {
  alert(`${type.toUpperCase()}: ${message}`);
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [mainImage, setMainImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState<number>(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const baseId = id?.split('_')[0] || id;
        const response = await fetch(
          `http://localhost:5261/api/SanPham/SanPhamByIDSorted?id=${baseId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: Product[] = await response.json();

        if (!data || data.length === 0) {
          throw new Error("No products returned from API.");
        }

        setProducts(data);

        const product = data.find((p) => p.id === id) || data[0];
        if (product) {
          setSelectedProduct(product);
          setSelectedColor(product.mauSac);
          setSelectedSize(product.details[0]?.kichThuoc || "");
          setMainImage(product.hinhAnhs[0] ? `data:image/jpeg;base64,${product.hinhAnhs[0]}` : "");
          setStock(product.details[0]?.soLuong || 0);
        } else {
          setError(`Product with ID ${id} not found in API response.`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred.";
        setError(`Failed to fetch product details: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  const handleColorChange = (color: string) => {
    const product = products.find((p) => p.mauSac === color);
    if (product) {
      setSelectedProduct(product);
      setSelectedColor(color);
      setSelectedSize(product.details[0]?.kichThuoc || "");
      setMainImage(product.hinhAnhs[0] ? `data:image/jpeg;base64,${product.hinhAnhs[0]}` : "");
      setStock(product.details[0]?.soLuong || 0);
      setQuantity(1);
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    const detail = selectedProduct?.details.find((d) => d.kichThuoc === size);
    setStock(detail?.soLuong || 0);
  };

  const toggleFavorite = () => {};

  const handleAddToCart = async () => {
    if (!selectedSize) {
      showNotification("Vui lòng chọn kích thước trước khi thêm vào giỏ hàng!", "error");
      return;
    }
    const cartData = {
      IDNguoiDung: "KH001",
      IDSanPham: id?.split("_")[0] || id,
      MauSac: selectedProduct?.mauSac,
      KichThuoc: selectedSize,
      SoLuong: quantity,
    };
    try {
      const response = await fetch("http://localhost:5261/api/Cart/ThemSanPhamVaoGioHang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cartData),
      });
      if (!response.ok) throw new Error("Failed to add to cart");
      showNotification("Đã thêm vào giỏ hàng thành công!", "success");
    } catch (err) {
      showNotification("Có lỗi xảy ra khi thêm vào giỏ hàng!", "error");
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (error || !selectedProduct) {
    return <div className="container mx-auto py-8">{error || "Product not found."}</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="space-y-3">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-[#9b87f5]/30">
            <img
              src={mainImage}
              alt={selectedProduct.tenSanPham}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {selectedProduct.hinhAnhs.map((image, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(`data:image/jpeg;base64,${image}`)}
                className={`aspect-square rounded-md overflow-hidden border border-[#9b87f5]/30 ${
                  mainImage === `data:image/jpeg;base64,${image}` ? "ring-2 ring-[#9b87f5]" : "opacity-80 hover:opacity-100"
                }`}
              >
                <img
                  src={`data:image/jpeg;base64,${image}`}
                  alt={`${selectedProduct.tenSanPham} view ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="border border-[#9b87f5]/30 rounded-lg p-4 shadow-sm bg-white">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.tenSanPham}</h1>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={i < Math.floor(4.5) ? "currentColor" : "none"}
                  stroke={i < Math.floor(4.5) ? "none" : "currentColor"}
                  className={`w-3 h-3 ${i < Math.floor(4.5) ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-600">4.5 ({mockReviews.length} đánh giá)</span>
          </div>
          <p className="text-lg font-semibold text-[#9b87f5] mb-3">
            {(selectedProduct.details[0].gia/1000).toFixed(3)} VND
          </p>
          <p className="text-sm text-gray-600 mb-3">{selectedProduct.moTa || "Sản phẩm này chưa có mô tả"}</p>

          <div className="mb-3">
            <h3 className="font-medium text-sm text-gray-900 mb-1">Màu sắc</h3>
            <div className="flex gap-1.5">
              {products.map((product) => (
                <button
                  key={product.mauSac}
                  onClick={() => handleColorChange(product.mauSac)}
                  className={`w-7 h-7 rounded-full border ${
                    selectedColor === product.mauSac
                      ? "border-[#9b87f5] ring-2 ring-[#9b87f5]"
                      : "border-gray-200 hover:border-[#9b87f5]/50"
                  }`}
                  style={{ backgroundColor: `#${product.mauSac}` }}
                  title={product.mauSac}
                ></button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-sm text-gray-900">Kích thước</h3>
              <SelectSize />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedProduct.details.map((detail) => (
                <button
                  key={detail.kichThuoc}
                  onClick={() => handleSizeChange(detail.kichThuoc)}
                  className={`w-9 h-9 flex items-center justify-center rounded-md border text-xs ${
                    selectedSize === detail.kichThuoc
                      ? "border-[#9b87f5] bg-[#9b87f5]/10 text-[#9b87f5]"
                      : "border-gray-200 hover:border-[#9b87f5]/50"
                  }`}
                >
                  {detail.kichThuoc}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-600">
              Trong kho: <span className="font-medium">{stock} sản phẩm</span>
            </p>
          </div>

          <div className="mb-3">
            <h3 className="font-medium text-sm text-gray-900 mb-1">Số lượng</h3>
            <div className="flex items-center border border-gray-200 rounded-md w-24">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="px-1.5 py-1 text-gray-500 hover:text-[#9b87f5]"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="flex-1 text-center text-xs">{quantity}</span>
              <button
                onClick={() => setQuantity((prev) => Math.min(stock, prev + 1))}
                className="px-1.5 py-1 text-gray-500 hover:text-[#9b87f5]"
                disabled={quantity >= stock}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-[#9b87f5] hover:bg-[#8a76e0] text-white text-sm py-2"
              disabled={stock === 0}
            >
              <ShoppingCart className="mr-1 h-3 w-3" /> Thêm vào giỏ
            </Button>
            <Button
              variant="outline"
              onClick={toggleFavorite}
              className="w-9 border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5]/10"
            >
              <Heart className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      <Testing />
      <div className="mb-12">
        <Tabs defaultValue="details">
          <TabsList className="mb-4 bg-transparent border-b border-[#9b87f5]/20">
            <TabsTrigger value="details" className="data-[state=active]:text-[#9b87f5] data-[state=active]:border-b-2 data-[state=active]:border-[#333333]">
              Chi tiết thông tin
            </TabsTrigger>
            <TabsTrigger value="specifications" className="data-[state=active]:text-[#9b87f5] data-[state=active]:border-b-2 data-[state=active]:border-[#333333]">
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:text-[#9b87f5] data-[state=active]:border-b-2 data-[state=active]:border-[#333333]">
              Đánh giá
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="p-3 border border-[#9b87f5]/20 rounded-lg">
            <p className="text-sm text-gray-600">{selectedProduct.moTa || "Sản phẩm này chưa có mô tả"}</p>
          </TabsContent>
          <TabsContent value="specifications" className="p-3 border border-[#9b87f5]/20 rounded-lg">
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
              <li>Kích thước: {selectedProduct.details.map((d) => d.kichThuoc).join(", ")}</li>
              <li>Số lượng: {stock} sản phẩm</li>
              <li>Chất liệu: {selectedProduct.chatLieu}</li>
              <li>Thương hiệu: {selectedProduct.maThuongHieu}</li>
            </ul>
          </TabsContent>
          <TabsContent value="reviews" className="p-3 border border-[#9b87f5]/20 rounded-lg">
            <div className="space-y-3">
              {mockReviews.map((review) => (
                <div key={review.id} className="border-b border-[#9b87f5]/10 pb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm text-gray-900">{review.user}</span>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                  <div className="flex mb-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={i < review.rating ? "currentColor" : "none"}
                        stroke={i < review.rating ? "none" : "currentColor"}
                        className={`w-3 h-3 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockRelatedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden border-[#9b87f5]/20">
              <div className="relative aspect-square border border-[#9b87f5]/30">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => {}}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white"
                >
                  <Heart
                    className={`h-3 w-3 ${product.isFavorite ? "fill-[#9b87f5] text-[#9b87f5]" : "text-gray-600"}`}
                  />
                </button>
              </div>
              <CardContent className="p-2">
                <h3 className="font-medium text-xs text-gray-900 hover:text-[#9b87f5] transition-colors">
                  {product.name}
                </h3>
                <div className="flex justify-between items-center mt-1">
                  <p className="font-semibold text-[#9b87f5] text-xs">${product.price.toFixed(2)}</p>
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                        stroke={i < Math.floor(product.rating) ? "none" : "currentColor"}
                        className={`w-2.5 h-2.5 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}`}
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;