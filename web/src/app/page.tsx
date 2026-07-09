import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { GoogleIcon, KakaoIcon, MusicNoteIcon } from "@/components/icons";

const FEATURE_CARDS = [
  {
    tone: "teal" as const,
    title: "클립 반복 생성",
    description: "10초 내외 클립을 빠르게 생성하고 검토해 원하는 장면으로 수렴시키세요.",
  },
  {
    tone: "coral" as const,
    title: "타임라인 조합",
    description: "채택한 클립을 타임라인에 배치하고 순서·길이를 자유롭게 편집합니다.",
  },
  {
    tone: "rose" as const,
    title: "나만의 스타일",
    description: "가사부터 시나리오, 스토리보드까지 이어지는 창작 파이프라인을 지원합니다.",
  },
];

export default function OnboardingPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-canvas px-6 py-16 sm:py-24">
      <div className="flex w-full max-w-3xl flex-col items-center text-center">
        <div className="mb-10 flex items-center gap-3 self-start">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-yellow text-ink">
            <MusicNoteIcon className="h-7 w-7" />
          </span>
          <span className="text-xl font-semibold text-ink">BeatSync AI</span>
        </div>

        <h1 className="text-5xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
          AI-Powered
          <br />
          Music Video Workspace
        </h1>

        <p className="mt-6 max-w-md text-lg text-slate">
          음악 하나로 시작하는 AI 뮤직비디오 제작 워크스페이스.
        </p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Button icon={<GoogleIcon />}>Login Google</Button>
          <Button icon={<KakaoIcon />}>Login Kakao</Button>
        </div>

        <div className="mt-16 grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>

        <p className="mt-14 text-xs text-stone">
          로그인 시 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
