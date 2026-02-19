import { type PurchasesError, PURCHASES_ERROR_CODE } from 'react-native-purchases';
import i18n from '@/i18n';

export const getPurchaseErrorMessage = (error: PurchasesError): string => {
  switch (error.code) {
    case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
      return i18n.t('purchases:errors.cancelled');
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
      return i18n.t('purchases:errors.notAllowed');
    case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
      return i18n.t('purchases:errors.invalid');
    case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
      return i18n.t('purchases:errors.notAvailable');
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
      return i18n.t('purchases:errors.network');
    case PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR:
      return i18n.t('purchases:errors.receiptInUse');
    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return i18n.t('purchases:errors.paymentPending');
    default:
      return i18n.t('purchases:errors.default');
  }
};

export const shouldShowError = (error: PurchasesError): boolean => {
  return error.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
};
