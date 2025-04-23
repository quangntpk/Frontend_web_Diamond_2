
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, CreditCard, ChevronRight, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

// Mock data
const cartItems = [
  {
    id: 1,
    name: "Crocus Cotton Tee",
    image: "https://via.placeholder.com/80x80",
    price: 29.99,
    quantity: 1,
    size: "M",
    color: "Crocus Purple",
    type: "product"
  },
  {
    id: 2,
    name: "Linen Blend Shirt",
    image: "https://via.placeholder.com/80x80",
    price: 49.99,
    quantity: 2,
    size: "L",
    color: "White",
    type: "product"
  },
  {
    id: 3,
    name: "Summer Dress",
    image: "https://via.placeholder.com/80x80",
    price: 79.99,
    quantity: 1,
    size: "S",
    color: "Floral",
    type: "product"
  },
  {
    id: 101,
    name: "Essential Capsule Combo",
    image: "https://via.placeholder.com/80x80",
    additionalImages: [
      "https://via.placeholder.com/40x40?text=1",
      "https://via.placeholder.com/40x40?text=2",
      "https://via.placeholder.com/40x40?text=3"
    ],
    price: 149.99,
    quantity: 1,
    description: "Crocus Purple blouse, neutral trousers, versatile blazer",
    type: "combo"
  }
];

// Calculate subtotal
const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const shipping = 5.99;
const tax = subtotal * 0.1; // 10% tax

// Available discount codes
const discountCodes = [
  { code: "WELCOME10", discount: 0.10 },
  { code: "SUMMER25", discount: 0.25 },
  { code: "FASHION15", discount: 0.15 },
  { code: "CROCUS20", discount: 0.20 },
  { code: "NEWYOU", discount: 0.30 }
];

export const CheckoutForm = () => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'review' | 'confirmation'>('shipping');
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [discountCode, setDiscountCode] = useState<string>("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  
  // Calculate total with discount
  const discountAmount = subtotal * appliedDiscount;
  const total = subtotal + shipping + tax - discountAmount;

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep('review');
    window.scrollTo(0, 0);
  };

  const handleReviewSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('confirmation');
      window.scrollTo(0, 0);
    }, 1500);
  };

  const handleApplyDiscountCode = () => {
    const code = discountCodes.find(c => c.code === discountCode.toUpperCase());
    
    if (code) {
      setAppliedDiscount(code.discount);
      toast.success("Discount code applied successfully!", {
        description: `${Math.round(code.discount * 100)}% discount has been applied to your order.`
      });
    } else {
      toast.error("Invalid discount code", {
        description: "Please check your code and try again."
      });
    }
    
    setDiscountCode("");
  };
  
  const handleSpin = () => {
    setIsSpinning(true);
    
    // Simulate spinning for 2 seconds
    setTimeout(() => {
      // Randomly select a discount code
      const randomIndex = Math.floor(Math.random() * discountCodes.length);
      const selectedCode = discountCodes[randomIndex];
      setSpinResult(selectedCode.code);
      setIsSpinning(false);
      
      // Auto-apply the discount after spinning
      setAppliedDiscount(selectedCode.discount);
      toast.success("You won a discount code!", {
        description: `${selectedCode.code} (${Math.round(selectedCode.discount * 100)}% off) has been applied to your order.`
      });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {step !== 'confirmation' && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' || step === 'payment' || step === 'review' ? 'bg-crocus-500 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className="ml-2">Shipping</div>
            </div>
            <div className="h-0.5 flex-1 bg-gray-200 mx-4" />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' || step === 'review' ? 'bg-crocus-500 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <div className="ml-2">Payment</div>
            </div>
            <div className="h-0.5 flex-1 bg-gray-200 mx-4" />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-crocus-500 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <div className="ml-2">Review</div>
            </div>
          </div>
        </div>
      )}

      {step === 'shipping' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Enter your shipping details</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="shippingForm" onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      required
                      value={shippingInfo.fullName}
                      onChange={handleShippingInfoChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="123 Main St, Apt 4B"
                      required
                      value={shippingInfo.address}
                      onChange={handleShippingInfoChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="New York"
                        required
                        value={shippingInfo.city}
                        onChange={handleShippingInfoChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="NY"
                        required
                        value={shippingInfo.state}
                        onChange={handleShippingInfoChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip/Postal Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        placeholder="10001"
                        required
                        value={shippingInfo.zipCode}
                        onChange={handleShippingInfoChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="(123) 456-7890"
                        required
                        value={shippingInfo.phone}
                        onChange={handleShippingInfoChange}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild variant="outline">
                  <Link to="/user/cart">Back to Cart</Link>
                </Button>
                <Button type="submit" form="shippingForm" className="bg-crocus-500 hover:bg-crocus-600">
                  Continue to Payment <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <div className="flex gap-2">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                          {item.type === "product" && (
                            <p className="text-xs text-gray-500">{item.size} | {item.color}</p>
                          )}
                        </div>
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mb-4">
                  <Star className="w-4 h-4 mr-2 text-crocus-500" />
                  Spin for a Discount
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center">Lucky Spin Discount</DialogTitle>
                  <DialogDescription className="text-center">
                    Spin the wheel to win a discount code for your order!
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center py-6">
                  <div className="relative w-64 h-64 mb-6">
                    {/* Simple representation of a spinning wheel */}
                    <div 
                      className={`w-full h-full rounded-full border-8 border-crocus-500 flex items-center justify-center transition-transform duration-1000 ${isSpinning ? 'animate-spin' : ''}`}
                      style={{ 
                        backgroundImage: "conic-gradient(#9b87f5, #7E69AB, #6E59A5, #9b87f5, #7E69AB, #6E59A5)",
                        boxShadow: "0 0 15px rgba(155, 135, 245, 0.5)"
                      }}
                    >
                      {!isSpinning && spinResult && (
                        <div className="bg-white p-3 rounded-lg text-center z-10">
                          <p className="font-bold text-crocus-700">{spinResult}</p>
                          <p className="text-xs text-gray-500">Applied to your order</p>
                        </div>
                      )}
                    </div>
                    {/* Arrow pointer */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                      <div className="w-0 h-0 border-left-8 border-right-8 border-top-8 border-transparent border-l-transparent border-r-transparent border-b-crocus-700"></div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSpin} 
                    disabled={isSpinning || spinResult !== null}
                    className="bg-crocus-500 hover:bg-crocus-600"
                  >
                    {isSpinning ? (
                      <span className="flex items-center">
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        Spinning...
                      </span>
                    ) : spinResult ? (
                      <span>Discount Applied!</span>
                    ) : (
                      <span>Spin the Wheel</span>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="flex gap-2">
              <Input 
                placeholder="Discount Code" 
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <Button 
                onClick={handleApplyDiscountCode}
                variant="outline"
                disabled={!discountCode}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how you want to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="paymentForm" onSubmit={handlePaymentSubmit} className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} required>
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card" className="flex items-center cursor-pointer w-full">
                        <CreditCard className="h-5 w-5 mr-2" />
                        <span>Credit/Debit Card</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="vnpay" id="vnpay" />
                      <Label htmlFor="vnpay" className="flex items-center cursor-pointer w-full">
                        <img src="https://via.placeholder.com/40x20" alt="VNPay" className="mr-2" />
                        <span>VNPay</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="zalopay" id="zalopay" />
                      <Label htmlFor="zalopay" className="flex items-center cursor-pointer w-full">
                        <img src="https://via.placeholder.com/40x20" alt="ZaloPay" className="mr-2" />
                        <span>ZaloPay</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center cursor-pointer w-full">
                        <span>Cash on Delivery (COD)</span>
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {paymentMethod === 'credit-card' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('shipping')}>
                  Back
                </Button>
                <Button 
                  type="submit" 
                  form="paymentForm" 
                  className="bg-crocus-500 hover:bg-crocus-600"
                  disabled={!paymentMethod}
                >
                  Continue to Review <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <div className="flex gap-2">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                        </div>
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Order</CardTitle>
                <CardDescription>Please verify your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Products</h3>
                  <ul className="space-y-3 bg-gray-50 p-4 rounded-md">
                    {cartItems.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <div className="flex gap-2">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                            {item.type === "product" && (
                              <p className="text-xs text-gray-500">{item.size} | {item.color}</p>
                            )}
                          </div>
                        </div>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Shipping Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="font-medium">{shippingInfo.fullName}</p>
                    <p>{shippingInfo.address}</p>
                    <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                    <p>{shippingInfo.phone}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Payment Method</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {paymentMethod === 'credit-card' && <p>Credit/Debit Card</p>}
                    {paymentMethod === 'vnpay' && <p>VNPay</p>}
                    {paymentMethod === 'zalopay' && <p>ZaloPay</p>}
                    {paymentMethod === 'cod' && <p>Cash on Delivery (COD)</p>}
                  </div>
                </div>
                
                <form id="reviewForm" onSubmit={handleReviewSubmit}>
                  {/* Hidden form elements if needed */}
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('payment')}>
                  Back
                </Button>
                <Button
                  type="submit"
                  form="reviewForm"
                  className="bg-crocus-500 hover:bg-crocus-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span>Place Order</span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === 'confirmation' && (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-4 text-2xl font-bold">Order Confirmed!</h2>
              <p className="mt-2 text-gray-600">
                Thank you for your order. We've received your payment and will process your order shortly.
              </p>
              
              <div className="mt-6 border-t border-b py-4">
                <p className="font-medium">Order #12345</p>
                <p className="text-sm text-gray-500 mt-1">A confirmation has been sent to your email.</p>
              </div>
              
              <div className="mt-6 flex gap-4 justify-center">
                <Button asChild className="bg-crocus-500 hover:bg-crocus-600">
                  <Link to="/user/orders">View Order</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
