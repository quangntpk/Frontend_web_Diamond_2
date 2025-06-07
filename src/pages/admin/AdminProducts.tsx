import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrashAlt, FaEye,FaDoorOpen } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Grid2X2, List, MoreVertical, Tag } from "lucide-react";
import EditProductModal from "@/components/admin/SanPhamAdmin/EditProductModal";
import CreateSanPhamModal from "@/components/admin/SanPhamAdmin/CreateSanPhamModal";
import DetailSanPhamModal from "@/components/admin/SanPhamAdmin/DetailSanPhamModal";
import Swal from "sweetalert2";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productEdit, setProductEdit] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [sortBy, setSortBy] = useState(""); // Sắp xếp: "" | "price-asc" | "price-desc" | "name-asc" | "name-desc"
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5261/api/SanPham/ListSanPham", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data || []);
      } else {
        console.error("Lỗi khi lấy danh sách sản phẩm:", response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error("Lỗi kết nối API danh sách sản phẩm:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductLoadInfo = async (id) => {
    try {
      const response = await fetch(`http://localhost:5261/api/SanPham/SanPhamByIDSorted?id=${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setProductEdit(data || null);
      } else {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", response.status);
        setProductEdit(null);
      }
    } catch (error) {
      console.error("Lỗi kết nối API chi tiết sản phẩm:", error);
      setProductEdit(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getSortedProducts = () => {
    let filtered = [...products].filter(
      (product) =>
        (product.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (product.loaiSanPham?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case "price-asc":
        return filtered.sort((a, b) => (a.donGia || 0) - (b.donGia || 0));
      case "price-desc":
        return filtered.sort((a, b) => (b.donGia || 0) - (a.donGia || 0));
      case "name-asc":
        return filtered.sort((a, b) => 
          (a.name || "").localeCompare(b.name || ""));
      case "name-desc":
        return filtered.sort((a, b) => 
          (b.name || "").localeCompare(a.name || ""));
      default:
        return filtered;
    }
  };

  const sortedProducts = getSortedProducts();
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
    fetchProductLoadInfo(product.id);
  };

  const handleViewDetails = (productId) => {
    setSelectedProductId(productId);
    setIsDetailModalOpen(true);
  };

  const handleDeleteProduct = async (product) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: `Sản phẩm ${product.name} mang mã ${product.id} sẽ chuyển sang trạng thái ngừng bán!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ngưng Bán",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:5261/api/SanPham/DeleteSanPham?id=${product.id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (response.ok) {
            Swal.fire({
              title: "Thành công!",
              text: "Ngưng Bán sản phẩm thành công!",
              icon: "success",
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
            }).then(() => {
              fetchProducts();
            });
          } else {
            Swal.fire({
              title: "Lỗi!",
              text: "Có lỗi xảy ra khi ngưng bán sản phẩm.",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Lỗi!",
            text: "Có lỗi hệ thống khi ngưng bán.",
            icon: "error",
          });
        }
      }
    });
  };

  const handleActiveProduct = async (product) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: `Sản phẩm ${product.name} mang mã ${product.id} sẽ chuyển sang trạng thái đang bán!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đang bán",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:5261/api/SanPham/ActiveSanPham?id=${product.id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (response.ok) {
            Swal.fire({
              title: "Thành công!",
              text: "Mở bán lại sản phẩm thành công!",
              icon: "success",
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
            }).then(() => {
              fetchProducts();
            });
          } else {
            Swal.fire({
              title: "Lỗi!",
              text: "Có lỗi xảy ra khi mở bán lại sản phẩm.",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Lỗi!",
            text: "Có lỗi hệ thống khi mở bán lại.",
            icon: "error",
          });
        }
      }
    });
  };

  const handleAddProductSuccess = () => {
    fetchProducts();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải sản phẩm...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sản phẩm</h1>
          <p className="text-muted-foreground mt-1">Quản lý sản phẩm trong cửa hàng của bạn</p>
        </div>
       <Button
          style={{
            display: "block",
            visibility: "visible",
            opacity: 1,
            backgroundColor: "#752CE0", // Màu ban đầu
            color: "white", // Đổi chữ thành trắng để tương phản tốt với nền tím
            transition: "background-color 0.3s ease", // Hiệu ứng chuyển màu mượt
            minWidth: "300px", // Tăng chiều rộng tối thiểu
            textAlign: "center", // Căn giữa nội dung
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-[#439ADE]"
          onClick={() => {
            console.log("Nút Thêm Sản Phẩm Mới được nhấn");
            setIsAddModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Thêm Sản Phẩm Mới
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tất cả sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Gõ tên sản phẩm cần tìm"
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 self-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    {sortBy === "" ? "Sắp xếp" : 
                      sortBy === "price-asc" ? "Giá thấp - cao" :
                      sortBy === "price-desc" ? "Giá cao - thấp" :
                      sortBy === "name-asc" ? "A - Z" : "Z - A"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy("")}>
                    Mặc định
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-asc")}>
                    Giá: Thấp đến Cao
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-desc")}>
                    Giá: Cao đến Thấp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                    Tên: A - Z
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                    Tên: Z - A
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex border rounded-md">
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-9 rounded-r-none"
                  onClick={() => setView("grid")}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-9 rounded-l-none"
                  onClick={() => setView("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentProducts.map((product) => (
                <Card key={product.id} className="hover-scale overflow-hidden group">
                  <div className="h-40 bg-purple-light flex items-center justify-center">
                    <img
                      src={
                        product.hinh && product.hinh[0]
                          ? `data:image/jpeg;base64,${product.hinh[0]}`
                          : "/placeholder-image.jpg"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{product.name || "Không có tên"}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          Thương hiệu: {product.thuongHieu || "Không xác định"}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            <FaEdit className="mr-2 h-4 w-4 text-blue-500" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDetails(product.id)}>
                            <FaEye className="mr-2 h-4 w-4 text-green-500" /> Chi tiết
                          </DropdownMenuItem>
                          {product.trangThai === 0 ? (
                            <DropdownMenuItem onClick={() => handleActiveProduct(product)} className="text-green-600">
                               <FaDoorOpen className="mr-2 h-4 w-4 text-green-500" /> Mở bán
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleDeleteProduct(product)} className="text-red-600">
                              <FaTrashAlt className="mr-2 h-4 w-4 text-red-500" /> Ngừng Bán
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="bg-secondary text-white border-0">
                        <Tag className="h-3 w-3 mr-1" /> {product.loaiSanPham || "N/A"}
                      </Badge>
                      <Badge variant="outline" className="bg-secondary text-white border-0">
                        <Tag className="h-3 w-3 mr-1" /> {product.chatLieu || "N/A"}
                      </Badge>
                      <Badge
                        variant={product.soLuong > 0 ? "default" : "destructive"}
                        className="flex flex-col justify-center items-center text-center h-full px-2"
                      >
                        {product.trangThai === 0 ? "Tạm Ngưng Bán" : "Đang Bán"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-bold text-purple">
                        {(product.donGia/1000)?.toFixed(3) || "0"} VND
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Còn lại: {product.soLuong || 0} sản phẩm
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-md divide-y">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 flex items-center gap-4 hover:bg-muted/50"
                >
                  <div className="h-12 w-12 bg-purple-light rounded-md flex items-center justify-center">
                    <img
                      src={
                        product.hinh && product.hinh[0]
                          ? `data:image/jpeg;base64,${product.hinh[0]}`
                          : "/placeholder-image.jpg"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name || "Không có tên"}</h3>
                    <p className="text-sm text-white line-clamp-1">
                      Thương hiệu: {product.thuongHieu || "Không xác định"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-secondary text-white border-0">
                      {product.loaiSanPham || "N/A"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple">
                      {(product.donGia / 1000)?.toFixed(3) || "0"} VND
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {product.soLuong || 0} in stock
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                        Chỉnh Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDetails(product.id)}>
                        Chi Tiết
                      </DropdownMenuItem>
                      {product.trangThai === 0 ? (
                        <DropdownMenuItem onClick={() => handleActiveProduct(product)} className="text-green-600">
                          Mở Bán
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleDeleteProduct(product)} className="text-red-600">
                          Ngừng Bán
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}

          {currentProducts.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Không tìm thấy sản phẩm nào</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <EditProductModal
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        selectedProduct={selectedProduct}
        productData={productEdit}
      />
      <CreateSanPhamModal
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        onSuccess={handleAddProductSuccess}
      />
      <DetailSanPhamModal
        productId={selectedProductId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};

export default Products;