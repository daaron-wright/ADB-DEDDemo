export import { MARWA_TRADE_NAME_EN, MARWA_TRADE_NAME_AR } from "./trade-name-constants";

type ContractSection = {
  heading: string;
  english: string;
  arabic: string;
};

export const CONTRACT_MAIN_SECTIONS: readonly ContractSection[] = [
  {
    heading: "Receipt overview",
    english:
      `Trade Name Reservation Receipt issued by the Abu Dhabi Registration & Licensing Authority on 29/09/2025. The trade name ${MARWA_TRADE_NAME_EN.toUpperCase()} was successfully reserved and the receipt was generated after payment through ADPAY.`,
    arabic:
      `إيصال حجز اسم تجاري صادر عن هيئة التسجيل والترخيص في أبوظبي بتاريخ 29/09/2025. تم حجز الاسم التجاري ${MARWA_TRADE_NAME_AR} بنجاح وتم إصدار الإيصال بعد إتمام الدفع عبر أدباي.`,
  },
  {
    heading: "Payment details",
    english:
      "Receipt No. 2112500002178 · Transaction No. TN-4993803 · POS No. 558 · Paid amount AED 65.14 · Payment method Credit Card · Application submitted to the General Directorate of Residence and Foreigners Affairs.",
    arabic:
      "رقم ��لإيصال 2112500002178 · رقم المعاملة TN-4993803 · جهاز نقاط البيع 558 · المبلغ المدفوع 65.14 درهم إماراتي · طريقة الدفع بطاقة ائتمان · تم تقديم الطلب إلى الإدارة العامة للإقامة وشؤون الأجانب.",
  },
  {
    heading: "Ownership & representatives",
    english:
      "Owner and Manager: BASEM LAYLA AL MANSOURI · Nationality: United Arab Emirates · Emirates ID: 784192598709191. The receipt confirms the owner’s authority to represent the business for the reserved trade name.",
    arabic:
      "المالك والمدير: ليلى المنصوري · الجنسية: الإمارات العربية المتحدة · رقم الهوية الإماراتية: 784192598709191. يؤكد الإيصال سلطة المالك في تمثيل المنشأة للاسم التجاري المحجوز.",
  },
  {
    heading: "Economic activity",
    english:
      "Activity: Restaurant · Activity code 5610001. The approval covers the F&B operation under the reserved trade name and must stay aligned with Department of Economic Development regulations.",
    arabic:
      "النشاط: مطعم · رمز النشاط 5610001. تشمل الموافقة نشاط الأغذية والم��روبات تحت الاسم التجاري المحجوز ويجب أن تتوافق مع لوائح دائرة التنمية الاقتصادية.",
  },
  {
    heading: "Important notices",
    english:
      "ADRA reserves the right to amend the trade name if it does not comply with reservation conditions. Initial approval was also submitted to the General Directorate of Residence and Foreigners Affairs. ADPAY charges are free up to AED 50, with processing fee plus VAT applied to higher amounts.",
    arabic:
      "تحتفظ هيئة التسجيل والترخيص في أبوظبي بالحق في تعديل الاسم التجاري إذا لم يلتزم بشروط الحجز. تم تقديم الموافقة المبدئية إلى الإدارة العامة للإقامة وشؤون الأجانب. رسوم أدباي مجانية للمبالغ حتى 50 درهمًا، ويتم تطبيق رسوم معالجة بالإضافة إلى ضريبة القيمة المضافة على المبالغ الأعلى.",
  },
];
