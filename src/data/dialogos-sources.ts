// Dialogos 출처 라이브러리 — 단일 출처(SSOT).
//
// 각 항목 = 퍼블릭 도메인(저작권 만료) 고대 저작 1개. Astro 동적 라우트
// (`apps/dialogos/sources/[slug].astro`)와 허브(`sources/index.astro`)가 이
// 데이터에서 페이지를 자동 생성한다. 작품 추가 = 이 파일에 항목 1개 추가.
//
// 저작권 안전: 본문은 우리 고유 해설만 싣고(현대 번역본 무게재),
// 원문은 검증된 퍼블릭 도메인 외부 소스로만 링크한다.
//
// 앱(pipi_thus)의 출처칩 slug ↔ 이 파일의 slug가 1:1로 대응한다.
// 권/편 단위 인용(예: 명상록 제5권)은 페이지 내 섹션 앵커(`#book-5`)로 연결된다.

import type { Lang } from '../i18n/ui';
// 7저작(세네카·에픽테토스·플라톤)은 Workflow로 PD 검증 + 3언어 작성 + 적대 검증을
// 거쳐 생성/패치된 데이터. 명상록은 아래에 직접 유지(첫 템플릿).
import generatedWorks from './dialogos-sources.generated.json';

export interface SourceFaq {
  q: string;
  a: string;
}

/** 한 저작 안의 권/편 — 페이지 내 앵커 섹션. */
export interface SourceSection {
  anchor: string; // 'book-5' / 'letter-1'
  title: string;
  body: string;
}

export interface SourcePdLink {
  label: string;
  url: string;
}

/** 핵심 구절·명언 — 우리 고유 의역 + 검증된 절 표기. schema.org/Quotation 렌더. */
export interface SourceQuote {
  text: string; // 우리 고유 의역 (현대 번역본 무단전재 금지)
  cite: string; // '5.1' / 'Letter 1' — 코퍼스의 검증된 절 표기
  gloss: string; // 1문장 의미 풀이 (언어별 각도 차등)
}

/** 핵심 개념 용어풀이 — <dl> 정의 리스트로 렌더(AI 청킹 친화). */
export interface SourceConcept {
  term: string; // '로고스 (logos)'
  def: string; // 1~2문장 정의
}

/** 저작 간 교차참조 — 사이트 내부링크(권위·체류). */
export interface SourceRelated {
  slug: string; // 'enchiridion'
  label: string; // '엥케이리디온 · 에픽테토스'
}

/**
 * 현대 정본 번역 안내 — 각 언어 페이지의 "번역본 가이드"(어느 번역본을 읽을까).
 * 독자의 "おすすめ訳 / 번역본 추천 / best translation" 검색에 응답. 광고·가격·구입링크
 * 없는 중립 정보. note는 우리 고유 평(검증된 사실 기반) — 역자 번역문 전재 금지.
 * 역자·출판사·총서·수록위치는 1차 출처(출판사 공식·국립도서관)로 확증한 사실만 싣는다.
 * 각 언어 content의 editions = 그 언어(ko/ja/en)의 번역본.
 */
export interface Edition {
  title: string; // ja '自省録（岩波文庫 改版）' · ko '명상록（도서출판 숲）' · en 'Meditations (Modern Library)'
  translator: string;
  publisher: string;
  note: string; // 1~2문장 특징 (정본/입문용/수록위치 등)
}

/** 한 언어(ko/ja/en)에 대한 출처 페이지 콘텐츠. */
export interface SourceContent {
  workName: string; // '명상록'
  mentorName: string; // '마르쿠스 아우렐리우스'
  lede: string; // meta description (≤155자 권장)
  intro: string; // 작품 소개 (HTML 조각 허용)
  context?: string; // [심화] 역사적 배경 1단락 (HTML) — ja는 일본 수용사 추가
  sections: SourceSection[]; // 권/편별 핵심
  quotes?: SourceQuote[]; // [심화] 검증된 절 단위 구절 — 앱 대화가 '사색'으로 인용하는 원천(pipi_thus tools/gen_source_library.mjs). 2026-10-19 저작당 최대 30개로 확장, 모두 PD 원문 대조·교차 검증
  concepts?: SourceConcept[]; // [심화] 핵심 개념 용어풀이 3~5개
  apply?: string; // [심화] '오늘 어떻게 적용할까' 1~2단락 (HTML) — 시장별 각도
  provenance: string; // Dialogos가 출처를 다루는 방식 (HTML)
  faq: SourceFaq[]; // AEO — FAQPage 스키마 + 가시 FAQ (4→6~8 확장)
  pdIntro: string; // 퍼블릭 도메인 원문 안내문
  pdLinks: SourcePdLink[]; // 검증된 PD 외부 링크
  related?: SourceRelated[]; // [심화] 저작 간 교차참조 (선택)
  editions?: Edition[]; // [심화] 현대 정본 번역 안내(번역본 가이드) — 각 언어별
}

export interface SourceWork {
  slug: string;
  mentorId: 'marcus' | 'seneca' | 'epictetus' | 'socrates';
  icon: string; // Font Awesome 클래스
  /** ISO 날짜 — JSON-LD dateModified (AEO 신선도 신호). */
  updated: string;
  content: Record<Lang, SourceContent>;
}

export const sourceWorks: Record<string, SourceWork> = {
  meditations: {
    slug: 'meditations',
    mentorId: 'marcus',
    icon: 'fa-book-open',
    updated: '2026-06-21',
    content: {
      ko: {
        workName: '명상록',
        mentorName: '마르쿠스 아우렐리우스',
        lede: '마르쿠스 아우렐리우스 《명상록》 — Dialogos가 인용하는 퍼블릭 도메인 스토아 원전. 작품 해설과 무료 원문(조지 롱 역) 안내.',
        intro:
          '《명상록》(그리스어 원제 <em>Τὰ εἰς ἑαυτόν</em>, "자기 자신에게 이르는 것들")은 로마 황제 마르쿠스 아우렐리우스(121–180)가 그리스어로 자신을 향해 쓴 일기 형식의 스토아 철학 기록입니다. 출판을 의도하지 않은 사적인 성찰로, 의무·이성·무상, 그리고 통제할 수 없는 것에 대한 초연함을 다룹니다. Dialogos에서 마르쿠스가 답할 때 이 책의 여러 권을 출처로 인용합니다.',
        sections: [
          {
            anchor: 'book-2',
            title: '제2권',
            body: '아침에 마주칠 배은망덕하고 오만한 이들을 미리 떠올리되, 이성적 본성을 지닌 당신은 그들에게 해를 입지 않는다. 죽음과 무상을 응시하며 지금의 의무에 집중하라. (2.1)',
          },
          {
            anchor: 'book-4',
            title: '제4권',
            body: '가장 고요한 은둔처는 자기 자신의 마음이다. 외부 사건이 아니라 그것에 대한 판단이 괴로움을 만드니, 판단을 거두면 해도 사라진다. (4.3)',
          },
          {
            anchor: 'book-5',
            title: '제5권',
            body: '동틀 녘 일어나기 싫을 때, 나는 인간의 일을 위해 일어난다고 스스로에게 일깨우라. 우주의 본성이 처방한 것을 받아들이는 것이 곧 건강한 영혼이다. (5.1, 5.8)',
          },
          {
            anchor: 'book-6',
            title: '제6권',
            body: '마음은 외부의 도움 없이 스스로 평정을 회복한다. 단순함과 선의로 행하는 것으로 충분하다. (6.8)',
          },
          {
            anchor: 'book-9',
            title: '제9권',
            body: '상실은 변화일 뿐이며, 변화는 자연의 기쁨이다. 무상을 받아들이면 슬픔은 멎는다. (9.35)',
          },
        ],
        provenance:
          'Dialogos의 답변은 저작권이 만료된 원전의 사상을 현대 한국어로 의역한 것이며, 저작권이 있는 현대 번역본을 그대로 옮기지 않습니다. 출처 표기는 그 사상이 실제로 등장하는 권·절을 가리킬 뿐, 원문을 글자 그대로 인용하지 않습니다.',
                faq: [{"q": "명상록을 한 줄로 요약하면?", "a": "통제할 수 있는 것(내 판단과 행동)과 없는 것(외부 사건과 타인)을 구분하고, 이성에 따라 지금의 의무를 다하며, 무상을 받아들여 마음의 평정을 지키라는 자기 훈련의 기록입니다. 출판이 아니라 자신을 다스리려고 쓴 일기입니다."}, {"q": "명상록의 대표 명언은 무엇인가요?", "a": "'동틀 녘 일어나기 싫을 때, 나는 인간이 할 일을 하러 일어난다고 되뇌라'(5.1), '판단을 거두면 해도 사라진다'(4.7), '길 위의 걸림돌이 곧 그 길을 나아가게 한다'(5.20), '상실은 변화일 뿐이다'(9.35)가 가장 널리 인용됩니다."}, {"q": "명상록 제5권은 어떤 내용인가요?", "a": "마르쿠스가 자신에게 쓴 성찰로, 동틀 녘 인간의 의무를 위해 일어나라는 권고(5.1)와, 우주의 본성이 정한 바를 의사의 처방처럼 받아들이라는 평정(5.8), 그리고 장애물조차 행동의 재료로 바꾸라는 사상(5.20)을 담고 있습니다."}, {"q": "마르쿠스 아우렐리우스는 누구인가요?", "a": "로마 제국의 황제(재위 161–180)이자 후기 스토아 철학자입니다. 통치와 전쟁의 와중에 그리스어로 자신에게 일기를 썼고, 그 노트가 《명상록》으로 전해집니다. 출판을 의도하지 않았기에 솔직한 자기 점검의 어조가 특징입니다."}, {"q": "명상록은 어떤 순서로 읽으면 좋나요?", "a": "체계적 논문이 아니라 격언 모음이라 어느 권부터 펼쳐도 됩니다. 다만 제2·4·5권에 자주 인용되는 핵심 다짐(2.1, 4.3, 5.1)이 모여 있어 입문으로 적당합니다. 제1권은 스승들에 대한 감사 목록이라 배경을 알고 보면 더 깊게 읽힙니다."}, {"q": "명상록의 현대적 의의는 무엇인가요?", "a": "통제 가능한 것에 집중하라는 가르침은 오늘날 인지행동치료와 회복탄력성 훈련의 뿌리로 자주 언급됩니다. 번아웃·불안·완벽주의에 시달리는 사람에게, 사건이 아니라 해석을 다스리라는 4.7의 통찰이 실용적인 자기관리 도구로 읽힙니다."}, {"q": "명상록 원문을 무료로 읽을 수 있나요?", "a": "예. 저작권이 만료된 조지 롱(1862) 영역본은 Wikisource에서, 메릭 카소본 영역본은 Project Gutenberg에서 무료로 읽을 수 있습니다. 아래 퍼블릭 도메인 링크를 참고하세요. 한국어 완역본은 퍼블릭 도메인이 제한적이라 영어 역본으로 안내합니다."}],
        context: "<p>《명상록》은 로마 황제 마르쿠스 아우렐리우스(121–180)가 게르만족과의 전선을 오가던 재위 후반(170년대 무렵)에 그리스어로, 오직 자신을 향해 쓴 사적인 노트입니다. 원제 <em>Τὰ εἰς ἑαυτόν</em>는 '자기 자신에게'라는 뜻으로, 출판이나 독자를 전혀 의도하지 않은 자기 점검의 기록입니다. 12권으로 전해지며 체계적 논문이 아니라 짧은 격언과 다짐이 모인 형식입니다. 제1권은 가족과 스승에게 빚진 것을 하나하나 적은 감사의 목록이고, 나머지는 의무·이성·무상·자기 통제를 거듭 되새깁니다.</p>",
        quotes: [{"text": "동틀 녘 일어나기 싫을 때, '나는 한 인간이 할 일을 하러 일어난다'고 스스로에게 일러두라.", "cite": "5.1", "gloss": "의무는 기분이 아니라 결심에서 나온다 — 번아웃의 아침에 침대에서 되뇔 한 문장."}, {"text": "가장 고요한 은둔처는 자기 자신의 마음이다. 사람들은 바닷가와 산을 찾지만, 너는 언제든 네 안으로 물러날 수 있다.", "cite": "4.3", "gloss": "휴식은 장소가 아니라 시선의 전환 — 도망칠 곳을 못 찾을 때 들어갈 진짜 방."}, {"text": "판단을 거두라. 그러면 '내가 해를 입었다'는 호소도 함께 사라진다.", "cite": "4.7", "gloss": "괴로움은 사건이 아니라 사건에 붙인 해석에서 온다 — 자기계발의 출발점."}, {"text": "마음은 행동을 가로막는 모든 장애를 도움으로 바꾼다. 방해물이 일을 밀어주고, 길 위의 걸림돌이 그 길을 가게 돕는다.", "cite": "5.20", "gloss": "막힘 자체를 다음 행동의 재료로 바꾸기 — 좌절을 동력으로 쓰는 스토아의 핵심."}, {"text": "상실은 변화일 뿐이다. 우주의 본성은 변화를 기뻐하며, 그 안에서 모든 일이 제대로 이루어진다.", "cite": "9.35", "gloss": "끝이 아니라 형태가 바뀐 것 — 무언가를 잃은 날에 붙드는 관점."}, {"text": "만 년을 살 사람처럼 굴지 말라. 죽음이 머리 위에 걸려 있으니, 살아 있고 할 수 있는 동안 선하라.", "cite": "4.17", "gloss": "무상은 미루기의 해독제 — '나중에'를 '지금'으로 바꾸는 압박."}, {"text": "아침마다 일러두라. 오늘 나는 참견꾼, 배은망덕한 자, 오만한 자를 만나리라. 그들은 선악을 모를 뿐, 나를 해치지 못한다.", "cite": "2.1", "gloss": "출근길에 미리 마음을 정해 두는 연습 — 무례한 사람을 만나도 하루가 무너지지 않도록."}, {"text": "지금 손에 든 일을 생의 마지막 일처럼 하라. 경솔함과 위선, 제 몫에 대한 불평을 내려놓으면 다른 잡념에서 놓여난다.", "cite": "2.5", "gloss": "알림과 잡념에 잘게 쪼개진 하루에 — 눈앞의 한 가지를 마지막처럼 대하는 집중법."}, {"text": "공익과 상관없이 남이 무엇을 왜 하고 무슨 말과 궁리를 하는지 따지며 남은 삶을 허비하지 말라. 그만큼 할 일을 놓친다.", "cite": "3.4", "gloss": "남의 SNS나 단톡방 속내를 해석하다 저녁이 사라질 때 — 그 시간에 할 수 있던 일이 따로 있었다."}, {"text": "우리 말과 행동의 대부분은 불필요하다. 덜어내면 여유는 늘고 불안은 준다. 매번 물어라, 이것은 불필요한 일이 아닌가.", "cite": "4.24", "gloss": "할 일 목록이 끝없이 길어질 때 — 더하기가 아니라 빼기로 평온을 되찾는 질문 하나."}, {"text": "끝없이 파도가 부딪쳐도 굳게 서서 물결을 잠재우는 곶처럼 되라. 이것은 불운이 아니다. 이를 의연히 견디는 것이 행운이다.", "cite": "4.49", "gloss": "일이 꼬인 날 ‘왜 하필 나만’이 떠오를 때 — 그날의 운은 사건이 아니라 견디는 방식이 정한다."}, {"text": "포도를 맺은 포도나무는 더 바라지 않는다. 선을 행한 사람도 보러 오라 외치지 않고, 철 따라 열매 맺듯 다음 일로 간다.", "cite": "5.6", "gloss": "도와주고도 고맙다는 말 한마디 없어 서운할 때 — 포도나무는 열매를 맺은 것으로 이미 제 일을 다했다."}, {"text": "매번 옳게 해내지 못한다고 넌더리 내거나 낙담하지 말라. 실패하면 다시 돌아오고, 하는 일 대부분이 사람다우면 만족하라.", "cite": "5.9", "gloss": "다짐한 습관을 또 어긴 날 — 무너진 날이 아니라 돌아갈 자리를 다시 확인하는 날."}, {"text": "가장 좋은 복수는 내게 잘못한 자를 닮지 않는 것이다.", "cite": "6.6", "gloss": "험담엔 험담으로, 무례엔 무례로 갚고 싶을 때 — 되갚는 순간 상대가 나를 빚어 버린다."}, {"text": "내 생각이나 행동이 그르다고 누가 보여 주면 기꺼이 고치겠다. 진리에 다친 이는 없다. 다치는 건 잘못에 머무는 자다.", "cite": "6.21", "gloss": "보고서나 코드에 지적을 받고 얼굴이 달아오를 때 — 지적받는 순간은 손해가 아니라 진실 쪽으로 한 걸음 옮기는 순간."}, {"text": "마음을 기쁘게 하고 싶으면 함께 사는 이들의 미덕을 떠올려라. 누구의 부지런함, 누구의 겸손, 누구의 너그러움을.", "cite": "6.48", "gloss": "가족이나 동료에게 서운함만 쌓일 때 — 그들의 좋은 점을 하나씩 세어 보는 기쁨의 처방."}, {"text": "도움받기를 부끄러워 말라. 네 일은 성벽 오르는 병사처럼 제 몫을 다하는 것. 다리를 절어 혼자 못 오르면 남의 손을 빌려라.", "cite": "7.7", "gloss": "아프거나 지쳐 혼자 감당이 안 될 때 — 도움을 청하는 것도 맡은 일을 해내는 한 방법이다."}, {"text": "앞일로 마음을 어지럽히지 말라. 가야 할 때가 오면, 지금 눈앞의 일에 쓰는 그 이성을 지니고 그곳에 이를 것이다.", "cite": "7.8", "gloss": "면접·수술·이사처럼 아직 오지 않은 일로 잠 못 들 때 — 그날의 나도 지금의 나만큼 생각할 수 있다."}, {"text": "없는 것보다 가진 것을 생각하라. 가진 것 중 가장 좋은 것을 골라, 그것이 없었다면 얼마나 간절히 구했을지 떠올려라.", "cite": "7.27", "gloss": "남의 새 차와 여행 사진에 마음이 쓰릴 때 — 가진 것의 값을 다시 매기되, 잃을까 매달리지는 않는 연습."}, {"text": "고통은 수치가 아니며 정신을 해치지 못한다. 대개의 고통은, 한계를 기억하고 상상으로 보태지 않으면 견딜 만하고 끝이 있다.", "cite": "7.64", "gloss": "에피쿠로스에게서 빌린 처방 — 통증으로 잠 못 드는 밤, ‘끝이 있다’는 사실 하나를 붙드는 법."}, {"text": "삶 전체를 한꺼번에 떠올려 괴로워 말라. 그때마다 물어라, 무엇이 정말 견딜 수 없는가. 너를 아프게 하는 건 지금뿐이다.", "cite": "8.36", "gloss": "대출·육아·커리어 걱정이 한꺼번에 몰려올 때 — 걱정을 오늘 하루치로 잘라 내는 기술."}, {"text": "위에서 내려다보라, 무수한 무리와 의식과 폭풍 속 항해를. 네 이름 모르는 이가 많고, 지금 칭찬하는 이도 곧 비난한다.", "cite": "9.30", "gloss": "회사 안 소문이나 단톡방 평판이 세상의 전부처럼 느껴질 때 — 시야를 높이면 크기가 제자리를 찾는다."}, {"text": "누군가는 ‘어찌하면 아이를 잃지 않을까’ 하고 빈다. 너는 이렇게 빌어라. ‘어찌하면 아이 잃을 것을 두려워하지 않을까.’", "cite": "9.40", "gloss": "아이의 검사 결과를 기다리는 밤 — 결과는 손에 없어도, 두려움에서 놓여나기를 구할 수는 있다."}, {"text": "누군가의 뻔뻔함에 화가 나면 곧 물어라. 세상에 뻔뻔한 이가 없을 수 있는가? 없다. 그러니 불가능한 것을 요구하지 말라.", "cite": "9.42", "gloss": "새치기나 끼어들기 같은 몰염치에 하루가 상할 때 — 기대를 고치면 분노가 먼저 줄어든다."}, {"text": "해야 할 일을 살필 수 있는데 왜 의심하며 겁내는가. 길이 보이면 돌아보지 말고 가고, 안 보이면 멈춰 좋은 조언을 구하라.", "cite": "10.12", "gloss": "이직이나 진로처럼 답이 안 보이는 선택 앞에서 — 확신이 없을 땐 멈추고 묻는 것도 행동이다."}, {"text": "선한 사람이 어떠해야 하는지 더는 논하지 말고, 그런 사람이 되어라.", "cite": "10.16", "gloss": "자기계발서를 또 한 권 사고 싶어질 때 — 원칙은 읽을 때가 아니라 오늘 한 번 해 볼 때 완성된다."}, {"text": "누가 나를 경멸하든 그건 그의 일, 나는 경멸받을 언행을 하지 않도록 살핀다. 누가 나를 미워하든 나는 모두에게 온화하리라.", "cite": "11.13", "gloss": "나를 싫어하는 사람이 분명히 있을 때 — 그의 감정은 그의 몫, 내 몫은 내 말과 행동뿐."}, {"text": "언젠가 삶이 끝나는 것을 두려워하지 말고, 본성에 따라 사는 삶을 끝내 시작하지 못하는 것을 두려워하라.", "cite": "12.1", "gloss": "나이 듦과 죽음이 문득 무서워질 때 — 두려움의 방향을 ‘끝’에서 ‘아직 시작하지 않은 삶’으로 돌리는 문장."}, {"text": "사람은 누구보다 자신을 사랑하면서도, 자신에 대한 제 생각보다 남의 생각을 더 무겁게 여긴다. 나는 이것이 자주 의아했다.", "cite": "12.4", "gloss": "‘좋아요’ 수와 남의 평가에 자존감이 오르내릴 때 — 나를 가장 아끼는 사람이 왜 내 판단을 가장 가볍게 여기는가."}, {"text": "가망 없어 보이는 일도 연습하라. 연습이 없어 다른 일엔 서툰 왼손도 고삐만은 오른손보다 힘 있게 쥔다. 익혔기 때문이다.", "cite": "12.6", "gloss": "새 언어나 악기, 운동 앞에서 ‘나는 원래 안 돼’라는 말이 나올 때 — 재능이 아니라 반복이 손을 만든다."}],
        concepts: [{"term": "헤게모니콘 (지배 이성, hēgemonikon)", "def": "마음의 지휘부, 즉 판단하고 동의하는 이성의 핵심. 외부 사건이 아니라 이것이 평정과 동요를 결정한다."}, {"term": "통제의 구분 (what is up to us)", "def": "내 의지·판단·행동은 나에게 달렸고, 결과·평판·타인은 그렇지 않다. 스토아 평정은 이 경계를 지키는 데서 온다."}, {"term": "우주의 본성 (전체의 자연, Universal Nature)", "def": "만물을 질서 짓는 이성적 섭리. 일어나는 일은 전체에 합당하므로 받아들임이 곧 건강한 영혼이다."}, {"term": "무상 (흐름, impermanence)", "def": "모든 것은 변하고 사라진다. 명성도 기억도 곧 잊히니, 지금의 의무에 집중하는 근거가 된다."}],
        apply: "<p>오늘 한 가지만 해보세요. 아침에 눈을 떴는데 일어나기 싫다면, 5.1을 빌려 '나는 인간이 할 일을 하러 일어난다'고 한 문장으로 되뇌고 발을 바닥에 내려놓으세요. 동기를 기다리지 말고 동작을 먼저 만드는 겁니다.</p><p>일과 중 누군가에게 화가 치밀면 4.7을 적용하세요. '그가 나를 해쳤다'는 판단을 잠깐 거두고, 사실(무슨 일이 일어났나)과 해석(내가 거기 붙인 의미)을 분리해 적어 보면, 화의 절반은 사건이 아니라 내 해석이었음이 드러납니다. 좌절이 닥치면 5.20처럼 '이 막힘을 다음 행동의 재료로 어떻게 쓸까'를 한 줄 적어 두세요.</p>",
        related: [{"slug": "enchiridion", "label": "엥케이리디온 · 에픽테토스"}, {"slug": "letters-to-lucilius", "label": "루킬리우스에게 보내는 편지 · 세네카"}, {"slug": "discourses", "label": "담화록 · 에픽테토스"}],
        editions: [
          { title: '명상록 (원전으로 읽는 순수고전세계)', translator: '천병희', publisher: '도서출판 숲 (원전으로 읽는 순수고전세계 총서)', note: '국내 최초의 그리스어 원전 직역으로 꼽히는 정본. 그동안의 영어·일본어 중역을 대체한 표준 번역으로 평가받는다. 2005년 초판 이후 개정을 거쳤다.' },
          { title: '명상록 (그리스어 원전 완역본) — 철학자 황제가 전쟁터에서 자신에게 쓴 일기', translator: '박문재', publisher: '현대지성 (현대지성 클래식 18)', note: '그리스어 원전 완역본으로, 역자의 상세한 해제와 함께 아우렐리우스가 영향을 받은 에픽테토스 명언집을 부록으로 실었다. 비교적 평이한 현대어로 옮겨 입문 독자에게 무난하다.' },
          { title: '자기 자신에게 이르는 것들 (명상록 헬라스어 완역본)', translator: '김재홍', publisher: '그린비 (그린비 고전의 숲 5)', note: "서양고전학 전공자가 옮긴 헬라스어(그리스어) 원전 완역본. '명상록'이라는 통칭 대신 원제 '자기 자신에게 이르는 것들'을 살리고 풍부한 주석·연보·찾아보기를 더한 학술 충실형 번역(2023)." },
        ],
        pdIntro:
          '아래는 저작권이 만료된 조지 롱(George Long, 1862) 영역본입니다. 한국어 퍼블릭 도메인 완역본은 제한적이어서, 원문은 영어 역본으로 안내합니다.',
        pdLinks: [
          {
            label: 'Wikisource — 명상록 전권 (조지 롱 역)',
            url: 'https://en.wikisource.org/wiki/The_Thoughts_of_the_Emperor_Marcus_Aurelius_Antoninus',
          },
          {
            label: 'Project Gutenberg — 명상록 내려받기(메릭 카소본 번역)',
            url: 'https://www.gutenberg.org/ebooks/2680',
          },
          {
            label: 'MIT Internet Classics Archive — 명상록 전권',
            url: 'https://classics.mit.edu/Antoninus/meditations.html',
          },
        ],
      },
      ja: {
        workName: '自省録',
        mentorName: 'マルクス・アウレリウス',
        lede: 'マルクス・アウレリウス『自省録』— Dialogos が引用するパブリックドメインのストア哲学原典。作品解説と無料原文(ジョージ・ロング訳)の案内。',
        intro:
          '『自省録』(ギリシア語原題 <em>Τὰ εἰς ἑαυτόν</em>、「自分自身に向けて」)は、ローマ皇帝マルクス・アウレリウス(121–180)がギリシア語で自らに書きつけた、日記形式のストア哲学の手記です。出版を意図しない私的な省察であり、義務・理性・無常、そして制御できないものへの超然を扱います。Dialogos でマルクスが答える際、この書の複数の巻を出典として引用します。',
        sections: [
          {
            anchor: 'book-2',
            title: '第2巻',
            body: '朝に出会う忘恩で傲慢な人々をあらかじめ思い描きつつ、理性的な本性を持つあなたは彼らに傷つけられない。死と無常を見つめ、今の務めに集中しなさい。(2.1)',
          },
          {
            anchor: 'book-4',
            title: '第4巻',
            body: '最も静かな隠れ家は自分自身の心である。外の出来事ではなく、それへの判断が苦しみを生む。判断を取り除けば、害もまた消える。(4.3)',
          },
          {
            anchor: 'book-5',
            title: '第5巻',
            body: '夜明けに起きたくない時には、私は人間の務めのために起きるのだと自らに言い聞かせなさい。宇宙の本性が定めたものを受け入れることが、健やかな魂である。(5.1, 5.8)',
          },
          {
            anchor: 'book-6',
            title: '第6巻',
            body: '心は外の助けなしに自ら平静を取り戻す。単純さと善意をもって行えば十分である。(6.8)',
          },
          {
            anchor: 'book-9',
            title: '第9巻',
            body: '失うことは変化に過ぎず、変化は自然の喜びである。無常を受け入れれば、嘆きはやむ。(9.35)',
          },
        ],
        provenance:
          'Dialogos の回答は、著作権が切れた原典の思想を現代日本語に意訳したものであり、著作権のある現代語訳をそのまま転載することはありません。出典の表記は、その思想が実際に現れる巻・節を指し示すものであって、原文を逐語的に引用するものではありません。',
                faq: [{"q": "自省録を一行で要約すると?", "a": "統制できるもの(自分の判断と行動)とできないもの(外の出来事と他人)を区別し、理性に従って今の務めを果たし、無常を受け入れて心の平静を保つ — そういう自己訓練の記録です。出版のためでなく、自らを律するために書いた日記です。"}, {"q": "自省録の代表的な名言は?", "a": "「夜明けに起きたくない時、私は人間の務めのために起きると言い聞かせよ」(5.1)、「判断を取り除けば害も消える」(4.7)、「道の上の障害がその道を行かせる」(5.20)、「失うことは変化に過ぎない」(9.35)が最もよく引用されます。"}, {"q": "自省録 第5巻はどんな内容ですか?", "a": "マルクスが自らに書いた省察で、夜明けに人間の務めのために起きよという勧め(5.1)と、宇宙の本性が定めたものを医師の処方のように受け入れる平静(5.8)、そして障害さえ行動の材料に変えよという思想(5.20)を含みます。"}, {"q": "マルクス・アウレリウスとは誰ですか?", "a": "ローマ帝国の皇帝(在位161–180)であり、後期ストア派の哲学者です。統治と戦争の合間にギリシア語で自らに日記を書き、その手記が『自省録』として伝わりました。出版を意図しなかったため、率直な自己点検の調子が特徴です。"}, {"q": "自省録はどんな順で読めばよいですか?", "a": "体系的な論文ではなく箴言集なので、どの巻から開いても構いません。ただし第2・4・5巻に核心の決意(2.1, 4.3, 5.1)が集まっており入門に向きます。第1巻は師への感謝の覚書で、背景を知って読むと一層深まります。"}, {"q": "自省録の現代的な意義は?", "a": "統制できるものに集中せよという教えは、今日の認知行動療法やレジリエンス訓練の源泉としてよく挙げられます。仕事の重圧や人間関係に疲れた人にとって、出来事ではなく解釈を整えよという4.7の洞察が、実用的なセルフケアの道具として読まれています。"}, {"q": "自省録の原文を無料で読めますか?", "a": "はい。著作権が切れたジョージ・ロング(1862)の英訳は Wikisource で、メリク・カソーボンの英訳は Project Gutenberg で無料で読めます。下記のパブリックドメインのリンクをご覧ください。日本語のパブリックドメイン全訳は限られるため、原文は英訳で案内します。"}],
        context: "<p>『自省録』は、ローマ皇帝マルクス・アウレリウス(121–180)が、ゲルマン人との戦線を行き来した在位後半(170年代頃)に、ギリシア語で自分自身に向けて書いた私的な手記です。原題 <em>Τὰ εἰς ἑαυτόν</em> は「自分自身に」の意で、出版も読者も意図しない自己点検の記録です。全12巻として伝わり、体系的な論文ではなく短い箴言と決意の集まりという形をとります。第1巻は家族や師から受けた恩を一つずつ挙げる感謝の覚書です。日本では神谷美恵子の訳が岩波文庫として広く読まれています。</p>",
        quotes: [{"text": "夜明けに起きたくない時には、「私は一人の人間としての務めを果たすために起きるのだ」と自らに言い聞かせなさい。", "cite": "5.1", "gloss": "務めは気分ではなく決意から始まる — 出社前、布団の中で唱える一文。"}, {"text": "最も静かな隠れ家は、自分自身の心である。人は海辺や山を求めるが、君はいつでも自分の内へ退くことができる。", "cite": "4.3", "gloss": "休息は場所ではなく視点の切り替え — 職場で逃げ場がない時に入れる本当の部屋。"}, {"text": "判断を取り除きなさい。そうすれば「害された」という訴えもまた消える。", "cite": "4.7", "gloss": "苦しみは出来事ではなく、それに付けた解釈から生まれる — 人間関係の摩擦をほどく起点。"}, {"text": "心は、行いを妨げるものをすべて助けに変える。妨げが行いを前へ進め、道の上の障害がその道を行く助けになる。", "cite": "5.20", "gloss": "詰まりそのものを次の一手の材料に変える — 理不尽な仕事に向き合う時の核。"}, {"text": "失うことは変化に過ぎない。宇宙の本性は変化を喜び、それに従ってすべてが正しく行われる。", "cite": "9.35", "gloss": "終わりではなく形が変わっただけ — 異動・別れの日に手放さない視点。"}, {"text": "一万年生きるかのように振る舞うな。死は君の頭上にかかっている。生きているうちに、できるうちに、善くあれ。", "cite": "4.17", "gloss": "無常は先延ばしの解毒剤 — 「後で」を「今」に変える静かな圧力。"}, {"text": "朝ごとに自分に言い聞かせなさい。今日はおせっかいな者、恩知らず、傲慢な者に会うだろう。彼らは善悪を知らないだけで、私を害することはできない。", "cite": "2.1", "gloss": "出勤前に心の構えを決めておく練習 — 無礼な人に会っても一日が崩れないように。"}, {"text": "いま手にしている務めを、生涯最後の行いのように果たしなさい。軽率さや偽り、自分の分への不満を捨てれば、ほかの雑念から解放される。", "cite": "2.5", "gloss": "通知と雑念で細切れになった一日に — 目の前のひとつを最後のつもりで扱う集中法。"}, {"text": "公益と関わりもなく、他人が何をなぜし、何を言い何を企むのかと考えて、残りの人生を費やすな。ほかのことをする機会を失う。", "cite": "3.4", "gloss": "他人のSNSやグループチャットの裏を読むうちに夜が消えるとき — その時間でできたことが別にあった。"}, {"text": "私たちの言葉と行いの大半は不要なものだ。それを除けば、ゆとりは増え、不安は減る。その都度問いなさい、これは不要なことではないか、と。", "cite": "4.24", "gloss": "やることリストが果てしなく伸びるとき — 足し算ではなく引き算で平静を取り戻す、ひとつの問い。"}, {"text": "絶えず波に打たれながらも揺るがず、周りの荒波を鎮める岬のようであれ。これは不運ではない。これを気高く耐えることこそ幸運なのだ。", "cite": "4.49", "gloss": "「なぜ自分だけ」と思う日に — その日の運を決めるのは出来事ではなく、耐え方のほうだ。"}, {"text": "実を結んだぶどうの木は、それ以上を求めない。善を行った人も見に来いと叫ばず、季節にまた実るように次の行いへ移る。", "cite": "5.6", "gloss": "手を貸したのに礼の一言もなく寂しいとき — ぶどうの木は実を結んだ時点で、もう務めを果たしている。"}, {"text": "いつも正しくやり遂げられなくても、嫌気がさしたり落胆したりするな。しくじったらまた戻り、行いの大半が人間らしければそれで満足しなさい。", "cite": "5.9", "gloss": "決めた習慣をまた破った日に — 崩れた日ではなく、戻る場所を確かめ直す日。"}, {"text": "最良の報復は、自分に害をなした者に似ないことである。", "cite": "6.6", "gloss": "陰口には陰口を、無礼には無礼を返したくなるとき — やり返した瞬間、相手が自分の姿を決めてしまう。"}, {"text": "私の考えや行いが誤っていると示せる人がいれば、喜んで改めよう。真理で害された者はいない。害されるのは誤りにとどまる者だ。", "cite": "6.21", "gloss": "報告書やコードに指摘を受けて顔が熱くなるとき — 指摘される瞬間は損ではなく、真実へ一歩近づく瞬間。"}, {"text": "心を喜ばせたいときは、共に暮らす人々の美点を思い浮かべなさい。ある人の勤勉さ、ある人の慎み深さ、またある人の気前のよさを。", "cite": "6.48", "gloss": "家族や同僚への不満ばかりが溜まるとき — 彼らの良いところを一つずつ数える、喜びの処方箋。"}, {"text": "助けを受けることを恥じるな。君の務めは城攻めの兵士のように持ち場を果たすこと。足が悪く一人で城壁に登れないなら、人の手を借りればよい。", "cite": "7.7", "gloss": "病気や疲れで一人では抱えきれないとき — 助けを求めることも、務めを果たすひとつのやり方だ。"}, {"text": "未来のことに心を乱されるな。そこへ行くべき時が来れば、いま目の前の事に用いているのと同じ理性を携えて行き着くのだから。", "cite": "7.8", "gloss": "面接や手術、引っ越しなど、まだ来ない出来事で眠れない夜に — その日の自分も、今の自分と同じように考えられる。"}, {"text": "ないものより、あるものを思いなさい。持っているものの中から最良のものを選び、それがなければどれほど切に求めたかを考えなさい。", "cite": "7.27", "gloss": "他人の新車や旅行の写真に胸がうずくとき — 持っているものの値打ちを測り直しつつ、失うまいとしがみつかない練習。"}, {"text": "苦痛は恥ではなく、心を損なうこともない。たいていの苦痛は、限りがあると心に留め、想像で付け足さなければ、耐えがたくも果てしなくもない。", "cite": "7.64", "gloss": "エピクロスから借りた処方 — 痛みで眠れない夜、「終わりがある」という一点を握りしめる方法。"}, {"text": "人生全体を一度に思い描いて心を乱すな。その都度問いなさい、本当に耐えがたいものは何か。君を苦しめるのは過去でも未来でもなく、現在だけだ。", "cite": "8.36", "gloss": "ローン、子育て、キャリアの不安が一度に押し寄せるとき — 心配を今日一日分に切り分ける技術。"}, {"text": "高みから見下ろしなさい。無数の人の群れと儀式、嵐と凪の中の航海を。君の名を知らぬ者は多く、いま称える者もやがて非難する。", "cite": "9.30", "gloss": "職場の噂や評判が世界のすべてに思えるとき — 視点を上げれば、物事が本来の大きさに戻る。"}, {"text": "ある人は「どうすれば子を失わずにすむか」と祈る。君はこう祈りなさい。「どうすれば子を失うことを恐れずにいられるか」と。", "cite": "9.40", "gloss": "子どもの検査結果を待つ夜に — 結果は手の中にないが、恐れから解き放たれることなら求めることができる。"}, {"text": "誰かの厚かましさに腹が立ったら、すぐ自問しなさい。厚かましい者のいない世界はありうるか。ありえない。ならば不可能を求めるな。", "cite": "9.42", "gloss": "割り込みや無神経な振る舞いに一日を台無しにされるとき — 期待を直せば、怒りのほうが先に小さくなる。"}, {"text": "何をすべきか調べられるのに、なぜ疑い恐れるのか。道が見えるなら振り返らずに進み、見えないなら立ち止まって最良の助言者に尋ねなさい。", "cite": "10.12", "gloss": "転職や進路のように答えの見えない選択の前で — 確信がないときは、立ち止まって尋ねることも行動のうち。"}, {"text": "善い人とはどうあるべきかを、もう論じるな。そういう人であれ。", "cite": "10.16", "gloss": "また自己啓発書を一冊買いたくなったとき — 原則は読むときではなく、今日一度やってみるときに完成する。"}, {"text": "誰かが私を軽蔑するか。それは本人が気にかければよい。私は軽蔑に値する言動をしないよう努める。誰かが私を憎むか。私は誰にも穏やかであろう。", "cite": "11.13", "gloss": "自分を嫌っている人が確かにいるとき — 相手の感情は相手のもの、自分の持ち分は自分の言動だけ。"}, {"text": "いつか生が終わることではなく、自然に従って生きることを一度も始めずにいることを恐れなさい。", "cite": "12.1", "gloss": "老いや死がふと怖くなるとき — 恐れの向きを「終わり」から「まだ始めていない生き方」へ向け直す一文。"}, {"text": "人は誰よりも自分を愛しながら、自分についての自分の考えより、他人の考えを重んじる。私はこれを幾度も不思議に思ってきた。", "cite": "12.4", "gloss": "「いいね」の数や他人の評価で自己肯定感が上下するとき — 自分を一番大事にする人が、なぜ自分の判断を一番軽んじるのか。"}, {"text": "成し遂げる望みのないことでも練習しなさい。練習不足でほかのことには役立たない左手も、手綱は右手より力強く握る。それを練習してきたからだ。", "cite": "12.6", "gloss": "新しい言語や楽器、運動を前に「自分にはもともと無理」と思うとき — 才能ではなく、繰り返しが手をつくる。"}],
        concepts: [{"term": "ヘゲモニコン (指導理性, hēgemonikon)", "def": "心の中枢、すなわち判断し同意する理性の核。平静と動揺を決めるのは外の出来事ではなくこれである。"}, {"term": "統制の区別 (我々次第なもの)", "def": "判断・意志・行動は自分次第だが、結果・評判・他人はそうではない。ストアの平静はこの境界を守ることから生まれる。"}, {"term": "宇宙の本性 (全体の自然, Universal Nature)", "def": "万物を秩序づける理性的な摂理。起こることは全体にとって適切であり、それを受け入れることが健やかな魂である。"}, {"term": "無常 (流転, impermanence)", "def": "すべては変わり、消えていく。名声も記憶もやがて忘れられるからこそ、今の務めに集中する根拠となる。"}],
        apply: "<p>今日、一つだけ試してください。朝、目は覚めたのに起きたくない時は、5.1を借りて「私は人間としての務めのために起きる」と一文だけ唱え、足を床に下ろします。やる気を待たず、動作を先につくるのです。</p><p>職場で誰かに苛立ったら、4.7を使ってみてください。「あの人が私を害した」という判断を一度脇に置き、事実(何が起きたか)と解釈(自分がそこに付けた意味)を分けて書き出すと、怒りの半分は出来事ではなく自分の解釈だったと見えてきます。理不尽な状況に詰まったら、5.20のように「この妨げを次の一手の材料にどう使うか」を一行メモしておきましょう。</p>",
        related: [{"slug": "enchiridion", "label": "エンケイリディオン · エピクテトス"}, {"slug": "letters-to-lucilius", "label": "ルキリウスへの手紙 · セネカ"}, {"slug": "discourses", "label": "語録 · エピクテトス"}],
        editions: [
          { title: '自省録（岩波文庫 改版）', translator: '神谷美恵子', publisher: '岩波書店（岩波文庫 青610-1）', note: '日本で最も広く読まれてきた定番の訳。2007年の改版で新たな補注が加えられた。原典の格調を保ちつつ通読できる、まず手に取りたい一冊。' },
          { title: 'マルクス・アウレリウス「自省録」（講談社学術文庫）', translator: '鈴木照雄', publisher: '講談社（講談社学術文庫）', note: 'ギリシア哲学研究者による学術的な新訳。読み比べたい人や、語句を踏み込んで理解したい読者に向く。' },
        ],
        pdIntro:
          '以下は著作権が切れたジョージ・ロング(George Long, 1862)の英訳です。日本語のパブリックドメイン全訳は限られているため、原文は英訳で案内します。',
        pdLinks: [
          {
            label: 'Wikisource — 自省録 全巻(ジョージ・ロング訳)',
            url: 'https://en.wikisource.org/wiki/The_Thoughts_of_the_Emperor_Marcus_Aurelius_Antoninus',
          },
          {
            label: 'Project Gutenberg — 自省録 ダウンロード(メリク・カソーボン訳)',
            url: 'https://www.gutenberg.org/ebooks/2680',
          },
          {
            label: 'MIT Internet Classics Archive — 自省録 全巻',
            url: 'https://classics.mit.edu/Antoninus/meditations.html',
          },
        ],
      },
      en: {
        workName: 'Meditations',
        mentorName: 'Marcus Aurelius',
        lede: 'Marcus Aurelius’ Meditations — the public-domain Stoic source Dialogos cites. Work overview plus free original text (George Long translation).',
        intro:
          'The <em>Meditations</em> (Greek title <em>Τὰ εἰς ἑαυτόν</em>, "To Himself") is a private, diary-like record of Stoic philosophy that the Roman emperor Marcus Aurelius (121–180) wrote to himself in Greek. Never meant for publication, it turns on duty, reason, impermanence, and detachment from what lies outside our control. When Marcus answers you in Dialogos, he cites several books of this work as sources.',
        sections: [
          {
            anchor: 'book-2',
            title: 'Book 2',
            body: 'Picture in advance the ungrateful and arrogant people you will meet — yet you, having a rational nature, need not be harmed by any of them. Keep death and impermanence in view, and attend to the duty before you. (2.1)',
          },
          {
            anchor: 'book-4',
            title: 'Book 4',
            body: 'The quietest retreat is your own mind. It is not events but your judgement of them that wounds you; remove the judgement and the harm is gone. (4.3)',
          },
          {
            anchor: 'book-5',
            title: 'Book 5',
            body: 'When you rise unwillingly at dawn, remind yourself that you rise to do the work of a human being. To accept what Universal Nature assigns is the health of the soul. (5.1, 5.8)',
          },
          {
            anchor: 'book-6',
            title: 'Book 6',
            body: 'The mind restores its own calm without outside help. It is enough to act with simplicity and goodwill. (6.8)',
          },
          {
            anchor: 'book-9',
            title: 'Book 9',
            body: 'Loss is nothing but change, and change is Nature’s delight. Accept impermanence and you cease to mourn. (9.35)',
          },
        ],
        provenance:
          'Dialogos’s replies paraphrase the ideas of the public-domain original into modern language; they do not reproduce any in-copyright modern translation. A citation points to the book and section where an idea genuinely appears — it is not a verbatim quotation of the text.',
                faq: [{"q": "What is the Meditations about, in one line?", "a": "Distinguish what you can control (your judgements and actions) from what you cannot (events and other people), do the present duty by reason, and accept impermanence to keep your mind calm. It is a record of self-training — a diary written to govern himself, not for publication."}, {"q": "What are the most famous quotes from the Meditations?", "a": "\"When you rise unwillingly at dawn, tell yourself you rise to do the work of a human being\" (5.1), \"remove the judgement and the harm is gone\" (4.7), \"the obstacle on the road becomes the road\" (5.20), and \"loss is nothing but change\" (9.35) are the most widely cited."}, {"q": "What is Book 5 of the Meditations about?", "a": "Reflections Marcus wrote to himself: the call to rise at dawn to do the work of a human being (5.1), the calm of accepting what Universal Nature assigns as a physician prescribes a remedy (5.8), and the idea that even obstacles can be turned into material for action (5.20)."}, {"q": "Who was Marcus Aurelius?", "a": "A Roman emperor (reigned 161–180) and late Stoic philosopher. Amid ruling and waging war he kept a journal to himself in Greek, and those notes survive as the Meditations. Because he never meant to publish, the tone is candid, unguarded self-examination."}, {"q": "In what order should I read the Meditations?", "a": "It is a collection of maxims rather than a systematic treatise, so you can open almost any book. Books 2, 4, and 5 gather the most-quoted core reminders (2.1, 4.3, 5.1) and make a good entry point. Book 1, a list of debts to his teachers, reads richer once you know the background."}, {"q": "Why does the Meditations still matter today?", "a": "Its emphasis on focusing only on what you can control is often cited as a root of modern cognitive behavioral therapy and resilience training. For anyone facing burnout, anxiety, or perfectionism, the insight of 4.7 — govern the interpretation, not the event — reads as a practical tool for self-management."}, {"q": "Can I read the Meditations for free?", "a": "Yes. George Long's public-domain English translation (1862) is free to read on Wikisource, and Meric Casaubon's on Project Gutenberg. See the public-domain links below. The full text is offered in English because public-domain complete translations in other languages are limited."}],
        context: "<p>The <em>Meditations</em> is a private notebook the Roman emperor Marcus Aurelius (121–180) wrote in Greek, to himself alone, mostly in the later years of his reign (around the 170s) while campaigning on the German frontier. Its title <em>Τὰ εἰς ἑαυτόν</em> means \"to himself\" — it was never meant for publication or any reader. It survives in twelve books and is not a systematic treatise but a collection of short maxims and self-reminders. Book 1 is a catalogue of debts of gratitude to family and teachers; the rest circle back, again and again, to duty, reason, impermanence, and self-command.</p>",
        quotes: [{"text": "When you rise unwillingly at dawn, tell yourself: I am rising to do the work of a human being.", "cite": "5.1", "gloss": "Duty starts in the decision, not the mood — a single line to repeat in bed on a hard morning."}, {"text": "The quietest retreat is your own mind. People seek the sea and the mountains, but you can withdraw into yourself at any hour.", "cite": "4.3", "gloss": "Rest is a shift of attention, not a location — the real room you can enter with nowhere to escape."}, {"text": "Take away the judgement, and the complaint \"I have been harmed\" is taken away with it.", "cite": "4.7", "gloss": "Suffering comes from the interpretation you add, not the event itself — the starting point of modern stress work."}, {"text": "The mind turns every hindrance to its action into an aid: what impedes the act furthers it, and the obstacle on the road helps us along it.", "cite": "5.20", "gloss": "Turn the blockage itself into raw material for the next move — the core of turning setbacks into fuel."}, {"text": "Loss is nothing but change, and Universal Nature delights in change; in obedience to it all things are done well.", "cite": "9.35", "gloss": "Not an ending but a change of form — a frame to hold on the day you lose something."}, {"text": "Do not act as if you had ten thousand years to live. Death hangs over you; while you live, while you can, be good.", "cite": "4.17", "gloss": "Impermanence as an antidote to procrastination — quiet pressure that turns \"later\" into \"now.\""}, {"text": "Each morning tell yourself: today I will meet the busybody, the ungrateful, the arrogant. They act from ignorance of good and evil; none of them can harm me.", "cite": "2.1", "gloss": "Rehearse the day’s friction before it starts — so one rude colleague or customer doesn’t get to set the tone of your whole day."}, {"text": "Do the task at hand as if it were the last act of your life, without carelessness, pretense or complaint about your lot, and you will be relieved of all other thoughts.", "cite": "2.5", "gloss": "For a day chopped into pieces by notifications and side-worries — treat the one thing in front of you as if it were your last, and the noise falls away."}, {"text": "If it serves no common good, don’t spend your remaining life wondering what others do and why, what they say, think or scheme; you lose the chance to do something else.", "cite": "3.4", "gloss": "When an evening vanishes into decoding someone’s posts or a group chat — that time had other uses."}, {"text": "Most of what we say and do is unnecessary; take it away and you will have more leisure and less unease. On each occasion ask: is this one of the unnecessary things?", "cite": "4.24", "gloss": "When the to-do list keeps growing — a single question that restores calm by subtraction rather than addition."}, {"text": "Be like the promontory the waves keep breaking against: it stands firm and calms the water around it. This is no misfortune; to bear it nobly is good fortune.", "cite": "4.49", "gloss": "On a day you catch yourself asking “why me?” — it is how you bear the event, not the event itself, that decides whether the day was unlucky."}, {"text": "A vine that has borne grapes seeks nothing more. Whoever does good doesn’t call others to come and see, but goes on to the next act, as the vine bears again in season.", "cite": "5.6", "gloss": "When you helped and no one said thanks — the vine’s work was finished the moment it bore fruit."}, {"text": "Don’t be disgusted or discouraged if you fail to act rightly every time. When you fall short, come back, and be content if most of what you do befits a human being.", "cite": "5.9", "gloss": "For the day you broke the habit again — not proof that everything has collapsed, just a reminder of where to return."}, {"text": "The best way to avenge yourself is not to become like the one who wronged you.", "cite": "6.6", "gloss": "When you want to answer gossip with gossip or rudeness with rudeness — retaliating lets the other person decide who you become."}, {"text": "If anyone can show me that I think or act wrongly, I will gladly change. I seek the truth, which never injured anyone; the one injured is he who stays in his error.", "cite": "6.21", "gloss": "When feedback on your report or code makes your face burn — being corrected isn’t a loss but a step toward what’s true."}, {"text": "When you want to lift your spirits, think of the good in the people you live among: how hard one works, how modest another is, how generous a third.", "cite": "6.48", "gloss": "When all you can see in family or coworkers is what annoys you — a prescription for gladness: count their good qualities one by one."}, {"text": "Don’t be ashamed to be helped. Your duty is a soldier’s in an assault: if you are limping and can’t scale the battlements alone, but can with help, why refuse it?", "cite": "7.7", "gloss": "When illness or exhaustion means you can’t carry it alone — asking for help is one of the ways the job still gets done."}, {"text": "Don’t let the future disturb you. If you must face it, you will arrive carrying the same reason you now use for what is in front of you.", "cite": "7.8", "gloss": "For nights lost to an interview, surgery or move that hasn’t happened yet — the you who gets there will think as clearly as the you who is here now."}, {"text": "Think less of what you lack than of what you have. Pick out the best of what you have, and consider how eagerly you would have sought it if it were not yours.", "cite": "7.27", "gloss": "When someone else’s new car or holiday photos sting — re-price what you already have, without clinging so hard that losing it would undo you."}, {"text": "Pain is no disgrace and does not make the mind worse. Most pain, if you remember its limits and add nothing to it in imagination, is neither intolerable nor everlasting.", "cite": "7.64", "gloss": "A remedy he borrows from Epicurus — for a sleepless night of pain, hold on to the one fact that it ends."}, {"text": "Don’t trouble yourself by picturing your whole life at once. Ask each time: what here is truly unbearable? Neither past nor future pains you, only the present.", "cite": "8.36", "gloss": "When worries about money, kids and career arrive all at once — the skill of cutting worry down to a single day’s portion."}, {"text": "Look down from above on countless herds of people, their rites, their voyages in storm and calm. Many don’t know your name; those praising you now will soon blame you.", "cite": "9.30", "gloss": "When office gossip or your standing in one group chat feels like the whole world — raise the viewpoint and things shrink back to their real size."}, {"text": "One man prays, “How may I not lose my little son?” Pray instead, “How may I not be afraid to lose him?”", "cite": "9.40", "gloss": "For the night you wait on a child’s test results — the outcome isn’t in your hands, but freedom from the fear is something you can ask for."}, {"text": "When someone’s shamelessness offends you, ask at once: could there be no shameless people in the world? There could not. So do not require the impossible.", "cite": "9.42", "gloss": "When someone cutting in line or in traffic sours your day — adjust the expectation, and the anger shrinks first."}, {"text": "Why the suspicious fear, when you can ask what ought to be done? If you see clearly, go on content, without turning back; if not, stop and take the best advisers.", "cite": "10.12", "gloss": "Facing a job change or a fork with no clear answer — when you can’t see the path, pausing to ask good people is itself a way of moving."}, {"text": "No more talk at all about what a good person ought to be like: be such a person.", "cite": "10.16", "gloss": "When you’re tempted to buy one more self-help book — a principle is finished not when you read it but when you act on it once, today."}, {"text": "Does someone despise me? Let him see to that; I will see that I do or say nothing deserving contempt. Does someone hate me? I will be gentle with all.", "cite": "11.13", "gloss": "When you know someone simply dislikes you — their feelings are theirs to manage; your share is only your own words and actions."}, {"text": "Fear not that you must one day stop living, but that you may never have begun to live according to nature.", "cite": "12.1", "gloss": "When aging or death suddenly frightens you — a line that turns the fear away from the ending and toward the life you haven’t yet begun."}, {"text": "I have often wondered how each of us loves himself more than anyone else, yet values his own opinion of himself less than the opinion of others.", "cite": "12.4", "gloss": "When likes and other people’s verdicts push your self-worth up and down — why does the one who loves you most trust your judgment least?"}, {"text": "Practise even what you despair of mastering: the left hand, weak elsewhere for want of practice, grips the bridle harder than the right, for it has practised that.", "cite": "12.6", "gloss": "When you hear yourself say “I’m just not built for this” about a language, an instrument or a sport — repetition, not talent, is what trains the hand."}],
        concepts: [{"term": "hēgemonikon (the ruling faculty)", "def": "The command center of the mind — the reasoning part that judges and assents. It, not external events, decides your calm or your turmoil."}, {"term": "what is up to us (the dichotomy of control)", "def": "Your judgements, will, and actions are yours; outcomes, reputation, and other people are not. Stoic calm comes from guarding this boundary."}, {"term": "Universal Nature", "def": "The rational providence that orders all things. Whatever happens is fitting for the whole, so accepting it is the health of the soul."}, {"term": "impermanence (flux)", "def": "Everything changes and passes; fame and memory are soon forgotten. This is precisely why the present duty deserves your full attention."}],
        apply: "<p>Try just one thing today. When you wake and don't want to get up, borrow 5.1: say the single line \"I am rising to do the work of a human being,\" and put your feet on the floor. Don't wait for motivation — build the motion first.</p><p>When someone irritates you during the day, apply 4.7. Set aside the judgement \"that person harmed me\" for a moment and write the fact (what happened) separately from the interpretation (the meaning you attached). Often half the anger turns out to live in the interpretation, not the event. When you hit a wall, do as 5.20 suggests and jot one line: how can I make this very obstacle the material for my next move?</p>",
        related: [{"slug": "enchiridion", "label": "The Enchiridion · Epictetus"}, {"slug": "letters-to-lucilius", "label": "Letters to Lucilius · Seneca"}, {"slug": "discourses", "label": "Discourses · Epictetus"}],
        editions: [
          { title: 'Meditations: A New Translation (Modern Library)', translator: 'Gregory Hays', publisher: 'Modern Library (Penguin Random House)', note: "The most widely recommended modern English version, prized for its spare, immediate, plain-spoken prose. Hays's introduction surveys Marcus's life, Stoic doctrine, and the work's lasting influence — a strong entry point for new readers. A free public-domain translation (George Long) is linked below." },
          { title: "Meditations: with Selected Correspondence (Oxford World's Classics)", translator: 'Robin Hard (intro & notes by Christopher Gill)', publisher: 'Oxford University Press', note: "A scholarly yet accessible edition whose introduction and notes by Christopher Gill set the text in its ancient philosophical context. It uniquely adds a selection of Marcus's correspondence with his tutor Fronto." },
          { title: 'Meditations (Penguin Classics)', translator: 'Martin Hammond (intro by Diskin Clay)', publisher: 'Penguin Classics', note: "A faithful, eloquent rendering close to the Greek, with detailed explanatory notes and an introduction by Diskin Clay on the development of the text. Good for readers who want fidelity plus thorough scholarly apparatus." },
        ],
        pdIntro:
          'The links below are the public-domain George Long (1862) translation, long out of copyright.',
        pdLinks: [
          {
            label: 'Wikisource — Meditations, complete (George Long)',
            url: 'https://en.wikisource.org/wiki/The_Thoughts_of_the_Emperor_Marcus_Aurelius_Antoninus',
          },
          {
            label: 'Project Gutenberg — Meditations, download (Meric Casaubon translation)',
            url: 'https://www.gutenberg.org/ebooks/2680',
          },
          {
            label: 'MIT Internet Classics Archive — Meditations, full text',
            url: 'https://classics.mit.edu/Antoninus/meditations.html',
          },
        ],
      },
    },
  },
  ...(generatedWorks as Record<string, SourceWork>),
};

export const sourceList: SourceWork[] = Object.values(sourceWorks);
