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

/** 한 언어(ko/ja/en)에 대한 출처 페이지 콘텐츠. */
export interface SourceContent {
  workName: string; // '명상록'
  mentorName: string; // '마르쿠스 아우렐리우스'
  lede: string; // meta description (≤155자 권장)
  intro: string; // 작품 소개 (HTML 조각 허용)
  sections: SourceSection[]; // 권/편별 핵심
  provenance: string; // Dialogos가 출처를 다루는 방식 (HTML)
  faq: SourceFaq[]; // AEO — FAQPage 스키마 + 가시 FAQ
  pdIntro: string; // 퍼블릭 도메인 원문 안내문
  pdLinks: SourcePdLink[]; // 검증된 PD 외부 링크
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
    updated: '2026-06-19',
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
        faq: [
          {
            q: '명상록 제5권은 어떤 내용인가요?',
            a: '마르쿠스가 자신에게 쓴 성찰로, 동틀 녘 인간의 의무를 위해 일어나라는 권고(5.1)와 우주의 본성이 정한 바를 받아들이는 평정(5.8)을 다룹니다.',
          },
          {
            q: '마르쿠스 아우렐리우스는 누구인가요?',
            a: '로마 제국의 황제(재위 161–180)이자 스토아 철학자입니다. 《명상록》은 출판을 의도하지 않고 그리스어로 자신에게 쓴 일기입니다.',
          },
          {
            q: '명상록 원문을 무료로 읽을 수 있나요?',
            a: '예. 저작권이 만료된 조지 롱(1862) 영역본을 Wikisource와 Project Gutenberg에서 무료로 읽을 수 있습니다. 아래 링크를 참고하세요.',
          },
          {
            q: 'Dialogos는 명상록을 어떻게 인용하나요?',
            a: '퍼블릭 도메인 원전의 사상을 현대어로 의역하며, 저작권이 있는 현대 번역본을 그대로 옮기지 않습니다. 출처 표기는 사상이 등장하는 권·절을 가리킵니다.',
          },
        ],
        pdIntro:
          '아래는 저작권이 만료된 조지 롱(George Long, 1862) 영역본입니다. 한국어 퍼블릭 도메인 완역본은 제한적이어서, 원문은 영어 역본으로 안내합니다.',
        pdLinks: [
          {
            label: 'Wikisource — 명상록 전권 (조지 롱 역)',
            url: 'https://en.wikisource.org/wiki/The_Thoughts_of_the_Emperor_Marcus_Aurelius_Antoninus',
          },
          {
            label: 'Project Gutenberg — 명상록 내려받기',
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
        faq: [
          {
            q: '自省録 第5巻はどんな内容ですか?',
            a: 'マルクスが自らに書いた省察で、夜明けに人間の務めのために起きよという勧め(5.1)と、宇宙の本性が定めたものを受け入れる平静(5.8)を扱います。',
          },
          {
            q: 'マルクス・アウレリウスとは誰ですか?',
            a: 'ローマ帝国の皇帝(在位161–180)であり、ストア派の哲学者です。『自省録』は出版を意図せず、ギリシア語で自らに書いた日記です。',
          },
          {
            q: '自省録の原文を無料で読めますか?',
            a: 'はい。著作権が切れたジョージ・ロング(1862)の英訳を Wikisource と Project Gutenberg で無料で読めます。下記のリンクをご覧ください。',
          },
          {
            q: 'Dialogos は自省録をどう引用しますか?',
            a: 'パブリックドメインの原典の思想を現代語に意訳し、著作権のある現代語訳をそのまま転載しません。出典の表記は思想が現れる巻・節を指します。',
          },
        ],
        pdIntro:
          '以下は著作権が切れたジョージ・ロング(George Long, 1862)の英訳です。日本語のパブリックドメイン全訳は限られているため、原文は英訳で案内します。',
        pdLinks: [
          {
            label: 'Wikisource — 自省録 全巻(ジョージ・ロング訳)',
            url: 'https://en.wikisource.org/wiki/The_Thoughts_of_the_Emperor_Marcus_Aurelius_Antoninus',
          },
          {
            label: 'Project Gutenberg — 自省録 ダウンロード',
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
        faq: [
          {
            q: 'What is Book 5 of the Meditations about?',
            a: 'A set of reflections Marcus wrote to himself, on rising at dawn to do the work of a human being (5.1) and on the calm of accepting what Universal Nature assigns (5.8).',
          },
          {
            q: 'Who was Marcus Aurelius?',
            a: 'A Roman emperor (reigned 161–180) and Stoic philosopher. The Meditations is a private journal he wrote to himself in Greek, never intended for publication.',
          },
          {
            q: 'Can I read the Meditations for free?',
            a: 'Yes. The public-domain George Long (1862) translation is free to read on Wikisource and Project Gutenberg. See the links below.',
          },
          {
            q: 'How does Dialogos cite the Meditations?',
            a: 'It paraphrases the ideas of the public-domain original into modern language and never reproduces an in-copyright translation. A citation marks the book and section where an idea appears.',
          },
        ],
        pdIntro:
          'The links below are the public-domain George Long (1862) translation, long out of copyright.',
        pdLinks: [
          {
            label: 'Wikisource — Meditations, complete (George Long)',
            url: 'https://en.wikisource.org/wiki/The_Thoughts_of_the_Emperor_Marcus_Aurelius_Antoninus',
          },
          {
            label: 'Project Gutenberg — Meditations, download',
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
