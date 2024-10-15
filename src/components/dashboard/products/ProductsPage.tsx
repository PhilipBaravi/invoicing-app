import { FC, useState } from "react";
import { Search, Filter, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductTable from "./ProductTable";
import ProductFilter from "./ProductFilter";
import ProductFormDialog from "./ProductFormDialog";

interface Product {
  id: string;
  name: string;
  status: "Active" | "Draft";
  price: number;
  totalSales: number;
  createdAt: string;
}

const initialProducts: Product[] = [
  { id: "1", name: "Laser Lemonade Machine", status: "Draft", price: 499.99, totalSales: 25, createdAt: "2023-07-12 10:42 AM" },
  { id: "2", name: "Hypernova Headphones", status: "Active", price: 129.99, totalSales: 100, createdAt: "2023-10-18 03:21 PM" },
  { id: "3", name: "AeroGlow Desk Lamp", status: "Active", price: 39.99, totalSales: 50, createdAt: "2023-11-29 08:15 AM" },
  { id: "4", name: "TechTonic Energy Drink", status: "Draft", price: 2.99, totalSales: 0, createdAt: "2023-12-25 11:59 PM" },
  { id: "5", name: "Gamer Gear Pro Controller", status: "Active", price: 59.99, totalSales: 75, createdAt: "2024-01-01 12:00 AM" },
  { id: "6", name: "Luminous VR Headset", status: "Active", price: 199.99, totalSales: 30, createdAt: "2024-02-14 02:14 PM" },
];

const ProductsPage : FC = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'totalSales' | 'createdAt'>>({
    name: '',
    status: 'Draft',
    price: 0,
  });

  // Define isFilterOpen and setIsFilterOpen here:
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });

  const filteredProducts = products.filter((product) => {
    const matchesTab = activeTab === "All" || product.status === activeTab;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDateRange = dateRange.from && dateRange.to
      ? new Date(product.createdAt) >= dateRange.from && new Date(product.createdAt) <= dateRange.to
      : true;
    const matchesPriceRange = product.price >= priceRange.min && product.price <= priceRange.max;
    return matchesTab && matchesSearch && matchesDateRange && matchesPriceRange;
  });

  const handleAddProduct = () => {
    const product: Product = {
      ...newProduct,
      id: (products.length + 1).toString(),
      totalSales: 0,
      createdAt: new Date().toLocaleString(),
    };
    setProducts([...products, product]);
    setIsDialogOpen(false);
    setNewProduct({ name: '', status: 'Draft', price: 0 });
  };

  const handleEditProduct = () => {
    if (editingProduct) {
      const updatedProducts = products.map(p =>
        p.id === editingProduct.id ? { ...editingProduct, ...newProduct } : p
      );
      setProducts(updatedProducts);
      setIsDialogOpen(false);
      setEditingProduct(null);
      setNewProduct({ name: '', status: 'Draft', price: 0 });
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      status: product.status,
      price: product.price,
    });
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    const headers = ["Name", "Status", "Price", "Total Sales", "Created At"];
    const csvContent = [
      headers.join(","),
      ...filteredProducts.map(product =>
        [product.name, product.status, product.price, product.totalSales, product.createdAt].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "products.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full  mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Products</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Manage your products and view their sales performance.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          {["All", "Active", "Draft"].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-2 text-sm font-medium ${
                activeTab === tab
                  ? "text-stone-900 dark:text-stone-100 border-b-2 border-stone-900 dark:border-stone-100"
                  : "text-stone-500 dark:text-stone-400"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500 dark:text-stone-400" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ProductFilter
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            dateRange={dateRange}
            setDateRange={setDateRange}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <ProductTable
        products={filteredProducts}
        openEditDialog={openEditDialog}
      />

      <ProductFormDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleAddProduct={handleAddProduct}
        handleEditProduct={handleEditProduct}
        editingProduct={editingProduct}
      />
    </div>
  );
}

export default ProductsPage