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

/** 한 언어(ko/ja/en)에 대한 출처 페이지 콘텐츠. */
export interface SourceContent {
  workName: string; // '명상록'
  mentorName: string; // '마르쿠스 아우렐리우스'
  lede: string; // meta description (≤155자 권장)
  intro: string; // 작품 소개 (HTML 조각 허용)
  context?: string; // [심화] 역사적 배경 1단락 (HTML) — ja는 일본 수용사 추가
  sections: SourceSection[]; // 권/편별 핵심
  quotes?: SourceQuote[]; // [심화] 핵심 구절·명언 3~6개 (검증된 절 강제)
  concepts?: SourceConcept[]; // [심화] 핵심 개념 용어풀이 3~5개
  apply?: string; // [심화] '오늘 어떻게 적용할까' 1~2단락 (HTML) — 시장별 각도
  provenance: string; // Dialogos가 출처를 다루는 방식 (HTML)
  faq: SourceFaq[]; // AEO — FAQPage 스키마 + 가시 FAQ (4→6~8 확장)
  pdIntro: string; // 퍼블릭 도메인 원문 안내문
  pdLinks: SourcePdLink[]; // 검증된 PD 외부 링크
  related?: SourceRelated[]; // [심화] 저작 간 교차참조 (선택)
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
                faq: [{"q": "명상록을 한 줄로 요약하면?", "a": "통제할 수 있는 것(내 판단과 행동)과 없는 것(외부 사건과 타인)을 구분하고, 이성에 따라 지금의 의무를 다하며, 무상을 받아들여 마음의 평정을 지키라는 자기 훈련의 기록입니다. 출판이 아니라 자신을 다스리려고 쓴 일기입니다."}, {"q": "명상록의 대표 명언은 무엇인가요?", "a": "'동틀 녘 일어나기 싫을 때, 나는 인간이 할 일을 하러 일어난다고 되뇌라'(5.1), '판단을 거두면 해도 사라진다'(4.7), '길 위의 걸림돌이 곧 그 길을 나아가게 한다'(5.20), '상실은 변화일 뿐이다'(9.35)가 가장 널리 인용됩니다."}, {"q": "명상록 제5권은 어떤 내용인가요?", "a": "마르쿠스가 자신에게 쓴 성찰로, 동틀 녘 인간의 의무를 위해 일어나라는 권고(5.1)와, 우주의 본성이 정한 바를 의사의 처방처럼 받아들이라는 평정(5.8), 그리고 장애물조차 행동의 재료로 바꾸라는 사상(5.20)을 담고 있습니다."}, {"q": "마르쿠스 아우렐리우스는 누구인가요?", "a": "로마 제국의 황제(재위 161–180)이자 후기 스토아 철학자입니다. 통치와 전쟁의 와중에 그리스어로 자신에게 일기를 썼고, 그 노트가 《명상록》으로 전해집니다. 출판을 의도하지 않았기에 솔직한 자기 점검의 어조가 특징입니다."}, {"q": "명상록은 어떤 순서로 읽으면 좋나요?", "a": "체계적 논문이 아니라 격언 모음이라 어느 권부터 펼쳐도 됩니다. 다만 제2·4·5권에 자주 인용되는 핵심 다짐(2.1, 4.3, 5.1)이 모여 있어 입문으로 적당합니다. 제1권은 스승들에 대한 감사 목록이라 배경을 알고 보면 더 깊게 읽힙니다."}, {"q": "명상록의 현대적 의의는 무엇인가요?", "a": "통제 가능한 것에 집중하라는 가르침은 오늘날 인지행동치료와 회복탄력성 훈련의 뿌리로 자주 언급됩니다. 번아웃·불안·완벽주의에 시달리는 사람에게, 사건이 아니라 해석을 다스리라는 4.7의 통찰이 실용적인 자기관리 도구로 읽힙니다."}, {"q": "명상록 원문을 무료로 읽을 수 있나요?", "a": "예. 저작권이 만료된 조지 롱(1862) 영역본을 Wikisource와 Project Gutenberg에서 무료로 읽을 수 있습니다. 아래 퍼블릭 도메인 링크를 참고하세요. 한국어 완역본은 퍼블릭 도메인이 제한적이라 영어 역본으로 안내합니다."}],
        context: "<p>《명상록》은 로마 황제 마르쿠스 아우렐리우스(121–180)가 게르만족과의 전선을 오가던 재위 후반(170년대 무렵)에 그리스어로, 오직 자신을 향해 쓴 사적인 노트입니다. 원제 <em>Τὰ εἰς ἑαυτόν</em>는 '자기 자신에게'라는 뜻으로, 출판이나 독자를 전혀 의도하지 않은 자기 점검의 기록입니다. 12권으로 전해지며 체계적 논문이 아니라 짧은 격언과 다짐이 모인 형식입니다. 제1권은 가족과 스승에게 빚진 것을 하나하나 적은 감사의 목록이고, 나머지는 의무·이성·무상·자기 통제를 거듭 되새깁니다.</p>",
        quotes: [{"text": "동틀 녘 일어나기 싫을 때, '나는 한 인간이 할 일을 하러 일어난다'고 스스로에게 일러두라.", "cite": "5.1", "gloss": "의무는 기분이 아니라 결심에서 나온다 — 번아웃의 아침에 침대에서 되뇔 한 문장."}, {"text": "가장 고요한 은둔처는 자기 자신의 마음이다. 사람들은 바닷가와 산을 찾지만, 너는 언제든 네 안으로 물러날 수 있다.", "cite": "4.3", "gloss": "휴식은 장소가 아니라 시선의 전환 — 도망칠 곳을 못 찾을 때 들어갈 진짜 방."}, {"text": "판단을 거두라. 그러면 '내가 해를 입었다'는 호소도 함께 사라진다.", "cite": "4.7", "gloss": "괴로움은 사건이 아니라 사건에 붙인 해석에서 온다 — 자기계발의 출발점."}, {"text": "마음을 가로막는 장애가 도리어 행동을 밀어준다. 길 위의 걸림돌이 곧 그 길을 나아가게 한다.", "cite": "5.20", "gloss": "막힘 자체를 다음 행동의 재료로 바꾸기 — 좌절을 동력으로 쓰는 스토아의 핵심."}, {"text": "상실은 변화일 뿐이다. 우주의 본성은 변화를 기뻐하며, 그 안에서 모든 일이 제대로 이루어진다.", "cite": "9.35", "gloss": "끝이 아니라 형태가 바뀐 것 — 무언가를 잃은 날에 붙드는 관점."}, {"text": "만 년을 살 사람처럼 굴지 말라. 죽음이 머리 위에 걸려 있으니, 살아 있고 할 수 있는 동안 선하라.", "cite": "4.17", "gloss": "무상은 미루기의 해독제 — '나중에'를 '지금'으로 바꾸는 압박."}],
        concepts: [{"term": "헤게모니콘 (지배 이성, hēgemonikon)", "def": "마음의 지휘부, 즉 판단하고 동의하는 이성의 핵심. 외부 사건이 아니라 이것이 평정과 동요를 결정한다."}, {"term": "통제의 구분 (what is up to us)", "def": "내 의지·판단·행동은 나에게 달렸고, 결과·평판·타인은 그렇지 않다. 스토아 평정은 이 경계를 지키는 데서 온다."}, {"term": "우주의 본성 (전체의 자연, Universal Nature)", "def": "만물을 질서 짓는 이성적 섭리. 일어나는 일은 전체에 합당하므로 받아들임이 곧 건강한 영혼이다."}, {"term": "무상 (흐름, impermanence)", "def": "모든 것은 변하고 사라진다. 명성도 기억도 곧 잊히니, 지금의 의무에 집중하는 근거가 된다."}],
        apply: "<p>오늘 한 가지만 해보세요. 아침에 눈을 떴는데 일어나기 싫다면, 5.1을 빌려 '나는 인간이 할 일을 하러 일어난다'고 한 문장으로 되뇌고 발을 바닥에 내려놓으세요. 동기를 기다리지 말고 동작을 먼저 만드는 겁니다.</p><p>일과 중 누군가에게 화가 치밀면 4.7을 적용하세요. '그가 나를 해쳤다'는 판단을 잠깐 거두고, 사실(무슨 일이 일어났나)과 해석(내가 거기 붙인 의미)을 분리해 적어 보면, 화의 절반은 사건이 아니라 내 해석이었음이 드러납니다. 좌절이 닥치면 5.20처럼 '이 막힘을 다음 행동의 재료로 어떻게 쓸까'를 한 줄 적어 두세요.</p>",
        related: [{"slug": "enchiridion", "label": "엥케이리디온 · 에픽테토스"}, {"slug": "letters-to-lucilius", "label": "루킬리우스에게 보내는 편지 · 세네카"}, {"slug": "discourses", "label": "담화록 · 에픽테토스"}],
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
                faq: [{"q": "自省録を一行で要約すると?", "a": "統制できるもの(自分の判断と行動)とできないもの(外の出来事と他人)を区別し、理性に従って今の務めを果たし、無常を受け入れて心の平静を保つ — そういう自己訓練の記録です。出版のためでなく、自らを律するために書いた日記です。"}, {"q": "自省録の代表的な名言は?", "a": "「夜明けに起きたくない時、私は人間の務めのために起きると言い聞かせよ」(5.1)、「判断を取り除けば害も消える」(4.7)、「道の上の障害がその道を行かせる」(5.20)、「失うことは変化に過ぎない」(9.35)が最もよく引用されます。"}, {"q": "自省録 第5巻はどんな内容ですか?", "a": "マルクスが自らに書いた省察で、夜明けに人間の務めのために起きよという勧め(5.1)と、宇宙の本性が定めたものを医師の処方のように受け入れる平静(5.8)、そして障害さえ行動の材料に変えよという思想(5.20)を含みます。"}, {"q": "マルクス・アウレリウスとは誰ですか?", "a": "ローマ帝国の皇帝(在位161–180)であり、後期ストア派の哲学者です。統治と戦争の合間にギリシア語で自らに日記を書き、その手記が『自省録』として伝わりました。出版を意図しなかったため、率直な自己点検の調子が特徴です。"}, {"q": "自省録はどんな順で読めばよいですか?", "a": "体系的な論文ではなく箴言集なので、どの巻から開いても構いません。ただし第2・4・5巻に核心の決意(2.1, 4.3, 5.1)が集まっており入門に向きます。第1巻は師への感謝の覚書で、背景を知って読むと一層深まります。"}, {"q": "自省録の現代的な意義は?", "a": "統制できるものに集中せよという教えは、今日の認知行動療法やレジリエンス訓練の源泉としてよく挙げられます。仕事の重圧や人間関係に疲れた人にとって、出来事ではなく解釈を整えよという4.7の洞察が、実用的なセルフケアの道具として読まれています。"}, {"q": "自省録の原文を無料で読めますか?", "a": "はい。著作権が切れたジョージ・ロング(1862)の英訳を Wikisource と Project Gutenberg で無料で読めます。下記のパブリックドメインのリンクをご覧ください。日本語のパブリックドメイン全訳は限られるため、原文は英訳で案内します。"}],
        context: "<p>『自省録』は、ローマ皇帝マルクス・アウレリウス(121–180)が、ゲルマン人との戦線を行き来した在位後半(170年代頃)に、ギリシア語で自分自身に向けて書いた私的な手記です。原題 <em>Τὰ εἰς ἑαυτόν</em> は「自分自身に」の意で、出版も読者も意図しない自己点検の記録です。全12巻として伝わり、体系的な論文ではなく短い箴言と決意の集まりという形をとります。第1巻は家族や師から受けた恩を一つずつ挙げる感謝の覚書です。日本では神谷美恵子の訳が岩波文庫として広く読まれています。</p>",
        quotes: [{"text": "夜明けに起きたくない時には、「私は一人の人間としての務めを果たすために起きるのだ」と自らに言い聞かせなさい。", "cite": "5.1", "gloss": "務めは気分ではなく決意から始まる — 出社前、布団の中で唱える一文。"}, {"text": "最も静かな隠れ家は、自分自身の心である。人は海辺や山を求めるが、君はいつでも自分の内へ退くことができる。", "cite": "4.3", "gloss": "休息は場所ではなく視点の切り替え — 職場で逃げ場がない時に入れる本当の部屋。"}, {"text": "判断を取り除きなさい。そうすれば「害された」という訴えもまた消える。", "cite": "4.7", "gloss": "苦しみは出来事ではなく、それに付けた解釈から生まれる — 人間関係の摩擦をほどく起点。"}, {"text": "心を妨げるものが、かえって行動を前へ進める。道の上の障害が、その道を行かせるのだ。", "cite": "5.20", "gloss": "詰まりそのものを次の一手の材料に変える — 理不尽な仕事に向き合う時の核。"}, {"text": "失うことは変化に過ぎない。宇宙の本性は変化を喜び、それに従ってすべてが正しく行われる。", "cite": "9.35", "gloss": "終わりではなく形が変わっただけ — 異動・別れの日に手放さない視点。"}, {"text": "君がこの世の務めを果たせるのは、いまだけだ。一万年生きる者のように振る舞わず、できるうちに善くあれ。", "cite": "4.17", "gloss": "無常は先延ばしの解毒剤 — 「後で」を「今」に変える静かな圧力。"}],
        concepts: [{"term": "ヘゲモニコン (指導理性, hēgemonikon)", "def": "心の中枢、すなわち判断し同意する理性の核。平静と動揺を決めるのは外の出来事ではなくこれである。"}, {"term": "統制の区別 (我々次第なもの)", "def": "判断・意志・行動は自分次第だが、結果・評判・他人はそうではない。ストアの平静はこの境界を守ることから生まれる。"}, {"term": "宇宙の本性 (全体の自然, Universal Nature)", "def": "万物を秩序づける理性的な摂理。起こることは全体にとって適切であり、それを受け入れることが健やかな魂である。"}, {"term": "無常 (流転, impermanence)", "def": "すべては変わり、消えていく。名声も記憶もやがて忘れられるからこそ、今の務めに集中する根拠となる。"}],
        apply: "<p>今日、一つだけ試してください。朝、目は覚めたのに起きたくない時は、5.1を借りて「私は人間としての務めのために起きる」と一文だけ唱え、足を床に下ろします。やる気を待たず、動作を先につくるのです。</p><p>職場で誰かに苛立ったら、4.7を使ってみてください。「あの人が私を害した」という判断を一度脇に置き、事実(何が起きたか)と解釈(自分がそこに付けた意味)を分けて書き出すと、怒りの半分は出来事ではなく自分の解釈だったと見えてきます。理不尽な状況に詰まったら、5.20のように「この妨げを次の一手の材料にどう使うか」を一行メモしておきましょう。</p>",
        related: [{"slug": "enchiridion", "label": "エンケイリディオン · エピクテトス"}, {"slug": "letters-to-lucilius", "label": "ルキリウスへの手紙 · セネカ"}, {"slug": "discourses", "label": "語録 · エピクテトス"}],
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
                faq: [{"q": "What is the Meditations about, in one line?", "a": "Distinguish what you can control (your judgements and actions) from what you cannot (events and other people), do the present duty by reason, and accept impermanence to keep your mind calm. It is a record of self-training — a diary written to govern himself, not for publication."}, {"q": "What are the most famous quotes from the Meditations?", "a": "\"When you rise unwillingly at dawn, tell yourself you rise to do the work of a human being\" (5.1), \"remove the judgement and the harm is gone\" (4.7), \"the obstacle on the road becomes the road\" (5.20), and \"loss is nothing but change\" (9.35) are the most widely cited."}, {"q": "What is Book 5 of the Meditations about?", "a": "Reflections Marcus wrote to himself: the call to rise at dawn to do the work of a human being (5.1), the calm of accepting what Universal Nature assigns as a physician prescribes a remedy (5.8), and the idea that even obstacles can be turned into material for action (5.20)."}, {"q": "Who was Marcus Aurelius?", "a": "A Roman emperor (reigned 161–180) and late Stoic philosopher. Amid ruling and waging war he kept a journal to himself in Greek, and those notes survive as the Meditations. Because he never meant to publish, the tone is candid, unguarded self-examination."}, {"q": "In what order should I read the Meditations?", "a": "It is a collection of maxims rather than a systematic treatise, so you can open almost any book. Books 2, 4, and 5 gather the most-quoted core reminders (2.1, 4.3, 5.1) and make a good entry point. Book 1, a list of debts to his teachers, reads richer once you know the background."}, {"q": "Why does the Meditations still matter today?", "a": "Its emphasis on focusing only on what you can control is often cited as a root of modern cognitive behavioral therapy and resilience training. For anyone facing burnout, anxiety, or perfectionism, the insight of 4.7 — govern the interpretation, not the event — reads as a practical tool for self-management."}, {"q": "Can I read the Meditations for free?", "a": "Yes. The public-domain George Long (1862) English translation is free to read on Wikisource and Project Gutenberg. See the public-domain links below. The full text is offered in English because public-domain complete translations in other languages are limited."}],
        context: "<p>The <em>Meditations</em> is a private notebook the Roman emperor Marcus Aurelius (121–180) wrote in Greek, to himself alone, mostly in the later years of his reign (around the 170s) while campaigning on the German frontier. Its title <em>Τὰ εἰς ἑαυτόν</em> means \"to himself\" — it was never meant for publication or any reader. It survives in twelve books and is not a systematic treatise but a collection of short maxims and self-reminders. Book 1 is a catalogue of debts of gratitude to family and teachers; the rest circle back, again and again, to duty, reason, impermanence, and self-command.</p>",
        quotes: [{"text": "When you rise unwillingly at dawn, tell yourself: I am rising to do the work of a human being.", "cite": "5.1", "gloss": "Duty starts in the decision, not the mood — a single line to repeat in bed on a hard morning."}, {"text": "The quietest retreat is your own mind. People seek the sea and the mountains, but you can withdraw into yourself at any hour.", "cite": "4.3", "gloss": "Rest is a shift of attention, not a location — the real room you can enter with nowhere to escape."}, {"text": "Take away the judgement, and the complaint \"I have been harmed\" is taken away with it.", "cite": "4.7", "gloss": "Suffering comes from the interpretation you add, not the event itself — the starting point of modern stress work."}, {"text": "What stands in the way of action advances action. The obstacle on the road becomes the road.", "cite": "5.20", "gloss": "Turn the blockage itself into raw material for the next move — the core of turning setbacks into fuel."}, {"text": "Loss is nothing but change, and Universal Nature delights in change; in obedience to it all things are done well.", "cite": "9.35", "gloss": "Not an ending but a change of form — a frame to hold on the day you lose something."}, {"text": "Do not act as if you had ten thousand years to live. Death hangs over you; while you live, while you can, be good.", "cite": "4.17", "gloss": "Impermanence as an antidote to procrastination — quiet pressure that turns \"later\" into \"now.\""}],
        concepts: [{"term": "hēgemonikon (the ruling faculty)", "def": "The command center of the mind — the reasoning part that judges and assents. It, not external events, decides your calm or your turmoil."}, {"term": "what is up to us (the dichotomy of control)", "def": "Your judgements, will, and actions are yours; outcomes, reputation, and other people are not. Stoic calm comes from guarding this boundary."}, {"term": "Universal Nature", "def": "The rational providence that orders all things. Whatever happens is fitting for the whole, so accepting it is the health of the soul."}, {"term": "impermanence (flux)", "def": "Everything changes and passes; fame and memory are soon forgotten. This is precisely why the present duty deserves your full attention."}],
        apply: "<p>Try just one thing today. When you wake and don't want to get up, borrow 5.1: say the single line \"I am rising to do the work of a human being,\" and put your feet on the floor. Don't wait for motivation — build the motion first.</p><p>When someone irritates you during the day, apply 4.7. Set aside the judgement \"that person harmed me\" for a moment and write the fact (what happened) separately from the interpretation (the meaning you attached). Often half the anger turns out to live in the interpretation, not the event. When you hit a wall, do as 5.20 suggests and jot one line: how can I make this very obstacle the material for my next move?</p>",
        related: [{"slug": "enchiridion", "label": "The Enchiridion · Epictetus"}, {"slug": "letters-to-lucilius", "label": "Letters to Lucilius · Seneca"}, {"slug": "discourses", "label": "Discourses · Epictetus"}],
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
