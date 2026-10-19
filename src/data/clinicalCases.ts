import { CaseGalleryImage } from './clinicData';

export interface ClinicalCase {
  id: string;
  caseNumber: string;
  category: 'composite' | 'laminate' | 'implant' | 'gummy' | 'bleaching' | 'rehabilitation' | string;
  categoryLabel: string;
  icon: string;
  accentColor: string;
  title: string;
  patientInfo: string;
  duration: string;
  description: string;
  guaranteeText: string;
  afterBadge: string;
  beforeImage: string;
  afterImage: string;
  serviceBookingId: string;
  galleryImages?: CaseGalleryImage[];
  tags?: string[];
}

export const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'case-composite-diastema',
    caseNumber: 'کیس #۲۱۴',
    category: 'composite',
    categoryLabel: 'کامپوزیت نانو سرامیک',
    icon: 'auto_fix_high',
    accentColor: '#004ac6',
    title: 'بستن دیاستم فک بالا و لایه‌بندی نانو در ۱ جلسه',
    patientInfo: 'خانم ۲۷ ساله • پاکدشت',
    duration: 'تک‌جلسه (۲ ساعت و نیم)',
    description: 'بستن فاصله بین دندان‌های پیشین با تکنیک لایه‌بندی چندرنگ Tokuyama ژاپن بدون هیچ‌گونه تراش بافت سالم مینا.',
    guaranteeText: 'بدون بی‌حسی و بدون درد',
    afterBadge: 'بعد از ۱ جلسه',
    beforeImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXeHC0SAZprmuRhdCiYr54eWhHF_mki8Zb7YUh6MjeFg-cxRPIRcNoq9F18SOx7gM1XK7NwLi4rkke1UoAktdiI8uj8zYXQINfqgf8l39LNWe8i0Pq91TkmMMukqtCOdXycIrfSGFuOhJRJrVVBNAtaB2HazziEu6th9VRmCt2s-bSFDimg9USXZOn5s0dG1XIUUd5BrH2XtM-TfDU5lc6PL4baIcLGJEWNYChm_Ht6RvpoBIE0IRO',
    afterImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmYMn9_xpu996h3jWqIBaCBzlD-0adrq2CB44mP18Fz3UcIMqT0UGXXNFgm55d-0MWGzTjdQ8YdxPmblckF0aOJS3MKvDOSsRJqQ73jbEixJ1eH1QjEVSKp0bKgpGjW84TjTVJcI6UAd-v8bO7rgjA0y_9_YngT3VhWt5A1kRpzQNrmf3qvlzxW6Oa2sk6mqwpejTMHdbUaHhKz2rsaRuxLBQVd558J4WdwIUw7HLC-KF6msVy_8bE',
    serviceBookingId: 'cosmetic-composite',
  },
  {
    id: 'case-laminate-emax',
    caseNumber: 'کیس #۳۰۸',
    category: 'laminate',
    categoryLabel: 'پرسلن لمینت E-Max',
    icon: 'diamond',
    accentColor: '#004ac6',
    title: 'اصلاح بدرنگی تتراسایکلین و فرم دندان‌ها',
    patientInfo: 'آقای ۳۴ ساله • پاکدشت',
    duration: '۸ واحد قدامی (۲ جلسه)',
    description: 'طراحی لبخند متناسب با میمیک چهره با لمینت سرامیکی شیشه‌ای ایماکس سوئیس و اصلاح خط لبخند متقارن با حداقل تراش.',
    guaranteeText: 'ضمانت کتبی ۱۰ ساله',
    afterBadge: 'بعد از لمینت سرامیکی',
    beforeImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoM0lnD2KgyH9xirf2MUV1NDYbaxrKUYqKgKJZ6QHZNJjtZUyXu5buX7q4WDJITId0NmOGHnMrJcF6jBpmD-V7wHCW5Mg4HExQVsoD87DcDEqd56-HqAKFV1PItVPJbUrK1Q9gAIpuc7BKRS5tsxodK9vhSFOXSCeJvCYxwEC9Ryp_Y-01uXghJwk5LaYUBAEw99Tm9LkkeNSvVpwhdH3kJg0xwskrNI7SZYXlm9bt2nOhT6jLnZ_C',
    afterImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzxW9EZdYXhDHL5IULw_ATMDiWeFPlECj3Ui3RKW5xiD3VWwE7XgyE8R_YnZa-q9DYNstSqS_881-H_X-e7YjsAqmacdAvnOawjlMvT_4ZUHqYvsjgJBTijOGKq4r39jM0wmX8WV2jX5l7qj52FJzqHeBuJ69cOzsvVlcX6cFeu6pG8hrq39H_r7NjZsqASksaPR0IUSvKQi463OUTA6Mk5D3NQflwTmsjWof-xrfB_EnEkDBMiP_P',
    serviceBookingId: 'cosmetic-composite',
  },
  {
    id: 'case-digital-implant',
    caseNumber: 'کیس #۴۵۵',
    category: 'implant',
    categoryLabel: 'ایمپلنت دیجیتال',
    icon: 'dentistry',
    accentColor: '#00569c',
    title: 'کاشت فوری ایمپلنت و روکش زیرکونیا',
    patientInfo: 'آقای ۴۸ ساله • قیام‌دشت',
    duration: 'جراحی بدون بخیه (Flapless)',
    description: 'استفاده از سرجیکال گاید اختصاصی سه‌بعدی، پایه تیتانیومی اشترومن سوئیس و تحویل روکش تمام‌سرامیک بدون تورم و بدون درد.',
    guaranteeText: 'پایه اشترومن با ضمانت مادام‌العمر',
    afterBadge: 'بعد از کاشت و روکش',
    beforeImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByP-3e29b5Zayma0foQQ9FWc804xowE7cSwcPMVHH7mh0GPAFD45dHhI75CZs8eH5TviDI0wYdHMY_WbccEPqRmBeX9piiSXsUVubUTNg_WWE1DeweAUDSi481VNIzwy6d6FhoudOejk1QVOFYGITgGmoaocI-L6TLd8Gy8KbOtDnXKdIIQQKGJX_UODUl-aRgk2ZXrFCmWDpGSABzMumi_mAy2B59AbBZHwHM-rill-kke8Nkiqou',
    afterImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMsO07WVVr0Yy8aIvr-0ozAm_TdGXXhwNh_fadtN7K7VjNlTVW7DPWTyamnlELdwcLXpSwXLQlb3DDNnX33_lbDaUIK3xn-bbQSgL368NynL9-kEzOxLqcL2njHV2kTnFu3Hl1LtNxqHqSCNaN-wFrWBhs3pfrS_CmC94k7vSmCl3vjbf3WOsS5JMkAfS8wJCksiTrcgsSm_dPrgzbAt2QBPXTHRVPxLa-Wmeq6_XwZez9pdA08VOW',
    serviceBookingId: 'dental-implants',
  },
  {
    id: 'case-gummy-smile',
    caseNumber: 'کیس #۱۹۲',
    category: 'gummy',
    categoryLabel: 'اصلاح لبخند لثه‌ای',
    icon: 'flare',
    accentColor: '#004ac6',
    title: 'جراحی ژنژیوکتومی و تعادل ارتفاع تاج دندان',
    patientInfo: 'خانم ۲۳ ساله • پاکدشت',
    duration: 'لیزر دیود + ۶ واحد ونیر',
    description: 'کاهش نمایش اضافه لثه هنگام خندیدن با لیزر بدون خونریزی و نصب ۶ واحد ونیر سرامیکی فوق‌نازک جهت کشیده‌تر شدن دندان‌ها.',
    guaranteeText: 'بهبودی بلافاصله پس از جراحی',
    afterBadge: 'بعد از لیفت و ونیر',
    beforeImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWVWMdAm0nvK0lblD53JphFFc-AtERBD1BA8ZP9AJPCo9-gQBZQRRlUutA3COxXEaYiC_gyPknYo3URKG8_FsQuZEZnV1Muxx60JP9ZRVgRQsSNk5ZPIHovfdw4sNLyX_2ov4d_64rLALyhNa_hTCUcSFd0ZEFMyE5MNwW15ZDzP7gtduFL-BvS3VMNVIiSDCpFCuFnHZBYl7I-_vGgMS6aXqypjigoA0kNoLw0mUPD9wJQnnTH2Jd',
    afterImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC03F-CCzZ-RT0wJ52ZNXhoyuHW6j6Xgf8f9A2M9zMchf_0cZx99NRkrvDs1PJuIzVxb2RM9Nb-XuyoIFA-V-xj8sk4_yuJC2UvohS2yzoc2bbRNdJhYNTLo-X514Q9OvCh-ayAWaSNFcyKWj6NWo0FGGiy0TzKtuTVVTUo6V6bClEFgzZWJQApzqBkmdGdGb_4T1CHzzw9Ktqq9yJCUf6v4aQMcmuWQ2UvdbZfwwiilbCEuJ1SR18r',
    serviceBookingId: 'cosmetic-composite',
  },
  {
    id: 'case-bleaching-office',
    caseNumber: 'کیس #۱۱۷',
    category: 'bleaching',
    categoryLabel: 'بلیچینگ تخصصی مطب',
    icon: 'light_mode',
    accentColor: '#004ac6',
    title: 'روشن‌سازی ۴ درجه‌ای مینای دندان',
    patientInfo: 'خانم ۲۹ ساله • ورامین',
    duration: 'آفیس + هوم در ۴۵ دقیقه',
    description: 'انجام بلیچینگ هوم و آفیس توأم با ژل اولترادنت آمریکا همراه با محافظ ژل لثه، بدون کمترین حساسیت حرارتی یا درد پس از درمان.',
    guaranteeText: 'نتیجه پایدار با تری اختصاصی شبانه',
    afterBadge: 'بعد از سفیدسازی',
    beforeImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxt1-43rKkC2yNX8MzHuwKVW29APrmZ-hWmu8iS8-atQkr1caYTC5rTuiSbcSC_zEV8l2i72s7eDhlXKZX4Yita8mUxzbMsCpK75JSHOL9dN4vTpocIjt4myP_PZkgduIp4hQ3FD01s2nSlNJbpFv2tnkaxSd8ETXLpUZWuzx6EHXU3Ydd1MkA2fce-0YILYWfURxg0HEetXNXK_2o4SLSGiyZgBL-Li7Y8W46ZBzEal6yVjfXrsDz',
    afterImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPHB-CjF_xDVQO_gN5Bt-HJmaMHC883jkF0mvD_q7imuy56lzYzQqLt_rdTUSX-FTTkyz9b3ecWMipbjEDMgzYYESgygWVSP6XFxyE4nLEWXWbUaJhz2HWVsPBB4jruzOI0os6CzW_D030nDmfDnRjRA-bF_sxD6BTTQsuQpOieevWqrs4ZZYO77BAjlvV9VPnX5h8NMuzpgg1vnulj9ixOPhsd_yCm9Vi-FLL9pgNznXx4WRCAucw',
    serviceBookingId: 'teeth-whitening',
  },
  {
    id: 'case-full-arch',
    caseNumber: 'کیس #۵۶۰',
    category: 'rehabilitation',
    categoryLabel: 'بازسازی کامل فک بالا',
    icon: 'health_and_safety',
    accentColor: '#00569c',
    title: 'بریج تمام سرامیک زیرکونیوم و بازسازی فانکشنال',
    patientInfo: 'آقای ۵۹ ساله • پاکدشت',
    duration: 'بریج زیرکونیا و ایمپلنت',
    description: 'بازیابی ارتفاع عمودی صورت، اکلوژن صحیح و جویدن آسان با استفاده از زیرکونیای یکپارچه تراش‌خورده با میلینگ دیجیتال CAD/CAM.',
    guaranteeText: 'استحکام فوق‌العاده ۱۲۰۰ مگاپاسکال',
    afterBadge: 'بعد از بازسازی فک با زیرکونیا',
    beforeImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp0FFidKRPxAMCNJ4LgxTHNYIZsbSSYpIbDZ2bGKG8x3WpogTVLq9AlFLNBooxoguzN8DThbUZWnjN0BVonxy4uBCdHxLk71PUOXXzOUhnFTTjXmj_MVb1VR6Hb-fz1gXjWqbLhgkQjGphIEvbXzwMKaBAh5HI9M7xyCvEs1ATCfqAycg0iG7WYxNwX4vO9JVb-vCgWajcdv5AQZ0HE3mWtc7OfQBC8hntqzTk8oC0F53W_Vatw1nA',
    afterImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkn0QlSAerPw6f7Tfk28ykl6V7T-feKrwfJpOClfsQdetSwGH4gFJ1v3Lrn-cTKdviPVxs149FeRUZDbx804zZOLVXcDOLSCQIWRokkn2MjVH-v3denQOQJ_Ahz-zS7IUg2ruTwo9iUBCnLBhQqky3tyP8I4bzUpELI_76TzWEoPFiEQsuyEOIPx0oZSAZ8cS_7IRBoH3qYBswM5k-QV9vg534hZK2OWm1DkyxZyyzweZh0I63k1Wu',
    serviceBookingId: 'dental-implants',
  },
];

export const EXTRA_CASES: ClinicalCase[] = [
  {
    id: 'case-extra-1',
    caseNumber: 'کیس #۶۱۰۴',
    category: 'composite',
    categoryLabel: 'کامپوزیت نانو سرامیک',
    icon: 'auto_fix_high',
    accentColor: '#004ac6',
    title: 'اصلاح عدم تقارن لبه‌های قدامی و خط لبخند',
    patientInfo: 'خانم ۳۱ ساله • پاکدشت',
    duration: '۶ واحد فک بالا • ۲ ساعت',
    description: 'ترمیم کامپوزیتی بدون تراش با رنگ سوپر بلیچ طبیعی و انعکاس شفاف لبه‌های اینسیزال.',
    guaranteeText: 'پولیش دوره‌ای رایگان',
    afterBadge: 'پایان درمان',
    beforeImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLq7K0WycCfDfTZOLw5guJ_QEib142TaLSMSgp-NW3EzX6nduY24vAT7kYK_rcaBt0vAU0e-3b0hZa5VrfWG69b4gOHdkCqUVcEqYVJZokYZ2MdtZTEABY9quE6uFzRvs3WxbgbGKQr6eimwChL8cR-UUIK6zYfd6t-Ku0_Uc6bldhtm3Wa6UlNkMW14IQaxrGtTuUzlKdU4idFyjdk8y2HAjHgxFModnf0EmQg4rHoTgpt__57tUB',
    afterImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiG0rD46U7aSt7daTtv1UeC6DE-Gw7SOCPqBEhmK0kiM116JIZsVZUkpgoLo5M2mgRKdoYriPRetmYWp-Q73VQsvLWd_EBhT50mfGYwbTvEWAobVRFMtj-mSbfLJVO03RDJ_qN7x2mvJzUgS2kTYMSM0K6YfjeSuOnoSAj9zGMFBtJykCWF9GzDMTvg_Sh_OsyjO3Q_wbkrFr8AL3HY6DaHRRIXuyQRyASnm8PArgxCb6XSf0L3tyI',
    serviceBookingId: 'cosmetic-composite',
  },
  {
    id: 'case-extra-2',
    caseNumber: 'کیس #۷۱۸۹',
    category: 'laminate',
    categoryLabel: 'لمینت پرسلن E-Max',
    icon: 'diamond',
    accentColor: '#004ac6',
    title: 'بازسازی لبخند با ۱۰ واحد لمینت کادکام آلمانی',
    patientInfo: 'آقای ۴۱ ساله • پاکدشت',
    duration: '۲ جلسه کاری در ۹ روز',
    description: 'تراش میکرومتری ۰.۳ میلیمتر با تطابق کامل انحنای لب‌ها و ضمانت‌نامه مکتوب ۱۰ ساله.',
    guaranteeText: 'ضمانت کتبی ۱۰ ساله',
    afterBadge: 'پایان درمان',
    beforeImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkjoWRsrzBSWd0x5bRnu6e_YeSScVVukFac7m5naWA7V7gN3EebgTRPBJ6cQizmKyJaTfKsEVv0i9RaN0Bv9xo7Cspk21ZKQPSoVku1by0P7ockBIPSvDTBMJz85bhqJXNmkop-F1YvdEwRGvDlXdfVTYvA918cIloW0QAMQw-81Cg9EmOeFcb7k7QVtoqY6HUN6fzgpO6Vzaae1VbOTuExE4VheywQZnd7VntfAlat4-Es8_ag73b',
    afterImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFfYE4agYQDUohoK5hV8sh6AtT01cnZaVzDGBtmMHldPnBJW7a2No9wwezoPL3CwDs902WLbYSiys9FKMTzFmIavB2uJjbhPvyFM6hBLDgnlyBfENRklyAYzY_aVKyJbqoyzlWpohu1b2o1SSFJ4bcztpZBHx4cY53aOKqE1ybjFRfYGA2AvkKWkbaWg8udPP60JkyUO2LhJ8BBqfqbKnmtv0f9qPzSp0R-FtEn0uLmfd8CmP0hztZ',
    serviceBookingId: 'cosmetic-composite',
  },
];

export const ALL_INITIAL_CASES: ClinicalCase[] = [...CLINICAL_CASES, ...EXTRA_CASES];
