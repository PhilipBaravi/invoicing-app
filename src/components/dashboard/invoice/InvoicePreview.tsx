import { FC } from "react";
import { InvoiceData } from "./invoicetypes";

type InvoicePreviewProps = {
  invoiceData: InvoiceData;
  contentRef: React.RefObject<HTMLDivElement>;
};

const InvoicePreview: FC<InvoicePreviewProps> = ({
  invoiceData,
  contentRef,
}) => (
  <div className="p-10 bg-white dark:bg-stone-950" ref={contentRef}>
    <div className="flex justify-between items-start mb-8">
      <div>
        <div className="w-32 h-32 bg-gray-200 dark:bg-stone-800 flex items-center justify-center text-gray-500 dark:text-stone-400">
          Logo
        </div>
        <h2 className="text-2xl font-bold mt-4 text-stone-950 dark:text-stone-50">
          {invoiceData.sellerName}
        </h2>
        <p className="text-stone-700 dark:text-stone-300">{invoiceData.sellerAddress}</p>
        <p className="text-stone-700 dark:text-stone-300">TIN: {invoiceData.sellerTIN}</p>
        <p className="text-stone-700 dark:text-stone-300">{invoiceData.sellerContact}</p>
        <p className="text-stone-700 dark:text-stone-300">{invoiceData.sellerEmail}</p>
      </div>
      <div className="text-right">
        <h1 className="text-4xl font-bold mb-4 text-stone-950 dark:text-stone-50">
          INVOICE
        </h1>
        <p className="text-stone-700 dark:text-stone-300">
          <strong>Invoice Number:</strong> {invoiceData.invoiceNumber}
        </p>
        <p className="text-stone-700 dark:text-stone-300">
          <strong>Issue Date:</strong> {invoiceData.issueDate}
        </p>
        <p className="text-stone-700 dark:text-stone-300">
          <strong>Due Date:</strong> {invoiceData.dueDate}
        </p>
      </div>
    </div>

    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-2 text-stone-950 dark:text-stone-50">
        Bill To:
      </h3>
      <p className="text-stone-700 dark:text-stone-300">{invoiceData.buyerName}</p>
      <p className="text-stone-700 dark:text-stone-300">{invoiceData.buyerAddress}</p>
      <p className="text-stone-700 dark:text-stone-300">TIN: {invoiceData.buyerTIN}</p>
      <p className="text-stone-700 dark:text-stone-300">{invoiceData.buyerContact}</p>
      <p className="text-stone-700 dark:text-stone-300">{invoiceData.buyerEmail}</p>
    </div>

    <table className="w-full mb-8">
      <thead>
        <tr className="bg-gray-100 dark:bg-stone-800">
          <th className="p-2 text-left text-stone-950 dark:text-stone-50">Description</th>
          <th className="p-2 text-right text-stone-950 dark:text-stone-50">Quantity</th>
          <th className="p-2 text-right text-stone-950 dark:text-stone-50">Unit Price</th>
          <th className="p-2 text-right text-stone-950 dark:text-stone-50">Total</th>
        </tr>
      </thead>
      <tbody>
        {invoiceData.items.map((item, index) => (
          <tr key={index} className="border-b border-stone-300 dark:border-stone-700">
            <td className="p-2 text-stone-700 dark:text-stone-300">{item.description}</td>
            <td className="p-2 text-right text-stone-700 dark:text-stone-300">{item.quantity}</td>
            <td className="p-2 text-right text-stone-700 dark:text-stone-300">{item.unitPrice}</td>
            <td className="p-2 text-right text-stone-700 dark:text-stone-300">{item.total}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end mb-8">
      <div className="w-1/2">
        <div className="flex justify-between mb-2">
          <span className="text-stone-700 dark:text-stone-300">Subtotal:</span>
          <span className="text-stone-700 dark:text-stone-300">{invoiceData.subtotal}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-stone-700 dark:text-stone-300">
            {invoiceData.taxType} ({invoiceData.taxRate}%):
          </span>
          <span className="text-stone-700 dark:text-stone-300">{invoiceData.taxAmount}</span>
        </div>
        {invoiceData.discountDescription && (
          <div className="flex justify-between mb-2">
            <span className="text-stone-700 dark:text-stone-300">
              Discount ({invoiceData.discountDescription}):
            </span>
            <span className="text-stone-700 dark:text-stone-300">
              -{invoiceData.discountAmount}
            </span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg">
          <span className="text-stone-950 dark:text-stone-50">Total Amount Due:</span>
          <span className="text-stone-950 dark:text-stone-50">{invoiceData.totalAmount}</span>
        </div>
      </div>
    </div>

    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-2 text-stone-950 dark:text-stone-50">
        Payment Details:
      </h3>
      <p className="text-stone-700 dark:text-stone-300">
        <strong>Accepted Methods:</strong> {invoiceData.paymentMethods}
      </p>
      <p className="text-stone-700 dark:text-stone-300">
        <strong>Instructions:</strong> {invoiceData.paymentInstructions}
      </p>
      <p className="text-stone-700 dark:text-stone-300">
        <strong>Late Fee Policy:</strong> {invoiceData.lateFee}
      </p>
    </div>

    {invoiceData.notes && (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2 text-stone-950 dark:text-stone-50">
          Additional Notes:
        </h3>
        <p className="text-stone-700 dark:text-stone-300">{invoiceData.notes}</p>
      </div>
    )}

    {invoiceData.termsConditions && (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2 text-stone-950 dark:text-stone-50">
          Terms and Conditions:
        </h3>
        <p className="text-stone-700 dark:text-stone-300">{invoiceData.termsConditions}</p>
      </div>
    )}

    <div className="mt-16 pt-8 border-t border-stone-300 dark:border-stone-700">
      <div className="flex justify-between">
        <div>
          <p className="font-bold text-stone-950 dark:text-stone-50">Authorized Signature</p>
          <div className="mt-8 border-t border-gray-400 dark:border-stone-700 w-48"></div>
        </div>
        <div>
          <p className="font-bold text-stone-950 dark:text-stone-50">Company Stamp</p>
          <div className="mt-8 border-2 border-gray-400 dark:border-stone-700 w-32 h-32"></div>
        </div>
      </div>
    </div>
  </div>
);

export default InvoicePreview;
