import { FC, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
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
  ShoppingBag,
  Utensils,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { CategoryList } from "./test-category-list-data"; // Importing the Category type

const categoryIcons: LucideIcon[] = [
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
];

interface EditCategoryBtnProps {
  category: CategoryList;
  onEditCategory: (updatedCategory: CategoryList) => void;
}

const EditCategoryBtn: FC<EditCategoryBtnProps> = ({ category, onEditCategory }) => {
  const [categoryName, setCategoryName] = useState<string>(category.description);
  const [selectedIcon, setSelectedIcon] = useState<LucideIcon | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Set the selected icon based on the icon string from the category
    const icon = categoryIcons.find((Icon) => Icon.name === category.icon);
    setSelectedIcon(icon || null);
  }, [category.icon]);

  const handleCategoryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value);
  };

  const handleIconSelect = (icon: LucideIcon) => {
    setSelectedIcon(icon);
  };

  const handleEditCategory = () => {
    if (!selectedIcon) return;

    const updatedCategory: CategoryList = {
      ...category,
      description: categoryName,
      icon: selectedIcon.name, // Store the updated icon as a string
    };

    onEditCategory(updatedCategory);

    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Pencil className="mr-2 h-4 w-4" /> Edit Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Modify the details for the category and choose an icon.
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
              onClick={handleEditCategory}
              disabled={!categoryName || !selectedIcon}
            >
              Save
            </Button>
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">Choose category icon:</h3>
          <Card>
            <CardContent className="grid grid-cols-4 gap-2 p-2">
              {categoryIcons.map((Icon, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`p-2 hover:bg-secondary ${
                    selectedIcon === Icon ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  onClick={() => handleIconSelect(Icon)}
                >
                  <Icon className="h-6 w-6" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryBtn;
