import React, { useState, useRef } from 'react';
import { useCMS } from '../context/CMSContext.tsx';
import { ArticleItem, CLINIC_INFO } from '../data/clinicData.ts';
import { MediaPreview } from '../utils/mediaUtils.tsx';

interface ArticlesSectionProps {
  onNavigateBlog: () => void;
  onSelectArticle?: (articleId: string) => void;
  onOpenBooking?: (preselectedService?: string) => void;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({
  onNavigateBlog,
  onSelectArticle,
  onOpenBooking,
}) => {
  const { articles, clinicInfo, comments, homeSettings } = useCMS();
  const artSettings = homeSettings?.articles;
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(true);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const getArticleCommentsCount = (art: ArticleItem) => {
    return (comments || []).filter(
      (c: any) =>
        (c.articleId === art.id || c.articleId === art.slug) &&
        c.status === 'approved'
    ).length;
  };

  const checkScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    // In RTL, scrollLeft can be 0 or negative depending on browser
    const maxScroll = scrollWidth - clientWidth;
    const currentScroll = Math.abs(scrollLeft);
    setCanScrollRight(currentScroll > 10);
    setCanScrollLeft(currentScroll < maxScroll - 10);
  };

  const scrollCarousel = (direction: 'next' | 'prev') => {
    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.clientWidth > 768 ? 380 : 300;
    // In RTL, scrolling right goes backwards (prev), scrolling left goes forwards (next)
    const delta = direction === 'next' ? -cardWidth : cardWidth;
    carouselRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const displayArticles = articles.slice(0, artSettings?.count ?? 6);

  return (
    <section id="articles" className="py-12 sm:py-20 bg-[#f7f9fb] border-b border-[#c3c6d7]/30">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6 text-right">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#dbe1ff] text-[#004ac6] text-xs font-semibold mb-3">
              <span className="material-symbols-outlined text-base">{artSettings?.badgeIcon || 'menu_book'}</span>
              <span>{artSettings?.badge || 'آموزش و آگاهی • پایگاه مقالات تخصصی'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#191c1e] mb-2 leading-tight">
              {artSettings?.title || 'مجله سلامت دهان و زیبایی لبخند پارمیس'}
            </h2>
            <p className="text-sm sm:text-base text-[#565e74] max-w-2xl">
              {artSettings?.description || (
                <>
                  جدیدترین مقالات علمی و نکات مراقبتی تالیف و بازبینی‌شده توسط{' '}
                  <strong className="text-[#004ac6] font-bold">دکتر انوشیروان شمس پور</strong>
                </>
              )}
            </p>
          </div>

          {/* Actions: View All & Carousel Navigation Arrows */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={onNavigateBlog}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#004ac6] text-white text-xs sm:text-sm font-bold hover:bg-[#2563eb] transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>{artSettings?.buttonText || 'مشاهده همه مقالات وبلاگ'}</span>
              <span className="material-symbols-outlined text-base rotate-180">arrow_back</span>
            </button>

            {/* Desktop / Tablet Carousel Controls */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white p-1 rounded-full border border-[#c3c6d7]/30 shadow-2xs">
              <button
                type="button"
                onClick={() => scrollCarousel('prev')}
                aria-label="مقاله قبلی"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#565e74] hover:bg-[#f2f4f6] hover:text-[#004ac6] transition-colors cursor-pointer active:scale-90"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('next')}
                aria-label="مقاله بعدی"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#565e74] hover:bg-[#f2f4f6] hover:text-[#004ac6] transition-colors cursor-pointer active:scale-90"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            ref={carouselRef}
            onScroll={checkScroll}
            className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar scroll-smooth"
          >
            {displayArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => {
                  if (onSelectArticle) {
                    onSelectArticle(article.id);
                  } else {
                    setActiveArticle(article);
                  }
                }}
                className="min-w-[280px] sm:min-w-[340px] md:min-w-[370px] max-w-[380px] snap-start bg-white rounded-3xl border border-[#c3c6d7]/30 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-right cursor-pointer group shrink-0 overflow-hidden"
              >
                <div>
                  {/* Article Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#eceef0]">
                    <MediaPreview
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      controls={false}
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#004ac6] text-[11px] font-bold shadow-xs">
                      {article.category}
                    </div>
                    {article.isFeatured && (
                      <div className="absolute top-3 left-3 bg-[#004ac6] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <span className="material-symbols-fill material-symbols-outlined text-xs">
                          star
                        </span>
                        <span>منتخب</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-[#565e74] text-xs mb-2.5 flex-wrap">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{article.readTime}</span>
                      {article.date && (
                        <>
                          <span>•</span>
                          <span>{article.date}</span>
                        </>
                      )}
                      {(artSettings?.showViews ?? true) && (article.views !== undefined && article.views > 0) && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 font-medium">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            <span>{article.views.toLocaleString('fa-IR')}</span>
                          </span>
                        </>
                      )}
                      {(artSettings?.showCommentsCount ?? true) && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 font-medium">
                            <span className="material-symbols-outlined text-sm">chat_bubble_outline</span>
                            <span>{getArticleCommentsCount(article).toLocaleString('fa-IR')} نظر</span>
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#191c1e] mb-2.5 leading-snug group-hover:text-[#004ac6] transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#565e74] mb-4 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[#c3c6d7]/20 flex items-center justify-between text-xs mt-auto">
                  <span className="text-[#565e74] font-medium truncate max-w-[170px]">
                    {article.author || 'دکتر انوشیروان شمس پور'}
                  </span>
                  <span className="text-[#004ac6] font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    <span>مطالعه مقاله</span>
                    <span className="material-symbols-outlined text-sm rotate-180">arrow_back</span>
                  </span>
                </div>
              </article>
            ))}

            {/* Final Carousel Card: View All Articles Link Card */}
            <div
              onClick={onNavigateBlog}
              className="min-w-[240px] sm:min-w-[280px] snap-start bg-gradient-to-tr from-[#dbe1ff]/60 to-white rounded-3xl border-2 border-dashed border-[#004ac6]/30 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#004ac6] hover:shadow-md transition-all shrink-0 group active:scale-95"
            >
              <div className="w-14 h-14 rounded-full bg-[#004ac6] text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <span className="material-symbols-outlined text-2xl rotate-180">arrow_back</span>
              </div>
              <h3 className="text-lg font-bold text-[#004ac6] mb-1">مشاهده همه مقالات</h3>
              <p className="text-xs text-[#565e74] mb-4">
                دسترسی به تمام مطالب، دسته‌بندی‌ها و جستجوی مقالات
              </p>
              <span className="text-xs font-bold text-[#004ac6] bg-white px-4 py-2 rounded-full border border-[#004ac6]/20 shadow-2xs">
                ورود به صفحه وبلاگ
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Guidance Note */}
        <div className="flex sm:hidden items-center justify-between text-xs text-[#565e74] mt-3 px-1">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-[#004ac6]">swipe</span>
            <span>برای مشاهده سایر مقالات به چپ بکشید</span>
          </span>
          <button
            type="button"
            onClick={onNavigateBlog}
            className="text-[#004ac6] font-bold underline underline-offset-4"
          >
            مشاهده همه ({articles.length})
          </button>
        </div>
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs text-right"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#eceef0] mb-4">
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="w-9 h-9 rounded-full bg-[#eceef0] hover:bg-[#c3c6d7] flex items-center justify-center text-[#191c1e] transition-colors cursor-pointer"
                aria-label="بستن پنجره"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
              <span className="text-xs font-bold text-[#004ac6] bg-[#dbe1ff] px-3 py-1 rounded-full">
                {activeArticle.category}
              </span>
            </div>

            <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-5 bg-[#eceef0]">
              <MediaPreview
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
                controls={true}
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-[#565e74] mb-3 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>{activeArticle.readTime}</span>
              </span>
              {activeArticle.date && (
                <>
                  <span>•</span>
                  <span>{activeArticle.date}</span>
                </>
              )}
              {(activeArticle.views !== undefined && activeArticle.views > 0) && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 font-medium">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>{activeArticle.views.toLocaleString('fa-IR')}</span>
                  </span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-0.5 font-medium">
                <span className="material-symbols-outlined text-sm">chat_bubble_outline</span>
                <span>{getArticleCommentsCount(activeArticle).toLocaleString('fa-IR')} نظر</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-[#191c1e] mb-4 leading-snug">
              {activeArticle.title}
            </h3>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f2f4f6] border border-[#c3c6d7]/30 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#004ac6] shrink-0 bg-[#e6e8ea]">
                <img
                  src={clinicInfo?.doctorImage || CLINIC_INFO.doctorImage}
                  alt={activeArticle.author || clinicInfo?.doctorName || CLINIC_INFO.doctorName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs sm:text-sm font-bold text-[#191c1e]">
                  {activeArticle.author || clinicInfo?.doctorName || CLINIC_INFO.doctorName}
                </span>
                <span className="text-[11px] text-[#565e74]">
                  {activeArticle.authorRole || 'جراح و دندان‌پزشک کلینیک پارمیس'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-[#565e74] leading-relaxed mb-6">
              {activeArticle.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {activeArticle.tips && activeArticle.tips.length > 0 && (
              <div className="bg-[#f2f4f6] p-5 rounded-2xl border border-[#c3c6d7]/30 mb-6">
                <h4 className="text-sm font-bold text-[#004ac6] mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                  <span>توصیه‌های مهم دندان‌پزشکی:</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-[#191c1e]">
                  {activeArticle.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#004ac6] font-bold">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-[#eceef0] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveArticle(null);
                  onNavigateBlog();
                }}
                className="bg-[#004ac6] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-[#2563eb] transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>مشاهده سایر مقالات در وبلاگ</span>
                <span className="material-symbols-outlined text-base rotate-180">arrow_back</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="bg-[#f2f4f6] text-[#191c1e] px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-[#e6e8ea] transition-colors cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
