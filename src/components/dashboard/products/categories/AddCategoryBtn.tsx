import { FC, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { CategoryList } from "./test-category-list-data";
import { ShoppingBag, Airplay, Aperture, Book, Box, Cake, Car, Coffee, Droplet, Home, Laptop, Leaf, Utensils, LucideIcon } from "lucide-react";

// Map of string icon names to actual Lucide icons
const iconMap: Record<string, LucideIcon> = {
  ShoppingBag,
  Airplay,
  Aperture,
  Book,
  Box,
  Cake,
  Car,
  Coffee,
  Droplet,
  Home,
  Laptop,
  Leaf,
  Utensils,
};

// Define string icon names
const categoryIcons = [
  "ShoppingBag",
  "Airplay",
  "Aperture",
  "Book",
  "Box",
  "Cake",
  "Car",
  "Coffee",
  "Droplet",
  "Home",
  "Laptop",
  "Leaf",
  "Utensils",
];

const AddCategoryBtn: FC<{ onAddCategory: (newCategory: CategoryList) => void }> = ({ onAddCategory }) => {
  const [categoryName, setCategoryName] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCategoryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value);
  };

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    setError(null);
  };

  const handleAddCategory = () => {
    if (!selectedIcon) {
      setError("Please choose a category icon");
      return;
    }

    const newCategory: CategoryList = {
      id: Math.random(),
      description: categoryName,
      icon: selectedIcon, // Store the selected icon as a string
    };

    onAddCategory(newCategory);
    setIsDialogOpen(false);
    setCategoryName('');
    setSelectedIcon(null);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Enter the details for the new category and choose an icon.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="Category name"
              value={categoryName}
              onChange={handleCategoryInput}
            />
            <Button
              className="ml-2"
              onClick={handleAddCategory}
              disabled={!categoryName || !selectedIcon}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">Choose category icon:</h3>
          <Card>
            <CardContent className="grid grid-cols-4 gap-2 p-2">
              {categoryIcons.map((icon, index) => {
                const Icon = iconMap[icon]; // Use iconMap to get the actual Lucide icon
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`p-2 hover:bg-secondary ${selectedIcon === icon ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => handleIconSelect(icon)}
                  >
                    {Icon && <Icon className="h-6 w-6" />} {/* Render icon dynamically */}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryBtn;
