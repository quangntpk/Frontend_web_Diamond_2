
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Minus, Plus, Trash, Images } from "lucide-react";
import { CartItem } from "@/types/cart";

interface ComboCartItemProps {
  item: CartItem;
  onQuantityChange: (id: number, change: number) => void;
  onRemoveItem: (id: number) => void;
}

export const ComboCartItem = ({ item, onQuantityChange, onRemoveItem }: ComboCartItemProps) => {
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="w-32 overflow-hidden rounded-lg border border-gray-200 relative">
          <AspectRatio ratio={16/9} className="bg-gray-50">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {item.additionalImages && item.additionalImages.length > 0 && (
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white rounded-md px-1.5 py-0.5 text-xs flex items-center">
                <Images className="h-3 w-3 mr-1" />
                {item.additionalImages.length}
              </div>
            )}
          </AspectRatio>
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.description}</p>
          <p className="font-medium mt-1">${item.price.toFixed(2)}</p>
        </div>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onQuantityChange(item.id, -1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="mx-3 w-6 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onQuantityChange(item.id, 1)}
          >
            <Plus className="h-3 w-3" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-red-500"
          onClick={() => onRemoveItem(item.id)}
        >
          <Trash className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>
      {item.additionalImages && item.additionalImages.length > 0 && (
        <div className="mt-3 pl-36">
          <p className="text-xs text-gray-500 mb-2">Included items:</p>
          <div className="flex gap-2">
            {item.additionalImages.map((img, index) => (
              <div key={index} className="w-16 h-16 overflow-hidden rounded-lg border border-gray-200">
                <AspectRatio ratio={1} className="bg-gray-50">
                  <img
                    src={img}
                    alt={`${item.name} item ${index+1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </AspectRatio>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
