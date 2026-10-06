import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { SampleAnswer } from "@/components/landing/sample-answer";
import { Browse } from "@/components/landing/browse";
import { Faq } from "@/components/landing/faq";
import { SiteFooter } from "@/components/landing/site-footer";
import { getTotalCount, getStats, getSampleQuestions } from "@/lib/questions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [total, stats, samples] = await Promise.all([
    getTotalCount(),
    getStats(),
    getSampleQuestions(1),
  ]);

  return (
    <>
      <Nav />
      <main className="wrap">
        <Hero total={total} />
        <SampleAnswer
          sample={samples[0]}
          total={total}
          roleCount={stats.roles.length}
          topicCount={stats.categories.length}
        />
        <Browse topics={stats.categories.slice(0, 6)} roles={stats.roles} />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}