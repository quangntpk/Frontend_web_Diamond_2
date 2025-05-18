import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Mail, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const LoginForm = () => {
  const [taiKhoan, setTaiKhoan] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTaiKhoan = localStorage.getItem("savedTaiKhoan");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedTaiKhoan && savedPassword) {
      setTaiKhoan(savedTaiKhoan);
      setPassword(savedPassword);
      setRememberPassword(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (rememberPassword) {
      localStorage.setItem("savedTaiKhoan", taiKhoan);
      localStorage.setItem("savedPassword", password);
    } else {
      localStorage.removeItem("savedTaiKhoan");
      localStorage.removeItem("savedPassword");
    }

    try {
      const response = await axios.post("http://localhost:5261/api/XacThuc/DangNhap", {
        taiKhoan,
        matKhau: password,
      });

      const { message, user, token, redirectUrl } = response.data;

      if (user && user.vaiTro !== 1) {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.maNguoiDung || "");
        localStorage.setItem("user", JSON.stringify({
          maNguoiDung: user.maNguoiDung || "",
          fullName: user.hoTen || "",
          email: user.email || "",
          vaiTro: user.vaiTro || "",
        }));
        window.dispatchEvent(new Event("storageChange"));
      }

      toast({
        title: "Đăng nhập thành công 🎉",
        description: message || "Chào mừng bạn quay trở lại!",
        duration: 3000,
        className: "bg-green-500 text-white border border-green-700 shadow-lg",
        action: (
          <Button variant="outline" className="bg-white text-green-500 hover:bg-green-100 border-green-500">
            Đóng
          </Button>
        ),
      });

      if (redirectUrl && redirectUrl !== window.location.origin) {
        const userData = encodeURIComponent(JSON.stringify({
          fullName: user?.hoTen || "",
          email: user?.email || "",
          role: user?.vaiTro || "",
        }));
        window.location.href = `${redirectUrl}?token=${token}&userId=${user?.maNguoiDung || ""}&user=${userData}`;
      } else {
        navigate("/");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại ⚠️",
        description: error.response?.data?.message || "Vui lòng kiểm tra lại thông tin.",
        duration: 3000,
        className: "bg-red-500 text-white border border-red-700 shadow-lg",
        action: (
          <Button variant="outline" className="bg-white text-red-500 hover:bg-red-100 border-red-500">
            Đóng
          </Button>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await axios.get("http://localhost:5261/api/XacThuc/google-login", {
        params: { returnUrl: "/api/XacThuc/google-callback" },
      });
      const { loginUrl } = response.data;
      if (!loginUrl) throw new Error("Không thể lấy URL đăng nhập Google");
      window.location.href = loginUrl;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Đăng nhập Google thất bại ⚠️",
        description: error.message || "Đã có lỗi xảy ra khi đăng nhập với Google.",
        duration: 3000,
        className: "bg-red-500 text-white border border-red-700 shadow-lg",
        action: (
          <Button
            variant="outline"
            className="bg-white text-red-500 hover:bg-red-100 border-red-500"
          >
            Đóng
          </Button>
        ),
      });
    }
  };

  const handleCheckboxChange = (checked) => {
    setRememberPassword(!!checked);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
        <CardDescription className="text-center">
          Nhập thông tin đăng nhập của bạn để truy cập tài khoản
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-2">
            <Label htmlFor="username">Tài khoản</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                id="username"
                placeholder="Nhập tài khoản"
                type="text"
                required
                value={taiKhoan}
                onChange={(e) => setTaiKhoan(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link
                to="/auth/forgot-password"
                className="text-sm font-medium text-crocus-600 hover:text-crocus-700"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberPassword}
              onCheckedChange={handleCheckboxChange}
            />
            <label
              htmlFor="rememberMe"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Ghi nhớ mật khẩu
            </label>
          </div>

          <Button type="submit" className="w-full bg-crocus-500 hover:bg-crocus-600">
            <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" onClick={handleGoogleLogin}>
              {/* Google SVG */}
              Google
            </Button>
            <Button variant="outline" type="button">
              {/* Hotmail SVG */}
              Hotmail
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-center text-sm">
          Chưa có tài khoản?{" "}
          <Link to="/auth/register" className="font-medium text-crocus-600 hover:text-crocus-700">
            Đăng ký
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};
