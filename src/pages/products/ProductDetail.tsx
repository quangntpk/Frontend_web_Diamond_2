import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import { Heart, ShoppingBag, Star } from "lucide-react";
import Swal from "sweetalert2";



// Component thông báo tùy chỉnh
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 font-roboto",
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      )}
    >
      <p>{message}</p>
      <button
        onClick={onClose}
        className="absolute top-1 right-1 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
};

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likedId, setLikedId] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => setNotification({ message, type });
  const closeNotification = () => setNotification(null);
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("Product ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const baseProductId = productId.split("_")[0] || productId;

        const productResponse = await fetch(
          `http://localhost:5261/api/SanPham/SanPhamByIDSorted?id=${baseProductId}`
        );
        if (!productResponse.ok) throw new Error("Failed to fetch product");
        const productData = await productResponse.json();
        const productArray = Array.isArray(productData) ? productData : [productData];

        const formattedProducts = productArray.map((product) => {
          const [baseId, colorCode] = product.id.split("_");
          return {
            id: product.id,
            baseId,
            colorCode,
            name: product.tenSanPham,
            description: product.moTa || "Không có mô tả",
            price: product.details[0]?.gia || 0,
            rating: 0,
            color: `#${product.mauSac || colorCode}`,
            sizes: product.details.map((detail) => ({
              size: detail.kichThuoc.trim(),
              quantity: detail.soLuong,
              price: detail.gia,
            })),
            material: product.chatLieu,
            brand: product.maThuongHieu,
            productType: product.loaiSanPham,
            images: product.hinhAnhs?.map((base64) => `data:image/jpeg;base64,${base64}`) || [],
          };
        });

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
          `/products/${productId}`
        )}&size=100x100`;
        setQrCodeUrl(qrUrl);

        const userData = JSON.parse(localStorage.getItem("user"));
        const currentUserId = userData?.maNguoiDung;
        if (currentUserId) {
          const yeuThichResponse = await fetch("http://localhost:5261/api/YeuThich");
          if (!yeuThichResponse.ok) throw new Error("Failed to fetch favorites");
          const yeuThichData = await yeuThichResponse.json();
          const userFavorite = yeuThichData.find(
            (yeuThich) =>
              yeuThich.maSanPham === baseProductId && yeuThich.maNguoiDung === currentUserId
          );
          if (userFavorite) {
            setIsLiked(true);
            setLikedId(userFavorite.maYeuThich);
          }
        }

        setProducts(formattedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const getUniqueColorList = () => {
    const colorMap = new Map();
    products.forEach((product) => colorMap.set(product.color, product.id));
    return Array.from(colorMap.entries()).map(([color, id]) => ({ id, color }));
  };

  const getSizesForColor = () => products[selectedColorIndex].sizes;

  const handleToggleLike = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const maNguoiDung = userData?.maNguoiDung;
    const hoTen = userData?.hoTen;

    if (!maNguoiDung) {
      showNotification("Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!", "error");
      return;
    }

    const baseProductId = productId.split("_")[0] || productId;
    const tenSanPham = products[0]?.name;

    if (isLiked) {
      try {
        const response = await fetch(`http://localhost:5261/api/YeuThich/${likedId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to remove favorite");
        setIsLiked(false);
        setLikedId(null);
        showNotification("Đã xóa sản phẩm khỏi danh sách yêu thích!", "success");
      } catch (err) {
        showNotification("Có lỗi xảy ra khi xóa yêu thích!", "error");
      }
    } else {
      const yeuThichData = {
        maSanPham: baseProductId,
        tenSanPham: tenSanPham,
        maNguoiDung: maNguoiDung,
        hoTen: hoTen,
        soLuongYeuThich: 1,
        ngayYeuThich: new Date().toISOString(),
      };
      try {
        const response = await fetch("http://localhost:5261/api/YeuThich", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(yeuThichData),
        });
        if (!response.ok) throw new Error("Failed to add favorite");
        const addedFavorite = await response.json();
        setIsLiked(true);
        setLikedId(addedFavorite.maYeuThich);
        showNotification("Đã thêm sản phẩm vào danh sách yêu thích!", "success");
      } catch (err) {
        showNotification("Có lỗi xảy ra khi thêm yêu thích!", "error");
      }
    }
  };

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => navigate("/login"));
      return;
    }

    if (selectedSizeIndex === null) {
      showNotification("Vui lòng chọn kích thước trước khi thêm vào giỏ hàng!", "error");
      return;
    }

    const userData = localStorage.getItem("userId");
    const maNguoiDung = userData;
    const selectedProduct = products[selectedColorIndex];
    const selectedSize = selectedProduct.sizes[selectedSizeIndex];

    const cartData = {
      IDNguoiDung: maNguoiDung,
      IDSanPham: productId.split("_")[0] || productId,
      MauSac: selectedProduct.colorCode,
      KichThuoc: selectedSize.size,
      SoLuong: quantity,
    };
    try {
      const response = await fetch("http://localhost:5261/api/Cart/ThemSanPhamVaoGioHang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(cartData),
      });
      if (!response.ok) throw new Error("Failed to add to cart");
      showNotification("Đã thêm vào giỏ hàng thành công!", "success");
    } catch (err) {
      showNotification("Có lỗi xảy ra khi thêm vào giỏ hàng!", "error");
    }
  };

  if (loading)
    return (
      <div className="pt-24 pb-16 px-6 min-h-screen flex items-center justify-center">
        <p>Loading product details...</p>
      </div>
    );
  if (error || !products.length)
    return (
      <div className="pt-24 pb-16 px-6 min-h-screen flex items-center justify-center">
        <p>Error: {error || "Product not found"}</p>
      </div>
    );

  const baseProduct = products[0];
  const currentProduct = products[selectedColorIndex];
  const availableSizes = getSizesForColor();
  const selectedPrice =
    selectedSizeIndex !== null ? currentProduct.sizes[selectedSizeIndex].price : currentProduct.price;
  const stockQuantity =
    selectedSizeIndex !== null ? availableSizes[selectedSizeIndex].quantity : availableSizes[0].quantity;

  return (
    <>

      <div className="pt-24 pb-16 px-6 min-h-screen bg-gradient-to-b from-white to-secondary/20">
        {notification && (
          <Notification message={notification.message} type={notification.type} onClose={closeNotification} />
        )}
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-border bg-white shadow-sm">
                <img
                  src={baseProduct.images[selectedImage]}
                  alt={baseProduct.name}
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>
              <div className="flex gap-3 overflow-auto pb-2">
                {baseProduct.images.map((image, index) => (
                  <button
                    key={index}
                    className={cn(
                      "rounded-lg overflow-hidden border-2 min-w-[80px] w-20 aspect-square transition-all",
                      selectedImage === index ? "border-primary ring-2 ring-primary/20" : "border-border/50 hover:border-primary/50"
                    )}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${baseProduct.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-medium mb-2 gradient-text">{baseProduct.name}</h1>
                {/* <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "w-4 h-4",
                          index < Math.floor(baseProduct.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{baseProduct.rating}</span>
                </div> */}
                <p className="text-2xl font-medium text-primary mb-4">{formatter.format(selectedPrice)} </p>
                <p className="text-muted-foreground">{baseProduct.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Màu Sắc</h3>
                <div className="flex gap-3">
                  {getUniqueColorList().map((item, index) => (
                    <button
                      key={item.id}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        selectedColorIndex === index ? "ring-2 ring-offset-2 ring-primary" : "ring-1 ring-border hover:ring-primary"
                      )}
                      style={{ backgroundColor: item.color }}
                      onClick={() => {
                        setSelectedColorIndex(index);
                        setSelectedSizeIndex(null);
                      }}
                      aria-label={`Select color ${item.color}`}
                    />
                  ))}
                </div>
              </div>
              {currentProduct && (
                <div>
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium mb-3">Kích Thước</h3>
                    <div className="ml-[100px]">
             
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sizeObj, index) => (
                      <button
                        key={index}
                        className={cn(
                          "h-10 min-w-[40px] px-3 rounded border text-sm font-medium transition-all",
                          selectedSizeIndex === index ? "border-primary bg-primary/10 shadow-lg" : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setSelectedSizeIndex(index)}
                      >
                        {sizeObj.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium mb-3">Số Lượng</h3>
                <div className="flex items-center border border-border rounded-md w-32">
                  <button
                    className="w-10 h-10 flex items-center justify-center text-lg"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">{quantity}</div>
                  <button
                    className="w-10 h-10 flex items-center justify-center text-lg"
                    onClick={() =>
                      setQuantity(
                        Math.min(
                          selectedSizeIndex !== null
                            ? availableSizes[selectedSizeIndex].quantity
                            : currentProduct.sizes[0].quantity,
                          quantity + 1
                        )
                      )
                    }
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-muted-foreground mt-2 block">
                  Số Lượng Sản phẩm còn lại trong kho: {stockQuantity}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Thông Tin Sản Phẩm</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">Chất liệu: {baseProduct.material}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">Thương hiệu: {baseProduct.brand}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">Loại sản phẩm: {baseProduct.productType}</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  className="flex-1 h-12 px-6 gradient-bg text-white rounded-full hover:opacity-90 transition-opacity flex items-center justify-center"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" /> Thêm Vào Giỏ Hàng
                </button>
                <button
                  onClick={handleToggleLike}
                  className="h-12 w-12 border border-primary/30 rounded-full hover:bg-primary/5 transition-colors flex items-center justify-center"
                >
                  <Heart className={cn("h-5 w-5", isLiked ? "fill-red-500 text-red-500" : "text-gray-400")} />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                {qrCodeUrl && (
                  <div className="mt-6 flex items-center space-x-4">
                    <h3 className="text-lg font-medium">Xem trên điện thoại :</h3>
                    <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
                  </div>
                )}
              </div>
            </div>
          </div>
    
          {/* <Comment productId={productId} /> Không cần reloadComments */}
          <br></br>
    
        </div>
      </div>
  
    </>
  );
};

export default ProductDetail;