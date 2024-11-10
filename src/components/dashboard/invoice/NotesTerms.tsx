import { FC } from 'react';
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from 'react-i18next';

interface NotesTermsProps {
  invoice: any;
  setInvoice: any;
}

const NotesTerms: FC<NotesTermsProps> = ({ invoice, setInvoice }) => {
  const { t } = useTranslation('invoices')
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="notes">{t('invoice.notesTerms.pageTitle')}</Label>
        <Textarea
          id="notes"
          placeholder={t('invoice.notesTerms.enterNotes')}
          value={invoice.notes}
          onChange={(e) => setInvoice({ ...invoice, notes:  e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="terms">{t('invoice.notesTerms.terms')}</Label>
        <Textarea
          id="terms"
          placeholder={t('invoice.notesTerms.enterTerms')}
          value={invoice.terms}
          onChange={(e) => setInvoice({ ...invoice, terms: e.target.value })}
        />
      </div>
    </div>
  );
};

export default NotesTerms;
