import { useState, useEffect, useCallback, useMemo } from "react";
import { FaPlus, FaEdit, FaTrashAlt, FaEye, FaUndo, FaTrash } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Search, MoreVertical, X, Plus, Loader2, ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import Swal from "sweetalert2";

interface DanhMucCon {
  maDanhMucCon: number;
  tenDanhMucCon: string;
  kiHieu?: string;
  trangThai?: number;
}

interface LoaiSanPham {
  maLoaiSanPham: number;
  tenLoaiSanPham: string;
  kiHieu: string;
  kichThuoc?: string;
  hinhAnh?: string;
  trangThai?: number;
}

interface KiHieuOption {
  kiHieu: string;
  tenLoaiSanPham: string;
}

const ITEMS_PER_PAGE = 10;
const API_URL = import.meta.env.VITE_API_URL;

const AdminSubcategories = () => {
  const [danhMucCons, setDanhMucCons] = useState<DanhMucCon[]>([]);
  const [loaiSanPhams, setLoaiSanPhams] = useState<LoaiSanPham[]>([]);
  const [kiHieuOptions, setKiHieuOptions] = useState<KiHieuOption[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProductTypes, setLoadingProductTypes] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [moModalThem, setMoModalThem] = useState(false);
  const [moModalSua, setMoModalSua] = useState(false);
  const [moModalXoa, setMoModalXoa] = useState(false);
  const [moModalXoaVinhVien, setMoModalXoaVinhVien] = useState(false);
  const [moModalKhoiPhuc, setMoModalKhoiPhuc] = useState(false);
  const [moModalChiTiet, setMoModalChiTiet] = useState(false);
  const [danhMucConCanXoa, setDanhMucConCanXoa] = useState<DanhMucCon | null>(null);
  const [danhMucConCanXoaVinhVien, setDanhMucConCanXoaVinhVien] = useState<DanhMucCon | null>(null);
  const [danhMucConCanKhoiPhuc, setDanhMucConCanKhoiPhuc] = useState<DanhMucCon | null>(null);
  const [tenDanhMucConMoi, setTenDanhMucConMoi] = useState("");
  const [kiHieuMoi, setKiHieuMoi] = useState<string>("");
  const [kiHieuFilter, setKiHieuFilter] = useState<string>("all");
  const [danhMucConDangSua, setDanhMucConDangSua] = useState<DanhMucCon | null>(null);
  const [danhMucConChiTiet, setDanhMucConChiTiet] = useState<DanhMucCon | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorsThem, setErrorsThem] = useState({ ten: "", kiHieu: "" });
  const [errorsSua, setErrorsSua] = useState({ ten: "", kiHieu: "" });

  const getKiHieuOptions = (data: LoaiSanPham[]): KiHieuOption[] => {
    const kiHieuMap = new Map<string, string>();
    data.forEach((lsp) => {
      if (!kiHieuMap.has(lsp.kiHieu)) {
        kiHieuMap.set(lsp.kiHieu, lsp.tenLoaiSanPham);
      }
    });
    return Array.from(kiHieuMap, ([kiHieu, tenLoaiSanPham]) => ({ kiHieu, tenLoaiSanPham }));
  };

  const fetchDanhMucCon = useCallback(async () => {
    try {
      setLoading(true);
      const targetStatus = activeTab === "active" ? 1 : 0;
      const response = await fetch(`${API_URL}/api/DanhMucCon?trangThai=${targetStatus}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          response.status === 404
            ? "Không tìm thấy dữ liệu danh mục con."
            : response.status === 500
            ? "Lỗi máy chủ, vui lòng thử lại sau."
            : errorText || "Không thể lấy danh sách danh mục con."
        );
      }

      const data: DanhMucCon[] = await response.json();
      const sortedData = data.sort((a, b) => b.maDanhMucCon - a.maDanhMucCon);
      setDanhMucCons(sortedData);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Lỗi khi tải danh sách danh mục con: " + (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchLoaiSanPham = useCallback(async () => {
    try {
      setLoadingProductTypes(true);
      const response = await fetch(`${API_URL}/api/LoaiSanPham`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          response.status === 404
            ? "Không tìm thấy dữ liệu loại sản phẩm."
            : response.status === 500
            ? "Lỗi máy chủ, vui lòng thử lại sau."
            : errorText || "Không thể lấy danh sách loại sản phẩm."
        );
      }

      const data: LoaiSanPham[] = await response.json();
      setLoaiSanPhams(data);
      const options = getKiHieuOptions(data);
      setKiHieuOptions(options);

      if (options.length > 0) {
        setKiHieuMoi(options[0].kiHieu);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Lỗi khi tải danh sách loại sản phẩm: " + (error as Error).message,
      });
    } finally {
      setLoadingProductTypes(false);
    }
  }, []);

  const sortedAndFilteredDanhMucCon = useMemo(() => {
    return [...danhMucCons]
      .sort((a, b) => b.maDanhMucCon - a.maDanhMucCon)
      .filter((dmc) => {
        const kiHieu = dmc.kiHieu || '';
        return (
          (dmc.tenDanhMucCon?.toLowerCase().includes(searchTerm) || false) ||
          (kiHieu.toLowerCase().includes(searchTerm) || false)
        ) && (
          kiHieuFilter === "all" || kiHieu === kiHieuFilter
        );
      });
  }, [danhMucCons, searchTerm, kiHieuFilter]);

  useEffect(() => {
    fetchDanhMucCon();
    fetchLoaiSanPham();
  }, [fetchDanhMucCon, fetchLoaiSanPham]);

  const validateThem = () => {
    let valid = true;
    const newErrors = { ten: "", kiHieu: "" };

    if (!tenDanhMucConMoi.trim()) {
      newErrors.ten = "Tên danh mục con không được để trống!";
      valid = false;
    } else if (tenDanhMucConMoi.length > 20) {
      newErrors.ten = "Tên danh mục con không được dài quá 20 ký tự!";
      valid = false;
    }

    if (!kiHieuMoi) {
      newErrors.kiHieu = "Vui lòng chọn một ký hiệu hợp lệ!";
      valid = false;
    }

    setErrorsThem(newErrors);
    return valid;
  };

  const validateSua = () => {
    let valid = true;
    const newErrors = { ten: "", kiHieu: "" };

    if (!danhMucConDangSua?.tenDanhMucCon?.trim()) {
      newErrors.ten = "Tên danh mục con không được để trống!";
      valid = false;
    } else if (danhMucConDangSua.tenDanhMucCon.length > 20) {
      newErrors.ten = "Tên danh mục con không được dài quá 20 ký tự!";
      valid = false;
    }

    if (!danhMucConDangSua?.kiHieu) {
      newErrors.kiHieu = "Vui lòng chọn một ký hiệu hợp lệ!";
      valid = false;
    }

    setErrorsSua(newErrors);
    return valid;
  };

  const themDanhMucCon = async () => {
    if (!validateThem()) return;

    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/api/DanhMucCon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenDanhMucCon: tenDanhMucConMoi,
          kiHieu: kiHieuMoi,
          trangThai: 1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          response.status === 400
            ? errorText || "Dữ liệu không hợp lệ."
            : response.status === 500
            ? "Lỗi máy chủ."
            : errorText || "Không thể thêm danh mục con."
        );
      }

      setTenDanhMucConMoi("");
      setKiHieuMoi(kiHieuOptions[0]?.kiHieu || "");
      setErrorsThem({ ten: "", kiHieu: "" });
      setMoModalThem(false);
      await fetchDanhMucCon();
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Thêm danh mục con thành công!",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Lỗi khi thêm danh mục con: " + (error as Error).message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const suaDanhMucCon = async () => {
    if (!validateSua()) return;

    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/api/DanhMucCon/${danhMucConDangSua!.maDanhMucCon}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maDanhMucCon: danhMucConDangSua.maDanhMucCon,
          tenDanhMucCon: danhMucConDangSua.tenDanhMucCon,
          kiHieu: danhMucConDangSua.kiHieu,
          trangThai: danhMucConDangSua.trangThai,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          response.status === 400
            ? errorText || "Dữ liệu không hợp lệ."
            : response.status === 404
            ? "Danh mục con không tồn tại."
            : response.status === 500
            ? "Lỗi máy chủ."
            : errorText || "Không thể cập nhật danh mục con."
        );
      }

      setMoModalSua(false);
      setDanhMucConDangSua(null);
      setErrorsSua({ ten: "", kiHieu: "" });
      await fetchDanhMucCon();
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Cập nhật danh mục con thành công!",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Lỗi khi cập nhật danh mục con: " + (error as Error).message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const anDanhMucCon = async () => {
    if (!danhMucConCanXoa) return;

    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/api/DanhMucCon/SoftDelete/${danhMucConCanXoa.maDanhMucCon}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          response.status === 400
            ? errorText || "Dữ liệu không hợp lệ."
            : response.status === 404
            ? "Danh mục con không tồn tại."
            : response.status === 500
            ? "Lỗi máy chủ."
            : errorText || "Không thể xóa danh mục con."
        );
      }

      setMoModalXoa(false);
      setDanhMucConCanXoa(null);
      await fetchDanhMucCon();
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Đã ẩn danh mục con!",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Lỗi khi ẩn danh mục con: " + (error as Error).message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const khoiPhucDanhMucCon = async () => {
    if (!danhMucConCanKhoiPhuc) return;

    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/api/DanhMucCon/${danhMucConCanKhoiPhuc.maDanhMucCon}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...danhMucConCanKhoiPhuc, trangThai: 1 }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          response.status === 400
            ? errorText || "Dữ liệu không hợp lệ."
            : response.status === 404
            ? "Danh mục con không tồn tại."
            : response.status === 500
            ? "Lỗi máy chủ."
            : errorText || "Không thể khôi phục danh mục con."
        );
      }

      setMoModalKhoiPhuc(false);
      setDanhMucConCanKhoiPhuc(null);
      await fetchDanhMucCon();
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Đã khôi phục danh mục con!",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Lỗi khi khôi phục danh mục con: " + (error as Error).message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const xoaVinhVienDanhMucCon = async () => {
    if (!danhMucConCanXoaVinhVien) return;

    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/api/DanhMucCon/${danhMucConCanXoaVinhVien.maDanhMucCon}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          response.status === 404
            ? "Danh mục con không tồn tại."
            : response.status === 409
            ? "Không thể xóa vì có dữ liệu liên quan."
            : response.status === 500
            ? "Lỗi máy chủ."
            : errorText || "Không thể xóa vĩnh viễn danh mục con."
        );
      }

      setMoModalXoaVinhVien(false);
      setDanhMucConCanXoaVinhVien(null);
      await fetchDanhMucCon();
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Đã xóa vĩnh viễn danh mục con!",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Lỗi khi xóa vĩnh viễn danh mục con: " + (error as Error).message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(sortedAndFilteredDanhMucCon.length / ITEMS_PER_PAGE);
  const paginatedDanhMucCon = sortedAndFilteredDanhMucCon.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getTenLoaiSanPham = (kiHieu: string | undefined): string => {
    if (!kiHieu) return "Không xác định";
    const option = kiHieuOptions.find((opt) => opt.kiHieu === kiHieu);
    return option ? option.tenLoaiSanPham : "Không xác định";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Quản Lý Danh Mục Con</h1>
        {activeTab === "active" && (
          <Button
            className="bg-[#9b87f5] text-white hover:bg-[#8a76e3]"
            onClick={() => setMoModalThem(true)}
            disabled={loading || loadingProductTypes || isProcessing}
          >
            <FaPlus className="mr-2 h-4 w-4" /> Thêm Danh Mục Con
          </Button>
        )}
      </div>

      <Tabs defaultValue="active" className="w-full" onValueChange={(value) => setActiveTab(value as "active" | "inactive")}>
        <TabsList className="grid w-full md:w-auto grid-cols-2 gap-1">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> Danh Sách Danh Mục Con
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> Khôi Phục Danh Mục Con
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Tìm kiếm danh mục con..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full md:w-[820px] pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div>
              <Select
                value={kiHieuFilter}
                onValueChange={setKiHieuFilter}
                disabled={loadingProductTypes}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo loại sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {kiHieuOptions.map((option) => (
                    <SelectItem key={option.kiHieu} value={option.kiHieu}>
                      {option.tenLoaiSanPham}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading || loadingProductTypes ? (
            <div className="flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#9b87f5]" />
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Danh Sách Danh Mục Con</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Tên Danh Mục Con</TableHead>
                        <TableHead>Loại Sản Phẩm</TableHead>
                        <TableHead>Hành Động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedDanhMucCon.length > 0 ? (
                        paginatedDanhMucCon.map((dmc, index) => (
                          <TableRow key={dmc.maDanhMucCon} className="hover:bg-muted/50">
                            <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                            <TableCell>{dmc.tenDanhMucCon}</TableCell>
                            <TableCell>{getTenLoaiSanPham(dmc.kiHieu)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDanhMucConChiTiet(dmc);
                                      setMoModalChiTiet(true);
                                    }}
                                    className="text-green-700"
                                  >
                                    <FaEye className="mr-2 h-4 w-4" /> Xem
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDanhMucConDangSua(dmc);
                                      setMoModalSua(true);
                                    }}
                                    className="text-blue-700"
                                  >
                                    <FaEdit className="mr-2 h-4 w-4" /> Sửa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDanhMucConCanXoa(dmc);
                                      setMoModalXoa(true);
                                    }}
                                    className="text-red-700"
                                  >
                                    <FaTrashAlt className="mr-2 h-4 w-4" /> Ẩn
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            Không tìm thấy danh mục con nào.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Trước
                  </Button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      className={currentPage === page ? "bg-[#9b87f5] text-white hover:bg-[#8a76e3]" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="flex items-center"
                  >
                    Sau <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="inactive">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Tìm kiếm danh mục con..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full md:w-[820px] pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div>
              <Select
                value={kiHieuFilter}
                onValueChange={setKiHieuFilter}
                disabled={loadingProductTypes}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo loại sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {kiHieuOptions.map((option) => (
                    <SelectItem key={option.kiHieu} value={option.kiHieu}>
                      {option.tenLoaiSanPham}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading || loadingProductTypes ? (
            <div className="flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#9b87f5]" />
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Danh Sách Danh Mục Con Đã Ẩn</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Tên Danh Mục Con</TableHead>
                        <TableHead>Loại Sản Phẩm</TableHead>
                        <TableHead>Hành Động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedDanhMucCon.length > 0 ? (
                        paginatedDanhMucCon.map((dmc, index) => (
                          <TableRow key={dmc.maDanhMucCon} className="hover:bg-muted/50">
                            <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                            <TableCell>{dmc.tenDanhMucCon}</TableCell>
                            <TableCell>{getTenLoaiSanPham(dmc.kiHieu)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDanhMucConChiTiet(dmc);
                                      setMoModalChiTiet(true);
                                    }}
                                    className="text-green-700"
                                  >
                                    <FaEye className="mr-2 h-4 w-4" /> Chi tiết
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDanhMucConCanKhoiPhuc(dmc);
                                      setMoModalKhoiPhuc(true);
                                    }}
                                    className="text-blue-700"
                                  >
                                    <FaUndo className="mr-2 h-4 w-4" /> Khôi phục
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDanhMucConCanXoaVinhVien(dmc);
                                      setMoModalXoaVinhVien(true);
                                    }}
                                    className="text-red-700"
                                  >
                                    <FaTrash className="mr-2 h-4 w-4" /> Xóa vĩnh viễn
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            Không có danh mục con nào để khôi phục.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Trước
                  </Button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      className={currentPage === page ? "bg-[#9b87f5] text-white hover:bg-[#8a76e3]" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="flex items-center"
                  >
                    Sau <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={moModalThem} onOpenChange={setMoModalThem}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Danh Mục Con</DialogTitle>
            <DialogDescription>Nhập thông tin danh mục con mới.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên Danh Mục Con</label>
              <Input
                value={tenDanhMucConMoi}
                onChange={(e) => {
                  setTenDanhMucConMoi(e.target.value);
                  setErrorsThem((prev) => ({ ...prev, ten: "" }));
                }}
                placeholder="Tên danh mục con"
                maxLength={20}
                disabled={isProcessing || loadingProductTypes}
              />
              {errorsThem.ten && <p className="text-red-500 text-sm mt-1">{errorsThem.ten}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại Sản Phẩm</label>
              <Select
                value={kiHieuMoi}
                onValueChange={(value) => {
                  setKiHieuMoi(value);
                  setErrorsThem((prev) => ({ ...prev, kiHieu: "" }));
                }}
                disabled={isProcessing || loadingProductTypes}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {kiHieuOptions.map((option) => (
                    <SelectItem key={option.kiHieu} value={option.kiHieu}>
                      {option.tenLoaiSanPham}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorsThem.kiHieu && <p className="text-red-500 text-sm mt-1">{errorsThem.kiHieu}</p>}
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setMoModalThem(false)}
              disabled={isProcessing || loadingProductTypes}
              className="flex items-center gap-2 bg-[#e7e4f5]"
            >
              <X className="h-4 w-4" /> Hủy
            </Button>
            <Button
              onClick={themDanhMucCon}
              disabled={isProcessing || loadingProductTypes}
              className="bg-[#9b87f5] text-white hover:bg-[#8a76e3] flex items-center gap-2"
            >
              {isProcessing ? "Đang xử lý..." : "Thêm"} <Plus className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moModalSua} onOpenChange={setMoModalSua}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa Danh Mục Con</DialogTitle>
            <DialogDescription>Cập nhật thông tin danh mục con.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên Danh Mục Con</label>
              <Input
                value={danhMucConDangSua?.tenDanhMucCon || ""}
                onChange={(e) => {
                  setDanhMucConDangSua({ ...danhMucConDangSua!, tenDanhMucCon: e.target.value });
                  setErrorsSua((prev) => ({ ...prev, ten: "" }));
                }}
                placeholder="Tên danh mục con"
                maxLength={20}
                disabled={isProcessing || loadingProductTypes}
              />
              {errorsSua.ten && <p className="text-red-500 text-sm mt-1">{errorsSua.ten}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại Sản Phẩm</label>
              <Select
                value={danhMucConDangSua?.kiHieu}
                onValueChange={() => {}}
                disabled={true}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {kiHieuOptions.map((option) => (
                    <SelectItem key={option.kiHieu} value={option.kiHieu}>
                      {option.tenLoaiSanPham}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorsSua.kiHieu && <p className="text-red-500 text-sm mt-1">{errorsSua.kiHieu}</p>}
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setMoModalSua(false)}
              disabled={isProcessing || loadingProductTypes}
              className="flex items-center gap-2 bg-[#e7e4f5]"
            >
              <X className="h-4 w-4" /> Hủy
            </Button>
            <Button
              onClick={suaDanhMucCon}
              disabled={isProcessing || loadingProductTypes}
              className="bg-[#9b87f5] text-white hover:bg-[#8a76e3] flex items-center gap-2"
            >
              {isProcessing ? "Đang xử lý..." : "Lưu"} <FaEdit className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moModalChiTiet} onOpenChange={setMoModalChiTiet}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chi Tiết Danh Mục Con</DialogTitle>
            <DialogDescription>Thông tin chi tiết của danh mục con.</DialogDescription>
          </DialogHeader>
          {danhMucConChiTiet && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên Danh Mục Con</label>
                <Input value={danhMucConChiTiet.tenDanhMucCon} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Loại Sản Phẩm</label>
                <Input value={getTenLoaiSanPham(danhMucConChiTiet.kiHieu)} disabled />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setMoModalChiTiet(false)}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-[#e7e4f5]"
            >
              <X className="h-4 w-4" /> Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moModalXoa} onOpenChange={setMoModalXoa}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận ẩn danh mục con</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn ẩn danh mục con này không? Bạn có thể khôi phục lại sau.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setMoModalXoa(false)}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-[#e7e4f5]"
            >
              <X className="h-4 w-4" /> Hủy
            </Button>
            <Button
              onClick={anDanhMucCon}
              disabled={isProcessing}
              className="bg-[#9b87f5] text-white hover:bg-[#8a76e3] flex items-center gap-2"
            >
              {isProcessing ? "Đang xử lý..." : "Ẩn"} <FaTrashAlt className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moModalKhoiPhuc} onOpenChange={setMoModalKhoiPhuc}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận khôi phục danh mục con</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn khôi phục danh mục con này không?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setMoModalKhoiPhuc(false)}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-[#e7e4f5]"
            >
              <X className="h-4 w-4" /> Hủy
            </Button>
            <Button
              onClick={khoiPhucDanhMucCon}
              disabled={isProcessing}
              className="bg-[#9b87f5] text-white hover:bg-[#8a76e3] flex items-center gap-2"
            >
              {isProcessing ? "Đang xử lý..." : "Khôi phục"} <FaUndo className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moModalXoaVinhVien} onOpenChange={setMoModalXoaVinhVien}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa vĩnh viễn danh mục con</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xóa vĩnh viễn danh mục con này không? Hành động này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setMoModalXoaVinhVien(false)}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-[#e7e4f5]"
            >
              <X className="h-4 w-4" /> Hủy
            </Button>
            <Button
              onClick={xoaVinhVienDanhMucCon}
              disabled={isProcessing}
              className="bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
            >
              {isProcessing ? "Đang xử lý..." : "Xóa vĩnh viễn"} <FaTrash className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubcategories;