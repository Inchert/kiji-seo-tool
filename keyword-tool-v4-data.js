// ========== KCI SEOキーワード分析ツール v4 - データファイル ==========

// ========== グローバル変数 ==========
let keywords = [];
let clusters = [];
let selectedClusterIndex = null;

// ========== サイトリファレンス設定 ==========
// ★★★ サイト変更時はこのセクションを更新してください ★★★
const SITE_REFERENCE = {
    // 基本設定（URLを変更する場合はここを編集）
    baseUrl: 'https://kensetsu-mikata.jp',
    lastUpdated: '2026-01-14',

    // サイト構造（URLパスを変更する場合はここを編集）
    paths: {
        top: '/',
        about: '/about/',
        course: '/course/',
        courseInfo: '/course-information/',
        application: '/application/',
        company: '/company/',
        elearning: '/course-information/e-learning/',
        shokucho: '/course/shokucho/',
        store: 'https://store.kensetsu-mikata.jp/' // 外部ドメイン
    },

    // URLビルダー関数
    getUrl(path) {
        if (path.startsWith('http')) return path;
        return this.baseUrl + (this.paths[path] || path);
    }
};

// ========== ビッグキーワード候補データ ==========
// 各教育テーマに対して、ラッコキーワードで検索すべきキーワードバリエーション
// icon: Material Symbols Outlined のアイコン名
const BIG_KEYWORD_VARIATIONS = {
    '職長': {
        name: '職長・安全衛生責任者教育',
        icon: 'engineering',
        estimatedVolume: 15000,
        priority: 'high',
        keywords: [
            { keyword: '職長教育', volume: 8000, note: '最重要・検索ボリューム最大' },
            { keyword: '職長安全衛生責任者教育', volume: 2000, note: '正式名称' },
            { keyword: '安全衛生責任者', volume: 1500, note: '責任者視点の検索' },
            { keyword: '職長 資格', volume: 1200, note: '資格取得意図' },
            { keyword: '職長 講習', volume: 1000, note: '講習受講意図' },
            { keyword: '職長教育 オンライン', volume: 1500, note: 'オンライン受講意図（CV高）' },
            { keyword: '職長 再教育', volume: 800, note: '5年更新の検索' }
        ]
    },
    'フルハーネス': {
        name: 'フルハーネス型墜落制止用器具特別教育',
        icon: 'safety_check',
        estimatedVolume: 12000,
        priority: 'high',
        keywords: [
            { keyword: 'フルハーネス 特別教育', volume: 5000, note: '最重要' },
            { keyword: 'フルハーネス 講習', volume: 3000, note: '講習受講意図' },
            { keyword: '墜落制止用器具', volume: 1500, note: '正式名称系' },
            { keyword: 'フルハーネス 義務化', volume: 600, note: '法改正関連' },
            { keyword: 'フルハーネス 資格', volume: 800, note: '資格取得意図' },
            { keyword: 'フルハーネス 特別教育 オンライン', volume: 1200, note: 'オンライン受講意図（CV高）' }
        ]
    },
    '足場': {
        name: '足場の組立て等特別教育',
        icon: 'construction',
        estimatedVolume: 8000,
        priority: 'high',
        keywords: [
            { keyword: '足場 特別教育', volume: 3500, note: '最重要' },
            { keyword: '足場の組立て等特別教育', volume: 2000, note: '正式名称' },
            { keyword: '足場 資格', volume: 1200, note: '資格取得意図' },
            { keyword: '足場 講習', volume: 800, note: '講習受講意図' },
            { keyword: '足場 特別教育 オンライン', volume: 800, note: 'オンライン受講意図（CV高）' }
        ]
    },
    '酸欠': {
        name: '酸素欠乏・硫化水素危険作業特別教育',
        icon: 'warning',
        estimatedVolume: 6000,
        priority: 'mid',
        keywords: [
            { keyword: '酸欠 特別教育', volume: 2500, note: '略称・最重要' },
            { keyword: '酸素欠乏 特別教育', volume: 1500, note: '正式名称系' },
            { keyword: '酸素欠乏危険作業', volume: 1000, note: '作業名での検索' },
            { keyword: '硫化水素 特別教育', volume: 500, note: '硫化水素視点' },
            { keyword: '酸欠 講習', volume: 600, note: '講習受講意図' },
            { keyword: '酸欠 特別教育 オンライン', volume: 500, note: 'オンライン受講意図（CV高）' }
        ]
    },
    '低圧電気': {
        name: '低圧電気取扱特別教育',
        icon: 'bolt',
        estimatedVolume: 5000,
        priority: 'mid',
        keywords: [
            { keyword: '低圧電気 特別教育', volume: 2000, note: '最重要' },
            { keyword: '低圧電気取扱業務特別教育', volume: 1500, note: '正式名称' },
            { keyword: '低圧電気 講習', volume: 600, note: '講習受講意図' },
            { keyword: '電気工事 資格', volume: 800, note: '資格系（関連）' },
            { keyword: '低圧電気 特別教育 オンライン', volume: 400, note: 'オンライン受講意図（CV高）' }
        ]
    },
    '粉じん': {
        name: '粉じん作業特別教育',
        icon: 'air',
        estimatedVolume: 4000,
        priority: 'mid',
        keywords: [
            { keyword: '粉じん 特別教育', volume: 1500, note: '最重要' },
            { keyword: '粉塵 特別教育', volume: 800, note: '漢字表記' },
            { keyword: '粉じん作業特別教育', volume: 1000, note: '正式名称' },
            { keyword: '粉じん 講習', volume: 400, note: '講習受講意図' },
            { keyword: '粉じん 特別教育 オンライン', volume: 300, note: 'オンライン受講意図（CV高）' }
        ]
    },
    '石綿': {
        name: '石綿取扱い作業従事者特別教育',
        icon: 'domain',
        estimatedVolume: 3500,
        priority: 'mid',
        keywords: [
            { keyword: '石綿 特別教育', volume: 1200, note: '最重要' },
            { keyword: 'アスベスト 特別教育', volume: 800, note: 'カタカナ表記' },
            { keyword: '石綿取扱い作業従事者特別教育', volume: 600, note: '正式名称' },
            { keyword: 'アスベスト 講習', volume: 500, note: '講習受講意図' },
            { keyword: '石綿 資格', volume: 400, note: '資格取得意図' }
        ]
    },
    '高所作業車': {
        name: '高所作業車運転特別教育',
        icon: 'local_shipping',
        estimatedVolume: 5000,
        priority: 'mid',
        keywords: [
            { keyword: '高所作業車 特別教育', volume: 1800, note: '最重要' },
            { keyword: '高所作業車 技能講習', volume: 1500, note: '技能講習との混同' },
            { keyword: '高所作業車 資格', volume: 1200, note: '資格取得意図' },
            { keyword: '高所作業車 免許', volume: 500, note: '免許系検索' }
        ]
    },
    '玉掛け': {
        name: '玉掛け技能講習',
        icon: 'fitness_center',
        estimatedVolume: 8000,
        priority: 'high',
        keywords: [
            { keyword: '玉掛け 技能講習', volume: 4000, note: '最重要' },
            { keyword: '玉掛け 資格', volume: 2500, note: '資格取得意図' },
            { keyword: '玉掛け 講習', volume: 2000, note: '講習受講意図' },
            { keyword: '玉掛け 免許', volume: 800, note: '免許系検索' },
            { keyword: '玉掛け 料金', volume: 500, note: '料金検索（CV高）' }
        ]
    },
    'フォークリフト': {
        name: 'フォークリフト運転技能講習',
        icon: 'forklift',
        estimatedVolume: 12000,
        priority: 'high',
        keywords: [
            { keyword: 'フォークリフト 免許', volume: 6000, note: '最重要' },
            { keyword: 'フォークリフト 講習', volume: 3500, note: '講習受講意図' },
            { keyword: 'フォークリフト 技能講習', volume: 2500, note: '正式名称系' },
            { keyword: 'フォークリフト 資格', volume: 2000, note: '資格取得意図' },
            { keyword: 'フォークリフト 料金', volume: 800, note: '料金検索（CV高）' }
        ]
    },
    'クレーン': {
        name: 'クレーン運転特別教育',
        icon: 'precision_manufacturing',
        estimatedVolume: 6000,
        priority: 'mid',
        keywords: [
            { keyword: 'クレーン 免許', volume: 3000, note: '最重要' },
            { keyword: 'クレーン 特別教育', volume: 1500, note: '特別教育系' },
            { keyword: '小型移動式クレーン', volume: 2000, note: '種類別検索' },
            { keyword: 'クレーン 資格', volume: 1500, note: '資格取得意図' }
        ]
    },
    'アーク溶接': {
        name: 'アーク溶接等作業特別教育',
        icon: 'local_fire_department',
        estimatedVolume: 4000,
        priority: 'mid',
        keywords: [
            { keyword: 'アーク溶接 特別教育', volume: 1500, note: '最重要' },
            { keyword: '溶接 資格', volume: 1500, note: '資格取得意図' },
            { keyword: 'アーク溶接 講習', volume: 800, note: '講習受講意図' },
            { keyword: '溶接 免許', volume: 600, note: '免許系検索' }
        ]
    },
    '小型車両系': {
        name: '小型車両系建設機械運転特別教育',
        icon: 'agriculture',
        estimatedVolume: 4000,
        priority: 'mid',
        keywords: [
            { keyword: '小型車両系建設機械 特別教育', volume: 1500, note: '正式名称' },
            { keyword: 'ユンボ 免許', volume: 1500, note: '通称での検索' },
            { keyword: 'バックホー 資格', volume: 800, note: '機種名検索' },
            { keyword: '重機 免許', volume: 1000, note: '一般名称' }
        ]
    },
    '丸のこ': {
        name: '丸のこ等取扱作業従事者教育',
        icon: 'carpenter',
        estimatedVolume: 2000,
        priority: 'low',
        keywords: [
            { keyword: '丸のこ 特別教育', volume: 800, note: '最重要' },
            { keyword: '丸のこ 講習', volume: 600, note: '講習受講意図' },
            { keyword: '丸鋸 資格', volume: 400, note: '漢字表記' }
        ]
    },
    '研削砥石': {
        name: '研削砥石取替試運転業務特別教育',
        icon: 'settings',
        estimatedVolume: 1500,
        priority: 'low',
        keywords: [
            { keyword: '研削砥石 特別教育', volume: 600, note: '最重要' },
            { keyword: 'グラインダー 資格', volume: 500, note: '通称での検索' },
            { keyword: '砥石 交換 資格', volume: 400, note: '作業内容での検索' }
        ]
    },
    '刈払機': {
        name: '刈払機取扱作業者安全衛生教育',
        icon: 'grass',
        estimatedVolume: 2000,
        priority: 'low',
        keywords: [
            { keyword: '刈払機 講習', volume: 800, note: '最重要' },
            { keyword: '草刈機 資格', volume: 600, note: '通称での検索' },
            { keyword: '刈払機 安全衛生教育', volume: 400, note: '正式名称' }
        ]
    },
    '振動工具': {
        name: '振動工具取扱作業者安全衛生教育',
        icon: 'vibration',
        estimatedVolume: 1000,
        priority: 'low',
        keywords: [
            { keyword: '振動工具 特別教育', volume: 400, note: '最重要' },
            { keyword: '振動工具 講習', volume: 300, note: '講習受講意図' },
            { keyword: 'チェーンソー 資格', volume: 300, note: '具体的工具名' }
        ]
    },
    'ロープ高所': {
        name: 'ロープ高所作業特別教育',
        icon: 'hiking',
        estimatedVolume: 1500,
        priority: 'low',
        keywords: [
            { keyword: 'ロープ高所作業 特別教育', volume: 600, note: '最重要' },
            { keyword: 'ロープアクセス 資格', volume: 500, note: '通称での検索' },
            { keyword: 'ブランコ作業 資格', volume: 400, note: '別名での検索' }
        ]
    },
    'ゴンドラ': {
        name: 'ゴンドラ取扱特別教育',
        icon: 'window',
        estimatedVolume: 1000,
        priority: 'low',
        keywords: [
            { keyword: 'ゴンドラ 特別教育', volume: 500, note: '最重要' },
            { keyword: 'ゴンドラ 資格', volume: 300, note: '資格取得意図' },
            { keyword: 'ゴンドラ 講習', volume: 200, note: '講習受講意図' }
        ]
    },
    '巻上げ機': {
        name: '巻上げ機運転特別教育',
        icon: 'sync',
        estimatedVolume: 1000,
        priority: 'low',
        keywords: [
            { keyword: '巻上げ機 特別教育', volume: 400, note: '最重要' },
            { keyword: 'ウインチ 資格', volume: 400, note: '通称での検索' },
            { keyword: '巻上げ機 講習', volume: 200, note: '講習受講意図' }
        ]
    }
};

// ========== KCI教育センター サイト情報 ==========
// （SITE_REFERENCEから自動生成）
const kciSiteInfo = {
    // 基本情報
    name: 'KCI教育センター',
    domain: new URL(SITE_REFERENCE.baseUrl).hostname,
    tagline: '建設業・製造業向け労働安全衛生教育',

    // 運営会社情報
    company: {
        name: '株式会社manebi',
        address: '〒971-8124 福島県いわき市小名浜住吉折返2-2-3',
        phone: '0120-919-749',
        fax: '0246-85-0039',
        businessHours: '平日 8:00-12:00 / 13:00-17:00'
    },

    // 実績
    achievements: {
        courses: 29,           // 科目数
        companies: 1000,       // 実施企業数
        participants: 10000    // 延べ受講者数
    },

    // サービス特徴
    features: [
        'オンライン講座・DVD講座対応',
        'eラーニング講習',
        'ZOOM講習対応',
        '一般講座・出張講習',
        '最短1日で修了証発行',
        '申込みから修了証発行まで3日程度',
        'カード型修了証（耐久性あり）',
        '全国対応'
    ],

    // ページURL（SITE_REFERENCEから生成）
    pages: {
        get top() { return SITE_REFERENCE.getUrl('top'); },
        get about() { return SITE_REFERENCE.getUrl('about'); },
        get course() { return SITE_REFERENCE.getUrl('course'); },
        get courseInfo() { return SITE_REFERENCE.getUrl('courseInfo'); },
        get application() { return SITE_REFERENCE.getUrl('application'); },
        get company() { return SITE_REFERENCE.getUrl('company'); },
        get elearning() { return SITE_REFERENCE.getUrl('elearning'); },
        get shokucho() { return SITE_REFERENCE.getUrl('shokucho'); },
        get store() { return SITE_REFERENCE.getUrl('store'); }
    },

    // コースカテゴリ
    courseCategories: {
        construction: {
            name: '建設業向け',
            courses: [
                '職長・安全衛生責任者教育',
                '能力向上教育（再教育）',
                '特別教育（29科目）'
            ]
        },
        manufacturing: {
            name: '製造業向け',
            courses: [
                '職長教育一般'
            ]
        }
    },

    // 受講方法
    learningMethods: [
        { id: 'online', name: 'オンライン講座', description: 'パソコン等で時間・場所を選ばず受講' },
        { id: 'dvd', name: 'DVD講座', description: 'DVD教材での受講' },
        { id: 'elearning', name: 'eラーニング', description: '顔認証付きeラーニングシステム' },
        { id: 'zoom', name: 'ZOOM講習', description: 'リアルタイムのオンライン講習' },
        { id: 'offline', name: '一般講座', description: '対面での講習' },
        { id: 'visit', name: '出張講習', description: '企業への出張講習' }
    ],

    // コース詳細（特別教育29科目）
    courses: {
        // === 建設業向け基本講座 ===
        '職長': {
            fullName: '職長・安全衛生責任者教育',
            category: 'basic',
            page: SITE_REFERENCE.getUrl('shokucho'),
            online: true, elearning: true, zoom: true, dvd: true,
            hours: 14,
            description: '建設現場で労働者を指揮する職長向けの教育'
        },
        '能力向上': {
            fullName: '能力向上教育（再教育）',
            category: 'basic',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: true, dvd: true,
            hours: 6,
            description: '修了後概ね5年経過した職長・安全衛生責任者対象の再教育'
        },
        // === 特別教育（主要科目） ===
        'フルハーネス': {
            fullName: 'フルハーネス型墜落制止用器具特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 6,
            practicalHours: 1.5,
            description: '高さ2m以上でフルハーネス型を使用して作業する者向け'
        },
        '足場': {
            fullName: '足場の組立て等特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 6,
            description: '足場の組立て・解体・変更作業に従事する者向け'
        },
        '酸欠': {
            fullName: '酸素欠乏・硫化水素危険作業特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 5.5,
            description: '酸素欠乏危険場所で作業に従事する者向け'
        },
        '低圧電気': {
            fullName: '低圧電気取扱特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 14,
            practicalHours: 7,
            description: '低圧電路の敷設・修理、配電盤の操作業務に従事する者向け'
        },
        '粉じん': {
            fullName: '粉じん作業特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 4.5,
            description: '特定粉じん作業に従事する者向け'
        },
        '石綿': {
            fullName: '石綿取扱い作業従事者特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 4.5,
            description: '石綿（アスベスト）取扱い作業に従事する者向け'
        },
        '高所作業車': {
            fullName: '高所作業車運転特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 9,
            practicalHours: 3,
            description: '作業床高さ10m未満の高所作業車の運転業務に従事する者向け'
        },
        '小型車両系': {
            fullName: '小型車両系建設機械運転特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 13,
            practicalHours: 6,
            description: '機体質量3t未満の小型車両系建設機械の運転業務に従事する者向け'
        },
        'アーク溶接': {
            fullName: 'アーク溶接等作業特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 21,
            practicalHours: 10,
            description: 'アーク溶接作業に従事する者向け'
        },
        '丸のこ': {
            fullName: '丸のこ等取扱作業従事者教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 4,
            description: '丸のこ等を使用する作業に従事する者向け'
        },
        '玉掛け補助': {
            fullName: '玉掛け補助作業特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 3,
            description: 'つり上げ荷重1t未満の玉掛け補助作業に従事する者向け'
        },
        '研削砥石': {
            fullName: '研削砥石取替試運転業務特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 6,
            practicalHours: 2,
            description: '研削砥石の取替え・試運転業務に従事する者向け'
        },
        '振動工具': {
            fullName: '振動工具取扱作業者安全衛生教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 4,
            description: '振動工具を使用する作業に従事する者向け'
        },
        '刈払機': {
            fullName: '刈払機取扱作業者安全衛生教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 6,
            description: '刈払機を使用する作業に従事する者向け'
        },
        'ロープ高所': {
            fullName: 'ロープ高所作業特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 7,
            practicalHours: 4,
            description: 'ロープを使用した高所作業に従事する者向け'
        },
        '巻上げ機': {
            fullName: '巻上げ機運転特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 10,
            practicalHours: 4,
            description: '巻上げ機の運転業務に従事する者向け'
        },
        'クレーン': {
            fullName: 'クレーン運転特別教育（5t未満）',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 13,
            practicalHours: 4,
            description: 'つり上げ荷重5t未満のクレーンの運転業務に従事する者向け'
        },
        'ゴンドラ': {
            fullName: 'ゴンドラ取扱特別教育',
            category: 'special',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: false, dvd: true,
            hours: 6,
            practicalHours: 3,
            description: 'ゴンドラの操作業務に従事する者向け'
        },
        // === 製造業向け ===
        '職長一般': {
            fullName: '職長教育一般（製造業等）',
            category: 'manufacturing',
            page: SITE_REFERENCE.getUrl('course'),
            online: true, elearning: true, zoom: true, dvd: true,
            hours: 12,
            description: '製造業、電気業、ガス業、自動車整備業、食料品製造業等向け'
        }
    }
};

// ========== 一次情報データベース ==========
const primarySources = {
    '職長': [
        { title: '厚生労働省 - 職長等に対する安全衛生教育', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/anzeneisei02.html' },
        { title: 'e-Gov - 労働安全衛生法第60条', url: 'https://elaws.e-gov.go.jp/document?lawid=347AC0000000057#Mp-At_60' }
    ],
    'フルハーネス': [
        { title: '厚生労働省 - 墜落制止用器具の安全な使用に関するガイドライン', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000184407.html' }
    ],
    '足場': [
        { title: '厚生労働省 - 足場からの墜落防止措置', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000187309.html' }
    ],
    '酸欠': [
        { title: '厚生労働省 - 酸素欠乏症等の防止', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/anzeneisei10.html' }
    ],
    '酸素欠乏': [
        { title: '厚生労働省 - 酸素欠乏症等の防止', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/anzeneisei10.html' }
    ],
    '粉じん': [
        { title: '厚生労働省 - 粉じん障害防止対策', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/anzeneisei05.html' }
    ],
    '低圧電気': [
        { title: '厚生労働省 - 電気災害の防止', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/anzeneisei17.html' }
    ],
    '石綿': [
        { title: '厚生労働省 - 石綿（アスベスト）情報', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/sekimen/index.html' }
    ],
    'アスベスト': [
        { title: '厚生労働省 - 石綿（アスベスト）情報', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/sekimen/index.html' }
    ],
    '玉掛け': [
        { title: '厚生労働省 - クレーン等安全規則', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/anzeneisei15.html' }
    ],
    'クレーン': [
        { title: '厚生労働省 - クレーン等安全規則', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/anzeneisei15.html' }
    ],
    'フォークリフト': [
        { title: '厚生労働省 - フォークリフトの安全', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/anzeneisei14.html' }
    ],
    '特別教育': [
        { title: '厚生労働省 - 特別教育一覧', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/anzeneisei36/index.html' }
    ],
    '技能講習': [
        { title: '厚生労働省 - 技能講習一覧', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/anzeneisei36/index.html' }
    ],
    '安全衛生教育': [
        { title: '厚生労働省 - 安全衛生教育', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/anzeneisei02.html' }
    ]
};

// ========== 推定検索ボリュームデータ ==========
const estimatedVolumes = {
    '職長教育': 8000,
    '職長教育 オンライン': 1500,
    '職長教育とは': 1200,
    '職長教育 web': 800,
    '職長教育 料金': 600,
    '職長教育 費用': 500,
    '職長 安全衛生責任者': 2000,
    '職長 安全衛生責任者教育': 1500,
    '職長教育 再教育': 400,
    '職長教育 5年': 300,
    '職長教育 内容': 400,
    '職長教育 カリキュラム': 200,
    '職長教育 時間': 300,
    '職長教育 対象者': 250,
    '職長教育 義務': 350,
    '職長教育 申し込み': 200,
    'フルハーネス 特別教育': 5000,
    'フルハーネス 講習': 3000,
    'フルハーネス 特別教育 オンライン': 1200,
    'フルハーネス 特別教育 web': 600,
    'フルハーネス 特別教育とは': 800,
    'フルハーネス 特別教育 料金': 400,
    'フルハーネス 特別教育 費用': 350,
    'フルハーネス 特別教育 時間': 300,
    'フルハーネス 特別教育 内容': 250,
    'フルハーネス 義務化': 600,
    '足場 特別教育': 3500,
    '足場の組立て等特別教育': 2000,
    '足場 特別教育 オンライン': 800,
    '足場 特別教育 web': 400,
    '足場 特別教育 料金': 300,
    '足場 特別教育とは': 500,
    '酸欠 特別教育': 2500,
    '酸素欠乏 特別教育': 1500,
    '酸素欠乏危険作業': 1000,
    '酸欠 特別教育 オンライン': 500,
    '酸欠 特別教育 料金': 250,
    '粉じん 特別教育': 1500,
    '粉塵 特別教育': 800,
    '粉じん作業特別教育': 1000,
    '粉じん 特別教育 オンライン': 300,
    '低圧電気 特別教育': 2000,
    '低圧電気取扱業務特別教育': 1500,
    '低圧電気 特別教育 オンライン': 400,
    '低圧電気 特別教育 料金': 200,
    '石綿 特別教育': 1200,
    'アスベスト 特別教育': 800,
    '石綿取扱い作業従事者特別教育': 600,
    '玉掛け 技能講習': 4000,
    '玉掛け 資格': 2500,
    '玉掛け 講習': 2000,
    '玉掛け 料金': 500,
    'フォークリフト 免許': 6000,
    'フォークリフト 講習': 3500,
    'フォークリフト 技能講習': 2500,
    'フォークリフト 料金': 800,
    '高所作業車 特別教育': 1800,
    '高所作業車 技能講習': 1500,
    '高所作業車 資格': 1200,
    'クレーン 免許': 3000,
    'クレーン 特別教育': 1500,
    '小型移動式クレーン': 2000,
    '特別教育': 8000,
    '特別教育 一覧': 2000,
    '技能講習': 5000,
    '技能講習 一覧': 1500,
    '安全衛生教育': 3000,
    '雇入れ時教育': 1500
};

// ========== 教育種別マスターデータ ==========
const educationMasterData = {
    '職長': {
        name: '職長・安全衛生責任者教育',
        law: '労働安全衛生法第60条',
        lawUrl: 'https://elaws.e-gov.go.jp/document?lawid=347AC0000000057#Mp-At_60',
        totalHours: 14,
        curriculum: [
            { subject: '作業方法の決定及び労働者の配置', hours: 2 },
            { subject: '労働者に対する指導又は監督の方法', hours: 2.5 },
            { subject: '危険性又は有害性等の調査等', hours: 4 },
            { subject: '異常時等における措置', hours: 1.5 },
            { subject: 'その他現場監督者として行うべき労働災害防止活動', hours: 2 },
            { subject: '安全衛生責任者の職務等', hours: 2 }
        ],
        priceRange: { online: { min: 8000, max: 12000 }, offline: { min: 12000, max: 18000 } },
        validityPeriod: 'なし（法的義務なし）',
        recommendedRefresh: '5年ごとに能力向上教育',
        targetPerson: '新たに職長（作業中の労働者を直接指導・監督する者）に就く者',
        industries: '建設業、製造業、電気業、ガス業、自動車整備業、機械修理業',
        penalty: '6ヶ月以下の懲役または50万円以下の罰金（労安法第119条）',
        onlineAvailable: true,
        practicalRequired: false
    },
    'フルハーネス': {
        name: 'フルハーネス型墜落制止用器具特別教育',
        law: '労働安全衛生規則第36条第41号',
        lawUrl: 'https://elaws.e-gov.go.jp/document?lawid=347M50002000032#Mp-At_36',
        totalHours: 6,
        curriculum: [
            { subject: '作業に関する知識', hours: 1 },
            { subject: 'フルハーネス型墜落制止用器具に関する知識', hours: 2 },
            { subject: '労働災害の防止に関する知識', hours: 1 },
            { subject: '関係法令', hours: 0.5 },
            { subject: '墜落制止用器具の使用方法等（実技）', hours: 1.5 }
        ],
        priceRange: { online: { min: 6000, max: 9000 }, offline: { min: 8000, max: 12000 } },
        validityPeriod: 'なし（法的義務なし）',
        recommendedRefresh: '特になし',
        targetPerson: '高さ2m以上でフルハーネス型を使用して作業する者',
        industries: '建設業全般、設備工事業、電気工事業',
        penalty: '6ヶ月以下の懲役または50万円以下の罰金',
        onlineAvailable: true,
        practicalRequired: true,
        practicalNote: '実技1.5時間は対面必須（一部講座は実技のみ別日程）'
    },
    '足場': {
        name: '足場の組立て等特別教育',
        law: '労働安全衛生規則第36条第39号',
        lawUrl: 'https://elaws.e-gov.go.jp/document?lawid=347M50002000032#Mp-At_36',
        totalHours: 6,
        curriculum: [
            { subject: '足場及び作業の方法に関する知識', hours: 3 },
            { subject: '工事用設備、機械、器具、作業環境等に関する知識', hours: 0.5 },
            { subject: '労働災害の防止に関する知識', hours: 1.5 },
            { subject: '関係法令', hours: 1 }
        ],
        priceRange: { online: { min: 6000, max: 9000 }, offline: { min: 8000, max: 12000 } },
        validityPeriod: 'なし（法的義務なし）',
        recommendedRefresh: '特になし',
        targetPerson: '足場の組立て・解体・変更作業に従事する者（地上補助作業を除く）',
        industries: '建設業、塗装業、設備工事業',
        penalty: '6ヶ月以下の懲役または50万円以下の罰金',
        onlineAvailable: true,
        practicalRequired: false
    },
    '酸欠': {
        name: '酸素欠乏・硫化水素危険作業特別教育',
        law: '酸素欠乏症等防止規則第12条',
        lawUrl: 'https://elaws.e-gov.go.jp/document?lawid=347M50002000042',
        totalHours: 5.5,
        curriculum: [
            { subject: '酸素欠乏等の発生の原因', hours: 1 },
            { subject: '酸素欠乏症等の症状', hours: 1 },
            { subject: '空気呼吸器等の使用方法', hours: 1 },
            { subject: '事故の場合の退避及び救急そ生の方法', hours: 1 },
            { subject: 'その他酸素欠乏症等の防止に関し必要な事項', hours: 1.5 }
        ],
        priceRange: { online: { min: 6000, max: 9000 }, offline: { min: 8000, max: 12000 } },
        validityPeriod: 'なし（法的義務なし）',
        recommendedRefresh: '特になし',
        targetPerson: '酸素欠乏危険場所で作業に従事する者',
        industries: '建設業、製造業、清掃業、下水道業',
        penalty: '6ヶ月以下の懲役または50万円以下の罰金',
        onlineAvailable: true,
        practicalRequired: false
    },
    '低圧電気': {
        name: '低圧電気取扱特別教育',
        law: '労働安全衛生規則第36条第4号',
        lawUrl: 'https://elaws.e-gov.go.jp/document?lawid=347M50002000032#Mp-At_36',
        totalHours: 14,
        curriculum: [
            { subject: '低圧の電気に関する基礎知識', hours: 1 },
            { subject: '低圧の電気設備に関する基礎知識', hours: 2 },
            { subject: '低圧用の安全作業用具に関する基礎知識', hours: 1 },
            { subject: '低圧の活線作業及び活線近接作業の方法', hours: 2 },
            { subject: '関係法令', hours: 1 },
            { subject: '実技', hours: 7 }
        ],
        priceRange: { online: { min: 8000, max: 12000 }, offline: { min: 12000, max: 18000 } },
        validityPeriod: 'なし（法的義務なし）',
        recommendedRefresh: '特になし',
        targetPerson: '低圧電路の敷設・修理、配電盤の操作業務に従事する者',
        industries: '電気工事業、設備業、製造業',
        penalty: '6ヶ月以下の懲役または50万円以下の罰金',
        onlineAvailable: true,
        practicalRequired: true,
        practicalNote: '実技7時間は対面必須'
    },
    '玉掛け': {
        name: '玉掛け技能講習',
        law: '労働安全衛生法第61条、クレーン等安全規則第221条',
        lawUrl: 'https://elaws.e-gov.go.jp/document?lawid=347M50002000034',
        totalHours: 19,
        curriculum: [
            { subject: 'クレーン等に関する知識', hours: 1 },
            { subject: 'クレーン等の玉掛けに必要な力学', hours: 3 },
            { subject: '玉掛けの方法', hours: 7 },
            { subject: '関係法令', hours: 1 },
            { subject: '実技（玉掛け）', hours: 6 },
            { subject: '実技（合図）', hours: 1 }
        ],
        priceRange: { online: null, offline: { min: 18000, max: 25000 } },
        validityPeriod: 'なし（法的義務なし）',
        recommendedRefresh: '特になし',
        targetPerson: 'つり上げ荷重1t以上のクレーン等の玉掛け作業に従事する者',
        industries: '建設業、製造業、運送業、港湾業',
        penalty: '6ヶ月以下の懲役または50万円以下の罰金',
        onlineAvailable: false,
        practicalRequired: true,
        practicalNote: '技能講習のため全課程対面必須'
    },
    'フォークリフト': {
        name: 'フォークリフト運転技能講習',
        law: '労働安全衛生法第61条',
        lawUrl: 'https://elaws.e-gov.go.jp/document?lawid=347AC0000000057#Mp-At_61',
        totalHours: 35,
        curriculum: [
            { subject: '走行に関する装置の構造及び取扱い', hours: 4 },
            { subject: '荷役に関する装置の構造及び取扱い', hours: 4 },
            { subject: '運転に必要な力学', hours: 2 },
            { subject: '関係法令', hours: 1 },
            { subject: '実技（走行）', hours: 20 },
            { subject: '実技（荷役）', hours: 4 }
        ],
        priceRange: { online: null, offline: { min: 35000, max: 50000 } },
        validityPeriod: 'なし（法的義務なし）',
        recommendedRefresh: '特になし',
        targetPerson: '最大荷重1t以上のフォークリフトを運転する者',
        industries: '物流業、製造業、倉庫業、建設業',
        penalty: '6ヶ月以下の懲役または50万円以下の罰金',
        onlineAvailable: false,
        practicalRequired: true,
        practicalNote: '技能講習のため全課程対面必須'
    },
    '粉じん': {
        name: '粉じん作業特別教育',
        law: '粉じん障害防止規則第22条',
        lawUrl: 'https://elaws.e-gov.go.jp/document?lawid=354M50002000018',
        totalHours: 4.5,
        curriculum: [
            { subject: '粉じんの発散防止及び作業場の換気の方法', hours: 1 },
            { subject: '作業場の管理', hours: 1 },
            { subject: '呼吸用保護具の使用の方法', hours: 0.5 },
            { subject: '粉じんに係る疾病及び健康管理', hours: 1 },
            { subject: '関係法令', hours: 1 }
        ],
        priceRange: { online: { min: 5000, max: 8000 }, offline: { min: 7000, max: 10000 } },
        validityPeriod: 'なし（法的義務なし）',
        recommendedRefresh: '特になし',
        targetPerson: '特定粉じん作業に従事する者',
        industries: '建設業、製造業、鋳造業、石材加工業',
        penalty: '6ヶ月以下の懲役または50万円以下の罰金',
        onlineAvailable: true,
        practicalRequired: false
    }
};

// ========== クラスター定義 ==========
const clusterDefinitions = [
    { name: '基礎知識・概要', patterns: ['とは', '意味', '定義', '概要', '必要'], priority: 3, cvExpect: 30 },
    { name: '受講資格・対象者', patterns: ['資格', '要件', '対象', '誰', '条件'], priority: 2, cvExpect: 40 },
    { name: '受講方法・形式', patterns: ['オンライン', 'web', 'eラーニング', '対面', '出張', '講座'], priority: 5, cvExpect: 80 },
    { name: '費用・料金', patterns: ['料金', '費用', '価格', '安い', '相場', '助成金'], priority: 5, cvExpect: 85 },
    { name: '講習内容・カリキュラム', patterns: ['カリキュラム', '内容', '時間', '科目', '講習'], priority: 3, cvExpect: 35 },
    { name: '修了証・有効期限', patterns: ['修了証', '有効期限', '期限', '更新', '再教育', '5年'], priority: 4, cvExpect: 50 },
    { name: '申し込み方法', patterns: ['申し込み', '申込', '予約', '受講方法', '手続き'], priority: 5, cvExpect: 90 },
    { name: 'おすすめ・比較', patterns: ['おすすめ', '比較', 'ランキング', 'どこがいい', '選び方'], priority: 5, cvExpect: 75 },
    { name: '法律・義務・罰則', patterns: ['義務', '法律', '罰則', '労働安全衛生法', '違反'], priority: 2, cvExpect: 25 },
    { name: '違い・種類', patterns: ['違い', '種類', '区分', '分類'], priority: 3, cvExpect: 35 }
];

// ========== ボリューム推定関数 ==========
function estimateVolume(keyword) {
    // 完全一致
    if (estimatedVolumes[keyword]) {
        return estimatedVolumes[keyword];
    }
    // 部分一致（スペースなし版も確認）
    const kwNormalized = keyword.replace(/\s+/g, ' ').trim();
    for (const [key, vol] of Object.entries(estimatedVolumes)) {
        if (kwNormalized.includes(key) || key.includes(kwNormalized)) {
            return Math.round(vol * 0.7); // 部分一致は70%で推定
        }
    }
    // パターンマッチで推定
    if (/オンライン|web|eラーニング/.test(keyword)) return 300;
    if (/料金|費用|価格/.test(keyword)) return 200;
    if (/申し込み|申込/.test(keyword)) return 150;
    if (/とは|意味/.test(keyword)) return 400;
    return 100; // デフォルト
}

// ========== 一次情報取得関数 ==========
function getPrimarySources(keyword) {
    const sources = [];
    for (const [key, value] of Object.entries(primarySources)) {
        if (keyword.includes(key)) {
            sources.push(...value);
        }
    }
    // 重複除去
    const unique = [];
    const seen = new Set();
    for (const s of sources) {
        if (!seen.has(s.url)) {
            seen.add(s.url);
            unique.push(s);
        }
    }
    return unique.length > 0 ? unique : [
        { title: '厚生労働省 - 安全衛生関係', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/index.html' }
    ];
}
