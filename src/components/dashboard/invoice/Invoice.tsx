import React, { useState, useRef, FC, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTheme } from '../layout/ThemeProvider';
import { useKeycloak } from '@react-keycloak/web';
import LineItems from './LineItems';
import ClientSelector from './ClientSelector';
import InvoiceDetails from './InvoiceDetails';
import Totals from './Totals';
import Signatures from './Signatures';
import Attachments from './Attachments';
import TaxDialog from './TaxDialog';
import LogoUploader from './LogoUploader';
import { Separator } from '@/components/ui/separator';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import {
  LineItem,
  Invoice,
  ClientVendor,
  BusinessInfo,
  Category,
  Product,
} from './invoice-types';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const currencies = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GEL: { symbol: "₾", rate: 2.65 },
};

const InvoiceComponent: FC = () => {
  const [invoice, setInvoice] = useState<Invoice>({
    id: 0,
    invoiceNo: '',
    invoiceStatus: 'AWAITING_APPROVAL',
    invoiceType: 'SALES',
    dateOfIssue: null,
    dueDate: new Date(),
    paymentTerms: '',
    notes: '',
    clientVendor: null,
    price: 0,
    tax: 0,
    total: 0,
    businessSignature: '',
    clientSignature: '',
    currency: ''
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [showTaxDialog, setShowTaxDialog] = useState(false);
  const [taxDetails, setTaxDetails] = useState({
    percentage: 0,
    name: '',
    number: '',
  });
  const [businessSignatureImage, setBusinessSignatureImage] = useState<string | null>(null);
  const [clientSignatureImage, setClientSignatureImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigCanvasBusinessRef = useRef<any>(null);
  const sigCanvasClientRef = useRef<any>(null);
  const businessSignatureInputRef = useRef<HTMLInputElement>(null);
  const clientSignatureInputRef = useRef<HTMLInputElement>(null);
  const [selectedClient, setSelectedClient] = useState<ClientVendor | null>(null);

  const [logo, setLogo] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { keycloak } = useKeycloak();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [clients, setClients] = useState<ClientVendor[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(false);
  const [businessInformation, setBusinessInformation] = useState<BusinessInfo | null>(null);
  const { t } = useTranslation('invoices');
  const { toast } = useToast();

  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedCurrency = (queryParams.get('currency') as keyof typeof currencies) || 'USD';
  const { symbol, rate } = currencies[selectedCurrency];

  const updateTotals = useCallback((items: LineItem[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = items.reduce(
      (sum, item) => sum + (item.price * item.quantity * item.tax) / 100,
      0
    );
    const total = subtotal + tax;
    setInvoice((prev) => ({
      ...prev,
      price: subtotal,
      tax: tax,
      total: total,
    }));
  }, []);

  const fetchProductsAndCategories = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.invoicehub.space/api/v1/product/list',
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        const fetchedProducts: Product[] = data.data;
        const convertedProducts = fetchedProducts.map((product) => {
          const productRate = currencies[product.currency as keyof typeof currencies].rate;
          const convertedPrice = product.price * (rate / productRate);
          return {
            ...product,
            price: convertedPrice
          }
        });

        setProducts(convertedProducts);

        const uniqueCategories = Array.from(
          new Set(convertedProducts.map((product: Product) => product.category.id))
        )
          .map((id) =>
            convertedProducts.find(
              (product: Product) => product.category.id === id
            )?.category
          )
          .filter(
            (category): category is Category => category !== undefined
          );

        setCategories(uniqueCategories);
      } else {
        setErrorMessage(
          `${t('invoice.errors.failedFetchProducts')} ${data.message}`
        );
      }
    } catch (error) {
      setErrorMessage(t('invoice.errors.failedFetchingProducts'));
    }
  }, [keycloak.token, t, rate]);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const response = await fetch(
          'https://api.invoicehub.space/api/v1/clientVendor/list',
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          }
        );
        const data = await response.json();

        if (data.success) {
          setClients(data.data);
        } else {
          setErrorMessage(`${t('invoice.errors.failedFetchClients')} ${data.message}`);
        }
      } catch (error) {
        setErrorMessage(t('invoice.errors.failedFetchingClients'));
      } finally {
        setIsLoadingClients(false);
      }
    };

    const fetchLoggedInCompanyDetails = async () => {
      try {
        const response = await fetch(
          'https://api.invoicehub.space/api/v1/user/loggedInUser',
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          }
        );
        const data = await response.json();

        if (data.success) {
          setBusinessInformation(data.data.company);
        } else {
          setErrorMessage(t('invoice.errors.failedFetchBusiness'));
        }
      } catch (error) {
        setErrorMessage(t('invoice.errors.failedFetchBusiness'));
      }
    };

    if (keycloak && keycloak.token) {
      fetchLoggedInCompanyDetails();
      fetchProductsAndCategories();
      fetchClients();
    }
  }, [keycloak, fetchProductsAndCategories, t]);

  const handleClientSelect = useCallback(
    (clientName: string) => {
      const client = clients.find((c) => c.name === clientName);
      if (client) {
        setSelectedClient(client);
        setInvoice((prevInvoice) => ({
          ...prevInvoice,
          clientVendor: client,
        }));
      } else {
        setSelectedClient(null);
      }
    },
    [clients]
  );

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        if (isEditMode) {
          const response = await fetch('https://api.invoicehub.space/api/v1/invoice/list', {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            const invoices = data.data;
            const fetchedInvoice = invoices.find((inv: any) => inv.id === Number(id));
            if (fetchedInvoice) {
              setInvoice({
                id: fetchedInvoice.id,
                invoiceNo: fetchedInvoice.invoiceNo,
                invoiceStatus: fetchedInvoice.invoiceStatus,
                invoiceType: fetchedInvoice.invoiceType,
                dateOfIssue: fetchedInvoice.dateOfIssue ? new Date(fetchedInvoice.dateOfIssue) : null,
                dueDate: fetchedInvoice.dueDate ? new Date(fetchedInvoice.dueDate) : null,
                paymentTerms: fetchedInvoice.paymentTerms,
                notes: fetchedInvoice.notes,
                clientVendor: fetchedInvoice.clientVendor,
                price: fetchedInvoice.price,
                tax: fetchedInvoice.tax,
                total: fetchedInvoice.total,
                businessSignature: fetchedInvoice.businessSignature,
                clientSignature: fetchedInvoice.clientSignature,
                currency: fetchedInvoice.currency
              });

              setSelectedClient(fetchedInvoice.clientVendor);

              const lineItemsResponse = await fetch(`https://api.invoicehub.space/api/v1/invoice/product/list/${id}`, {
                headers: {
                  Authorization: `Bearer ${keycloak.token}`,
                },
              });

              if (lineItemsResponse.ok) {
                const lineItemsData = await lineItemsResponse.json();
                const fetchedLineItems = lineItemsData.data.map((item: any) => ({
                  itemId: item.product.id,
                  categoryId: item.product.category.id,
                  name: item.product.name,
                  description: item.product.description || '',
                  price: item.price * (rate / currencies[item.product.currency as keyof typeof currencies].rate),
                  quantity: item.quantity,
                  tax: item.tax,
                  maxQuantity: item.product.quantityInStock,
                  error: '',
                }));
                setLineItems(fetchedLineItems);
                updateTotals(fetchedLineItems);
              } else {
                console.error('Failed to fetch line items');
              }
            } else {
              console.error('Invoice not found');
            }
          } else {
            console.error('Failed to fetch invoice list');
          }
        } else {
          const response = await fetch('https://api.invoicehub.space/api/v1/invoice/generate', {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch invoice details');
          }
          const data = await response.json();
          setInvoice((prevInvoice: any) => ({
            ...prevInvoice,
            invoiceNo: data.data.invoiceNo,
            dateOfIssue: new Date(data.data.dateOfIssue),
          }));
        }
      } catch (error) {
        console.error('Error fetching invoice details:', error);
      }
    };

    if (keycloak.token) {
      fetchInvoiceDetails();
    }
  }, [isEditMode, id, keycloak.token, updateTotals, rate]);

  const { theme } = useTheme();
  const penColor = theme === 'dark' ? 'white' : 'black';

  const handleLogoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setLogo(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleAddLineItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      {
        itemId: 0,
        categoryId: 0,
        name: '',
        description: '',
        price: 0,
        quantity: 1,
        tax: 0,
        maxQuantity: 0,
        error: '',
      },
    ]);
  }, []);

  const handleLineItemChange = useCallback(
    (index: number, field: keyof LineItem, value: string | number) => {
      setLineItems((prev) => {
        const updatedLineItems = prev.map((item, i) => {
          if (i === index) {
            let updatedItem = {
              ...item,
              [field]:
                field === 'price' ||
                field === 'quantity' ||
                field === 'itemId' ||
                field === 'categoryId' ||
                field === 'tax'
                  ? Number(value)
                  : value,
              error: '',
            };

            if (field === 'quantity') {
              const selectedProduct = products.find(
                (product) => product.id === item.itemId
              );
              if (selectedProduct) {
                const maxQuantity = selectedProduct.quantityInStock;
                if (Number(value) > maxQuantity) {
                  updatedItem.quantity = maxQuantity;
                  updatedItem.error = `${t('invoice.errors.maximumQuantity')} ${maxQuantity}`;
                } else if (Number(value) < 1) {
                  updatedItem.quantity = 1;
                  updatedItem.error = `${t('invoice.errors.minimumQuantity')}`;
                }
              }
            }

            return updatedItem;
          }
          return item;
        });
        updateTotals(updatedLineItems);
        return updatedLineItems;
      });
    },
    [products, updateTotals, t]
  );

  const handleRemoveLineItem = useCallback(
    (index: number) => {
      setLineItems((prev) => {
        const updatedLineItems = prev.filter((_, i) => i !== index);
        updateTotals(updatedLineItems);
        return updatedLineItems;
      });
    },
    [updateTotals]
  );

  const handleAddTaxes = useCallback(
    (index: number) => {
      setCurrentItemIndex(index);
      setTaxDetails((prevTaxDetails) => ({
        ...prevTaxDetails,
        percentage: lineItems[index].tax,
      }));
      setShowTaxDialog(true);
    },
    [lineItems]
  );

  const applyTaxes = useCallback(() => {
    if (currentItemIndex !== null) {
      setLineItems((prev) => {
        const updatedLineItems = prev.map((item, index) =>
          index === currentItemIndex
            ? { ...item, tax: taxDetails.percentage }
            : item
        );
        updateTotals(updatedLineItems);
        return updatedLineItems;
      });
      setShowTaxDialog(false);
      setCurrentItemIndex(null);
      setTaxDetails({ percentage: 0, name: '', number: '' });
    }
  }, [currentItemIndex, taxDetails.percentage, updateTotals]);

  const handleAttachment = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'image/gif',
        ];

        Array.from(files).forEach((file) => {
          if (allowedTypes.includes(file.type)) {
            validFiles.push(file);
          } else {
            invalidFiles.push(file.name);
          }
        });

        if (invalidFiles.length > 0) {
          toast({
            title: t('invoice.error'),
            description: `${t('invoice.errors.invalidFileTypes')} ${invalidFiles.join(
              ', '
            )}. ${t('invoice.errors.fileTypes')}`,
            variant: 'destructive',
            duration: 3000
          })
          setErrorMessage(
            `${t('invoice.errors.invalidFileTypes')} ${invalidFiles.join(
              ', '
            )}. ${t('invoice.errors.fileTypes')}`
          );
        } else {
          setErrorMessage('');
        }

        setAttachments((prev) => [...prev, ...validFiles]);

        event.target.value = '';
      }
    },
    [t, toast]
  );

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleItemSelect = useCallback(
    (index: number, categoryId: number, productId: number) => {
      const selectedProduct = products.find(
        (product) => product.id === productId
      );
      if (selectedProduct) {
        setLineItems((prev) => {
          const updatedLineItems = prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  itemId: selectedProduct.id,
                  categoryId: categoryId,
                  name: selectedProduct.name,
                  description: selectedProduct.description || '',
                  price: selectedProduct.price,
                  quantity: 1,
                  tax: 0,
                  maxQuantity: selectedProduct.quantityInStock,
                  error: '',
                }
              : item
          );
          updateTotals(updatedLineItems);
          return updatedLineItems;
        });
      } else {
        toast({
          title: t('invoice.error'),
          description: t('invoice.errors.productNotFound'),
          variant: 'destructive',
          duration: 3000
        })
        setErrorMessage(`${t('invoice.errors.productNotFound')}`);
      }
    },
    [products, updateTotals, t, toast]
  );

  const handleClearSignature = useCallback(
    (type: 'business' | 'client') => {
      if (type === 'business') {
        sigCanvasBusinessRef.current?.clear();
        setBusinessSignatureImage(null);
        setInvoice((prev) => ({ ...prev, businessSignature: '' }));
      } else {
        sigCanvasClientRef.current?.clear();
        setClientSignatureImage(null);
        setInvoice((prev) => ({ ...prev, clientSignature: '' }));
      }
    },
    []
  );

  const handleSaveSignature = useCallback((type: 'business' | 'client') => {
    const signatureDataUrl =
      type === 'business'
        ? sigCanvasBusinessRef.current
            ?.getTrimmedCanvas()
            .toDataURL('image/png')
        : sigCanvasClientRef.current
            ?.getTrimmedCanvas()
            .toDataURL('image/png');
    if (signatureDataUrl) {
      if (type === 'business') {
        setBusinessSignatureImage(signatureDataUrl);
        setInvoice((prev) => ({
          ...prev,
          businessSignature: signatureDataUrl,
        }));
      } else {
        setClientSignatureImage(signatureDataUrl);
        setInvoice((prev) => ({
          ...prev,
          clientSignature: signatureDataUrl,
        }));
      }
    }
  }, []);

  const handleSignatureUpload = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement>,
      type: 'business' | 'client'
    ) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (type === 'business') {
            setBusinessSignatureImage(result);
            setInvoice((prev) => ({
              ...prev,
              businessSignature: result,
            }));
          } else {
            setClientSignatureImage(result);
            setInvoice((prev) => ({
              ...prev,
              clientSignature: result,
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleSaveInvoice = useCallback(async () => {
    if (!selectedClient) {
      setErrorMessage(t('invoice.errors.selectClient'));
      toast({
        title: t('invoice.error'),
        description: t('invoice.errors.selectClient'),
        variant: 'destructive',
        duration: 3000
      })
      return;
    }

    const hasErrors = lineItems.some((item) => item.error);
    if (hasErrors) {
      setErrorMessage(t('invoice.errors.lineItems'));
      toast({
        title: t('invoice.error'),
        description: t('invoice.errors.lineItems'),
        variant: 'destructive',
        duration: 3000
      })
      return;
    }

    if (!invoice.notes || !invoice.paymentTerms) {
      setErrorMessage(t('invoice.errors.notesTerms'));
      toast({
        title: t('invoice.error'),
        description: t('invoice.errors.notesTerms'),
        variant: 'destructive',
        duration: 3000
      })
      return;
    }

    try {
      const clientVendor = {
        id: selectedClient.id,
        name: selectedClient.name,
        phone: selectedClient.phone,
        website: selectedClient.website,
        email: selectedClient.email,
        clientVendorType: selectedClient.clientVendorType,
        address: {
          id: selectedClient.address.id,
          addressLine1: selectedClient.address.addressLine1,
          addressLine2: selectedClient.address.addressLine2,
          city: selectedClient.address.city,
          state: selectedClient.address.state,
          country: selectedClient.address.country,
          zipCode: selectedClient.address.zipCode,
        },
      };

      const companyData = {
        id: businessInformation?.id,
        title: businessInformation?.title,
        phone: businessInformation?.phone,
        website: businessInformation?.website,
        email: businessInformation?.email,
        address: {
          id: businessInformation?.address?.id,
          addressLine1: businessInformation?.address?.addressLine1,
          addressLine2: businessInformation?.address?.addressLine2,
          city: businessInformation?.address?.city,
          state: businessInformation?.address?.state,
          country: businessInformation?.address?.country,
          zipCode: businessInformation?.address?.zipCode,
        },
      };

      const invoiceData = {
        invoiceNo: invoice.invoiceNo,
        invoiceType: invoice.invoiceType,
        dateOfIssue: invoice.dateOfIssue
          ? invoice.dateOfIssue.toISOString()
          : null,
        dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
        paymentTerms: invoice.paymentTerms,
        notes: invoice.notes,
        clientVendor: clientVendor,
        price: invoice.price,
        tax: invoice.tax,
        total: invoice.total,
        company: companyData,
        currency: selectedCurrency // Add currency to the invoice data
      };

      const response = await fetch(
        isEditMode
          ? `https://api.invoicehub.space/api/v1/invoice/update/${id}`
          : 'https://api.invoicehub.space/api/v1/invoice/create',
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${keycloak.token}`,
          },
          body: JSON.stringify(invoiceData),
        }
      );

      if (!response.ok) {
        if(isEditMode){
          toast({
            title: t('invoice.error'),
            description: t('invoice.errors.errorUpdating'),
            variant: 'destructive',
            duration: 3000
          })
        }else{
          toast({
            title: t('invoice.error'),
            description: t('invoice.errors.errorAdding'),
            variant: 'destructive',
            duration: 3000
          })
        }
        const errorResponse = await response.json();
        setErrorMessage(
          `Server Error: ${errorResponse.message || 'Unknown error'}`
        );
        throw new Error('Failed to create/update invoice');
      }

      const responseData = await response.json();
      const invoiceId = responseData.data.id;

      if (isEditMode) {
        const existingLineItemsResponse = await fetch(
          `https://api.invoicehub.space/api/v1/invoice/product/list/${id}`,
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          }
        );

        const existingLineItemsData = await existingLineItemsResponse.json();
        const existingLineItems = existingLineItemsData.data;

        for (const item of existingLineItems) {
          await fetch(
            `https://api.invoicehub.space/api/v1/invoice/remove/product/${item.id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${keycloak.token}`,
              },
            }
          );
        }
      }

      for (const item of lineItems) {
        const product = products.find((p) => p.id === item.itemId);
        if (!product) {
          setErrorMessage(`Product with ID ${item.itemId} not found.`);
          throw new Error('Product not found');
        }

        const taxAmount = (item.price * item.quantity * item.tax) / 100;

        const lineItemData = {
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          tax: item.tax,
          total: item.price * item.quantity + taxAmount,
          product: product,
        };

        const productResponse = await fetch(
          `https://api.invoicehub.space/api/v1/invoice/add/product/${invoiceId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${keycloak.token}`,
            },
            body: JSON.stringify(lineItemData),
          }
        );

        if (!productResponse.ok) {
          toast({
            title: t('invoice.error'),
            description: t('invoice.errors.errorAddingProduct'),
            variant: 'destructive',
            duration: 3000
          })
          const errorResponse = await productResponse.json();
          setErrorMessage(
            `${t('invoice.errors.errorAddingProduct')} ${
              errorResponse.message || 'Unknown error'
            }`
          );
          throw new Error('Failed to add product to invoice');
        }
      }

      await fetchProductsAndCategories();

      setShowSuccessDialog(true);

      toast({
        title: t('invoice.success'),
        description: isEditMode
          ? t('invoice.updateSuccess')
          : t('invoice.saveSuccess'),
        variant: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: t('invoice.error'),
        description: t('invoice.errors.errorSavingInvoice'),
        variant: 'destructive',
        duration: 3000
      })
      console.error(error);
      setErrorMessage(t('invoice.errors.errorSavingInvoice'));
    }
  }, [
    invoice,
    lineItems,
    selectedClient,
    keycloak.token,
    products,
    fetchProductsAndCategories,
    isEditMode,
    id,
    t,
    businessInformation,
    selectedCurrency,
    toast
  ]);

  return (
    <div className="p-2 sm:p-4">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {isEditMode ? t('invoiceList.editInvoice') : t('invoice.newInvoice')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="w-full lg:w-1/2">
              <InvoiceDetails invoice={invoice} setInvoice={setInvoice} isEditMode={isEditMode} />
            </div>
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <LogoUploader logo={logo} handleLogoUpload={handleLogoUpload} />
            </div>
          </div>    
          <Separator />
          <LineItems
            lineItems={lineItems}
            handleAddLineItem={handleAddLineItem}
            handleLineItemChange={handleLineItemChange}
            handleRemoveLineItem={handleRemoveLineItem}
            handleAddTaxes={handleAddTaxes}
            handleItemSelect={handleItemSelect}
            categories={categories}
            products={products}
            isEditMode={isEditMode}
            currencySymbol={symbol}
          />
          <Separator />
          <Totals 
            invoice={{
              ...invoice,
              price: invoice.price * rate,
              tax: invoice.tax * rate,
              total: invoice.total * rate
            }} 
            setInvoice={setInvoice} 
            currencySymbol={symbol} 
          />
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="w-full lg:w-1/2">
              <ClientSelector
                selectedClient={selectedClient}
                handleClientSelect={handleClientSelect}
                clients={clients}
              />
            </div>
            <div className="w-full lg:w-1/2 text-left lg:text-right">
              {businessInformation ? (
                <div className="space-y-2">
                  <h2 className="text-lg sm:text-xl font-bold">
                    {t('invoice.companyName')} {businessInformation.title}
                  </h2>
                  <p className="font-[600]">{t('invoice.phone')} {businessInformation.phone}</p>
                  <p>
                    <span className="text-stone-950 dark:text-stone-50 font-[600]">
                      {t('invoice.website')}
                    </span>
                    <span className="font-[600] text-blue-700">
                      {' '}
                      {businessInformation.website}
                    </span>
                  </p>
                  <p>
                    <span className="text-stone-950 dark:text-stone-50 font-[600]">
                      {t('invoice.email')}
                    </span>
                    <span className="font-[600] text-blue-700">
                      {' '}
                      {businessInformation.email}
                    </span>
                  </p>
                  <p>
                    <span className="font-[600]">{t('invoice.country')}</span>
                    <span className="text-stone-950 dark:text-stone-50 font-[600]">
                      {' '}
                      {businessInformation.address.country}
                    </span>
                  </p>
                  <p>
                    <span className="font-[600]">{t('invoice.city')}</span>
                    <span className="text-stone-950 dark:text-stone-50 font-[600]">
                      {' '}
                      {businessInformation.address.city}
                    </span>
                  </p>
                  <p>
                    <span className="font-[600]">{t('invoice.address')}</span>
                    <span className="text-stone-950 dark:text-stone-50 font-[600]">
                      {' '}
                      {businessInformation.address.addressLine1}
                    </span>
                  </p>
                </div>
              ) : (
                <div>{t('invoice.loadingData')}</div>
              )}
            </div>
          </div>
          <Separator />
          <Signatures
            invoice={invoice}
            penColor={penColor}
            sigCanvasBusinessRef={sigCanvasBusinessRef}
            sigCanvasClientRef={sigCanvasClientRef}
            businessSignatureImage={businessSignatureImage}
            clientSignatureImage={clientSignatureImage}
            handleClearSignature={handleClearSignature}
            handleSaveSignature={handleSaveSignature}
            handleSignatureUpload={handleSignatureUpload}
            businessSignatureInputRef={businessSignatureInputRef}
            clientSignatureInputRef={clientSignatureInputRef}
          />
          <Separator />
          <Attachments
            attachments={attachments}
            handleAttachment={handleAttachment}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            handleRemoveAttachment={handleRemoveAttachment}
          />
          {errorMessage && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>{t('invoice.attachmentsError')}</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          {isLoadingClients && (
            <div className="mt-4">
              <p>{t('invoice.loadingClients')}</p>
            </div>
          )}
        </CardContent>
        <Separator />
        
        <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard/invoices')}
            className="w-full sm:w-auto"
          >
            {t('invoice.cancel')}
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={handleSaveInvoice}
              className="w-full sm:w-auto"
            >
              {isEditMode ? t('invoiceList.edit') : t('invoice.saveInvoice')}
            </Button>
          </div>
        </CardFooter>
        <TaxDialog
          showTaxDialog={showTaxDialog}
          setShowTaxDialog={setShowTaxDialog}
          taxDetails={taxDetails}
          setTaxDetails={setTaxDetails}
          applyTaxes={applyTaxes}
        />
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent className="sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle>{t('invoice.success')}</AlertDialogTitle>
              <AlertDialogDescription>
                {isEditMode
                  ? t('invoice.updateSuccess')
                  : t('invoice.saveSuccess')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                onClick={() => {
                  setShowSuccessDialog(false);
                  navigate('/dashboard/invoices');
                }}
                className="w-full sm:w-auto"
              >
                {t('invoiceList.dialog.continue')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
};

export default InvoiceComponent;
