// Types based on flipkart.json structure

export interface FlipkartOfferItem {
  provider: string[];
  logo: string;
  offerText: {
    text: string;
  };
  offerDescription: {
    id: string;
    text: string;
    tncText: string;
  };
}

export interface FlipkartResponse {
  items: Array<{
    type: string;
    data: {
      offers?: {
        offerList: FlipkartOfferItem[];
      };
    };
  }>;
}

// Internal unified offer interface for Service
export interface ProcessedOffer {
  offerId: string;
  description: string;
  bank: string;
  paymentInstrument: string;
  minTransactionAmount: number;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  maxDiscountAmount: number;
  validity?: {
    start: string;
    end: string;
  };
}

export interface IngestResponse {
  offersIdentified: number;
  newOffersCreated: number;
}

export interface DiscountResponse {
  highestDiscountAmount: number;
}
