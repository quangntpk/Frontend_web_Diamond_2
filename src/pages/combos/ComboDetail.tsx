import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { 
  Heart,
  ShoppingCart
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Swal from "sweetalert2";

const ComboDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [combo, setCombo] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [comboQuantity, setComboQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selections, setSelections] = useState<any>({});
  const [sizeQuantities, setSizeQuantities] = useState<any>({});
  const [colorSelected, setColorSelected] = useState<any>({});

  useEffect(() => {
    const fetchCombo = async () => {
      try {
        const response = await fetch(`http://localhost:5261/api/Combo/ComboSanPhamView?id=${id}`);
        const data = await response.json();

        // Process the API data to match the provided structure
        const processedCombo = {
          id: data[0].maCombo,
          name: data[0].name,
          price: data[0].gia,
          description: data[0].moTa || "Không có mô tả",
          longDescription: data[0].moTa || "Không có mô tả chi tiết",
          image: data[0].hinhAnh ? `data:image/jpeg;base64,${data[0].hinhAnh}` : "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
          images: data[0].hinhAnh 
            ? [`data:image/jpeg;base64,${data[0].hinhAnh}`]
            : [
                "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
                "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
                "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
              ],
          rating: 4.8,
          reviews: [
            { id: 1, user: "Madison K.", date: "April 2, 2025", rating: 5, comment: "Giá trị tuyệt vời! Cả ba sản phẩm kết hợp hoàn hảo và chất lượng tuyệt vời." },
            { id: 2, user: "Ryan T.", date: "March 28, 2025", rating: 5, comment: "Mua cho vợ và cô ấy rất thích. Màu sắc rất đẹp." },
            { id: 3, user: "Jamie L.", date: "March 15, 2025", rating: 4, comment: "Combo tuyệt vời, nhưng tôi mong có thêm lựa chọn kích thước cho váy." }
          ],
          isFavorite: false,
          products: data[0].sanPhams.map((product: any) => ({
            id: product.idSanPham,
            name: product.name,
            price: product.donGia,
            image: product.hinh && product.hinh.length > 0 
              ? `data:image/jpeg;base64,${product.hinh[0]}`
              : "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
            colors: product.mauSac || [],
            sizes: product.kichThuoc || []
          })),
          originalPrice: data[0].gia * 1.15,
          savings: data[0].gia * 0.15,
          savingsPercentage: 15
        };

        // Initialize selections for each product
        const initialSelections = processedCombo.products.reduce((acc: any, product: any) => ({
          ...acc,
          [product.id]: { colorIndex: null, sizeIndex: null }
        }), {});
        setSelections(initialSelections);

        setCombo(processedCombo);
        setMainImage(processedCombo.image);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching combo:", error);
        setIsLoading(false);
      }
    };

    fetchCombo();
  }, [id]);

  const fetchSizeQuantities = async (productId: string, color: string) => {
    try {
      const colorCode = color.replace("#", "");
      const response = await fetch(
        `http://localhost:5261/api/SanPham/SanPhamByIDSorted?id=${productId}_${colorCode}`
      );
      if (!response.ok) {
        throw new Error("Không thể lấy thông tin kích thước và số lượng");
      }
      const data = await response.json();
      const productData = Array.isArray(data) ? data[0] : data;

      const sizeData = productData.details.map((detail: any) => ({
        size: detail.kichThuoc.trim(),
        quantity: detail.soLuong,
        price: detail.gia,
      }));

      setSizeQuantities((prev: any) => ({
        ...prev,
        [productId]: sizeData,
      }));
    } catch (err) {
      console.error("Lỗi khi lấy thông tin kích thước:", err);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể lấy thông tin kích thước. Vui lòng thử lại.",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  const handleSelectionChange = (productId: string, field: string, value: any) => {
    setSelections((prev: any) => {
      const newSelections = {
        ...prev,
        [productId]: { ...prev[productId], [field]: value },
      };

      if (field === "colorIndex") {
        const selectedColor = combo.products.find((p: any) => p.id === productId).colors[value];
        fetchSizeQuantities(productId, `#${selectedColor}`);
        setColorSelected((prev: any) => ({
          ...prev,
          [productId]: true,
        }));
        // Reset size selection when color changes
        newSelections[productId].sizeIndex = null;
      }

      return newSelections;
    });
  };

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để thêm combo vào giỏ hàng.",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    const invalidProducts = combo.products.filter(
      (product: any) => 
        selections[product.id].colorIndex === null || 
        selections[product.id].sizeIndex === null
    );
    if (invalidProducts.length > 0) {
      Swal.fire({
        title: "Thông báo!",
        text: "Vui lòng chọn màu sắc và kích thước cho tất cả sản phẩm trong combo!",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    const cartData = {
      IDKhachHang: userId,
      IDCombo: Number(combo.id),
      SoLuong: Number(comboQuantity),
      Detail: combo.products.map((product: any) => ({
        MaSanPham: String(product.id),
        MauSac: product.colors[selections[product.id].colorIndex].replace("#", ""),
        KichThuoc: sizeQuantities[product.id][selections[product.id].sizeIndex].size,
      })),
    };

    try {
      const response = await fetch("http://localhost:5261/api/Cart/ThemComboVaoGioHang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cartData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Không thể thêm combo vào giỏ hàng: ${errorText}`);
      }

      Swal.fire({
        title: "Thành công!",
        text: "Đã thêm combo vào giỏ hàng thành công!",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: "Lỗi!",
        text: `Có lỗi xảy ra khi thêm vào giỏ hàng: ${(err as Error).message}`,
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  const toggleFavorite = () => {
    console.log(`Toggle favorite for combo ${combo?.id}`);
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Đang tải...</div>;
  }

  if (!combo) {
    return <div className="container mx-auto py-8">Không tìm thấy combo</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Link to="/combos" className="text-crocus-600 hover:underline flex items-center gap-1">
          ← Quay về Trang Danh Sách Combo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img 
              src={mainImage} 
              alt={combo.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {combo.images.map((image: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setMainImage(image)}
                className={`aspect-square rounded-md overflow-hidden ${mainImage === image ? 'ring-2 ring-crocus-500' : 'opacity-70'}`}
              >
                <img 
                  src={image} 
                  alt={`${combo.name} view ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{combo.name}</h1>
              <Button 
                variant="ghost" 
                onClick={toggleFavorite}
                className="h-10 w-10 p-0"
              >
                <Heart className={`h-6 w-6 ${combo.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[...Array(5)].map((_: any, i: number) => (
                  <svg 
                    key={i} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill={i < Math.floor(combo.rating) ? "currentColor" : "none"}
                    stroke={i < Math.floor(combo.rating) ? "none" : "currentColor"}
                    className={`w-5 h-5 ${i < Math.floor(combo.rating) ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600">{combo.rating} ({combo.reviews.length} Đánh Giá)</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-crocus-600">{(combo.price/1000).toFixed(3)} VND</p>
                <p className="text-sm line-through text-gray-500">{(combo.originalPrice/1000).toFixed(3)} VND</p>
              </div>
              <p className="text-green-600 font-medium">Tiết Kiệm {(combo.savings/1000).toFixed(3)} VND ({combo.savingsPercentage}% off)</p>
            </div>
          </div>

          <p className="text-gray-700">{combo.description}</p>

          <div>
            <h3 className="font-medium mb-3">Bao Gồm các Sản Phẩm ({combo.products.length})</h3>
            <div className="space-y-3">
              {combo.products.map((product: any) => (
                <div key={product.id} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-14 h-14 rounded object-cover"
                    />
                    <div>
                      <h4 className="font-medium">
                        <Link to={`/products/${product.id}`} className="hover:text-crocus-600 transition-colors">
                          {product.name}
                        </Link>
                      </h4>
                      <p className="text-sm text-gray-600">{(product.price/1000).toFixed(3)} VND</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Màu Sắc</label>
                      <div className="flex gap-2">
                        {product.colors.map((color: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleSelectionChange(product.id, "colorIndex", index)}
                            className={`w-8 h-8 rounded-full border-2 ${
                              selections[product.id]?.colorIndex === index
                                ? "border-crocus-500"
                                : "border-gray-300"
                            }`}
                            style={{ backgroundColor: `#${color}` }}
                            title={`#${color}`}
                          />
                        ))}
                      </div>
                    </div>
                    {colorSelected[product.id] && sizeQuantities[product.id]?.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Kích Thước</label>
                        <div className="flex gap-2 flex-wrap">
                          {sizeQuantities[product.id].map((size: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => handleSelectionChange(product.id, "sizeIndex", index)}
                              className={`px-3 py-1 border rounded-md text-sm ${
                                selections[product.id]?.sizeIndex === index
                                  ? "border-crocus-500 bg-crocus-50"
                                  : "border-gray-300"
                              } ${size.quantity === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                              disabled={size.quantity === 0}
                            >
                              {size.size} ({size.quantity} còn lại)
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {colorSelected[product.id] && !sizeQuantities[product.id]?.length && (
                      <p className="text-sm text-red-500">Không có kích thước nào khả dụng cho màu này.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Số Lượng</h3>
            <div className="flex items-center border border-gray-200 rounded-md w-32">
              <button 
                onClick={() => setComboQuantity(prev => Math.max(1, prev - 1))}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                -
              </button>
              <span className="flex-1 text-center">{comboQuantity}</span>
              <button 
                onClick={() => setComboQuantity(prev => prev + 1)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-crocus-600 hover:bg-crocus-700"
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Thêm Vào Giỏ Hàng
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Chi Tiết</TabsTrigger>
            <TabsTrigger value="reviews">Đánh Giá</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="p-4 border rounded-lg">
            <p className="text-gray-700">{combo.longDescription}</p>
          </TabsContent>
          <TabsContent value="reviews" className="p-4 border rounded-lg">
            <div className="space-y-4">
              {combo.reviews.map((review: any) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{review.user}</span>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_: any, i: number) => (
                      <svg 
                        key={i} 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill={i < review.rating ? "currentColor" : "none"}
                        stroke={i < review.rating ? "none" : "currentColor"}
                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Combo Tương Tự</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {[
            {
              id: 2,
              name: "Crocus Office Attire",
              price: 159999,
              image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
              rating: 4.6,
              isFavorite: false,
              productCount: 3
            },
            {
              id: 3,
              name: "Crocus Weekend Casual",
              price: 99999,
              image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
              rating: 4.7,
              isFavorite: false,
              productCount: 3
            }
          ].map(combo => (
            <Card key={combo.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <Link to={`/combos/${combo.id}`}>
                  <img
                    src={combo.image}
                    alt={combo.name}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <button
                  onClick={() => console.log(`Toggle favorite for related combo ${combo.id}`)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  <Heart className={`h-5 w-5 ${combo.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="inline-block bg-crocus-500 text-white px-2 py-1 rounded text-xs font-medium">
                    {combo.productCount} Sản Phẩm
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <Link to={`/combos/${combo.id}`}>
                  <h3 className="font-medium hover:text-crocus-600 transition-colors">{combo.name}</h3>
                </Link>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-semibold">{(combo.price/1000).toFixed(3)} VND</p>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_: any, i: number) => (
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComboDetail;