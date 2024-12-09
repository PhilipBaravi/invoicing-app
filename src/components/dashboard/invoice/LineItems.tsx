import { FC } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { LineItem, Category, Product } from './invoice-types';
import { useTranslation } from 'react-i18next';

interface LineItemsProps {
  lineItems: LineItem[];
  handleAddLineItem: () => void;
  handleLineItemChange: (index: number, field: keyof LineItem, value: string | number) => void;
  handleRemoveLineItem: (index: number) => void;
  handleAddTaxes: (index: number) => void;
  handleItemSelect: (index: number, categoryId: number, productId: number) => void;
  categories: Category[];
  products: Product[];
  isEditMode: boolean;
}

const LineItems: FC<LineItemsProps> = ({
  lineItems,
  handleAddLineItem,
  handleLineItemChange,
  handleRemoveLineItem,
  handleAddTaxes,
  handleItemSelect,
  categories,
  products,
  isEditMode,
}) => {
  const { t } = useTranslation('invoices');
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
    <Label htmlFor="lineItems">{t('invoice.lineItems.pageTitle')}</Label>
    <div className="overflow-x-auto">
      <table className="w-full mb-2 min-w-[640px]">
        <thead>
          <tr>
            <th className="text-left w-[20%]">{t('invoice.lineItems.category')}</th>
            <th className="text-left w-[20%]">{t('invoice.lineItems.product')}</th>
            <th className="text-left w-[15%]">{t('invoice.lineItems.price')}</th>
            <th className="text-left w-[15%]">{t('invoice.lineItems.quantity')}</th>
            <th className="text-center w-[15%]">{t('invoice.lineItems.lineTotal')}</th>
            <th className="w-[15%]">{t('invoice.lineItems.actions')}</th>
          </tr>
        </thead>
      </table>

      {lineItems.length === 0 ? (
        !isEditMode && (
          <Button onClick={handleAddLineItem} id="lineItems" className="mb-4">
            <PlusIcon className="mr-2 h-4 w-4" /> {t('invoice.lineItems.add')}
          </Button>
        )
      ) : (
        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <Select
                  value={item.categoryId ? item.categoryId.toString() : undefined}
                  onValueChange={(value) => handleLineItemChange(index, 'categoryId', Number(value))}
                  disabled={isEditMode}
                >
                  <SelectTrigger className="w-full sm:w-[20%]">
                    <SelectValue placeholder={t('invoice.lineItems.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={item.itemId ? item.itemId.toString() : undefined}
                  onValueChange={(value) => handleItemSelect(index, item.categoryId, Number(value))}
                  disabled={!item.categoryId || isEditMode}
                >
                  <SelectTrigger className="w-full sm:w-[20%]">
                    <SelectValue placeholder={t('invoice.lineItems.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter((product) => product.category.id === item.categoryId)
                      .map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Input
                  className="w-full sm:w-[15%]"
                  type="number"
                  min="0"
                  value={item.price}
                  onChange={(e) => handleLineItemChange(index, 'price', e.target.value)}
                />
                <Input
                  className="w-full sm:w-[15%]"
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                />
                <div className="w-full sm:w-[15%] flex items-center justify-center font-bold">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <div className="w-full sm:w-[15%] flex items-center justify-center gap-2">
                  <Button variant="link" onClick={() => handleAddTaxes(index)} className="text-blue-700">
                    {t('invoice.lineItems.addTax')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveLineItem(index)} disabled={isEditMode}>
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder={t('invoice.lineItems.enterDescription')}
                value={item.description}
                onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                className="w-full"
              />
              {item.error && <p className="text-red-500 mt-1">{item.error}</p>}
            </div>
          ))}
          {!isEditMode && (
            <Button onClick={handleAddLineItem} className="mt-2">
              <PlusIcon className="mr-2 h-4 w-4" /> {t('invoice.lineItems.add')}
            </Button>
          )}
        </div>
      )}
    </div>
  </div>
  );
};

export default LineItems;
