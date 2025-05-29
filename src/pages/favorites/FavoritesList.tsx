import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { X } from "lucide-react";

const YeuThich = () => {
  const [yeuThichList, setYeuThichList] = useState([]);
  const [comboData, setComboData] = useState({}); // Lưu trữ thông tin combo theo maCombo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setIsLoggedIn(!!userData);
    const currentUserId = userData?.maNguoiDung || null;
    setUserId(currentUserId);

    const fetchYeuThichList = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        // Lấy danh sách yêu thích
        const response = await fetch(
          `http://localhost:5261/api/YeuThich?maNguoiDung=${currentUserId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách yêu thích");
        }

        const data = await response.json();
        const filteredData = data.filter((item) => item.maNguoiDung === currentUserId);
        setYeuThichList(filteredData);

        // Lấy thông tin combo nếu có maCombo khác null
        const comboIds = filteredData
          .filter((item) => item.maCombo !== null)
          .map((item) => item.maCombo);

        if (comboIds.length > 0) {
          const comboResponse = await fetch(
            `http://localhost:5261/api/Combo/ComboSanPhamView`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!comboResponse.ok) {
            throw new Error("Không thể lấy danh sách combo");
          }

          const comboList = await comboResponse.json();
          const comboMap = {};
          comboList.forEach((combo) => {
            comboMap[combo.maCombo] = combo.name; // Sử dụng "name" thay vì "tenComBo"
          });
          setComboData(comboMap);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchYeuThichList();
  }, []);

  const handleDelete = async (maYeuThich) => {
    try {
      const response = await fetch(`http://localhost:5261/api/YeuThich/${maYeuThich}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setYeuThichList(yeuThichList.filter((item) => item.maYeuThich !== maYeuThich));
      } else {
        throw new Error("Không thể xóa mục yêu thích");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
     
        <main className="flex-grow py-20 px-6">
          <div className="container mx-auto max-w-6xl flex flex-col items-center justify-center text-center">
            <p>Đang tải...</p>
          </div>
        </main>
      
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
      
        <main className="flex-grow py-20 px-6">
          <div className="container mx-auto max-w-6xl flex flex-col items-center justify-center text-center">
            <p>{error}</p>
          </div>
        </main>
    
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col">
       
        <main className="flex-grow py-20 px-6">
          <div className="container mx-auto max-w-6xl flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#9B59B6" }}>
              Danh sách yêu thích
            </h2>
            <p className="text-muted-foreground mb-6">
              Vui lòng đăng nhập để xem danh sách yêu thích của bạn.
            </p>
            <Link to="/login" className="text-primary font-medium hover-effect hover:opacity-80">
              Đăng nhập ngay
            </Link>
          </div>
        </main>
       
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
    
      <main className="flex-grow py-20 px-6">
        <div className="container mx-auto max-w-6xl flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#9B59B6" }}>
            Danh sách yêu thích
          </h2>
          <p className="text-muted-foreground mb-6">
            Đây là trang hiển thị các sản phẩm và combo bạn đã thêm vào danh sách yêu thích.
          </p>
          {yeuThichList.length > 0 ? (
            <div className="w-full flex flex-col gap-4">
              {yeuThichList.map((item) => (
                <div
                  key={item.maYeuThich}
                  className="bg-white border rounded-xl p-4 shadow-md flex items-center justify-between w-full"
                  style={{ borderColor: "#9B59B6" }}
                >
                  <div className="flex items-center w-full gap-6">
                    {item.maCombo === null ? (
                      // Hiển thị sản phẩm nếu maCombo là null
                      <>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold truncate">
                            Mã sản phẩm: {item.maSanPham}
                          </h3>
                        </div>
                        <div className="flex-2 min-w-0">
                          <h3 className="text-lg font-semibold truncate">
                            Tên sản phẩm: {item.tenSanPham}
                          </h3>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-muted-foreground truncate">
                            Ngày yêu thích: {new Date(item.ngayYeuThich).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Link
                            to={`/product/${item.maSanPham}`}
                            className="text-primary font-medium hover-effect hover:opacity-80 whitespace-nowrap"
                          >
                            Xem Chi Tiết
                          </Link>
                          <button
                            className="h-10 w-10 border border-primary/30 rounded-full hover:bg-primary/5 transition-colors flex items-center justify-center"
                            onClick={() => handleDelete(item.maYeuThich)}
                          >
                            <X className="h-5 w-5 text-red-500" />
                          </button>
                        </div>
                      </>
                    ) : (
                      // Hiển thị combo nếu maCombo khác null
                      <>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold truncate">
                            Mã combo: {item.maCombo}
                          </h3>
                        </div>
                        <div className="flex-2 min-w-0">
                          <h3 className="text-lg font-semibold truncate">
                            Tên combo: {comboData[item.maCombo] || "Đang tải..."}
                          </h3>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-muted-foreground truncate">
                            Ngày yêu thích: {new Date(item.ngayYeuThich).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Link
                            to={`/combo/${item.maCombo}`} // Giả định đường dẫn cho combo
                            className="text-primary font-medium hover-effect hover:opacity-80 whitespace-nowrap"
                          >
                            Xem Chi Tiết
                          </Link>
                          <button
                            className="h-10 w-10 border border-primary/30 rounded-full hover:bg-primary/5 transition-colors flex items-center justify-center"
                            onClick={() => handleDelete(item.maYeuThich)}
                          >
                            <X className="h-5 w-5 text-red-500" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <p>(Chưa có sản phẩm hoặc combo nào trong danh sách yêu thích)</p>
            </div>
          )}
        </div>
      </main>
    
    </div>
  );
};

export default YeuThich;